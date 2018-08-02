/**
 * @license
 * Copyright 厦门乾元盛世科技有限公司 All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file.
 */


import { Component, Input, Output, ElementRef, EventEmitter, ViewEncapsulation, OnInit } from '@angular/core';
import * as moment from 'moment';

import { UpdateClassService } from '../../core/service/update.class.service';


export interface TimeOpt {
    value: number;
    text: string;
    disabled: boolean;
}

/**
 * 时间选项组合框
 */
@Component({
    selector: 'ant-time-combobox',
    templateUrl: './time.combobox.html',
    preserveWhitespaces: false,
    encapsulation: ViewEncapsulation.None,
    providers: [ UpdateClassService ]
})
export class TimeCombobox implements OnInit {

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


    /** 实际日期值 */
    @Input() value: moment.Moment;

    /** 时间格式 */
    @Input() format: string;

    @Input() showHour = true;
    @Input() showMinute = true;
    @Input() showSecond = true;

    /** 隐藏禁止选择的选项 */
    @Input() hideDisabledOptions = false;

    /** 获取不可用的小时列表 */
    @Input() disabledHours: () => number[];

    /** 获取不可用的分钟列表 */
    @Input() disabledMinutes: (hour: number) => number[];

    /** 获取不可用的秒钟列表 */
    @Input() disabledSeconds: (hour: number, minute: number) => number[];


    /** `变更`事件 */
    @Output() change = new EventEmitter<moment.Moment>();


    public hourOptions: TimeOpt[];
    public minuteOptions: TimeOpt[];
    public secondOptions: TimeOpt[];

    constructor(
        protected el: ElementRef,
        protected updateClassService: UpdateClassService) {

    }

    ngOnInit(): void {
        this.buildData();
        this.updateClassMap();
    }

    private updateClassMap(): void {
        const classes = {
            [`${this.prefixCls}-combobox`]: true
        };
        this.updateClassService.update(this.el.nativeElement, classes);
    }

    buildData(): void {
        this.hourOptions = this.getHourOptions();
        this.minuteOptions = this.getMinuteOptions();
        this.secondOptions = this.getSecondOptions();
    }

    buildOnHourChange(): void {
        this.minuteOptions = this.getMinuteOptions();
        this.secondOptions = this.getSecondOptions();
    }

    buildOnMinuteChange(): void {
        this.secondOptions = this.getSecondOptions();
    }

    onItemChange(type: string, itemValue: number): void {
        const value = this.value.clone();
        if (type === 'hour') {
            this.value = value.hour(itemValue);
            this.buildOnHourChange();
        } else if (type === 'minute') {
            this.value = value.minute(itemValue);
            this.buildOnMinuteChange();
        } else {
            this.value = value.second(itemValue);
        }

        this.change.emit(value);
    }

    getHourSelectedIndex(): number {
        return this.value.hour();
    }

    getMinuteSelectedIndex(): number {
        return this.value.minute();
    }

    getSecondSelectedIndex(): number {
        return this.value.second();
    }

    /** 获取小时列表 */
    getHourOptions(): TimeOpt[] {
        if (!this.showHour) {
            return null;
        }

        const hourOptions: TimeOpt[] = [];
        const disabledOptions = this.disabledHours && this.disabledHours() || [];
        for (let i = 0; i < 24; i++) {
            hourOptions.push({
                value: i,
                text: i < 10 ? `0${i}` : `${i}`,
                disabled: disabledOptions.indexOf(i) >= 0
            });
        }
        return hourOptions;
    }

    /** 获取分钟列表 */
    getMinuteOptions(): TimeOpt[] {
        if (!this.showMinute) {
            return null;
        }

        const value = this.value;
        const minuteOptions: TimeOpt[] = [];
        const disabledOptions = this.disabledMinutes && this.disabledMinutes(value.hour()) || [];
        for (let i = 0; i < 60; i++) {
            minuteOptions.push({
                value: i,
                text: i < 10 ? `0${i}` : `${i}`,
                disabled: disabledOptions.indexOf(i) >= 0
            });
        }
        return minuteOptions;
    }

    /** 获取秒钟列表 */
    getSecondOptions(): TimeOpt[] {
        if (!this.showSecond) {
            return null;
        }

        const value = this.value;
        const secondOptions: TimeOpt[] = [];
        const disabledOptions = this.disabledSeconds && this.disabledSeconds(value.hour(), value.minute()) || [];
        for (let i = 0; i < 60; i++) {
            secondOptions.push({
                value: i,
                text: i < 10 ? `0${i}` : `${i}`,
                disabled: disabledOptions.indexOf(i) >= 0
            });
        }
        return secondOptions;
    }

}
