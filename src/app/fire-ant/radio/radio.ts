/**
 * @license
 * Copyright 厦门乾元盛世科技有限公司 All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file.
 */


import {
    Component, Input, Output, EventEmitter, ElementRef, Renderer2, ViewEncapsulation,
    OnInit, Inject, Optional, Host, forwardRef
} from '@angular/core';
import { NG_VALUE_ACCESSOR, COMPOSITION_BUFFER_MODE } from '@angular/forms';

import { UpdateClassService } from '../core/service/update.class.service';
import { toBoolean } from '../util/lang';
import { FormControl } from '../input/form.control';
import { RadioGroup } from './radio.group';

const INPUT_CONTROL_VALUE_ACCESSOR: any = {
    provide: NG_VALUE_ACCESSOR,
    useExisting: forwardRef(() => Radio),
    multi: true
};

@Component({
    selector: 'ant-radio',
    templateUrl: './radio.html',
    styleUrls: ['./style/index.scss', './style/patch.scss'],
    preserveWhitespaces: false,
    encapsulation: ViewEncapsulation.None,
    providers: [ UpdateClassService, INPUT_CONTROL_VALUE_ACCESSOR ],
    exportAs: 'radio'
})
export class Radio extends FormControl implements OnInit {

    /** 样式前缀 */
    @Input()
    get prefixCls(): string {
        return this._prefixCls;
    }
    set prefixCls(prefixCls: string) {
        if (this._prefixCls !== prefixCls) {
            this._prefixCls = prefixCls;
            this.updateInputClass();
            this.updateWrapperClass();
            this.updateRadioClass();
        }
    }
    private _prefixCls = 'ant-radio';


    /** 指定当前是否选中 */
    @Input()
    get checked(): boolean {
        return this._checked;
    }
    set checked(checked: boolean) {
        const value = toBoolean(checked);
        if (this._checked !== value) {
            this._checked = value;
            this.updateRadioClass();
            this.updateWrapperClass();
        }
    }
    private _checked = false;


    /** 是否禁用状态，默认为 false */
    @Input()
    get disabled(): boolean {
        return this._disabled || this.isGroupDisabled() || false;
    }
    set disabled(disabled: boolean) {
        const value = toBoolean(disabled);
        if (this._disabled !== value) {
            this._disabled = value;
            this.updateRadioClass();
            this.updateWrapperClass();
        }
    }
    private _disabled = false;


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


    /** 用户CSS样式 */
    @Input()
    get className(): string {
        return this._className;
    }
    set className(className: string) {
        if (this._className !== className) {
            this._className = className;
            this.updateWrapperClass();
        }
    }
    private _className: string;


    /** 内部输入控件的tabIndex属性，默认情况下无需关注 */
    @Input() tabIndex: string;

    /** 未选中状态下的值，默认为空字符串值 */
    @Input() uncheckedValue: any;


    /** 值变更事件 */
    @Output() change = new EventEmitter<any>();

    /** Check变更事件 */
    @Output() check = new EventEmitter<boolean>();

    /** 内部默认的控件 */
    public type = 'radio';

    // 内部样式
    public wrapperClass: any;
    public radioClass: any;
    public inputClass: string;
    public innerClass: string;

    constructor(
        renderer: Renderer2,
        elementRef: ElementRef,
        @Optional() @Inject(COMPOSITION_BUFFER_MODE) compositionMode: boolean,
        @Inject(forwardRef(() => RadioGroup)) @Optional() @Host() private group: RadioGroup) {
        super(renderer, elementRef, compositionMode);
        this.value = 'on';
    }

    ngOnInit(): void {
        // 处理CheckboxGroup的初始值
        if (this.group && this.value) {
            this.checked = this.group.value === this.value;
        }
        this._disabled = this._disabled || this.isGroupDisabled() || false;

        // 初始化样式
        this.updateInputClass();
        this.updateWrapperClass();
        this.updateRadioClass();
    }

    private updateWrapperClass(): any {
        this.wrapperClass = {
            [`${this.getPrefixCls()}-wrapper`]: 1,
            [`${this.getPrefixCls()}-wrapper-checked`]: this.checked,
            [`${this.getPrefixCls()}-wrapper-disabled`]: this.disabled,
            [`${this.className}`]: this.className
        };
    }

    private updateRadioClass(): any {
        this.radioClass = {
            [`${this.getPrefixCls()}`]: 1,
            [`${this.getPrefixCls()}-checked`]: this.checked,
            [`${this.getPrefixCls()}-disabled`]: this.disabled
        };
    }

    private updateInputClass(): void {
        this.inputClass = `${this.getPrefixCls()}-input`;
        this.innerClass = `${this.getPrefixCls()}-inner`;
    }

    private getPrefixCls(): string {
        if (this.group && this.group.mode === 'button') {
            return `${this.prefixCls}-button`;
        }
        return this.prefixCls;
    }

    /**
     * 通过ngModel控制的checked状态，当ngModel的值与控件的value一样时为checked
     * @param value ngModel对应的值
     */
    writeValue(value: any): void {
        this.checked = (this.value === value);
    }

    handleChange(event: Event): void {
        event.preventDefault();
        event.stopPropagation();
        if (this.disabled) {
            return;
        }

        this.checked = !this.checked;
        const value = this.checked ? this.value : (this.uncheckedValue || '');
        this.onChange(value); // Angular need this
        this.check.emit(this.checked);
        this.change.emit(value);
        this.makeGroupChange();
    }

    /**
     * 如果Checkbox在CheckboxGroup内部，则触发CheckboxGroup的值变化
     */
    private makeGroupChange() {
        if (this.group) {
            this.group.toggle(this.value, this.checked);
        }
    }

    private isGroupDisabled(): boolean {
        return this.group && this.group.disabled;
    }

    /**
     * @Override (From ControlValueAccessor interface)
     */
    setDisabledState(isDisabled: boolean): void {
        this.disabled = isDisabled;
    }
}


