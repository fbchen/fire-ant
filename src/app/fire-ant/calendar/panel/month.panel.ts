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

export interface MonthData {
    month: number;
    title: string;
    content: string;
    value: moment.Moment;
}

/**
 * 月
 */
@Component({
    selector: 'ant-month-panel',
    templateUrl: './month.panel.html',
    preserveWhitespaces: false,
    encapsulation: ViewEncapsulation.None,
    providers: [ UpdateClassService ]
})
export class MonthPanel implements OnInit {

    @Input() rootPrefixCls: string;

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

    /** 月份的显示格式 */
    @Input() displayFormat = 'MMM';

    // 多少行
    @Input() row = 4;

    // 多少列
    @Input() col = 3;

    /** 显示顶部工具栏 */
    @Input() showHeader = true;

    /**
     * 国际化配置
     * 参考：https://github.com/ant-design/ant-design/blob/master/components/date-picker/locale/example.json
     */
    @Input() locale: any = {};

    /** 不可选择的月份 */
    @Input() disabledMonth: (value: moment.Moment) => boolean;

    /** 自定义的单元格显示模板，参数：{current: 当前单元格日期值，locale: 国际化} */
    @Input() cellRender: TemplateRef<any>;

    /** 自定义的单元格的内容显示模板，参数：{current: 当前单元格日期值，locale: 国际化} */
    @Input() cellContentRender: TemplateRef<any>;


    /** `年份选择`事件 */
    @Output() valueUpdate = new EventEmitter<moment.Moment>();

    /** `月份选择`事件 */
    @Output() change = new EventEmitter<moment.Moment>();

    /** 显示年选择面板 */
    public isYearPanelVisible = false;

    public startYear: number;
    public endYear: number;

    /** 由4行x3列的月份数据生成的表格 */
    public months: MonthData[][];

    constructor(
        private el: ElementRef,
        private updateClassService: UpdateClassService) {

    }

    /** The underlying host native element */
    getHostElement(): HTMLElement {
        return this.el.nativeElement as HTMLElement;
    }

    ngOnInit(): void {
        this.value = this.value || moment();
        this.buildData();

        // 初始化样式
        this.updateClassMap();
    }

    private updateClassMap(): void {
        const classes = this.prefixCls;
        this.updateClassService.update(this.el.nativeElement, classes);
    }

    buildData(): void {
        this.months = this.getMonths();
    }

    goYear(direction: number): void {
        const newValue = this.value.clone();
        newValue.add(direction, 'year');
        this.value = newValue;
        this.valueUpdate.emit(newValue);
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

    /** 显示“年”选择面板 */
    showYearPanel(event: Event): void {
        event.preventDefault();
        this.isYearPanelVisible = true;
    }

    /** 选择年 */
    onYearSelect(value: moment.Moment): void {
        this.value = value;
        this.isYearPanelVisible = false;
    }

    /** 选择年代 */
    onDecadeSelect(value: moment.Moment): void {
        this.value = value;
        this.buildData();
    }


    /** 获取月份的显示名字 */
    getMonthName(value: moment.Moment): string {
        if (this.displayFormat) {
            return value.format(this.displayFormat);
        }

        const locale = value.locale();
        const localeData = value.localeData();
        return localeData[locale === 'zh-cn' ? 'months' : 'monthsShort'](value);
    }

    /** 获取月份列表 */
    getMonths(): MonthData[][] {
        const value = this.value;
        const current = value.clone();

        const months: MonthData[][] = [];
        let index = 0;
        for (let rowIndex = 0; rowIndex < this.row; rowIndex++) {
            months[rowIndex] = [];
            for (let colIndex = 0; colIndex < this.col; colIndex++) {
                current.month(index);
                const content = this.getMonthName(current);
                months[rowIndex][colIndex] = {
                    month: index,
                    content: content,
                    title: content,
                    value: current.clone()
                };
                index++;
            }
        }
        return months;
    }

    isAllowMonth(current: moment.Moment, month: number): boolean {
        if (this.disabledMonth) {
            const value = current.clone().month(month);
            return !(this.disabledMonth(value) === true);
        }
        return true;
    }

    getMonthCellClass(monthData: MonthData): any {
        const value = this.value;
        const today = getToday(value);
        const currentMonth = this.value.month();
        const disabled = !this.isAllowMonth(value, monthData.month);

        return {
            [`${this.prefixCls}-cell`]: 1,
            [`${this.prefixCls}-cell-disabled`]: disabled,
            [`${this.prefixCls}-selected-cell`]: monthData.month === currentMonth,
            [`${this.prefixCls}-current-cell`]: today.year() === value.year() && monthData.month === today.month(),
        };
    }

    onSelectMonth(month: number, event: Event): void {
        if (this.isAllowMonth(this.value, month)) {
            this.chooseMonth(month, event); // 选择月份
        }
    }

    chooseMonth(month: number, event: Event): void {
        event.preventDefault();
        const value = this.value.clone();
        value.month(month);
        this.change.emit(value);
    }

}
