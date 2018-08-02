/**
 * @license
 * Copyright 厦门乾元盛世科技有限公司 All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file.
 */

import {
    Component, Input, Output, EventEmitter, ElementRef, Renderer2, HostBinding, ViewEncapsulation,
    OnInit, AfterViewInit, OnDestroy, ContentChild, ViewChild, Inject, Optional, forwardRef, TemplateRef
} from '@angular/core';
import { NgControl, NG_VALUE_ACCESSOR, COMPOSITION_BUFFER_MODE } from '@angular/forms';

import { Subject } from 'rxjs/Subject';
import { Subscription } from 'rxjs/Subscription';
import { debounceTime } from 'rxjs/operators';

import { toBoolean } from '../util/lang';
import { onNextFrame } from '../util/anim.frame';
import { KeyCode } from '../util/key.code';

import calculateNodeHeight from './calculateNodeHeight';
import { FormControl } from './form.control';

export interface AutoSizeType {
    minRows?: number;
    maxRows?: number;
}

const INPUT_CONTROL_VALUE_ACCESSOR: any = {
    provide: NG_VALUE_ACCESSOR,
    useExisting: forwardRef(() => InputBox),
    multi: true
};


@Component({
    selector: 'ant-input',
    templateUrl: './input.html',
    styleUrls: ['./style/index.scss'],
    preserveWhitespaces: false,
    encapsulation: ViewEncapsulation.None,
    providers: [INPUT_CONTROL_VALUE_ACCESSOR]
})
export class InputBox extends FormControl implements OnInit, AfterViewInit, OnDestroy {

    /** 样式前缀 */
    @Input()
    get prefixCls(): string {
        return this._prefixCls;
    }
    set prefixCls(prefixCls: string) {
        if (this._prefixCls !== prefixCls) {
            this._prefixCls = prefixCls;
            this.updateInputClass();
            this.updateAffixWrapperClass();
            this.updateAffixPrefixClass();
            this.updateAffixSuffixClass();
        }
    }
    protected _prefixCls = 'ant-input';

    /** 自定义输入框样式 */
    @Input()
    get inputCls(): string {
        return this._inputCls;
    }
    set inputCls(inputCls: string) {
        if (this._inputCls !== inputCls) {
            this._inputCls = inputCls;
            this.updateInputClass();
        }
    }
    protected _inputCls: string;


    /** 声明 input 类型，同原生 input 标签的 type 属性。另外提供 `type="textarea"` */
    @Input() type = 'text';

    /** 控件大小。注：标准表单内的输入框大小限制为 `large`。可选 `large` `default` `small`。 */
    @Input()
    get size(): 'large' | 'default' | 'small' {
        return this._size;
    }
    set size(size: 'large' | 'default' | 'small') {
        if (this._size !== size) {
            this._size = size;
            this.updateInputClass();
        }
    }
    protected _size: 'large' | 'default' | 'small';


    /** 输入框的placeholder */
    @Input() placeholder: string;

    /** 是否只读状态，默认为 false */
    @Input()
    get readOnly(): boolean {
        return this._readOnly;
    }
    set readOnly(readOnly: boolean) {
        const value = toBoolean(readOnly);
        if (this._readOnly !== value) {
            this._readOnly = value;
        }
    }
    private _readOnly = false;

    /** Whether is disabled */
    @Input()
    get disabled(): boolean {
        return this._disabled;
    }
    set disabled(disabled: boolean) {
        const value = toBoolean(disabled);
        if (this._disabled !== value) {
            this._disabled = value;
            this.updateInputClass();
        }
    }
    private _disabled = false;


    /** 带有前缀图标的 input，也可以通过使用属性为“prefixTpl”的模板来达到同样效果 */
    @Input()
    get prefix(): string {
        return this._prefix;
    }
    set prefix(prefix: string) {
        if (this._prefix !== prefix) {
            this._prefix = prefix;
            this.updateInputClass();
        }
    }
    protected _prefix: string;


    /** 带有后缀图标的 input，也可以通过使用属性为“suffixTpl”的模板来达到同样效果 */
    @Input()
    get suffix(): string {
        return this._suffix;
    }
    set suffix(suffix: string) {
        if (this._suffix !== suffix) {
            this._suffix = suffix;
            this.updateInputClass();
        }
    }
    protected _suffix: string;


