/**
 * @license
 * Copyright 厦门乾元盛世科技有限公司 All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file.
 */


import { Component, Input, Output, EventEmitter, ElementRef, ViewEncapsulation, OnInit, HostListener } from '@angular/core';
import * as moment from 'moment';

import { UpdateClassService } from '../../core/service/update.class.service';
import { toBoolean } from '../../util/lang';
import { KeyCode } from '../../util/key.code';



/**
 * 时间
 */
@Component({
    selector: 'ant-time-panel',
    templateUrl: './time.panel.html',
    preserveWhitespaces: false,
    encapsulation: ViewEncapsulation.None,
    providers: [ UpdateClassService ]
})
export class TimePanel implements OnInit {

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

    /** 面板样式 */
    @Input() panelCls: string;


    /** 用户CSS样式 */
    @Input()
    get className(): string {
        return this._className;
    }
    set className(className: string) {
        if (this._className !== className) {
            this._className = className;
            this.updateClassMap();
        }
    }
    private _className: string;


    /** 面板值：用于在面板上显示当前年月的日期值 */
    @Input()
    get value(): moment.Moment {
        return this.selectedValue;
    }
    set value(value: moment.Moment) {
        this.selectedValue = value || moment();
    }
    /** 内部选中的值 */
    public selectedValue: moment.Moment;

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

    @Input()
    get showHour(): boolean {
        return this._showHour;
    }
    set showHour(showHour: boolean) {
        const value = toBoolean(showHour);
        if (this._showHour !== value) {
            this._showHour = value;
            this.updateClassMap();
        }
    }
    private _showHour = true;


    @Input()
    get showMinute(): boolean {
        return this._showMinute;
    }
    set showMinute(showMinute: boolean) {
        const value = toBoolean(showMinute);
        if (this._showMinute !== value) {
            this._showMinute = value;
            this.updateClassMap();
        }
    }
    private _showMinute = true;


    @Input()
    get showSecond(): boolean {
        return this._showSecond;
    }
    set showSecond(showSecond: boolean) {
        const value = toBoolean(showSecond);
        if (this._showSecond !== value) {
            this._showSecond = value;
            this.updateClassMap();
        }
    }
    private _showSecond = true;


    /** 隐藏禁止选择的选项 */
    @Input() hideDisabledOptions = false;

    /** 获取不可用的小时列表 */
    @Input() disabledHours: () => number[];

    /** 获取不可用的分钟列表 */
    @Input() disabledMinutes: (hour: number) => number[];

    /** 获取不可用的秒钟列表 */
    @Input() disabledSeconds: (hour: number, minute: number) => number[];




    /** `选择`事件 */
    @Output() valueUpdate = new EventEmitter<moment.Moment>();

    /** 键盘事件 */
    @Output() keyesc = new EventEmitter<KeyboardEvent>();

    /** 清除值事件 */
    @Output() clear = new EventEmitter<any>();


    constructor(
        private el: ElementRef,
        private updateClassService: UpdateClassService) {

    }

    /** The underlying host native element */
    getHostElement(): HTMLElement {
        return this.el.nativeElement as HTMLElement;
    }

    ngOnInit(): void {
        this.selectedValue = this.value || moment();

        // 初始化样式
        this.updateClassMap();
    }

    private updateClassMap(): void {
        const count = this.getComboboxCount();
        const classes = {
            [`${this.panelCls}`]: this.panelCls,
            [`${this.prefixCls}-column-${count}`]: count,
            [`${this.className}`]: this.className
        };
        this.updateClassService.update(this.el.nativeElement, classes);
    }

    @HostListener('keydown', ['$event'])
    onKeyDown(event: KeyboardEvent): void {
        const keyCode = event.keyCode;
        if (KeyCode.ESC === keyCode) {
            this.keyesc.emit(event);
            return;
        }
    }

    getComboboxCount(): number {
        let count = 0;
        if (this.showHour) {
            count++;
        }
        if (this.showMinute) {
            count++;
        }
        if (this.showSecond) {
            count++;
        }
        return count;
    }

    /** 获取日期/时间的显示格式（用于日历上的输入框的显示） */
    getFormat(): string {
        return this.format || this.locale.dateTimeFormat;
    }

    /** 触发变更 */
    onChange(value: moment.Moment): void {
        this.value = value;
        if (value) {
            this.selectedValue = value;
        }

        this.valueUpdate.emit(value);
    }

    onClearValue(_: any): void {
        this.clear.emit();
    }

}
