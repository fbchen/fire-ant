/**
 * @license
 * Copyright 厦门乾元盛世科技有限公司 All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file.
 */


import {
    Component, Input, Output, EventEmitter, ElementRef, Renderer2, ViewEncapsulation,
    HostBinding, HostListener, OnInit, OnDestroy, Inject, Optional, forwardRef,
    ComponentFactoryResolver, ComponentRef, EmbeddedViewRef, ApplicationRef, Injector, Type
} from '@angular/core';
import { NG_VALUE_ACCESSOR, COMPOSITION_BUFFER_MODE } from '@angular/forms';
import { ɵgetDOM as getDOM, DOCUMENT } from '@angular/platform-browser';

import { UpdateClassService } from '../core/service/update.class.service';
import { toBoolean } from '../util/lang';

import * as align from 'dom-align';
import * as moment from 'moment';

import { FormControl } from '../input/form.control';
import { transitionAppear, transitionLeave } from '../core/animation/transition';
import { KeyCode } from '../util/key.code';
import { onNextFrame } from '../util/anim.frame';
import { DomUtils } from '../util/dom.utils';
import { getPopupClassNameFromAlign, getAlignFromPlacement } from '../trigger/utils';

import placements from './placements';
import { RangeCalendar } from '../calendar/range.calendar';
import { DisabledTime } from '../calendar/time/time.util';
import { RangeButton } from '../calendar/range.calendar';


const INPUT_CONTROL_VALUE_ACCESSOR: any = {
    provide: NG_VALUE_ACCESSOR,
    useExisting: forwardRef(() => RangePicker),
    multi: true
};



@Component({
    selector: 'ant-rangepicker',
    templateUrl: './range.picker.html',
    styleUrls: ['./style/index.scss', '../input/style/index.scss'],
    preserveWhitespaces: false,
    encapsulation: ViewEncapsulation.None,
    providers: [ UpdateClassService, INPUT_CONTROL_VALUE_ACCESSOR ],
    exportAs: 'rangepicker'
})
export class RangePicker extends FormControl implements OnInit, OnDestroy {

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
    private _prefixCls = 'ant-calendar';


    @Input()
    get inputPrefixCls(): string {
        return this._inputPrefixCls;
    }
    set inputPrefixCls(inputPrefixCls: string) {
        if (this._inputPrefixCls !== inputPrefixCls) {
            this._inputPrefixCls = inputPrefixCls;
            this.updatePickerInputClass();
        }
    }
    private _inputPrefixCls = 'ant-input';


    /**
     * 输入框大小，`large` 高度为 32px，`small` 为 22px，默认是 28px。<br>
     * 注：标准表单内的输入框大小限制为 `large`。可选 `large` `default` `small`。
     */
    @Input()
    get size(): 'large' | 'small' | 'default' {
        return this._size;
    }
    set size(size: 'large' | 'small' | 'default') {
        if (this._size !== size) {
            this._size = size;
            this.updateClassMap();
            this.updatePickerInputClass();
        }
    }
    private _size: 'large' | 'small' | 'default' = 'default';


    /** 选择框默认文字 */
    @Input() placeholder: string;

    /** 开始日期选择框默认文字 */
    @Input() startPlaceholder = '开始日期';

    /** 开始日期选择框默认文字 */
    @Input() endPlaceholder = '结束日期';


    /** 是否只读状态，默认为 true */
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
    private _readOnly = true;


    @Input()
    get disabled(): boolean {
        return this._disabled;
    }
    set disabled(disabled: boolean) {
        const value = toBoolean(disabled);
        if (this._disabled !== value) {
            this._disabled = value;
            this.updatePickerInputClass();
        }
    }
    private _disabled = false;


    /** 是否必填 */
    @Input() required = false;

    /** 是否显示清除按钮，默认为true */
    @Input() allowClear = true;

    /** 清除图标按钮的Title */
    @Input() clearText = '清除';

    /** 增加时间选择功能 */
    @Input() showTimePicker = false;

    /** 是否展示“今天”按钮 */
    @Input() showToday = false;

    /** 是否显示星期数（第几周 OF YEAR） */
    @Input() showWeekNumber = false;

    /** 是否显示日期输入框 */
    @Input() showDateInput = true;

    /** 显示【确定】按钮。默认自动判断。 */
    @Input() showOk: boolean;

    /** 自定义按钮 */
    @Input() buttons: RangeButton[];

