/**
 * @license
 * Copyright 厦门乾元盛世科技有限公司 All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file.
 */


import {
    Component, Input, Output, EventEmitter, ElementRef, ViewEncapsulation,
    HostBinding, HostListener, OnInit
} from '@angular/core';
import * as moment from 'moment';

import { UpdateClassService } from '../core/service/update.class.service';
import { toBoolean } from '../util/lang';
import * as LOCALE from './locale/zh_CN';
import { KeyCode } from '../util/key.code';
import { getToday } from './calendar';
import { DisabledTime, isAllowedDate } from './time/time.util';

export interface RangeButton {
    text: string;
    start: moment.Moment;
    end: moment.Moment;
}

/**
 * 日历控件
 * 参考：https://github.com/react-component/calendar
 */
@Component({
    selector: 'ant-range-calendar',
    templateUrl: './range.calendar.html',
    preserveWhitespaces: false,
    encapsulation: ViewEncapsulation.None,
    providers: [ UpdateClassService ],
    exportAs: 'calendar'
})
export class RangeCalendar implements OnInit {

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


    /** 日历模式 */
    @Input()
    get mode(): string {
        return this._mode;
    }
    set mode(mode: string) {
        if (this._mode !== mode) {
            this._mode = mode;
            this.updateClassMap();
        }
    }
    private _mode: string;


    /** 用户CSS样式 */
    @Input()
    get className(): string {
        return this._className;
    }
    set className(className: string) {
        if (this._className !== className) {
            this._className = className;
            this.updateClassMap();
        }
    }
    private _className: string;


    /** 显示选择的范围 */
    @Input() type: 'start' | 'end' | 'both' = 'both';

    /** 初始值 */
    @Input()
    get value(): Date[] | moment.Moment[] {
        return this._value;
    }
    set value(value: Date[] | moment.Moment[]) {
        this._value = value;
        // 生成范围值
        this.rangeValues = this.getRangeFromValue();
        // 更新相关样式
        this.updateTodayButtonClass();
    }
    private _value: Date[] | moment.Moment[];


    /** 获取日期/时间的显示格式（用于日历上的输入框的显示），例如：YYYY-MM-DD */
    @Input() format: string;

    /** 是否显示清除按钮，默认为true */
    @Input() allowClear = true;


    /** 显示【确定】按钮。默认自动判断。 */
    @Input()
    get showOk(): boolean {
        return this._showOk;
    }
    set showOk(showOk: boolean) {
        const value = toBoolean(showOk);
        if (this._showOk !== value) {
            this._showOk = showOk;
            this.updateFooterClass();
        }
    }
    private _showOk: boolean;


    /** 显示【今天】按钮 */
    @Input() showToday = false;

    /** 【今天】按钮的文本 */
    @Input() todayBtnText: string;

    /** 是否显示日期输入框 */
    @Input() showDateInput = true;

    /** 日期输入框的占位字符(默认) */
    @Input() placeholder: string;

    /** 日期输入框的占位字符(start) */
    @Input() startPlaceholder: string;

    /** 日期输入框的占位字符(end) */
    @Input() endPlaceholder: string;


    /** 是否显示星期数（第几周 OF YEAR） */
    @Input()
    get showWeekNumber(): boolean {
        return this._showWeekNumber;
    }
    set showWeekNumber(showWeekNumber: boolean) {
        const value = toBoolean(showWeekNumber);
        if (this._showWeekNumber !== value) {
            this._showWeekNumber = value;
            this.updateClassMap();
        }
    }
    private _showWeekNumber = false;


    /** 是否显示时间选择框 */
    @Input()
    get showTimePicker(): boolean {
        return this._showTimePicker;
    }
    set showTimePicker(showTimePicker: boolean) {
        const value = toBoolean(showTimePicker);
        if (this._showTimePicker !== value) {
            this._showTimePicker = value;
            this.updateClassMap();
            this.updateFooterClass();
        }
    }
    private _showTimePicker = false;


