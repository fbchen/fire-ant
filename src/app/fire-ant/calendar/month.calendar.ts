/**
 * @license
 * Copyright 厦门乾元盛世科技有限公司 All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file.
 */


import { Component, ElementRef, ViewEncapsulation, HostBinding, HostListener, OnInit } from '@angular/core';
import * as moment from 'moment';

import { UpdateClassService } from '../core/service/update.class.service';
import { KeyCode } from '../util/key.code';
import { Calendar } from './calendar';

/**
 * 月历控件
 * 参考：https://github.com/react-component/calendar
 */
@Component({
    selector: 'ant-month-calendar',
    templateUrl: './month.calendar.html',
    preserveWhitespaces: false,
    encapsulation: ViewEncapsulation.None,
    providers: [ UpdateClassService ],
    exportAs: 'calendar'
})
export class MonthCalendar extends Calendar implements OnInit {

    /** 使光标可以聚焦，然后可以使用键盘导航 */
    @HostBinding('attr.tabIndex') tabIndex = '0';

    constructor(
        protected el: ElementRef,
        protected updateClassService: UpdateClassService) {
        super(el, updateClassService);
    }


    @HostListener('keydown', ['$event'])
    onKeyDown(event: KeyboardEvent): void {
        const keyCode = event.keyCode;

        // mac
        const ctrlKey = event.ctrlKey || event.metaKey;
        const disabledDate = this.disabledDate;

        let value = this.innerValue;
        switch (keyCode) {
            case KeyCode.DOWN:
                event.preventDefault();
                value = value.clone();
                value.add(3, 'months');
                this.setValue(value);
                return;
            case KeyCode.UP:
                event.preventDefault();
                value = value.clone();
                value.add(-3, 'months');
                this.setValue(value);
                return;
            case KeyCode.LEFT:
                event.preventDefault();
                value = value.clone();
                if (ctrlKey) {
                    value.add(-1, 'years');
                } else {
                    value.add(-1, 'months');
                }
                this.setValue(value);
                return;
            case KeyCode.RIGHT:
                event.preventDefault();
                value = value.clone();
                if (ctrlKey) {
                    value.add(1, 'years');
                } else {
                    value.add(1, 'months');
                }
                this.setValue(value);
                return;
            case KeyCode.ENTER:
                event.preventDefault();
                if (!disabledDate || !disabledDate(value)) {
                    this.onSelect(value, 'keyboard');
                }
                return;
            case KeyCode.ESC:
                this.keyesc.emit(event);
                return;
            default:
                // this.keydown.emit(event);
                return;
        }
    }

    isAllowedDate(value: moment.Moment): boolean {
        const disabledDate = this.disabledDate;
        if (disabledDate && disabledDate(value)) {
            return false;
        }
        return true;
    }

    /** 获取日期/时间的显示格式（用于日历上的输入框的显示） */
    getFormat(): string {
        return this.format || this.locale.dateTimeFormat;
    }

    /** 选择月份 */
    onSelectMonth(value: moment.Moment): void {
        this.onSelect(value, 'picker');
    }

    /** 选择年份 */
    onSelectYear(value: moment.Moment): void {
        this.setValue(value);
    }

}
