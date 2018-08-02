/**
 * @license
 * Copyright 厦门乾元盛世科技有限公司 All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file.
 */


import { Component, Input, Output, EventEmitter, ElementRef, ViewEncapsulation, OnInit, TemplateRef } from '@angular/core';
import * as moment from 'moment';

import { UpdateClassService } from '../../core/service/update.class.service';
import { getToday } from '../calendar';



const DATE_ROW_COUNT = 6;
const DATE_COL_COUNT = 7;

export interface WeekDay {
    shortName: string;
    name: string;
}

export interface DayInfo {
    value: moment.Moment;
    date: number;
    isToday: boolean;
    isCurrentWeek: boolean;
    isBeforeCurrentMonthYear: boolean;
    isAfterCurrentMonthYear: boolean;
    isDisabled: boolean;
}

/**
 * 日期表格
 */
@Component({
    selector: 'ant-date-panel',
    templateUrl: './date.panel.html',
    preserveWhitespaces: false,
    encapsulation: ViewEncapsulation.None,
    providers: [ UpdateClassService ]
})
export class DatePanel implements OnInit {

    /** 样式前缀 */
    @Input()
    get prefixCls(): string {
        return this._prefixCls;
    }
    set prefixCls(prefixCls: string) {
        if (this._prefixCls !== prefixCls) {
            this._prefixCls = prefixCls;
        }
    }
    private _prefixCls: string;


    /** 面板值：该值用于生成日期表格面板（范围选择时，value值不作为实际值；在单选控件中，value也作为实际值) */
    @Input()
    get value(): moment.Moment {
        return this._value;
    }
    set value(value: moment.Moment) {
        this._value = value || moment();
        this.buildData();
    }
    private _value: moment.Moment;


    /** 已选中的值：主要用于RangePicker，显示有背景色的日期范围。例如鼠标移入一个包含预定义范围的按钮上，将触发传入一个预览的selectedValue范围。 */
    @Input() selectedValue: moment.Moment[];

    /** 鼠标盘旋的值：主要用于RangePicker，显示有背景色的日期范围。例如鼠标点击选择一个值后，鼠标移动，此时的hoverValue将与第一个值组成一个预览的范围。 */
    @Input() hoverValue: moment.Moment;

    /** 如果是范围选择，则需要设置为 true */
    @Input() isRangePicker = false;

    /**
     * 国际化配置
     * 参考：https://github.com/ant-design/ant-design/blob/master/components/date-picker/locale/example.json
     */
    @Input() locale: any = {};

    /** 是否显示星期数（第几周 OF YEAR） */
    @Input() showWeekNumber = false;

    /** 不可选择的日期 */
    @Input() disabledDate: (value: moment.Moment) => boolean;

    /** 自定义的日期单元格显示模板，参数：{current: 当前单元格日期值， value: 当前实际日期值} */
    @Input() dateCellRender: TemplateRef<any>;

    /** 自定义的日期单元格的内容显示模板，参数：{current: 当前单元格日期值， value: 当前实际日期值} */
    @Input() dateCellContentRender: TemplateRef<any>;


    /** `选择`事件 */
    @Output() valueUpdate = new EventEmitter<moment.Moment>();

    /** `鼠标滑过`事件 */
    @Output() dayHover = new EventEmitter<moment.Moment>();

    /** 由6行x7列的日期数据生成的表格 */
    public days: DayInfo[][];
    /** 表格的表头行数据 */
    public weekDays: WeekDay[];

    constructor(
        private el: ElementRef) {

    }

    /** The underlying host native element */
    getHostElement(): HTMLElement {
        return this.el.nativeElement as HTMLElement;
    }

    ngOnInit(): void {
        this.value = this.value || moment();
        this.buildData();
    }

    buildData(): void {
        this.days = this.getDays();
        this.weekDays = this.getWeekDays();
    }

    getWeekDays(): WeekDay[] {
        const value = this.value;
        const localeData = value.localeData();
        const firstDayOfWeek = localeData.firstDayOfWeek();
        const now = moment();

        const weekDays: WeekDay[] = [];
        for (let i = 0; i < DATE_COL_COUNT; i++) {
            const index = (firstDayOfWeek + i) % DATE_COL_COUNT;
            now.day(index);
            weekDays[i] = {
                shortName: localeData.weekdaysMin(now),
                name: localeData.weekdaysShort(now)
            };
        }
        return weekDays;
    }


    isSameDay(one: moment.Moment, two: moment.Moment): boolean {
        return one && two && one.isSame(two, 'day');
    }

    isSameMonthYear(current: moment.Moment, today: moment.Moment): boolean {
        return current.year() === today.year() && current.month() === today.month();
    }

    beforeCurrentMonthYear(current: moment.Moment, today: moment.Moment): boolean {
        if (current.year() < today.year()) {
            return true;
        }
        return current.year() === today.year() && current.month() < today.month();
    }

    afterCurrentMonthYear(current: moment.Moment, today: moment.Moment): boolean {
        if (current.year() > today.year()) {
            return true;
        }
        return current.year() === today.year() && current.month() > today.month();
    }