    /** 不可选择的日期 */
    @Input() disabledDate: (value: moment.Moment) => boolean;

    /** 不可选择的时间(将根据选择的日期动态调用获取) */
    @Input() disabledTime: (value: moment.Moment, type: 'start' | 'end') => DisabledTime;

    /** moment的local设置 */
    @Input() lang = 'zh-cn';

    /**
     * 国际化配置
     * 参考：https://github.com/ant-design/ant-design/blob/master/components/date-picker/locale/example.json
     */
    @Input() locale: any = LOCALE.default;


    /** 组件是否可见 */
    @Input()
    get visible(): boolean {
        return this._visible;
    }
    set visible(visible: boolean) {
        const value = toBoolean(visible);
        if (this._visible !== value) {
            this._visible = value;
            this.updateClassMap();
        }
    }
    private _visible = false;


    /** 自定义按钮 */
    @Input()
    get buttons(): RangeButton[] {
        return this._buttons;
    }
    set buttons(buttons: RangeButton[]) {
        this._buttons = buttons;
        this.updateClassMap();
    }
    private _buttons: RangeButton[];



    /** 选择事件 */
    @Output() valueUpdate = new EventEmitter<moment.Moment[]>();

    /** 清空事件 */
    @Output() clear = new EventEmitter<any>();


    /** 键盘事件 */
    @Output() keyesc = new EventEmitter<KeyboardEvent>();

    /** `时间控件开关`事件 */
    @Output() timePickerOpenChange = new EventEmitter<boolean>();


    /** 使光标可以聚焦，然后可以使用键盘导航 */
    @HostBinding('attr.tabIndex') tabIndex = '0';


    private _backupSelectedValue: moment.Moment[];

    /** 当前选中的值（但未确定是否最终的用户选择） */
    public selectedValue: moment.Moment[];

    /** 范围值，用于显示两个日历面板范围 */
    public rangeValues: moment.Moment[];

    /** 鼠标盘旋的值（未点击确定的值） */
    public hoverValue: moment.Moment;

    /** 时间选择控件是否可见 */
    public isTimePickerVisible = false;

    /** 是否第一个面板的年月选择控件可见 */
    public isLeftMonthYearPanelShow = false;
    /** 是否第二个面板的年月选择控件可见 */
    public isRightMonthYearPanelShow = false;

    // 内部样式
    public okButtonClass: any;
    public todayButtonClass: any;
    public footerClass: any;
    public timePickerButtonClass: any;


    disabledStartMonth = (month: moment.Moment): boolean => {
        const values = this.value;
        if (values[1]) {
            return month.isSameOrAfter(values[1], 'month');
        }
        return false;
    }

    disabledEndMonth = (month: moment.Moment): boolean => {
        const values = this.value;
        if (values[0]) {
            return month.isSameOrBefore(values[0], 'month');
        }
        return false;
    }

    disabledStartDate = (date: moment.Moment): boolean => {
        return this.disabledDate && this.disabledDate(date/*, 'start'*/);
    }

    disabledEndDate = (date: moment.Moment): boolean => {
        return this.disabledDate && this.disabledDate(date/*, 'end'*/);
    }

    disabledStartTime = (date: moment.Moment): DisabledTime => {
        return this.disabledTime && this.disabledTime(date, 'start');
    }

    disabledEndTime = (date: moment.Moment): DisabledTime => {
        return this.disabledTime && this.disabledTime(date, 'end');
    }


    constructor(
        private el: ElementRef,
        private updateClassService: UpdateClassService) {

    }

    ngOnInit(): void {
        // 推荐在入口文件全局设置 locale
        // import 'moment/locale/zh-cn';
        moment.locale(this.lang || 'zh-cn');

        // 生成范围值
        this.rangeValues = this.getRangeFromValue();

        // 构建数据
        this.buildData();

        // 初始化样式
        this.updateClassMap();
        this.updateOKButtonClass();
        this.updateTodayButtonClass();
        this.updateFooterClass();
        this.updateTimePickerButtonClass();
    }

