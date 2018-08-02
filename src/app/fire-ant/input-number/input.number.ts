/**
 * @license
 * Copyright 厦门乾元盛世科技有限公司 All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file.
 */


import {
    Component, Input, Output, EventEmitter, ElementRef, Renderer2, ViewEncapsulation,
    ViewChild, Inject, Optional, forwardRef, OnInit
} from '@angular/core';
import { NG_VALUE_ACCESSOR, COMPOSITION_BUFFER_MODE } from '@angular/forms';

import { UpdateClassService } from '../core/service/update.class.service';
import { isPresent, toBoolean } from '../util/lang';
import { KeyCode } from '../util/key.code';
import { FormControl } from '../input/form.control';



/**
 * When click and hold on a button - the speed of auto changin the value.
 */
const SPEED = 200;

/**
 * When click and hold on a button - the delay before auto changin the value.
 */
const DELAY = 600;


const INPUT_CONTROL_VALUE_ACCESSOR: any = {
    provide: NG_VALUE_ACCESSOR,
    useExisting: forwardRef(() => InputNumber),
    multi: true
};


@Component({
    selector: 'ant-number',
    templateUrl: './input.number.html',
    styleUrls: ['./style/index.scss'],
    preserveWhitespaces: false,
    encapsulation: ViewEncapsulation.None,
    providers: [ UpdateClassService, INPUT_CONTROL_VALUE_ACCESSOR ],
    exportAs: 'input'
})
export class InputNumber extends FormControl implements OnInit {

    /** 样式前缀 */
    @Input()
    get prefixCls(): string {
        return this._prefixCls;
    }
    set prefixCls(prefixCls: string) {
        if (this._prefixCls !== prefixCls) {
            this._prefixCls = prefixCls;
            this.updateClassMap();
        }
    }
    private _prefixCls = 'ant-input-number';



    /** 控件大小。注：标准表单内的输入框大小限制为 `large`。可选 `large` `default` `small`。 */
    @Input()
    get size(): 'large' | 'default' | 'small' {
        return this._size;
    }
    set size(size: 'large' | 'default' | 'small') {
        if (this._size !== size) {
            this._size = size;
            this.updateClassMap();
        }
    }
    private _size: 'large' | 'default' | 'small' = 'default';