    /** 返回值的格式 */
    @Input()
    get format(): string {
        return this._format;
    }
    set format(format: string) {
        if (this._format !== format) {
            this._format = format;
        }
    }
    private _format: string;

    /** 日期的默认数据格式 */
    @Input()
    get dateFormat(): string {
        return this._dateFormat;
    }
    set dateFormat(dateFormat: string) {
        if (this._dateFormat !== dateFormat) {
            this._dateFormat = dateFormat;
        }
    }
    private _dateFormat = 'YYYY-MM-DD';

    /** 显示时间的话，时间的格式 */
    @Input()
    get timeFormat(): string {
        return this._timeFormat;
    }
    set timeFormat(timeFormat: string) {
        if (this._timeFormat !== timeFormat) {
            this._timeFormat = timeFormat;
        }
    }
    private _timeFormat = 'HH:mm:ss';

    /** 显示值的格式 */
    @Input()
    get displayFormat(): string {
        return this._displayFormat;
    }
    set displayFormat(displayFormat: string) {
        if (this._displayFormat !== displayFormat) {
            this._displayFormat = displayFormat;
            this.buildDisplayValue();
        }
    }
    private _displayFormat: string;

    /** 日期的默认显示格式 */
    @Input()
    get dateDisplayFormat(): string {
        return this._dateDisplayFormat;
    }
    set dateDisplayFormat(dateDisplayFormat: string) {
        if (this._dateDisplayFormat !== dateDisplayFormat) {
            this._dateDisplayFormat = dateDisplayFormat;
            this.buildDisplayValue();
        }
    }
    private _dateDisplayFormat = 'YYYY年M月D日';

    /** 显示时间的话，时间的显示格式 */
    @Input()
    get timeDisplayFormat(): string {
        return this._timeDisplayFormat;
    }
    set timeDisplayFormat(timeDisplayFormat: string) {
        if (this._timeDisplayFormat !== timeDisplayFormat) {
            this._timeDisplayFormat = timeDisplayFormat;
            this.buildDisplayValue();
        }
    }
    private _timeDisplayFormat = 'HH:mm:ss';


    /** 默认返回的value为string格式，若`valueAsDate`设为`true`，则返回`Date` */
    @Input() valueAsDate = false;

    /** 默认返回的value为string格式，若`valueAsMoment`设为`true`，则返回`Moment` */
    @Input() valueAsMoment = false;

    /** moment的local设置 */
    @Input() lang = 'zh-cn';

    /**
     * 国际化配置
     * 参考：https://github.com/ant-design/ant-design/blob/master/components/date-picker/locale/example.json
     */
    @Input() locale: any;

    /**
     * maxDate 属性规定输入字段所允许的最大日期。
     */
    @Input() maxDate: Date;

    /**
     * minDate 属性规定输入字段所允许的最小日期。
     */
    @Input() minDate: Date;

    /** 不可选择的日期 */
    @Input() disabledDate: (value: moment.Moment, type: 'start' | 'end') => boolean;

    /** 不可选择的时间(将根据选择的日期动态调用获取) */
    @Input() disabledTime: (value: moment.Moment, type: 'start' | 'end') => DisabledTime;

    /** 展开/关闭菜单时的动画效果 */
    @Input() transitionName = 'slide-up';

    /** 鼠标移入后显示菜单的延迟时间（秒）*/
    @Input() mouseEnterDelay = 0.15; // 秒

    /** 鼠标移出后隐藏菜单的延迟时间（秒）*/
    @Input() mouseLeaveDelay = 0.15; // 秒

    /** 触发下拉的行为，可选取值：Array<'click'|'hover'> */
    @Input() triggerAction: string | string[] = ['click'];

    /** 日历控件的 class 属性 */
    @Input() calendarClass: string;

    /** 浮层预设位置：`bottomLeft` `bottomRight` `topLeft` `topRight` */
    @Input() dropdownPlacement = 'bottomLeft';

    /** 弹窗位置 */
    @Input() builtinPlacements = placements;

    /** 值变更事件 */
    @Output() change = new EventEmitter<moment.Moment[]>();

    /**
     * 菜单可视事件变更
     */
    @Output() openChange = new EventEmitter<boolean>();

    /** 显示值 */
    public displayValue: string[] = [];

    /** 实际值 */
    private actualValue: moment.Moment[] = [];