    private updateClassMap(): void {
        const classes = {
            [`${this.prefixCls}`]: true,
            [`${this.prefixCls}-range`]: true,
            [`${this.prefixCls}-range-with-ranges`]: this.buttons && this.buttons.length,
            [`${this.prefixCls}-show-time-picker`]: this.showTimePicker,
            [`${this.prefixCls}-${this.mode}`]: this.mode,
            [`${this.prefixCls}-week-number`]: this.showWeekNumber,
            [`${this.prefixCls}-hidden`]: !this.visible,
            [`${this.className}`]: this.className
        };
        this.updateClassService.update(this.el.nativeElement, classes);
    }

    /** 获取【确定】按钮的样式 */
    updateOKButtonClass(): void {
        this.okButtonClass = {
            [`${this.prefixCls}-ok-btn`]: true,
            [`${this.prefixCls}-ok-btn-disabled`]: this.isOkDisabled()
        };
    }

    /** 获取【今天】按钮的样式 */
    updateTodayButtonClass(): void {
        this.todayButtonClass = {
            [`${this.prefixCls}-today-btn`]: true,
            [`${this.prefixCls}-today-btn-disabled`]: this.isTodayDisabled()
        };
    }

    updateFooterClass(): void {
        this.footerClass = {
            [`${this.prefixCls}-footer`]: true,
            [`${this.prefixCls}-range-bottom`]: true,
            [`${this.prefixCls}-footer-show-ok`]: this.showOkButton()
        };
    }

    /** 获取【时间】按钮的样式 */
    updateTimePickerButtonClass(): void {
        this.timePickerButtonClass = {
            [`${this.prefixCls}-time-picker-btn`]: true,
            [`${this.prefixCls}-time-picker-btn-disabled`]: this.isTimePickerBtnDisabled()
        };
    }


    buildData(): void {
        this.selectedValue = [];
        if (this.value && this.value.length) {
            this.selectedValue[0] = this.value[0] ? moment(this.value[0]) : null;
            this.selectedValue[1] = this.value[1] ? moment(this.value[1]) : null;
        }
    }

    /** 生成日历的显示范围 */
    getRangeFromValue(): moment.Moment[] {
        const value = this.value;
        const startMomemt = moment(value[0] || new Date());
        const endMomemt = moment(value[1] || new Date());
        if (endMomemt.isSame(startMomemt, 'month')) {
            endMomemt.add(1, 'month');
        }
        return [startMomemt, endMomemt];
    }

    /** 生成日历的显示范围 */
    getRangeFromSelectedValue(): moment.Moment[] {
        const [start, end] = this.selectedValue;
        const newEnd = end && end.isSame(start, 'month') ? end.clone().add(1, 'month') : end;
        return [start, newEnd];
    }

    /** 起始值，用于显示面板的日期表格，不用于表示实际值 */
    getStartValue(): moment.Moment {
        return this.rangeValues[0];
    }

    /** 终止值，用于显示面板的日期表格，不用于表示实际值 */
    getEndValue(): moment.Moment {
        return this.rangeValues[1];
    }


    /** 由年份、月份等面板触发的起始值变更（连带导致日历面板的日期表格重画） */
    onStartValueChange(value: moment.Moment): void {
        this.rangeValues[0] = value;
        this.updateOKButtonClass();
    }

    /** 由年份、月份等面板触发的终止值变更（连带导致日历面板的日期表格重画） */
    onEndValueChange(value: moment.Moment): void {
        this.rangeValues[1] = value;
        this.updateOKButtonClass();
    }