    /** Whether is disabled */
    @Input()
    set disabled(disabled: boolean) {
        const value = toBoolean(disabled);
        if (this._disabled !== value) {
            this._disabled = value;
            this.updateClassMap();
        }
    }
    get disabled(): boolean {
        return this._disabled;
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

    /** 是否必填 */
    @Input() required = false;

    /** 选择框默认文字 */
    @Input() placeholder: string;

    /**
     * max 属性规定输入字段所允许的最大值。<br>
     * 注释：max 和 min 属性适用于以下 <input> 类型：number, range, date, datetime, datetime-local, month, time 以及 week。
     */
    @Input() max: number;

    /**
     * min 属性规定输入字段所允许的最小值。<br>
     * 注释：max 和 min 属性适用于以下 <input> 类型：number, range, date, datetime, datetime-local, month, time 以及 week。
     */
    @Input() min: number;

    /** 每次改变步数，可以为小数。默认为1。 */
    // tslint:disable-next-line:no-input-rename
    @Input('step') stepValue = 1;

    /** 数值精度 */
    @Input() precision: number;

    /**
     * 指定输入框展示值的格式。入参为(value: number)，返回值为string。
     */
    @Input() formatter: (value: number) => string;

    /** 指定从 formatter 里转换回数字的方式，和 formatter 搭配使用 */
    @Input() parser: (formated: string) => number;

    /** 自动聚焦 */
    @Input() autoFocus = false;


    /** 值变更事件 */
    @Output() change = new EventEmitter<any>();

    /** 实际输入框 */
    @ViewChild('input') input: ElementRef;

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
     * The internal data model
     */
    public formattedValue: any;
    private actualValue: number;

    /** 是否已聚焦 */
    public set focused(focused: boolean) {
        this._focused = focused;
        this.updateClassMap();
    }
    public get focused(): boolean {
        return this._focused;
    }
    private _focused = false;

    // 计时器
    private autoStepTimer: any;

    constructor(
        public renderer: Renderer2,
        public el: ElementRef,
        protected updateClassService: UpdateClassService,
        @Optional() @Inject(COMPOSITION_BUFFER_MODE) public compositionMode: boolean) {
        super(renderer, el, compositionMode);
    }

    /** The underlying host native element */
    getHostElement(): HTMLElement {
        return this.el.nativeElement as HTMLElement;
    }

    ngOnInit(): void {
        this.updateClassMap();
    }

    protected updateClassMap(): void {
        if (!this.updateClassService) {
            return;
        }

        const classes = {
            [`${this.prefixCls}`]: true,
            [`${this.prefixCls}-lg`]: this.size === 'large',
            [`${this.prefixCls}-sm`]: this.size === 'small',
            [`${this.prefixCls}-disabled`]: this.disabled,
            [`${this.prefixCls}-focused`]: this.focused
        };
        this.updateClassService.update(this.el.nativeElement, classes);
    }

    /** 对用户输入的值进行预处理，如文本转数字等 */
    processValue(value: any): number {
        if (this.parser) {
            value = this.parser(value);
        }
        return Number(value);
    }

    onInputValueChange(value: string): void {
        // processValue()方法用于转换接收内部input控件产生的值
        const actualValue: number = this.processValue(value);
        if (isNaN(actualValue) || !isFinite(actualValue)) {
            // 当输入值不能转换为数值时，尝试把所有非数值字符替换掉
            value = value.replace(/[^\d\.-]/ig, '')        // 替换非数值字符
                .replace(/(.+)-(.*)/ig, '$1$2')            // 替换中间的-
                .replace(/([^.]*)\.([^.]*)\.(.*)/ig, '$1.$2$3'); // 替换多余的小数点
            this.input.nativeElement.value = value;
            return;
        }

        // this.formattedValue = value;
        this.actualValue = actualValue;
        // view1 -> model -> onChange -> view2 (outside world) (ie. NgModel on this control)
        // view1 is 我们在template中定义的组件生成的view
        // view2 is 别人使用当前组件在应用中生成的view
        this.onChange(actualValue); // Angular need this
        this.change.emit(actualValue);

        // 输出格式化的数值
        this.writeValue(actualValue);
    }

    /**
     * Write a new value to the element.
     *
     * @Override (From ControlValueAccessor interface)
     */
    writeValue(value: any): void {
        if (value == null) {
            return;
        }

        // 初始化通过ngModel接收的数值
        if (typeof value === 'number' && this.actualValue !== value) {
            this.actualValue = value;
        }

        // 设置带格式的显示数值
        const formatedValue = this.formatNumber(value);
        if (formatedValue !== this.formattedValue) {
            this.formattedValue = formatedValue;
            // onNextFrame(() => {
                // this.formattedValue = formatedValue;
            // });
        }
    }


    /**
     * @private
     */
    onBlur(event: UIEvent) {
        this.onTouched(); // set your control to 'touched'
        this.focused = false;
        this.blur.emit(event);
    }

    onFocus(event: Event): void {
        this.onTouched(); // set your control to 'touched'
        this.focused = true;
        this.focus.emit(event);
    }

    /** focus on the input */
    doFocus(): void {
        this.input.nativeElement.focus();
    }

    onKeyDown(event: KeyboardEvent): void {
        if (event.keyCode === KeyCode.UP) {
            const ratio = this.getRatio(event);
            this.up(event, ratio);
            this.stop();
        } else if (event.keyCode === KeyCode.DOWN) {
            const ratio = this.getRatio(event);
            this.down(event, ratio);
            this.stop();
        }
    }

    onKeyUp(event: KeyboardEvent): void {
        this.stop();
    }

    onUpHandlerPress(event: Event): void {
        this.up(event);
    }

    onDownHandlerPress(event: Event): void {
        this.down(event);
    }

    /** 禁止内部input控件的change事件传播 */
    onInputChange(event: Event): void {
        event.stopPropagation();
    }

    /**
     * 若按下『SHIFT』键则10倍速率，若按下『CTRL』或『META』键，则0.1倍速率，否则速率不变
     *
     * @param e 键盘事件
     */
    getRatio(e: KeyboardEvent): number {
        let ratio = 1;
        if (e.metaKey || e.ctrlKey) {
            ratio = 0.1;
        } else if (e.shiftKey) {
            ratio = 10;
        }
        return ratio;
    }

    formatNumber(num: number): string {
        if (this.formatter) {
            return this.formatter(num);
        }
        return num.toFixed(this.getMaxPrecision());
    }


    /** 向上增加的按钮是否不可用 */
    isUpHandlerDisabled(): boolean {
        if (isNaN(this.actualValue)) {
            return true;
        }
        const max = this._getMax();
        return isPresent(this.max) && (!isNaN(max) && this.actualValue >= max);
    }

    /** 向下增加的按钮是否不可用 */
    isDownHandlerDisabled(): boolean {
        if (isNaN(this.actualValue)) {
            return true;
        }
        const min = this._getMin();
        return isPresent(this.min) && (!isNaN(min) && this.actualValue <= min);
    }

    preventDefaultEvent(event: Event): void {
        event.preventDefault();
    }


    stop(event?: Event): void {
        if (this.autoStepTimer) {
            clearTimeout(this.autoStepTimer);
        }
    }

    down(e: Event, ratio: number = 1, recursive: boolean = false): void {
        if (this.disabled) {
            return;
        }

        this.stop();
        this.step('down', e, ratio);
        this.autoStepTimer = setTimeout(() => {
            this.down(e, ratio, true);
        }, recursive ? SPEED : DELAY);
    }

    up(e: Event, ratio: number = 1, recursive: boolean = false): void {
        if (this.disabled) {
            return;
        }

        this.stop();
        this.step('up', e, ratio);
        this.autoStepTimer = setTimeout(() => {
            this.up(e, ratio, true);
        }, recursive ? SPEED : DELAY);
    }

    step(type: string, e: Event, ratio: number = 1): void {
        if (this.disabled) {
            return;
        }
        if (e) {
            e.preventDefault();
        }
        this.focused = true;
        this.actualValue = this.actualValue || 0;

        let value = 0;
        if ('up' === type) {
            value = this.actualValue + this.stepValue * ratio;
            const max = this._getMax();
            value = (!isNaN(max) && value >= max) ? max : value;
        }
        if ('down' === type) {
            value = this.actualValue - this.stepValue * ratio;
            const min = this._getMin();
            value = (!isNaN(min) && value <= min) ? min : value;
        }


        // 根据精度重新生成准确的值
        const precision = this.getMaxPrecision();
        value = Number(Number(value).toFixed(precision));

        if (this.actualValue !== value) {
            this.actualValue = value;
            this.writeValue(value);
            this.onChange(value); // Angular need this
            this.change.emit(value);
        }
    }

    _getMin(): number {
        return isPresent(this.min) ? Number(this.min) : NaN;
    }

    _getMax(): number {
        return isPresent(this.max) ? Number(this.max) : NaN;
    }

    getPrecision(value: any): number {
        if (!isPresent(value)) {
            return 0;
        }

        const str = value.toString();
        if (str.indexOf('e-') >= 0) {
            return parseInt(str.slice(str.indexOf('e-') + 2), 10);
        }

        let precision = 0;
        if (str.indexOf('.') >= 0) {
            precision = str.length - str.indexOf('.') - 1;
        }
        return precision;
    }

    // step={1.0} value={1.51}
    // press +
    // then value should be 2.51, rather than 2.5
    getMaxPrecision(): number {
        if (isPresent(this.precision)) {
            return this.precision;
        }

        const stepPrecision = this.getPrecision(this.stepValue);
        const valuePrecision = this.getPrecision(this.actualValue);
        const maxPrecision = Math.max(valuePrecision, stepPrecision);
        // RangeError: toFixed() digits argument must be between 0 and 20
        return Math.min(maxPrecision, 20);
    }

    /**
     * @Override (From ControlValueAccessor interface)
     */
    setDisabledState(isDisabled: boolean): void {
        this.disabled = isDisabled;
    }
}