    /**  */
    @Input()
    get prefixTpl(): TemplateRef<any> {
        return this._prefixTpl;
    }
    set prefixTpl(prefixTpl: TemplateRef<any>) {
        this._prefixTpl = prefixTpl;
        this.updateInputClass();
    }
    protected _prefixTpl: TemplateRef<any>;


    @Input()
    get suffixTpl(): TemplateRef<any> {
        return this._suffixTpl;
    }
    set suffixTpl(suffixTpl: TemplateRef<any>) {
        this._suffixTpl = suffixTpl;
        this.updateInputClass();
    }
    protected _suffixTpl: TemplateRef<any>;


    /** 自适应内容高度，只对 `type="textarea"` 有效，可设置为 `true|false` 或对象：`{ minRows: 2, maxRows: 6 }` */
    @Input() autosize: boolean | AutoSizeType = false;

    @Input() autoComplete: 'on' | 'off';

    @Input() spellCheck: boolean;

    /**
     * maxlength 属性规定输入字段的最大长度，以字符个数计。<br>
     * 注释：maxlength 属性与 <input type="text"> 或 <input type="password"> 配合使用。
     */
    @Input() maxlength: string;

    /**
     * minlength 属性规定输入字段的最小长度，以字符个数计。<br>
     * 注释：minlength 属性与 <input type="text"> 或 <input type="password"> 配合使用。
     */
    @Input() minlength: string;

    /**
     * max 属性规定输入字段所允许的最大值。<br>
     * 注释：max 和 min 属性适用于以下 <input> 类型：number, range, date, datetime, datetime-local, month, time 以及 week。
     */
    @Input() max: number | Date;

    /**
     * min 属性规定输入字段所允许的最小值。<br>
     * 注释：max 和 min 属性适用于以下 <input> 类型：number, range, date, datetime, datetime-local, month, time 以及 week。
     */
    @Input() min: number | Date;

    /** 是否必填 */
    @Input() required = false;

    /**
     * pattern 属性规定用于验证输入字段的模式（正则表达式）。<br>
     * 注释：pattern 属性适用于以下 <input> 类型：text, search, url, telephone, email 以及 password 。
     */
    @Input() pattern: string;

    /**
     * 行数，当类型是textarea时
     */
    @Input() rows = 3;

    /**
     * 默认情况下，输入框的focus、blur事件是不传播的，因此当我们控制内部的输入框后，需要发射自己的focus、blur事件
     *
     * @output {event} Expression to call when the input no longer has focus
     */
    @Output() blur: EventEmitter<Event> = new EventEmitter<Event>();

    /**
     * 默认情况下，输入框的focus、blur事件是不传播的，因此当我们控制内部的输入框后，需要发射自己的focus、blur事件
     *
     * @output {event} Expression to call when the input has focus
     */
    @Output() focus: EventEmitter<Event> = new EventEmitter<Event>();


    /**
     * 内部输入框的内容，用于绑定内部的 ngModel 值
     */
    set innerValue(value: any) {
        if (this._value !== value) {
            // processValue()用于转换接收内部view控件产生的值和外部通过@Input传入的值
            const v = this.processValue(value);
            this._value = v;
            // view1 -> model -> onChange -> view2 (outside world) (ie. NgModel on this control)
            // view1 is 我们在template中定义的组件生成的view
            // view2 is 别人使用当前组件在应用中生成的view
            this.onChange(this._value); // Angular need this
        }
    }

    /**
     * The value of the input ngModel (model -> view2)
     */
    get innerValue() {
        return this._value;
    }

    /**
     * The internal data model
     */
    private _value: any = '';

    private valueChangeEmiter = new Subject<any>();

    /** 长文本框的样式：用于当输入变化时重新计算文本框的高度 (如在 `autosize` 为 `true` 的情况下) */
    public textareaStyles: any;


    // 实际输入控件(<input>)
    @ContentChild(NgControl) state: NgControl;
    @ViewChild('input') input: ElementRef;

    private _textChangesSubscription: Subscription;


    // 内部样式
    public inputClass: any;
    public affixWrapperClass: string;
    public affixPrefixClass: string;
    public affixSuffixClass: string;

    constructor(
        @Inject(Renderer2) public renderer: Renderer2,
        @Inject(ElementRef) public el: ElementRef,
        @Optional() @Inject(COMPOSITION_BUFFER_MODE) public compositionMode: boolean) {
        super(renderer, el, compositionMode);

        // wait for 300ms pause in events
        this._textChangesSubscription = this.valueChangeEmiter.pipe(
            debounceTime(300)
        ).subscribe(() => {
            this.resizeTextarea();
        });
    }