    // 触发器与下拉菜单
    private component: ComponentRef<RangeCalendar>;
    private calendar: RangeCalendar;
    private popupVisible = false;
    private popupContainer: HTMLElement;
    private alignClass: string;
    private delayTimer: any; // 延迟计时

    // 点击Document的事件（一般用于触发点击后隐藏冒泡组件）
    private clickOutsideHandler: Function;
    private touchOutsideHandler: Function;

    /** 是否已聚焦 */
    get focused(): boolean {
        return this._focused;
    }
    set focused(focused: boolean) {
        this._focused = focused;
        this.updatePickerInputClass();
    }
    private _focused = false;


    // 内部样式
    public pickerInputClass: any;


    constructor(
        @Inject(Renderer2) public renderer: Renderer2,
        @Inject(ElementRef) public el: ElementRef,
        @Optional() @Inject(COMPOSITION_BUFFER_MODE) public compositionMode: boolean,
        @Inject(DOCUMENT) private doc: Document,
        private _componentFactoryResolver: ComponentFactoryResolver,
        private _appRef: ApplicationRef,
        private _injector: Injector,
        private updateClassService: UpdateClassService) {

        super(renderer, el, compositionMode);
    }

    ngOnDestroy(): void {
        this.destroyCalendar();
    }

    /** The underlying host native element */
    getHostElement(): HTMLElement {
        return this.el.nativeElement as HTMLElement;
    }

    ngOnInit(): void {
        this.updateClassMap();
        this.updatePickerInputClass();
    }

    private updateClassMap(): void {
        const classes = {
            [`${this.prefixCls}-picker`]: true,
        };
        this.updateClassService.update(this.el.nativeElement, classes);
    }

    private updatePickerInputClass(): void {
        this.pickerInputClass = {
            [`${this.prefixCls}-picker-input`]: true,
            [`${this.inputPrefixCls}`]: true,
            [`${this.inputPrefixCls}-lg`]: this.size === 'large',
            [`${this.inputPrefixCls}-sm`]: this.size === 'small',
            [`${this.inputPrefixCls}-disabled`]: this.disabled,
            [`${this.inputPrefixCls}-focused`]: this.focused
        };
    }

    @HostBinding('style.minWidth')
    get minWidth(): string {
        return this.showTimePicker ? '300px' : null;
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

        // 将ngModel的值(可能是string、Date等)转换为Moment
        const result: moment.Moment[] = this.processValue(value);
        this.setValue(result/*, true*/);
    }

    /** 对用户输入的值进行预处理，如文本转日期等 */
    processValue(value: any[]): moment.Moment[] {
        const result: moment.Moment[] = [];

        const startValue: any = value[0];
        const endValue: any = value[1];
        if (startValue) {
            let val: moment.Moment = null;
            if (typeof startValue === 'string' && this.getFormat()) {
                val = moment(startValue, this.getFormat()) || moment(startValue);
            } else { // like Date, Array, ...
                val = moment(startValue);
            }
            result[0] = val.isValid() ? val : null;
        }

        if (endValue) {
            let val: moment.Moment = null;
            if (typeof endValue === 'string' && this.getFormat()) {
                val = moment(endValue, this.getFormat()) || moment(endValue);
            } else { // like Date, Array, ...
                val = moment(endValue);
            }
            result[1] = val.isValid() ? val : null;
        }

        return result;
    }

    setValue(actualValue: moment.Moment[], mute = false): void {
        this.actualValue = actualValue;
        this.buildDisplayValue();

        if (!mute) {
            const value: any[] = this.getFormValue();
            this.onChange(value); // Angular need this
            this.change.emit(actualValue);
        }
    }

    buildDisplayValue(): void {
        const actualValue = this.actualValue || [];
        // 设置带格式的显示数值
        const display: string[] = [];
        for (let i = 0; i < actualValue.length; i++) {
            const value = actualValue[i];
            display[i] = value ? value.format(this.getDisplayFormat()) : '';
        }
        this.displayValue = display;
    }

    getFormValue(): any[] {
        // 返回moment[]
        if (this.valueAsMoment) {
            return this.actualValue;
        }

        // 返回Date[]
        const value = this.actualValue;
        if (this.valueAsDate) {
            const start = value[0] && value[0].toDate() || null;
            const end = value[1] && value[1].toDate() || null;
            return [start, end];
        }

        // 返回string[]
        return this.getFormattedValue();
    }

