/**
 * @license
 * Copyright 厦门乾元盛世科技有限公司 All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file.
 */


import { Component, Input, Output, EventEmitter, ElementRef, ViewEncapsulation, OnInit } from '@angular/core';
import * as moment from 'moment';

import { UpdateClassService } from '../../core/service/update.class.service';
import { toBoolean } from '../../util/lang';

/**
 * 日历头部
 */
@Component({
    selector: 'ant-calendar-header',
    templateUrl: './calendar.header.html',
    preserveWhitespaces: false,
    encapsulation: ViewEncapsulation.None,
    providers: [ UpdateClassService ]
})
export class CalendarHeader implements OnInit {

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
    private _prefixCls: string;


    /** 面板值：用于在面板上显示当前年月的日期值 */
    @Input() value: moment.Moment;

    /**
     * 国际化配置
     * 参考：https://github.com/ant-design/ant-design/blob/master/components/date-picker/locale/example.json
     */
    @Input() locale: any = {};


    @Input()
    get showTimePicker(): boolean {
        return this._showTimePicker;
    }
    set showTimePicker(showTimePicker: boolean) {
        const value = toBoolean(showTimePicker);
        if (this._showTimePicker !== value) {
            this._showTimePicker = value;
            this.updateClassMap();
        }
    }
    private _showTimePicker = false;


    /** 时间选择控件是否可见 */
    @Input() isTimePickerVisible = false;

    /** 月份选择控件是否可见 */
    @Input() isMonthPanelVisible = false;

    /** 年份选择控件是否可见 */
    @Input() isYearPanelVisible = false;

    @Input() enablePrev = true;

    @Input() enableNext = true;

    /** 不可选择的月份（不是disabledDate，因为在Header中没有选择日期的，只有选择月份、年份等） */
    @Input() disabledMonth: (value: moment.Moment) => boolean;

    /** `选择`事件 */
    @Output() valueUpdate = new EventEmitter<moment.Moment>();

    /** `面板变化`事件 */
    @Output() panelChange = new EventEmitter<{
        isMonthPanelVisible: boolean, isYearPanelVisible: boolean
    }>();


    public startYear: number;
    public endYear: number;

    // 内部样式
    public monthYearElClass: any;

    constructor(
        private el: ElementRef,
        private updateClassService: UpdateClassService) {

    }

    ngOnInit(): void {
        this.value = this.value || moment();

        // 初始化样式
        this.updateClassMap();
        this.updateMonthYearElClass();
    }

    private updateClassMap(): void {
        const classes = {
            [`${this.prefixCls}-header`]: true
        };
        this.updateClassService.update(this.el.nativeElement, classes);
    }

    private updateMonthYearElClass(): void {
        const monthBeforeYear = this.isMonthBeforeYear();
        this.monthYearElClass = {
            [`${this.prefixCls}-my-select`]: monthBeforeYear,
            [`${this.prefixCls}-ym-select`]: !monthBeforeYear,
        };
    }

    /** The underlying host native element */
    getHostElement(): HTMLElement {
        return this.el.nativeElement as HTMLElement;
    }

    setValue(newValue: moment.Moment): void {
        this.value = newValue;
        this.valueUpdate.emit(newValue);
    }


    /** 对年份进行加减 */
    goYear(direction: number): void {
        const newValue = this.value.clone();
        newValue.add(direction, 'years');
        this.setValue(newValue);
    }

    /** 对月份进行加减 */
    goMonth(direction: number): void {
        const newValue = this.value.clone();
        newValue.add(direction, 'months');
        this.setValue(newValue);
    }

    /** 下一年：用于前进/后退按钮的响应 */
    nextYear(event: Event): void {
        event.preventDefault();
        this.goYear(1);
    }

    /** 上一年：用于前进/后退按钮的响应 */
    previousYear(event: Event): void {
        event.preventDefault();
        this.goYear(-1);
    }

    /** 下一月：用于前进/后退按钮的响应 */
    nextMonth(event: Event): void {
        event.preventDefault();
        this.goMonth(1);
    }

    /** 上一月：用于前进/后退按钮的响应 */
    previousMonth(event: Event): void {
        event.preventDefault();
        this.goMonth(-1);
    }

    /** 显示月份选择面板 */
    showMonthPanel(event: Event): void {
        event.preventDefault();
        if (this.isTimePickerVisible) {
            return;
        }

        this.isMonthPanelVisible = true;
        this.isYearPanelVisible = false;
        this.triggerPanelChange();
    }

    /** 显示年份选择面板 */
    showYearPanel(event: Event): void {
        event.preventDefault();
        if (this.isTimePickerVisible) {
            return;
        }

        this.isMonthPanelVisible = false;
        this.isYearPanelVisible = true;
        this.triggerPanelChange();
    }

    /** 选择年代或世纪 */
    onSelectDecadeOrCentury(value: moment.Moment): void {
        this.setValue(value);
    }

    /** 选择月份或年份 */
    onSelectMonthOrYear(value: moment.Moment): void {
        this.setValue(value);
        this.isMonthPanelVisible = false;
        this.isYearPanelVisible = false;
        this.triggerPanelChange();
    }

    triggerPanelChange(): void {
        this.panelChange.emit({
            isMonthPanelVisible: this.isMonthPanelVisible,
            isYearPanelVisible: this.isYearPanelVisible
        });
    }

    /** 不同的文化中，日期格式的年、月的排序不一样，例如：“1995-12-25”和“12/25/1995 */
    isMonthBeforeYear(): boolean {
        const locale = this.locale || {};
        return locale.monthBeforeYear || false;
    }

    getLocaleData(): any {
        return this.value.localeData();
    }


}
