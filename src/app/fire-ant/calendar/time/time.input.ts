/**
 * @license
 * Copyright 厦门乾元盛世科技有限公司 All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file.
 */


import { Component, Input, Output, EventEmitter, ElementRef, ViewEncapsulation, OnInit, ViewChild } from '@angular/core';
import { toBoolean } from '../../util/lang';

import { UpdateClassService } from '../../core/service/update.class.service';
import * as moment from 'moment';


/**
 * 时间输入框
 */
@Component({
    selector: 'ant-time-input',
    templateUrl: './time.input.html',
    preserveWhitespaces: false,
    encapsulation: ViewEncapsulation.None,
    providers: [ UpdateClassService ]
})
export class TimeInput implements OnInit {

    /** 样式前缀 */
    @Input()
    get prefixCls(): string {
        return this._prefixCls;
    }
    set prefixCls(prefixCls: string) {
        if (this._prefixCls !== prefixCls) {
            this._prefixCls = prefixCls;
            this.updateClassMap();
            this.updateInputClassName();
        }
    }
    private _prefixCls = 'ant-calendar-time-picker';


    /** 实际值 */
    @Input()
    get value(): moment.Moment {
        return this._value;
    }
    set value(value: moment.Moment) {
        this._value = value;
        this.buildData();
    }
    private _value: moment.Moment;


    /** 日期显示格式 */
    @Input()
    get format(): string {
        return this._format;
    }
    set format(format: string) {
        if (this._format !== format) {
            this._format = format;
            this.buildData();
        }
    }
    private _format: string;



    /**
     * 国际化配置
     * 参考：https://github.com/ant-design/ant-design/blob/master/components/date-picker/locale/example.json
     */
    @Input() locale: any = {};

    /** 选择框默认文字 */
    @Input() placeholder: string;

    /** 是否只读状态，默认为 false */
    @Input()
    get readOnly(): boolean {
        return this._readOnly;
    }
    set readOnly(readOnly: boolean) {
        const value = toBoolean(readOnly);
        if (this._readOnly !== value) {
            this._readOnly = value;
        }
    }
    private _readOnly = false;

    /** 是否禁用状态，默认为 false */
    @Input()
    get disabled(): boolean {
        return this._disabled;
    }
    set disabled(disabled: boolean) {
        const value = toBoolean(disabled);
        if (this._disabled !== value) {
            this._disabled = value;
        }
    }
    private _disabled = false;

    /** 是否显示清除按钮，默认为true */
    @Input() allowClear = true;

    /** 允许空值 */
    @Input() allowEmpty = true;


    /** 获取不可用的小时列表 */
    @Input() disabledHours: () => number[];

    /** 获取不可用的分钟列表 */
    @Input() disabledMinutes: (hour: number) => number[];

    /** 获取不可用的秒钟列表 */
    @Input() disabledSeconds: (hour: number, minute: number) => number[];

    /** 值变更事件 */
    @Output() change = new EventEmitter<moment.Moment>();

    /** 清除值事件 */
    @Output() clear = new EventEmitter<any>();


    /** 实际输入框(用于显示值) */
    @ViewChild('input') input: ElementRef;


    // 控制输入框的样式
    get invalid(): boolean {
        return this._invalid;
    }
    set invalid(invalid: boolean) {
        if (this._invalid !== invalid) {
            this._invalid = invalid;
            this.updateInputClassName();
        }
    }
    private _invalid = false;


    public _innerValue: string;

    // 内部样式
    public inputClassName: any;

    constructor(
        protected el: ElementRef,
        protected updateClassService: UpdateClassService) {

    }

    /** The underlying host native element */
    getHostElement(): HTMLElement {
        return this.el.nativeElement as HTMLElement;
    }


    ngOnInit(): void {
        this.updateClassMap();
        this.updateInputClassName();
    }

    private updateClassMap(): void {
        const classes = {
            [`${this.prefixCls}-input-wrap`]: true
        };
        this.updateClassService.update(this.el.nativeElement, classes);
    }

    /** 输入框的样式 */
    private updateInputClassName(): void {
        this.inputClassName = {
            [`${this.prefixCls}-input`]: true,
            [`${this.prefixCls}-input-invalid`]: this.invalid
        };
    }

    buildData(): void {
        if (this.value) {
            this._innerValue = this.value.format(this.format);
        } else {
            this._innerValue = '';
        }
    }

    focus(): void {
        this.input.nativeElement.focus();
    }

    get innerValue(): string {
        return this._innerValue;
    }

    set innerValue(str: string) {
        if (!str) {
            if (this.allowEmpty) {
                this.onChange(null);
            }
            this.invalid = false;
            return;
        }


        const disabledHours = this.disabledHours;
        const disabledMinutes = this.disabledMinutes;
        const disabledSeconds = this.disabledSeconds;

        const parsed = moment(str, this.format, true);
        if (!parsed.isValid()) {
            this.invalid = true;
            return;
        }

        const value = this.value.clone()
            .year(parsed.year())
            .month(parsed.month())
            .date(parsed.date())
            .hour(parsed.hour())
            .minute(parsed.minute())
            .second(parsed.second());

        // if time value is disabled, response warning.
        const disabledHourOptions = disabledHours && disabledHours() || [];
        const disabledMinuteOptions = disabledMinutes && disabledMinutes(value.hour()) || [];
        const disabledSecondOptions = disabledSeconds && disabledSeconds(value.hour(), value.minute()) || [];
        if (disabledHourOptions.indexOf(value.hour()) >= 0 ||
            disabledMinuteOptions.indexOf(value.minute()) >= 0 ||
            disabledSecondOptions.indexOf(value.second()) >= 0
        ) {
            this.invalid = true;
            return;
        }


        const originalValue = this.value;
        if (originalValue && value) {
            if (!originalValue.isSame(value)) {
                this.onChange(value);
            }
        } else if (originalValue !== value) {
            this.onChange(value);
        }
        this.invalid = false;
    }

    onChange(value: moment.Moment): void {
        this.change.emit(value);
    }

    onInputChange(event: Event): void {
        event.stopPropagation();
    }

    onClear(event: Event): void {
        event.stopPropagation();
        this.innerValue = '';
        this.clear.emit();
        this.onChange(null);
    }

    /** 是否清空按钮可见 */
    isClearIconVisible(): boolean {
        if (!this.allowEmpty) {
            return false;
        }
        const isHasInput = this.innerValue && this.innerValue.length > 0;
        return !this.disabled && this.allowClear && isHasInput;
    }


}