    getFormattedValue(): string[] {
        const value = this.actualValue;
        const start = value[0] && value[0].format(this.getFormat()) || '';
        const end = value[1] && value[1].format(this.getFormat()) || '';
        return [start, end];
    }

    getFormat(): string {
        if (this.format) {
            return this.format;
        }
        return this.showTimePicker ? `${this.dateFormat} ${this.timeFormat}` : this.dateFormat;
    }

    getDisplayFormat(): string {
        if (this.displayFormat) {
            return this.displayFormat;
        }
        return this.showTimePicker ? `${this.dateDisplayFormat} ${this.timeDisplayFormat}` : this.dateDisplayFormat;
    }

    getDisabledDateFunc(value: moment.Moment, type: 'start' | 'end'): boolean {
        if (value == null) {
            return true; // ignore empty value
        }

        const date = moment(value);
        if (this.maxDate && date.isAfter(this.maxDate, 'day')) {
            return true;
        }
        if (this.minDate && date.isBefore(this.minDate, 'day')) {
            return true;
        }
        return this.disabledDate && this.disabledDate(value, type) || false;
    }


    /**
     * @private
     */
    onBlur(event: UIEvent) {
        this.onTouched(); // set your control to 'touched'
        this.focused = false;
    }

    onFocus(event: Event): void {
        this.onTouched(); // set your control to 'touched'
        this.focused = true;
    }

    /** focus on the input */
    focus(): void {
        this.getHostElement().focus();
    }



    /** 是否清空按钮可见 */
    isClearIconVisible(): boolean {
        const isHasInput = this.displayValue && this.displayValue.length > 0;
        return !this.disabled && this.allowClear && isHasInput;
    }

    /** 清空搜索框的值以及已选选项 */
    clearSelection(event: Event): void {
        event.preventDefault();
        event.stopPropagation();

        this.displayValue = [];
        this.actualValue = [];

        // 触发变更事件
        this.onChange([]); // Angular need this
        this.change.emit([]);
        this.focus();
    }


    /** 搜索框禁止change事件传播 */
    handlerInputChange(event: Event): void {
        event.stopPropagation();
    }

    /** 搜索框光标退出 */
    handleInputBlur(event: Event): void {
        this.focused = false;
    }

    /** 搜索框鼠标点击 */
    handleInputClick(event: Event): void {
        // Prevent `Trigger` behaviour.
        if (this.focused || this.open) {
            event.stopPropagation();
            event.stopImmediatePropagation();
        }
        this.focused = true;
    }

    /** 搜索框键盘事件 */
    handleInputKeyDown(event: KeyboardEvent): void {
        const keyCode = event.keyCode;
        if (keyCode === KeyCode.BACKSPACE) {
            event.stopPropagation(); // 不可删除Label
        }
    }

    onCalendarKeyDown(event: KeyboardEvent): void {
        if (event.keyCode === KeyCode.ESC) {
            event.stopPropagation();
            this.close();
        }
    }


    getTiggerElement(): HTMLElement {
        return this.getHostElement();
    }

    getCalendarElement(): HTMLElement {
        return this.calendar && this.calendar.getHostElement();
    }

    closeCalendar(): void {
        this.setPopupVisible(false);
    }

    destroyCalendar(): void {
        if (this.calendar) {
            this.component.destroy();
            this.getPopupContainer().parentElement.remove();
            this.popupContainer = null;
            this.calendar = null;
            this.component = null;
        }
    }


    createCalendar(): RangeCalendar {
        if (!this.calendar) {
            const component: ComponentRef<RangeCalendar> = this._createComponent(RangeCalendar);
            Object.assign(component.instance, {
                value: this.actualValue,
                mode: this.showTimePicker ? 'time' : undefined,
                className: this.calendarClass,
                lang: this.lang,
                placeholder: this.placeholder,
                startPlaceholder: this.startPlaceholder,
                endPlaceholder: this.endPlaceholder,
                buttons: this.buttons,
                showOk: this.showOk,
                showToday: this.showToday,
                showTimePicker: this.showTimePicker,
                showWeekNumber: this.showWeekNumber,
                showDateInput: this.showDateInput,
                disabledDate: this.getDisabledDateFunc.bind(this),
                disabledTime: this.disabledTime
            });
            if (this.locale) {
                component.instance.locale = this.locale;
            }

            this.component = component;
            this.calendar = component.instance;

            this.calendar.valueUpdate.subscribe((value: moment.Moment[]) => {
                this.setValue(value);
                this.close();
            });

            this.calendar.keyesc.subscribe((event: KeyboardEvent) => {
                this.closeCalendar();
            });
        }
        return this.calendar;
    }

