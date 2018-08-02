/**
 * @license
 * Copyright 厦门乾元盛世科技有限公司 All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file.
 */


import {
    Component, Input, Output, EventEmitter, ElementRef, Renderer2, ViewEncapsulation,
    HostListener, OnDestroy, OnChanges, SimpleChanges, SimpleChange, ViewChild, Inject, Optional, forwardRef,
    ComponentFactoryResolver, ComponentRef, EmbeddedViewRef, ApplicationRef, Injector, Type, OnInit
} from '@angular/core';
import { NG_VALUE_ACCESSOR, COMPOSITION_BUFFER_MODE } from '@angular/forms';
import { ɵgetDOM as getDOM, DOCUMENT } from '@angular/platform-browser';

import * as align from 'dom-align';
import * as moment from 'moment';

import { UpdateClassService } from '../core/service/update.class.service';
import { toBoolean } from '../util/lang';

import { FormControl } from '../input/form.control';
import { transitionAppear, transitionLeave } from '../core/animation/transition';
import { KeyCode } from '../util/key.code';
import { onNextFrame } from '../util/anim.frame';
import { DomUtils } from '../util/dom.utils';
import { getPopupClassNameFromAlign, getAlignFromPlacement } from '../trigger/utils';

import placements from './placements';
import { TimePanel } from '../calendar/panel/time.panel';


const INPUT_CONTROL_VALUE_ACCESSOR: any = {
    provide: NG_VALUE_ACCESSOR,
    useExisting: forwardRef(() => TimePicker),
    multi: true
};


@Component({
    selector: 'ant-timepicker',
    templateUrl: './time.picker.html',
    styleUrls: ['./style/index.scss', '../input/style/index.scss'],
    preserveWhitespaces: false,
    encapsulation: ViewEncapsulation.None,
    providers: [ UpdateClassService, INPUT_CONTROL_VALUE_ACCESSOR ],
    exportAs: 'timepicker'
})
export class TimePicker extends FormControl implements OnInit, OnDestroy, OnChanges {

    /** 选择框默认文字 */
    @Input() placeholder = '请选择时间';

    /** 样式前缀 */
    @Input()
    get prefixCls(): string {
        return this._prefixCls;
    }
    set prefixCls(prefixCls: string) {
        if (this._prefixCls !== prefixCls) {
            this._prefixCls = prefixCls;
            this.updateClassMap();
            this.updatePickerInputClass();
        }
    }
    private _prefixCls = 'ant-time-picker';


