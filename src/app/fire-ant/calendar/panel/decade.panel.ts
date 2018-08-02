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

export interface DecadeData {
    startYear: number;
    endYear: number;
}

/**
 * 年代
 */
@Component({
    selector: 'ant-decade-panel',
    templateUrl: './decade.panel.html',
    preserveWhitespaces: false,
    encapsulation: ViewEncapsulation.None,
    providers: [ UpdateClassService ]
})
export class DecadePanel implements OnInit {

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



    /** `世纪选择`事件 */
    @Output() valueUpdate = new EventEmitter<moment.Moment>();

    /** `年代选择`事件 */
    @Output() change = new EventEmitter<moment.Moment>();


    public startYear: number;
    public endYear: number;

    /** 由4行x3列的数据生成的表格 */
    public decades: DecadeData[][];

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
        this.decades = this.getYears();
    }


    goYear(direction: number): void {
        const newValue = this.value.clone();
        newValue.add(direction, 'years');
        this.value = newValue;
        this.buildData();
        this.valueUpdate.emit(newValue);
    }

    /** 下一世纪：用于前进/后退按钮的响应 */
    nextCentury(event: Event): void {
        event.preventDefault();
        this.goYear(100);
    }

    /** 上一世纪：用于前进/后退按钮的响应 */
    previousCentury(event: Event): void {
        event.preventDefault();
        this.goYear(-100);
    }

    /** 获取年代列表 */
    getYears(): DecadeData[][] {
        const value = this.value;
        const currentYear = value.year();
        const startYear = Math.floor(currentYear / 100) * 100; // 求整数，如2017->2000;
        const previousYear = startYear - 10;
        this.startYear = startYear;
        this.endYear = startYear + 99;

        const years: DecadeData[][] = [];
        let index = 0;
        for (let rowIndex = 0; rowIndex < this.row; rowIndex++) {
            years[rowIndex] = [];
            for (let colIndex = 0; colIndex < this.col; colIndex++) {
                const value1 = previousYear + index * 10;
                const value2 = previousYear + index * 10 + 9;
                years[rowIndex][colIndex] = {
                    startYear: value1,
                    endYear: value2
                };
                index++;
            }
        }
        return years;
    }

    getDecadeCellClass(decade: DecadeData): any {
        const currentYear: number = this.value.year();
        const startYear = Math.floor(currentYear / 100) * 100; // 求整数，如2017->2000
        const endYear = startYear + 99;

        return {
            [`${this.prefixCls}-cell`]: 1,
            [`${this.prefixCls}-selected-cell`]: currentYear >= decade.startYear && currentYear <= decade.endYear,
            [`${this.prefixCls}-last-century-cell`]: decade.startYear < startYear,
            [`${this.prefixCls}-next-century-cell`]: decade.endYear > endYear,
        };
    }

    onSelectDecade(decade: DecadeData, event: Event): void {
        const currentYear: number = this.value.year();
        const startYear = Math.floor(currentYear / 100) * 100; // 求整数，如2017->2000
        const endYear = startYear + 99;

        if (decade.startYear < startYear) {
            this.previousCentury(event);
        } else if (decade.endYear > endYear) {
            this.nextCentury(event);
        } else {
            this.chooseDecade(decade, event);
        }
    }

    chooseDecade(decade: DecadeData, event: Event): void {
        event.preventDefault();
        const value = this.value.clone();
        value.year(decade.startYear);
        this.change.emit(value);
    }

}