    private _createComponent<T>(component: Type<T>): ComponentRef<T> {
        const componentFactory = this._componentFactoryResolver.resolveComponentFactory(component);
        const componentRef: ComponentRef<T> = componentFactory.create(this._injector);
        this._appRef.attachView(componentRef.hostView);

        // At this point the component has been instantiated, so we move it to the location in the DOM
        // where we want it to be rendered.
        const _hostDomElement = this.getPopupContainer();
        _hostDomElement.appendChild(this._getComponentRootNode(componentRef));
        return componentRef;
    }

    /** Gets the root HTMLElement for an instantiated component. */
    private _getComponentRootNode(componentRef: ComponentRef<any>): HTMLElement {
        return (componentRef.hostView as EmbeddedViewRef<any>).rootNodes[0] as HTMLElement;
    }



    @HostListener('keydown', ['$event'])
    onKeyDown(event: KeyboardEvent): void {
        const keyCode = event.keyCode;
        if (keyCode !== KeyCode.DOWN &&
            keyCode !== KeyCode.UP &&
            keyCode !== KeyCode.LEFT &&
            keyCode !== KeyCode.RIGHT &&
            keyCode !== KeyCode.ENTER &&
            keyCode !== KeyCode.BACKSPACE &&
            keyCode !== KeyCode.ESC) {
            return;
        }

        // Press any keys above to reopen menu
        if (!this.popupVisible &&
            keyCode !== KeyCode.BACKSPACE &&
            keyCode !== KeyCode.ESC) {
            this.setPopupVisible(true);
            return;
        }
        // Press ESC to close menu
        if (keyCode === KeyCode.ESC) {
            this.setPopupVisible(false);
            return;
        }

        if (this.popupVisible) {
            event.preventDefault();
        }
    }


    @HostListener('click', ['$event'])
    onTriggerClick(event: MouseEvent): void {
        if (this.disabled) {
            return;
        }
        this.onTouched(); // set your control to 'touched'

        if (this.isClickTiggerAction()) {
            this.delaySetPopupVisible(!this.popupVisible, 0.1);
        }
    }

    @HostListener('mouseenter', ['$event'])
    onTriggerMouseEnter(event: MouseEvent): void {
        if (this.disabled) {
            return;
        }
        if (this.isPointerTiggerAction()) {
            this.delaySetPopupVisible(true, this.mouseEnterDelay);
        }
    }

    @HostListener('mouseleave', ['$event'])
    onTriggerMouseLeave(event: MouseEvent): void {
        if (this.disabled) {
            return;
        }
        if (!this.isPopupVisible()) {
            return;
        }
        if (this.isPointerTiggerAction()) {
            const container = this.getPopupContainer();
            if (DomUtils.contains(container, event.relatedTarget as Node)
                || DomUtils.contains(container, event.target as Node)) {
                return; // 还在菜单内部
            }
            this.delaySetPopupVisible(false, this.mouseLeaveDelay);
        }
    }

    isClickTiggerAction(): boolean {
        if (typeof this.triggerAction === 'string') {
            return this.triggerAction === 'click';
        }
        return this.triggerAction.indexOf('click') !== -1;
    }

    isPointerTiggerAction(): boolean {
        if (typeof this.triggerAction === 'string') {
            return this.triggerAction === 'hover';
        }
        return this.triggerAction.indexOf('hover') !== -1;
    }



    protected getPopupContainer(): HTMLElement {
        if (!this.popupContainer) {
            const div = getDOM().createElement('div');
            // Make sure default popup container will never cause scrollbar appearing
            div.style.position = 'absolute';
            div.style.top = '0';
            div.style.left = '0';
            div.style.width = '100%';

            const mountNode = this.doc.body;
            mountNode.appendChild(div);

            const popupContainer = getDOM().createElement('div');
            popupContainer.classList.add(`${this.prefixCls}-picker-container`);
            div.appendChild(popupContainer);
            this.popupContainer = popupContainer;
        }

        return this.popupContainer;
    }

    getAlign(): {} {
        return getAlignFromPlacement(this.builtinPlacements, this.dropdownPlacement, {});
    }