    /** 在日历面板里点击某个日期触发 */
    onValueSelected(value: moment.Moment, direction: 'left' | 'right'): void {
        if (!value) {
            return;
        }

        const selectedValue = this.selectedValue.concat();
        const length = selectedValue.length;
        if (length === 0 || length === 2) { // 还没有选择，或者若已经有2个了，则重新选择
            selectedValue.length = 0;
            selectedValue.push(value);
        } else if (length === 1) { // 选择了1个
            const selected = selectedValue[0];
            if (this.isAfter(value, selected)) {
                selectedValue.push(value);
            } else {
                selectedValue.unshift(value);
            }
        }
        this.selectedValue = selectedValue;
        this.updateOKButtonClass();
        this.updateTimePickerButtonClass();

        // 设置实际值
        if (selectedValue[0] && selectedValue[1] && !this.showTimePicker) {
            this.setValue(this.selectedValue);
        }
    }

    /** 在时间面板里点击某个时、分、秒数字触发 */
    onTimeValueChange(value: moment.Moment, direction: 'left' | 'right'): void {
        const index = direction === 'left' ? 0 : 1;
        this.selectedValue[index] = value;
        this.updateOKButtonClass();
    }

    /**
     * 检测`date1`是否`isAfter` `date2`，即：`date1`是否比`date2`大
     */
    isAfter(date1: moment.Moment, date2: moment.Moment): boolean {
        if (this.isTimePickerVisible) {
            return date1.isAfter(date2);
        }
        return date1.isAfter(date2, 'days');
    }


    @HostListener('keydown', ['$event'])
    onKeyDown(event: KeyboardEvent): void {
        const keyCode = event.keyCode;
        if (KeyCode.ESC === keyCode) {
            this.keyesc.emit(event);
            return;
        }
    }

    /** The underlying host native element */
    getHostElement(): HTMLElement {
        return this.el.nativeElement as HTMLElement;
    }

    /** 是否显示【确定】按钮 */
    showOkButton(): boolean {
        return this.showOk || (!this.showOk && this.showTimePicker);
    }

    isTodayInView(): boolean {
        const startValue = this.getStartValue();
        const endValue = this.getEndValue();
        const today = getToday(startValue);
        const thisMonth = today.month();
        const thisYear = today.year();
        const isTodayInView =
            startValue.year() === thisYear && startValue.month() === thisMonth ||
            endValue.year() === thisYear && endValue.month() === thisMonth;
        return isTodayInView;
    }

    isTodayDisabled(): boolean {
        return this.isTodayInView();
    }

    /** 获取【今天】的按钮文本 */
    getTodayButtonText(): string {
        return this.locale.backToToday;
    }

    /** 点击【今天】按钮 */
    onToday(event: Event): void {
        event.preventDefault();
        if (!this.isTodayInView()) {
            return;
        }

        const startValue = getToday(this.selectedValue[0]);
        const endValue = startValue.clone().add(1, 'months');
        this.selectedValue = [startValue, endValue];
    }



    isTimePickerBtnDisabled(): boolean {
        return !this.hasSelectedValue();
    }

    /** 点击【选择时间】按钮 */
    onTimePickerBtnClick(event: Event): void {
        if (this.isTimePickerBtnDisabled()) {
            return;
        }
        this.isTimePickerVisible = !this.isTimePickerVisible;
        this.timePickerOpenChange.emit(this.isTimePickerVisible);
    }

    onTimePickerOpenChange(open: boolean): void {
        this.isTimePickerVisible = open;
    }


    isOkDisabled(): boolean {
        if (!this.hasSelectedValue()) {
            return true;
        }
        return !this.isAllowedDateAndTime(this.selectedValue);
    }


    isAllowedDateAndTime(selectedValue: moment.Moment[]): boolean {
        const date1 = selectedValue[0];
        const date2 = selectedValue[1];

        return isAllowedDate(date1, this.disabledDate, this.disabledStartTime.bind(this))
            && isAllowedDate(date2, this.disabledDate, this.disabledEndTime.bind(this));
    }