    /** 对用户输入的值进行预处理，如文本转数字等 */
    processValue(value: any): any {
        if (this.type === 'number') {
            const num = parseFloat(value);
            return isNaN(num) ? null : num;
        }
        return value;
    }

    /**
     * Write a new value to the element.
     *
     * @Override (From ControlValueAccessor interface)
     */
    writeValue(value: any): void {
        if (value !== null) {
            // view2 (outside world) (ie. NgModel on this control) -> model -> view1
            // view1 is 我们在template中定义的组件生成的view
            // view2 is 别人使用当前组件在应用中生成的view
            this.innerValue = value;
        }
    }

    /** The underlying host native element */
    getHostElement(): HTMLElement {
        return this.elementRef.nativeElement as HTMLElement;
    }

    ngOnInit(): void {
        this.updateInputClass();
        this.updateAffixWrapperClass();
        this.updateAffixPrefixClass();
        this.updateAffixSuffixClass();
    }

    /**
     * invalid样式
     */
    @HostBinding('class.ant-input-invalid') get warnCls(): boolean {
        return this.state && this.state.invalid;
    }

    clearState(): void {
        const c = this.state && this.state.control;
        if (c) {
            c.markAsPristine();
            c.markAsUntouched();
        }
    }

    getInputClass(): any {
        return {
            [`${this.prefixCls}`]: 1,
            [`${this.prefixCls}-sm`]: this.size === 'small',
            [`${this.prefixCls}-lg`]: this.size === 'large',
            [`has-prefix`]: this.prefix || this.prefixTpl,
            [`has-suffix`]: this.suffix || this.suffixTpl,
            [`${this.inputCls}`]: this.inputCls
        };
    }

    updateInputClass(): void {
        this.inputClass = this.getInputClass();
    }

    updateAffixWrapperClass(): void {
        this.affixWrapperClass = `${this.prefixCls}-affix-wrapper`;
    }

    updateAffixPrefixClass(): void {
        this.affixPrefixClass = `${this.prefixCls}-prefix`;
    }

    updateAffixSuffixClass(): void {
        this.affixSuffixClass = `${this.prefixCls}-suffix`;
    }

    ngAfterViewInit(): void {
        onNextFrame(() => {
            this.resizeTextarea();
        });
    }

    ngOnDestroy(): void {
        if (this._textChangesSubscription) {
            this._textChangesSubscription.unsubscribe();
        }
    }

    /**
     * 当前字符总长度
     */
    get charLength(): number {
        if (typeof this._value === 'string') {
            return this._value.length;
        }
        if (typeof this._value === 'number') {
            return String(this._value).length;
        }
        return 0;
    }

    handleKeyDown(event: KeyboardEvent): void {
        const maxLen = parseInt(this.maxlength, 10);
        if (!isNaN(maxLen) && this.charLength >= maxLen) {
            const keyCode = event.keyCode;
            if (keyCode === KeyCode.DELETE || keyCode === KeyCode.BACKSPACE) {
                return; // 允许删除
            }
            if (KeyCode.isTextModifyingKeyEvent(event)) {
                event.preventDefault(); // 禁止增加输入
            }
        }
    }

    handleKeyUp(ev: UIEvent): void {
        this.valueChangeEmiter.next(ev);
    }

    handleTextareaChange(event: Event): void {
        this.resizeTextarea();
    }

    resizeTextarea(): void {
        if (this.type !== 'textarea' || !this.autosize) {
            return;
        }
        const minRows = this.autosize ? (this.autosize as AutoSizeType).minRows : null;
        const maxRows = this.autosize ? (this.autosize as AutoSizeType).maxRows : null;
        this.textareaStyles = calculateNodeHeight(
            this.input.nativeElement as HTMLTextAreaElement, false, minRows, maxRows);
    }

    /**
     * @private
     */
    onBlur(event: UIEvent) {
        this.onTouched(); // set your control to 'touched'
        this.blur.emit(event);
    }

    /**
     * @private
     */
    onFocus(event: UIEvent) {
        this.focus.emit(event);
    }

    doFocus(): void {
        this.input.nativeElement.focus();
    }

    /**
     * @Override (From ControlValueAccessor interface)
     */
    setDisabledState(isDisabled: boolean): void {
        this.disabled = isDisabled;
    }
}