    forceAlign(): void {
        if (!this.disabled) {
            const baseTarget = this.getTiggerElement(); // 基准组件，位置不会变
            const alignTarget = this.getPopupContainer();

            // https://www.npmjs.com/package/dom-align
            const alignConfig = this.getAlign();
            this.onAlign(align(alignTarget, baseTarget, alignConfig));
        }
    }

    onAlign(_align: any): void {
        const dropdownPrefixCls = `${this.prefixCls}-picker-container`;
        const alignClass = getPopupClassNameFromAlign(this.builtinPlacements, dropdownPrefixCls, _align);

        // 先删除旧的样式，再添加新的样式
        if (this.alignClass !== alignClass) {
            const target = this.getPopupContainer();
            if (this.alignClass) {
                this.renderer.removeClass(target, this.alignClass);
            }
            this.renderer.addClass(target, alignClass);
            this.alignClass = alignClass;
        }
    }


    /**
     * 显示或者隐藏菜单
     *
     * @param visible true-显示，false-隐藏
     * @param delayS 延迟时间（单位：秒）
     */
    delaySetPopupVisible(visible: boolean, delayS: number): void {
        const delay: number = delayS * 1000;
        this.clearDelayTimer();
        if (delay) {
            this.delayTimer = setTimeout(() => {
                this.setPopupVisible(visible);
                this.clearDelayTimer();
            }, delay);
        } else {
            this.setPopupVisible(visible);
        }
    }

    isPopupVisible(): boolean {
        return this.popupVisible;
    }

    setPopupVisible(popupVisible: boolean): void {
        if (this.disabled) {
            return;
        }

        if (this.popupVisible !== popupVisible) {
            this.popupVisible = popupVisible;
            if (!this.calendar) {
                this.createCalendar();
            }
            this.calendar.visible = popupVisible;

            // We must listen to `mousedown` or `touchstart`, edge case:
            // https://github.com/ant-design/ant-design/issues/5804
            // https://github.com/react-component/calendar/issues/250
            // https://github.com/react-component/trigger/issues/50
            if (popupVisible) {
                if (!this.clickOutsideHandler) {
                    this.clickOutsideHandler = this.renderer.listen('document', 'mousedown', this.onDocumentClick.bind(this));
                }
                // always hide on mobile
                if (!this.touchOutsideHandler) {
                    this.touchOutsideHandler = this.renderer.listen('document', 'touchstart', this.onDocumentClick.bind(this));
                }
            }
            if (!popupVisible) {
                this.clearOutsideHandler();
                this.animClose();
            }

            this.openChange.emit(popupVisible);
            this.afterPopupVisibleChange(popupVisible);
            this.focus();
        }
    }

    afterPopupVisibleChange(popupVisible: boolean): void {
        if (popupVisible) {
            onNextFrame(() => {
                this.forceAlign();
                transitionAppear(this.getPopupContainer(), this.transitionName, () => {
                    this.getCalendarElement().focus(); // so we can navigate by keyboard
                });
            });
        }
    }

    animClose(destroy: boolean = true): void {
        transitionLeave(this.getPopupContainer(), this.transitionName, () => {
            if (destroy) {
                this.destroyCalendar();
            }
        });
    }


    onDocumentClick(event: MouseEvent): void {
        const target = event.target as Node;
        const root = this.getHostElement();
        const popupEl = this.getCalendarElement();
        if (!popupEl) {
            return;
        }

        if (!DomUtils.contains(root, target) && !DomUtils.contains(popupEl, target)) {
            this.setPopupVisible(false);
        }
    }

    clearOutsideHandler(): void {
        if (this.clickOutsideHandler) {
            this.clickOutsideHandler(); // Removes "listen" listener
            this.clickOutsideHandler = null;
        }

        if (this.touchOutsideHandler) {
            this.touchOutsideHandler(); // Removes "listen" listener
            this.touchOutsideHandler = null;
        }
    }

    clearDelayTimer(): void {
        if (this.delayTimer) {
            clearTimeout(this.delayTimer);
            this.delayTimer = null;
        }
    }

    open(): void {
        this.setPopupVisible(true);
    }

    close(): void {
        this.setPopupVisible(false);
    }

    /**
     * @Override (From ControlValueAccessor interface)
     */
    setDisabledState(isDisabled: boolean): void {
        this.disabled = isDisabled;
    }
}