    getDays(): DayInfo[][] {
        const value = this.value;
        const today = getToday(value);

        // 本月（开始于本月“第一天”）
        const month1 = value.clone();
        month1.date(1);

        // 本月第一天是周几
        const day = month1.day();
        const lastMonthDiffDay = (day + 7 - value.localeData().firstDayOfWeek()) % 7;

        // 获取上个月的最后一周
        const lastMonth1 = month1.clone();
        lastMonth1.add(-lastMonthDiffDay, 'days');

        // 遍历行列，生成显示日期
        const current = lastMonth1;
        const days: any[][] = [];
        for (let rowIndex = 0; rowIndex < DATE_ROW_COUNT; rowIndex++) {
            days[rowIndex] = [];
            for (let colIndex = 0; colIndex < DATE_COL_COUNT; colIndex++) {
                const val = current.clone();
                const isBeforeCurrentMonthYear = this.beforeCurrentMonthYear(current, value);
                const isAfterCurrentMonthYear = this.afterCurrentMonthYear(current, value);
                days[rowIndex][colIndex] = {
                    value: val,
                    date: val.date(),
                    isToday: this.isSameDay(current, today),
                    isCurrentWeek: this.isSameDay(current, today),
                    isBeforeCurrentMonthYear: isBeforeCurrentMonthYear,
                    isAfterCurrentMonthYear: isAfterCurrentMonthYear,
                    isDisabled: this.isDisabledDate(current)
                };
                current.add(1, 'days');
            }
        }

        return days;
    }

    isDisabledDate(current: moment.Moment): boolean {
        const disabledDate = this.disabledDate;
        if (disabledDate) {
            return disabledDate(current);
        }
        return false;
    }

    /** 主要用于RangePicker，显示有背景色的日期范围 */
    getHoverRange(): moment.Moment[] {
        const rangeValue = [];
        const values = this.selectedValue;
        const len = values && values.length || 0;

        if (len) {
            if (len === 2) {
                rangeValue.push(...values);
            } else {
                const value = values[0];
                if (this.hoverValue) {
                    if (this.hoverValue.isBefore(value, 'day')) {
                        rangeValue.push(this.hoverValue, value);
                    } else {
                        rangeValue.push(value, this.hoverValue);
                    }
                } else {
                    rangeValue.push(value);
                }
            }
        }
        return rangeValue;
    }

    /** 鼠标滑动中的选择状态 */
    isSelectedDate(current: moment.Moment): boolean {
        // 面板上只有当月的日期可以hover覆盖
        if (!this.isSameMonthYear(current, this.value)) {
            return false;
        }

        // 范围选择（范围选择时，value值不作为实际值）
        const rangeValue = this.getHoverRange();
        if (rangeValue.length) {
            for (let i = 0; i < rangeValue.length; i++) {
                if (this.isSameDay(current, rangeValue[i])) {
                    return true;
                }
            }
        }

        // 非范围选择
        if (!this.isRangePicker && this.isSameDay(current, this.value)) {
            return true;
        }

        return false;
    }

    /** 鼠标点击后的选择状态 (与selectedValue的值进行比较) */
    isSelectedValueDate(current: moment.Moment): boolean {
        const selectedValue = this.selectedValue;
        if (selectedValue) {
            for (let i = 0; i < selectedValue.length; i++) {
                if (this.isSameDay(current, selectedValue[i])) {
                    return true;
                }
            }
        }
        return false;
    }

    isInHoverRange(current: moment.Moment): boolean {
        const rangeValue = this.getHoverRange();
        if (!rangeValue.length) {
            return false;
        }

        // 面板上只有当月的日期可以hover覆盖
        if (!this.isSameMonthYear(current, this.value)) {
            return false;
        }

        const startValue = rangeValue[0];
        const endValue = rangeValue[1];
        return current.isAfter(startValue, 'day') && current.isBefore(endValue, 'day');
    }

    getDayTitle(current: moment.Moment): string {
        return current.format('L');
    }

    getDayRowClass(days: DayInfo[]): any {
        let isCurrentWeek = false;
        let isActiveWeek = false;
        days.forEach(day => {
            if (day.isCurrentWeek) {
                isCurrentWeek = true;
            }
            if (!isActiveWeek) {
                const current = day.value;
                isActiveWeek = this.isSelectedDate(current);
            }
        });

        return {
            [`${this.prefixCls}-current-week`]: isCurrentWeek,
            [`${this.prefixCls}-active-week`]: isActiveWeek,
        };
    }

    getDayCellClass(day: DayInfo, days: DayInfo[]): any {
        const len = days.length;
        const index = days.indexOf(day);
        const isFirst = index === 0;
        const isLast = index === len - 1;

        const current = day.value;
        const isSelected = this.isSelectedDate(current);
        const isSelectedValue = this.isSelectedValueDate(current);
        const isInHoverRange = this.isInHoverRange(current);

        return {
            [`${this.prefixCls}-cell`]: true,
            [`${this.prefixCls}-today`]: day.isToday,
            [`${this.prefixCls}-last-month-cell`]: day.isBeforeCurrentMonthYear,
            [`${this.prefixCls}-next-month-btn-day`]: day.isAfterCurrentMonthYear,

            [`${this.prefixCls}-in-range-cell`]: isInHoverRange,
            [`${this.prefixCls}-selected-day`]: isSelected, // 当selectedValue选中时，或value一样
            [`${this.prefixCls}-selected-date`]: isSelectedValue, // 当selectedValue选中时

            [`${this.prefixCls}-disabled-cell`]: day.isDisabled,
            [`${this.prefixCls}-disabled-cell-first-of-row`]: day.isDisabled && isFirst,
            [`${this.prefixCls}-disabled-cell-last-of-row`]: day.isDisabled && isLast,
        };
    }

    onSelectDay(day: DayInfo, event: Event): void {
        event.preventDefault();
        if (day.isDisabled) {
            return;
        }
        this.valueUpdate.emit(day.value);
    }

    onDayHover(day: DayInfo, event: Event): void {
        event.preventDefault();
        if (day.isDisabled) {
            return;
        }
        this.dayHover.emit(day.value);
    }

}
