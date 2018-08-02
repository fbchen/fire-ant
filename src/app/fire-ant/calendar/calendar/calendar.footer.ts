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
import { getToday } from '../calendar';


/**
 * 日历页脚
 */
@Component({
    selector: 'ant-calendar-footer',
    templateUrl: './calendar.footer.html',
    preserveWhitespaces: false,
    encapsulation: ViewEncapsulation.None,
    providers: [ UpdateClassService ]
})
export class CalendarFooter implements OnInit {

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
    @Input()
    get value(): moment.Moment {
        return this._value;
    }
    set value(value: moment.Moment) {
        this._value = value;
        this.updateTodayButtonClass();
    }
    private _value: moment.Moment;

    /** 已选中的值 */
    @Input() selectedValue: moment.Moment[];

    /**
     * 国际化配置
     * 参考：https://github.com/ant-design/ant-design/blob/master/components/date-picker/locale/example.json
     */
    @Input() locale: any = {};

    /** 显示【确定】按钮 */
    @Input()
    get showOk(): boolean {
        return this._showOk;
    }
    set showOk(showOk: boolean) {
        const value = toBoolean(showOk);
        if (this._showOk !== value) {
            this._showOk = value;
            this.updateClassMap();
            this.updateOKButtonClass();
        }
    }
    private _showOk: boolean;


    /** 显示【今天】按钮 */
    @Input()
    get showToday(): boolean {
        return this._showToday;
    }
    set showToday(showToday: boolean) {
        const value = toBoolean(showToday);
        if (this._showToday !== value) {
            this._showToday = value;
            // this.updateClassMap();
        }
    }
    private _showToday = true;


    /** 是否显示选择“时间”的按钮 */
    @Input()
    get showTimePicker(): boolean {
        return this._showTimePicker;
    }
    set showTimePicker(showTimePicker: boolean) {
        const value = toBoolean(showTimePicker);
        if (this._showTimePicker !== value) {
            this._showTimePicker = value;
            this.updateClassMap();
            this.updateOKButtonClass();
        }
    }
    private _showTimePicker = false;


    /** 显示“日期输入框” */
    @Input() showDateInput = true;


    /** 禁用注脚的所有按钮 */
    @Input()
    get disabled(): boolean {
        return this._disabled;
    }
    set disabled(disabled: boolean) {
        const value = toBoolean(disabled);
        if (this._disabled !== value) {
            this._disabled = value;
            this.updateTodayButtonClass();
            this.updateTimePickerButtonClass();
            this.updateOKButtonClass();
        }
    }
    private _disabled = false;


    /** 禁用【确定】按钮 */
    @Input()
    get okDisabled(): boolean {
        return this._okDisabled;
    }
    set okDisabled(okDisabled: boolean) {
        const value = toBoolean(okDisabled);
        if (this._okDisabled !== value) {
            this._okDisabled = value;
            this.updateOKButtonClass();
        }
    }
    private _okDisabled = false;


    /** 禁用【时间】按钮 */
    @Input()
    get timePickerDisabled(): boolean {
        return this._timePickerDisabled;
    }
    set timePickerDisabled(timePickerDisabled: boolean) {
        const value = toBoolean(timePickerDisabled);
        if (this._timePickerDisabled !== value) {
            this._timePickerDisabled = value;
            this.updateTimePickerButtonClass();
        }
    }
    private _timePickerDisabled = false;


    /** 时间选择控件是否可见 */
    @Input() isTimePickerVisible = false;

    /** 【今天】按钮的文本 */
    @Input() todayBtnText: string;

    /** 不可选择的日期 */
    @Input()
    get disabledDate(): (value: moment.Moment) => boolean {
        return this._disabledDate;
    }
    set disabledDate(disabledDate: (value: moment.Moment) => boolean) {
        this._disabledDate = disabledDate;
        this.updateTodayButtonClass();
    }
    private _disabledDate: (value: moment.Moment) => boolean;


    /** `选择`事件 */
    @Output() confirm = new EventEmitter<{value: moment.Moment, cause: string}>();

    /** `时间控件开关`事件 */
    @Output() timePickerOpenChange = new EventEmitter<boolean>();


    // 内部样式
    public todayButtonClass: any;
    public okButtonClass: any;
    public timePickerButtonClass: any;

    constructor(
        private el: ElementRef,
        private updateClassService: UpdateClassService) {

    }

    ngOnInit(): void {
        this.value = this.value || moment();

        // 初始化样式
        this.updateOKButtonClass();
        this.updateTodayButtonClass();
        this.updateTimePickerButtonClass();
        this.updateClassMap();
    }

    /** The underlying host native element */
    getHostElement(): HTMLElement {
        return this.el.nativeElement as HTMLElement;
    }

    private updateClassMap(): void {
        const classes = {
            [`${this.prefixCls}-footer`]: true,
            [`${this.prefixCls}-footer-show-ok`]: this.showOkButton()
        };
        this.updateClassService.update(this.el.nativeElement, classes);
    }

    /** 【今天】按钮是否可用 */
    isTodayDisabled(): boolean {
        let isDisabled = this.disabled;
        if (!isDisabled && this.value) {
            const today = getToday(this.value);
            isDisabled = this.disabledDate && this.disabledDate(today);
        }
        return isDisabled;
    }

    /** 获取【今天】按钮的样式 */
    updateTodayButtonClass(): void {
        this.todayButtonClass = {
            [`${this.prefixCls}-today-btn`]: true,
            [`${this.prefixCls}-today-btn-disabled`]: this.isTodayDisabled()
        };
    }

    /** 获取【今天】的按钮文本 */
    getTodayButtonText(): string {
        return this.todayBtnText || (this.showTimePicker && this.locale.now) || this.locale.today;
    }

    /** 点击【今天】按钮 */
    onToday(event: Event): void {
        event.preventDefault();
        if (this.isTodayDisabled()) {
            return;
        }

        const today = getToday(this.value);
        this.confirm.emit({value: today, cause: 'todayButton'});
    }

    /** 是否显示【确定】按钮 */
    showOkButton(): boolean {
        return this.showOk || (!this.showOk && this.showTimePicker);
    }

    /** 获取【确定】按钮的样式 */
    updateOKButtonClass(): void {
        this.okButtonClass = {
            [`${this.prefixCls}-ok-btn`]: true,
            [`${this.prefixCls}-ok-btn-disabled`]: this.okDisabled || this.disabled
        };
    }

    /** 点击【确定】按钮 */
    onOk(event: Event): void {
        event.preventDefault();
        if (this.okDisabled || this.disabled) {
            return;
        }
        this.confirm.emit({value: this.value, cause: 'okButton'});
    }

    /** 获取【时间】按钮的样式 */
    updateTimePickerButtonClass(): void {
        this.timePickerButtonClass = {
            [`${this.prefixCls}-time-picker-btn`]: true,
            [`${this.prefixCls}-time-picker-btn-disabled`]: this.timePickerDisabled || this.disabled
        };
    }

    /** 点击【选择时间】按钮 */
    onTimePickerBtnClick(event: Event): void {
        this.isTimePickerVisible = !this.isTimePickerVisible;
        this.timePickerOpenChange.emit(this.isTimePickerVisible);
    }

}
