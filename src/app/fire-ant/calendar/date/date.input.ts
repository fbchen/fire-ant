/**
 * @license
 * Copyright 厦门乾元盛世科技有限公司 All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file.
 */


import {
    Component, Input, Output, EventEmitter, ElementRef, ViewEncapsulation,
    OnInit, OnChanges, SimpleChanges, ViewChild
} from '@angular/core';
import * as moment from 'moment';

import { UpdateClassService } from '../../core/service/update.class.service';
import { toBoolean } from '../../util/lang';

@Component({
    selector: 'ant-date-input',
    templateUrl: './date.input.html',
    preserveWhitespaces: false,
    encapsulation: ViewEncapsulation.None,
    providers: [ UpdateClassService ]
})
export class DateInput implements OnInit, OnChanges {

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
    private _prefixCls: string;


    /** 实际值：输入框可显示的值 */
    @Input() value: moment.Moment;

    /** 日期显示格式 */
    @Input() format: string;

    /**
     * 国际化配置
     * 参考：https://github.com/ant-design/ant-design/blob/master/components/date-picker/locale/example.json
     */
    @Input() locale: any = {};

    /** 选择框默认文字 */
    @Input() placeholder: string;


    /** 是否只读状态，默认为 false */
    @Input()
    set readOnly(readOnly: boolean) {
        const value = toBoolean(readOnly);
        if (this._readOnly !== value) {
            this._readOnly = value;
        }
    }
    get readOnly(): boolean {
        return this._readOnly;
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
    @Input()
    set allowClear(allowClear: boolean) {
        const value = toBoolean(allowClear);
        if (this._allowClear !== value) {
            this._allowClear = value;
        }
    }
    get allowClear(): boolean {
        return this._allowClear;
    }
    private _allowClear = true;


    /** 不可选择的日期 */
    @Input() disabledDate: (value: moment.Moment) => boolean;

    /** 实际输入框(用于显示值) */
    @ViewChild('input') input: ElementRef;

    /** 值变更事件 */
    @Output() change = new EventEmitter<moment.Moment>();


    private invalid = false;

    public _innerValue: string;

    // 内部样式
    public inputClassName: any;

    constructor(
        private el: ElementRef,
        private updateClassService: UpdateClassService) {

    }

    /** The underlying host native element */
    getHostElement(): HTMLElement {
        return this.el.nativeElement as HTMLElement;
    }

    buildData(): void {
        this._innerValue = moment.isMoment(this.value) ? this.value.format(this.format) : '';
    }

    ngOnInit(): void {
        this.buildData();

        // 初始化样式
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

    ngOnChanges(changes: SimpleChanges): void {
        if (changes['value']) {
            this.buildData();
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
            this.onChange(null);
            this.invalid = false;
            this.updateInputClassName();
            return;
        }


        const disabledDate = this.disabledDate;
        const parsed = moment(str, this.format, true);
        if (!parsed.isValid()) {
            this.invalid = true;
            this.updateInputClassName();
            return;
        }

        const value = this.value.clone()
            .year(parsed.year())
            .month(parsed.month())
            .date(parsed.date())
            .hour(parsed.hour())
            .minute(parsed.minute())
            .second(parsed.second());

        if (disabledDate && !disabledDate(value)) {
            this.invalid = true;
            this.updateInputClassName();
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
        this.updateInputClassName();
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
        this.onChange(null);
    }

    /** 是否清空按钮可见 */
    isClearIconVisible(): boolean {
        const isHasInput = this.innerValue && this.innerValue.length > 0;
        return !this.disabled && this.allowClear && isHasInput;
    }


}
