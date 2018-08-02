/**
 * @license
 * Copyright 厦门乾元盛世科技有限公司 All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file.
 */


import {
    Component, Input, Output, EventEmitter, ElementRef, ViewEncapsulation,
    OnInit, TemplateRef, ContentChild
} from '@angular/core';

import { UpdateClassService } from '../core/service/update.class.service';
import { toBoolean } from '../util/lang';

import * as moment from 'moment';
import * as LOCALE from '../calendar/locale/zh_CN';


export type CalendarMode = 'month' | 'year';


@Component({
    selector: 'ant-fullcalendar',
    templateUrl: './fullcalendar.html',
    styleUrls: ['./style/index.scss', './style/patch.scss'],
    preserveWhitespaces: false,
    encapsulation: ViewEncapsulation.None,
    providers: [ UpdateClassService ],
    exportAs: 'fullcalendar'
})
export class FullCalendar implements OnInit {

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
    private _prefixCls = 'ant-fullcalendar';


    /** 初始值 */
    @Input() value: moment.Moment;

    /** moment的local设置 */
    @Input() lang = 'zh-cn';

    /**
     * 国际化配置
     * 参考：https://github.com/ant-design/ant-design/blob/master/components/date-picker/locale/example.json
     */
    @Input() locale: any = LOCALE.default;


    /** 初始模式，取值：`month`, `year` */
    @Input()
    get mode(): CalendarMode {
        return this._mode;
    }
    set mode(mode: CalendarMode) {
        if (this._mode !== mode) {
            this._mode = mode;
            // this.updateClassMap();
        }
    }
    private _mode: CalendarMode = 'month';


    /** 是否全屏显示 */
    @Input()
    get fullscreen(): boolean {
        return this._fullscreen;
    }
    set fullscreen(fullscreen: boolean) {
        const value = toBoolean(fullscreen);
        if (this._fullscreen !== value) {
            this._fullscreen = value;
            this.updateClassMap();
            this.updateCalendarWarpClass();
        }
    }
    private _fullscreen = true;


    /** 不可选择的日期 */
    @Input() disabledDate: (value: moment.Moment) => boolean;

    /** 年份选择框中，当前值的起始偏移量 */
    @Input() yearSelectOffset = 10;

    /** 年份选择框中，最大选项数 */
    @Input() yearSelectTotal = 20;

    /** 自定义渲染日期单元格，返回内容会被追加到单元格，参数：{current: 当前单元格日期值， value: 当前实际日期值} */
    @ContentChild('dateCellRender') dateCellRender: TemplateRef<any>;

    /** 自定义渲染日期单元格，返回内容会被追加到单元格，参数：{current: 当前单元格日期值， value: 当前实际日期值} */
    @ContentChild('dateCellContentRender') dateCellContentRender: TemplateRef<any>;

    /** 自定义渲染月单元格，返回内容会被追加到单元格，参数：{current: 当前单元格日期值，locale: 国际化} */
    @ContentChild('monthCellRender') monthCellRender: TemplateRef<any>;

    /** 自定义渲染月单元格，返回内容会被追加到单元格，参数：{current: 当前单元格日期值，locale: 国际化} */
    @ContentChild('monthCellContentRender') monthCellContentRender: TemplateRef<any>;


    /** 值选择事件 */
    @Output() valueUpdate = new EventEmitter<moment.Moment>();

    /** 面板切换事件 */
    @Output() panelChange = new EventEmitter<{date?: moment.Moment, mode?: CalendarMode}>();


    public _year: number;
    public _month: number;

    public years: any[] = [];
    public months: any[] = [];

    // 内部样式
    public calendarWarpClass: any;

    constructor(
        private el: ElementRef,
        private updateClassService: UpdateClassService) {
    }

    ngOnInit(): void {
        // 推荐在入口文件全局设置 locale
        // import 'moment/locale/zh-cn';
        moment.locale(this.lang || 'zh-cn');

        if (!this.value || !this.value.isValid()) {
            this.value = moment();
        }
        this._build();

        // 初始化样式
        this.updateClassMap();
        this.updateCalendarWarpClass();
    }

    private updateClassMap(): void {
        const classes = {
            [`${this.prefixCls}`]: true,
            [`${this.prefixCls}-fullscreen`]: this.fullscreen
        };
        this.updateClassService.update(this.el.nativeElement, classes);
    }

    private updateCalendarWarpClass(): void {
        this.calendarWarpClass = {
            [`${this.prefixCls}`]: 1,
            [`${this.prefixCls}-full`]: 1,
            [`${this.prefixCls}-fullscreen`]: this.fullscreen
        };
    }

    _build(): void {
        this._getYearMonth(); // 生成下拉框的已选值（年、月）
        this.getYearOptions(); // 生成年份选择框
        this.getMonthOptions(); // 生成月份选择框
    }

    _getYearMonth(): void {
        this._year = this.value.year();
        this._month = this.value.month();
    }

    getYearOptions(): any[] {
        const year = this.value.year();
        const start = year - (this.yearSelectOffset as number);
        const end = start + (this.yearSelectTotal as number);
        const suffix = this.locale.year === '年' ? '年' : '';
        const options: any[] = [];
        for (let i = start; i < end; i++) {
            options.push({
                value: i,
                text: `${i}${suffix}`
            });
        }
        return (this.years = options);
    }

    getMonthOptions(): any[] {
        const months: string[] = this._getMonthsLocale(this.value);
        const options: any[] = [];
        months.forEach((month: string, index: number) => {
            options.push({
                value: index,
                text: `${month}`
            });
        });
        return (this.months = options);
    }

    _getMonthsLocale(value: moment.Moment): string[] {
        const current = value.clone();
        const localeData = value.localeData();
        const months: string[] = [];
        for (let i = 0; i < 12; i++) {
          current.month(i);
          months.push(localeData.monthsShort(current));
        }
        return months;
    }

    onYearChange(year: number): void {
        this.value = this.value.clone().year(year);
        this._build(); // 重构下拉框等
    }

    onMonthChange(month: number): void {
        this.value = this.value.clone().month(month);
    }

    onValueChange(value: moment.Moment): void {
        this.value = value;
        this._getYearMonth();
        this.valueUpdate.emit(value);
    }

    onModeChange(mode: CalendarMode): void {
        this.mode = mode;
        this.panelChange.emit({date: this.value, mode: this.mode});
    }

    _zerofixed(v: number): string {
        if (v < 10) {
            return `0${v}`;
        }
        return `${v}`;
    }


}
