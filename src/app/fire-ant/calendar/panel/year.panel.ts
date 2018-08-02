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


/**
 * 年
 */
@Component({
    selector: 'ant-year-panel',
    templateUrl: './year.panel.html',
    preserveWhitespaces: false,
    encapsulation: ViewEncapsulation.None,
    providers: [ UpdateClassService ]
})
export class YearPanel implements OnInit {

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

    // 多少行（年）
    @Input() row = 4;

    // 多少列（年）
    @Input() col = 3;

    /**
     * 国际化配置
     * 参考：https://github.com/ant-design/ant-design/blob/master/components/date-picker/locale/example.json
     */
    @Input() locale: any = {};


    /** `年代选择`事件 */
    @Output() valueUpdate = new EventEmitter<moment.Moment>();

    /** `年份选择`事件 */
    @Output() change = new EventEmitter<moment.Moment>();

    /** 显示年代选择面板 */
    public isDecadePanelVisible = false;

    public startYear: number;
    public endYear: number;

    /** 由4行x3列的年份数据生成的表格 */
    public years: number[][];

    constructor(
        private el: ElementRef,
        private updateClassService: UpdateClassService) {

    }

    /** The underlying host native element */
    getHostElement(): HTMLElement {
        return this.el.nativeElement as HTMLElement;
    }

    ngOnInit(): void {
        this.buildData();

        // 初始化样式
        this.updateClassMap();
    }

    private updateClassMap(): void {
        const classes = this.prefixCls;
        this.updateClassService.update(this.el.nativeElement, classes);
    }

    buildData(): void {
        this.years = this.getYears();
    }


    goYear(direction: number): void {
        const newValue = this.value.clone();
        newValue.add(direction, 'year');
        this.value = newValue;
        this.buildData();
        this.valueUpdate.emit(newValue);
    }

    /** 下一年代：用于前进/后退按钮的响应 */
    nextDecade(event: Event): void {
        event.preventDefault();
        this.goYear(10);
    }

    /** 上一年代：用于前进/后退按钮的响应 */
    previousDecade(event: Event): void {
        event.preventDefault();
        this.goYear(-10);
    }

    /** 显示“年代”选择面板 */
    showDecadePanel(event: Event): void {
        event.preventDefault();
        this.isDecadePanelVisible = true;
    }

    /** 选择年代 */
    onDecadeSelect(value: moment.Moment): void {
        this.value = value;
        this.isDecadePanelVisible = false;
        this.buildData();
        this.valueUpdate.emit(value);
    }

    /** 选择世纪 */
    onCenturySelect(value: moment.Moment): void {
        this.value = value;
        this.buildData();
    }

    /** 获取年份列表，例如: [[2010, 2011, 2012], [2013, 2014, 2015], ...] */
    getYears(): number[][] {
        const value = this.value;
        const currentYear = value.year();
        const startYear = Math.floor(currentYear / 10) * 10; // 求整数，如2017->2010;
        const previousYear = startYear - 1;
        this.startYear = startYear;
        this.endYear = startYear + 10;

        const years: number[][] = [];
        let index = 0;
        for (let rowIndex = 0; rowIndex < this.row; rowIndex++) {
            years[rowIndex] = [];
            for (let colIndex = 0; colIndex < this.col; colIndex++) {
                const year = previousYear + index;
                years[rowIndex][colIndex] = year;
                index++;
            }
        }
        return years;
    }

    getYearCellClass(year: number): any {
        const currentYear: number = this.value.year();
        const startYear = Math.floor(currentYear / 10) * 10; // 求整数，如2017->2010
        const endYear = startYear + 9;

        return {
            [`${this.prefixCls}-cell`]: 1,
            [`${this.prefixCls}-selected-cell`]: year === currentYear,
            [`${this.prefixCls}-last-decade-cell`]: year < startYear,
            [`${this.prefixCls}-next-decade-cell`]: year > endYear,
        };
    }

    onSelectYear(year: number, event: Event): void {
        const currentYear: number = this.value.year();
        const startYear = Math.floor(currentYear / 10) * 10; // 求整数，如2017->2010
        const endYear = startYear + 9;

        if (year < startYear) {
            this.previousDecade(event);
        } else if (year > endYear) {
            this.nextDecade(event);
        } else {
            this.chooseYear(year, event);
        }
    }

    chooseYear(year: number, event: Event): void {
        event.preventDefault();
        const value = this.value.clone();
        value.year(year);
        this.change.emit(value);
    }

}