    onOk(): void {
        if (this.isAllowedDateAndTime(this.selectedValue)) {
            this.setValue(this.selectedValue);
        }
    }

    setValue(newValue: moment.Moment[]): void {
        this.valueUpdate.emit(newValue);
    }

    clearHoverValue(): void {
        this.hoverValue = null;
    }

    handleHoverChange(hoverValue: moment.Moment): void {
        this.hoverValue = hoverValue;
    }

    onDayHover(value: moment.Moment): void {
        if (!this.selectedValue.length) {
            return;
        }
        this.hoverValue = value;
    }

    onClear(event: Event): void {
        event.stopPropagation();
        this.clearHoverValue();
        this.selectedValue = [];
        this.clear.emit();
    }



    /** 获取日期/时间的显示格式（用于日历上的输入框的显示） */
    getFormat(): string {
        const l = this.locale;
        const format = this.format;
        return format || (this.showTimePicker ? l.dateTimeFormat : l.dateFormat);
    }


    /** 当年份、月份面板出现或消失时（开始时间区） */
    onStartPanelChange(event: { isMonthPanelVisible: boolean, isYearPanelVisible: boolean }): void {
        this.isLeftMonthYearPanelShow = event.isMonthPanelVisible || event.isYearPanelVisible;
    }

    /** 当年份、月份面板出现或消失时（结束时间区） */
    onEndPanelChange(event: { isMonthPanelVisible: boolean, isYearPanelVisible: boolean }): void {
        this.isRightMonthYearPanelShow = event.isMonthPanelVisible || event.isYearPanelVisible;
    }

    /** 鼠标从日期表格移出 */
    onDatePanelLeave(): void {
        if (this.type !== 'both') {
            this.clearHoverValue();
        }
    }

    hasSelectedValue(): boolean {
        return !!this.selectedValue[1] && !!this.selectedValue[0];
    }

    /** 是否清空按钮可见 */
    isClearIconVisible(): boolean {
        return this.allowClear && this.hasSelectedValue();
    }

    isStartPanelNextEnable(): boolean {
        const startValue = this.getStartValue();
        const endValue = this.getEndValue();
        const nextMonthOfStart = startValue.clone().add(1, 'months');
        const isClosestMonths = nextMonthOfStart.year() === endValue.year() &&
            nextMonthOfStart.month() === endValue.month();

        return !isClosestMonths || this.isRightMonthYearPanelShow;
    }

    isEndPanelNextEnable(): boolean {
        const startValue = this.getStartValue();
        const endValue = this.getEndValue();
        const nextMonthOfStart = startValue.clone().add(1, 'months');
        const isClosestMonths = nextMonthOfStart.year() === endValue.year() &&
            nextMonthOfStart.month() === endValue.month();

        return !isClosestMonths || this.isLeftMonthYearPanelShow;
    }


    onRangeButtonHover(button: RangeButton): void {
        this._backupSelectedValue = this.selectedValue;
        if (button.start && button.end) {
            this.hoverValue = null;
            this.selectedValue = [button.start, button.end];
            // this.updateOKButtonClass();
            // this.updateTimePickerButtonClass();
        }
    }

    onRangeButtonLeave(button: RangeButton): void {
        if (this._backupSelectedValue) {
            this.selectedValue = this._backupSelectedValue;
            // this.updateOKButtonClass();
            // this.updateTimePickerButtonClass();
        }
        this._backupSelectedValue = null;
    }

    onRangeButtonClick(button: RangeButton): void {
        if (button.start && button.end) {
            this.selectedValue = [button.start, button.end];
            if (this.isAllowedDateAndTime(this.selectedValue)) {
                this.setValue(this.selectedValue);
            }
            // 更新确定按钮的样式
            this.updateOKButtonClass();
            this.updateTimePickerButtonClass();
        }
    }

}
