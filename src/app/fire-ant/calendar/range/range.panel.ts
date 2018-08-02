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
import { DisabledTime, getDisabledTime } from '../time/time.util';

/**
 * 范围选择
 */
@Component({
    selector: 'ant-range-panel',
    templateUrl: './range.panel.html',
    preserveWhitespaces: false,
    encapsulation: ViewEncapsulation.None,
    providers: [ UpdateClassService ]
})
export class RangePanel implements OnInit {

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

    /** 鼠标热点值 */
    @Input() hoverValue: moment.Moment;

    /** 已选择值 */
    @Input()
    get selectedValue(): moment.Moment[] {
        return this._selectedValue;
    }
    set selectedValue(selectedValue: moment.Moment[]) {
        this._selectedValue = selectedValue;
        this.buildData();
    }
    private _selectedValue: moment.Moment[];


    /** 面板布局位置 */
    @Input()
    get direction(): 'left' | 'right' {
        return this._direction;
    }
    set direction(direction: 'left' | 'right') {
        if (this._direction !== direction) {
            this._direction = direction;
        }
    }
    private _direction: 'left' | 'right';


    /** 是否显示时间选择框 */
    @Input() showTimePicker = false;

    /** 时间选择控件是否可见 */
    @Input() isTimePickerVisible = false;

    /** 是否显示星期数（第几周 OF YEAR） */
    @Input() showWeekNumber = false;

    /** 不可选择的月份 */
    @Input() disabledMonth: (value: moment.Moment) => boolean;

    /** 不可选择的日期 */
    @Input() disabledDate: (value: moment.Moment) => boolean;

    /** 不可选择的时间(将根据选择的日期动态调用获取) */
    @Input() disabledTime: (value: moment.Moment) => DisabledTime;

    /** 返回值的格式 */
    @Input() format: string;

    /** 选择框默认文字 */
    @Input() placeholder: string;

    /** 翻页按钮是否可用 */
    @Input() enableNext: boolean;
    @Input() enablePrev: boolean;

    /**
     * 国际化配置
     * 参考：https://github.com/ant-design/ant-design/blob/master/components/date-picker/locale/example.json
     */
    @Input() locale: any = {};


    /** `日期变更`事件 */
    @Output() change = new EventEmitter<moment.Moment>();

    /** `时间选择`事件 */
    @Output() timechange = new EventEmitter<moment.Moment>();

    /** `年月选择`事件 */
    @Output() valueUpdate = new EventEmitter<moment.Moment>();

    /** `鼠标滑过`事件 */
    @Output() dayHover = new EventEmitter<moment.Moment>();


    /** 获取不可用的小时列表 */
    public disabledHours: () => number[];

    /** 获取不可用的分钟列表 */
    public disabledMinutes: (hour: number) => number[];

    /** 获取不可用的秒钟列表 */
    public disabledSeconds: (hour: number, minute: number) => number[];

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
        const classes = {
            [`${this.prefixCls}-range-part`]: true,
            [`${this.prefixCls}-range-${this.direction}`]: true
        };
        this.updateClassService.update(this.el.nativeElement, classes);
    }

    buildData(): void {
        this.buildTimeConfig();
    }

    buildTimeConfig(): void {
        if (this.showTimePicker) {
            const value = this.getValue();
            const cfg = getDisabledTime(value, this.disabledTime);
            this.disabledHours = cfg.disabledHours;
            this.disabledMinutes = cfg.disabledMinutes;
            this.disabledSeconds = cfg.disabledSeconds;
        }
    }

    /** 用于面板顶部的输入框的显示值，这里用selectedValue中的一个（根据start/end面板确定） */
    getValue(): moment.Moment {
        const index = this.direction === 'left' ? 0 : 1;
        return this.selectedValue[index];
    }

    /** 由于直接点击日历表格，获取实际的值 */
    selectDateValue(newValue: moment.Moment): void {
        this.change.emit(newValue);
    }

    /** 选择时间 */
    selectTimeValue(newValue: moment.Moment): void {
        this.timechange.emit(newValue);
    }

    /** 由于年份、月份面板导致的日期重置 */
    setValue(newValue: moment.Moment): void {
        this.valueUpdate.emit(newValue);
    }

    /** 由于鼠标移动，获取当前鼠标正在覆盖的值（用于显示有背景色的选择范围） */
    onDayHover(value: moment.Moment): void {
        this.dayHover.emit(value);
    }

}