    /** 样式前缀 */
    @Input()
    get inputPrefixCls(): string {
        return this._inputPrefixCls;
    }
    set inputPrefixCls(inputPrefixCls: string) {
        this._inputPrefixCls = inputPrefixCls;
        this.updatePickerInputClass();
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


    /** Whether is disabled */
    @Input()
    get disabled(): boolean {
        return this._disabled;
    }
    set disabled(disabled: boolean) {
        const value = toBoolean(disabled);
        if (this._disabled !== value) {
            this._disabled = value;
            this.updateClassMap();
            this.updatePickerInputClass();
        }
    }
    private _disabled = false;


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
    private _readOnly = false;

    /** 是否必填 */
    @Input() required = false;

    /** 是否显示清除按钮，默认为true */
    @Input() allowClear = true;

    /** 清除图标按钮的Title */
    @Input() clearText = '清除';

    /** 隐藏禁止选择的选项 */
    @Input() hideDisabledOptions = false;

    /** 获取不可用的小时列表 */
    @Input() disabledHours: () => number[];

    /** 获取不可用的分钟列表 */
    @Input() disabledMinutes: (hour: number) => number[];

    /** 获取不可用的秒钟列表 */
    @Input() disabledSeconds: (hour: number, minute: number) => number[];

    /** 返回值的格式 */
    @Input() format: string;

    /** 显示值的格式 */
    @Input() displayFormat: string;

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

    /** 展开/关闭菜单时的动画效果 */
    @Input() transitionName = 'slide-up';

    /** 鼠标移入后显示菜单的延迟时间（秒）*/
    @Input() mouseEnterDelay = 0.15; // 秒

    /** 鼠标移出后隐藏菜单的延迟时间（秒）*/
    @Input() mouseLeaveDelay = 0.15; // 秒

    /** 触发下拉的行为，可选取值：Array<'click'|'hover'> */
    @Input() triggerAction: string | string[] = ['click'];

    /** 下拉控件的 class 属性 */
    @Input() dropdownClass: string;

    /** 浮层预设位置：`bottomLeft` `bottomRight` `topLeft` `topRight` */
    @Input() dropdownPlacement = 'bottomLeft';

    /** 弹窗位置 */
    @Input() builtinPlacements = placements;



    /** 值变更事件 */
    @Output() change = new EventEmitter<moment.Moment>();

    /**
     * 菜单可视事件变更
     */
    @Output() openChange = new EventEmitter<boolean>();

    /** 实际输入框(用于显示值) */
    @ViewChild('input') input: ElementRef;


    /** 显示值 */
    public displayValue: string;

    /** 实际值 */
    private actualValue: moment.Moment;

    // 触发器与下拉菜单
    private component: ComponentRef<TimePanel>;
    private timePanel: TimePanel;
    private popupVisible = false;
    private popupContainer: HTMLElement;
    private alignClass: string;
    private delayTimer: any; // 延迟计时
    private align = { offset: [0, -2] };

    // 点击Document的事件（一般用于触发点击后隐藏冒泡组件）
    private clickOutsideHandler: Function;
    private touchOutsideHandler: Function;

    /** 是否已聚焦 */
    public get focused(): boolean {
        return this._focused;
    }
    public set focused(focused: boolean) {
        this._focused = focused;
    }
    private _focused = false;


    // 内部样式
    public pickerInputClasses: any;


    constructor(
        public renderer: Renderer2,
        public el: ElementRef,
        public updateClassService: UpdateClassService,
        @Optional() @Inject(COMPOSITION_BUFFER_MODE) public compositionMode: boolean,
        @Inject(DOCUMENT) private doc: Document,
        public componentFactoryResolver: ComponentFactoryResolver,
        public appRef: ApplicationRef,
        public injector: Injector) {
        super(renderer, el, compositionMode);
    }

    ngOnDestroy(): void {
        this.destroyTimePanel();
    }

    ngOnChanges(changes: SimpleChanges): void {
        if (this.isChanged(changes, 'format') || this.isChanged(changes, 'displayFormat') ||
            this.isChanged(changes, 'dateFormat') || this.isChanged(changes, 'dateDisplayFormat') ||
            this.isChanged(changes, 'timeFormat') || this.isChanged(changes, 'timeDisplayFormat')) {
            this.setValue(this.actualValue);
        }
    }

    ngOnInit(): void {
        this.updateClassMap();
        this.updatePickerInputClass();
    }

    isChanged(changes: SimpleChanges, name: string): boolean {
        const prop: SimpleChange = changes[name];
        return prop !== undefined && prop !== null && !prop.isFirstChange();
    }

    /** The underlying host native element */
    getHostElement(): HTMLElement {
        return this.elementRef.nativeElement as HTMLElement;
    }

    protected updateClassMap(): void {
        const classes = {
            [`${this.prefixCls}`]: true,
            [`${this.prefixCls}-${this.size}`]: this.size
        };
        this.updateClassService.update(this.el.nativeElement, classes);
    }

    private updatePickerInputClass(): void {
        this.pickerInputClasses = {
            [`${this.prefixCls}-input`]: true,
            [`${this.inputPrefixCls}`]: true,
            [`${this.inputPrefixCls}-lg`]: this.size === 'large',
            [`${this.inputPrefixCls}-sm`]: this.size === 'small',
            [`${this.inputPrefixCls}-disabled`]: this.disabled,
            [`${this.inputPrefixCls}-focused`]: this.focused
        };
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
        const mm: moment.Moment = this.processValue(value);
        this.setValue(mm.isValid() ? mm : null);
    }

    /** 对用户输入的值进行预处理，如文本转日期等 */
    processValue(value: any): moment.Moment {
        if (typeof value === 'string' && this.getFormat()) {
            return moment(value, this.getFormat());
        }
        return moment(value);
    }

    setValue(actualValue: moment.Moment): void {
        this.actualValue = actualValue;
        this.buildDisplayValue();

        const value = this.getFormValue();
        this.onChange(value); // Angular need this
        this.change.emit(actualValue);
    }

    buildDisplayValue(): void {
        // 设置带格式的显示数值
        let display: string = null;
        if (this.actualValue) {
            display = this.actualValue.format(this.getDisplayFormat());
        }
        if (display !== this.displayValue) {
            this.displayValue = display;
        }
    }

    getFormValue(): any {
        if (this.valueAsMoment) {
            return this.actualValue;
        }
        if (this.valueAsDate) {
            return this.actualValue && this.actualValue.toDate() || null;
        }
        return this.getFormattedValue();
    }

    getFormattedValue(): string {
        if (this.actualValue) {
            return this.actualValue.format(this.getFormat());
        }
        return '';
    }

    getFormat(): string {
        return this.format || 'HH:mm:ss';
    }

    getDisplayFormat(): string {
        return this.displayFormat || this.format || 'HH:mm:ss';
    }


    /**
     * @private
     */
    onBlur(event: UIEvent): void {
        this.onTouched(); // set your control to 'touched'
        this.focused = false;
    }

    onFocus(event: Event): void {
        this.onTouched(); // set your control to 'touched'
        this.focused = true;
    }

    /** focus on the input */
    focus(): void {
        this.input.nativeElement.focus();
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

        this.displayValue = '';
        this.actualValue = null;

        // 触发变更事件
        this.onChange(null); // Angular need this
        this.change.emit(null);
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

    onTimePanelKeyDown(event: KeyboardEvent): void {
        if (event.keyCode === KeyCode.ESC) {
            event.stopPropagation();
            this.close();
        }
    }


    getTiggerElement(): HTMLElement {
        return this.getHostElement();
    }

    getTimePanelElement(): HTMLElement {
        return this.timePanel && this.timePanel.getHostElement();
    }



    closeTimePanel(): void {
        this.setPopupVisible(false);
    }

    destroyTimePanel(): void {
        if (this.timePanel) {
            this.component.destroy();
            this.getPopupContainer().remove();
            this.popupContainer = null;
            this.timePanel = null;
            this.component = null;
        }
    }

    createTimePanel(): TimePanel {
        if (!this.timePanel) {
            const component: ComponentRef<TimePanel> = this._createComponent(TimePanel);
            Object.assign(component.instance, {
                prefixCls: `${this.prefixCls}-panel`,
                panelCls: `${this.prefixCls}-panel`,
                className: this.dropdownClass,
                value: this.actualValue,
                lang: this.lang,
                format: this.getFormat(),
                placeholder: this.placeholder,
                allowClear: this.allowClear,
                allowEmpty: this.allowClear,
                disabledHours: this.disabledHours,
                disabledMinutes: this.disabledMinutes,
                disabledSeconds: this.disabledSeconds,
                hideDisabledOptions: this.hideDisabledOptions,
                showHour: this.isShowHour(),
                showMinute: this.isShowMinute(),
                showSecond: this.isShowSecond()
            });
            if (this.locale) {
                component.instance.locale = this.locale;
            }


            this.component = component;
            this.timePanel = component.instance;

            this.timePanel.valueUpdate.subscribe((value: moment.Moment) => {
                this.setValue(value);
            });
            this.timePanel.keyesc.subscribe((event: KeyboardEvent) => {
                this.closeTimePanel();
            });
            this.timePanel.clear.subscribe(() => {
                this.closeTimePanel();
            });
        }
        return this.timePanel;
    }

    isShowHour(): boolean {
        const format = this.getFormat();
        return format.indexOf('H') > -1 || format.indexOf('h') > -1 || format.indexOf('k') > -1;
    }

    isShowMinute(): boolean {
        const format = this.getFormat();
        return format.indexOf('m') > -1;
    }

    isShowSecond(): boolean {
        const format = this.getFormat();
        return format.indexOf('s') > -1;
    }

    private _createComponent<T>(component: Type<T>): ComponentRef<T> {
        const componentFactory = this.componentFactoryResolver.resolveComponentFactory(component);
        const componentRef: ComponentRef<T> = componentFactory.create(this.injector);
        this.appRef.attachView(componentRef.hostView);

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
            const container = this.getTimePanelElement();
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

            const root = this.doc.body;
            root.appendChild(div);
            this.popupContainer = div;
        }

        return this.popupContainer;
    }

    getAlign(): {} {
        return getAlignFromPlacement(this.builtinPlacements, this.dropdownPlacement, this.align);
    }

    forceAlign(): void {
        if (!this.disabled) {
            const baseTarget = this.getTiggerElement(); // 基准组件，位置不会变
            const alignTarget = this.getTimePanelElement();

            // https://www.npmjs.com/package/dom-align
            const alignConfig = this.getAlign();
            this.onAlign(align(alignTarget, baseTarget, alignConfig));
        }
    }

    onAlign(_align: any): void {
        const dropdownPrefixCls = `${this.prefixCls}-panel`;
        const alignClass = getPopupClassNameFromAlign(this.builtinPlacements, dropdownPrefixCls, _align);

        // 先删除旧的样式，再添加新的样式
        if (this.alignClass !== alignClass) {
            const target = this.getTimePanelElement();
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
            if (!this.timePanel) {
                this.createTimePanel();
            }
            // this.popupPanel.visible = popupVisible;

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
                transitionAppear(this.getTimePanelElement(), this.transitionName, () => {
                    this.getTimePanelElement().focus(); // so we can navigate by keyboard
                });
            });
        }
    }

    animClose(destroy: boolean = true): void {
        transitionLeave(this.getTimePanelElement(), this.transitionName, () => {
            if (destroy) {
                this.destroyTimePanel();
            }
            this.focus();
        });
    }


    onDocumentClick(event: MouseEvent): void {
        const target = event.target as Node;
        const root = this.getHostElement();
        const popupEl = this.getTimePanelElement();
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

