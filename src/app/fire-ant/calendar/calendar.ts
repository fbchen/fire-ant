/**
 * @license
 * Copyright 厦门乾元盛世科技有限公司 All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file.
 */


import {
    Component, Input, Output, EventEmitter, ElementRef, ViewEncapsulation,
    HostBinding, HostListener, OnInit
} from '@angular/core';
import * as moment from 'moment';

import { UpdateClassService } from '../core/service/update.class.service';
import { toBoolean } from '../util/lang';
import { KeyCode } from '../util/key.code';

import * as LOCALE from './locale/zh_CN';
import { DisabledTime, isTimeInvalid, getDisabledTime } from './time/time.util';


export function getToday(value: moment.Moment): moment.Moment {
    const locale = value.locale();
    const utcOffset = value.utcOffset();
    return moment().locale(locale).utcOffset(utcOffset);
}


/**
 * 日历控件
 * 参考：https://github.com/react-component/calendar
 */
@Component({
    selector: 'ant-calendar',
    templateUrl: './calendar.html',
    preserveWhitespaces: false,
    encapsulation: ViewEncapsulation.None,
    providers: [ UpdateClassService ],
    exportAs: 'calendar'
})
export class Calendar implements OnInit {

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
    private _prefixCls = 'ant-calendar';


    /** 日历模式 */
    @Input()
    get mode(): string {
        return this._mode;
    }
    set mode(mode: string) {
        if (this._mode !== mode) {
            this._mode = mode;
            this.updateClassMap();
        }
    }
    private _mode: string;

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


    /** 初始值 */
    @Input() value: Date | moment.Moment;

    /** 获取日期/时间的显示格式（用于日历上的输入框的显示），例如：YYYY-MM-DD */
    @Input() format: string;

    /** 显示【确定】按钮。默认自动判断。 */
    @Input() showOk: boolean;

    /** 显示【今天】按钮 */
    @Input() showToday = true;

    /** 是否显示日期输入框 */
    @Input() showDateInput = true;

    /** 日期输入框的占位字符 */
    @Input() placeholder: string;


    /** 是否显示星期数（第几周 OF YEAR） */
    @Input()
    get showWeekNumber(): boolean {
        return this._showWeekNumber;
    }
    set showWeekNumber(showWeekNumber: boolean) {
        const value = toBoolean(showWeekNumber);
        if (this._showWeekNumber !== value) {
            this._showWeekNumber = value;
            this.updateClassMap();
        }
    }
    private _showWeekNumber = false;


    /** 是否显示时间选择框 */
    @Input()
    get showTimePicker(): boolean {
        return this._showTimePicker;
    }
    set showTimePicker(showTimePicker: boolean) {
        const value = toBoolean(showTimePicker);
        if (this._showTimePicker !== value) {
            this._showTimePicker = value;
        }
    }
    private _showTimePicker = false;


    /** 不可选择的日期 */
    @Input() disabledDate: (value: moment.Moment) => boolean;

    /** 不可选择的时间(将根据选择的日期动态调用获取) */
    @Input() disabledTime: (value: moment.Moment) => DisabledTime;

    /** moment的local设置 */
    @Input() lang = 'zh-cn';

    /**
     * 国际化配置
     * 参考：https://github.com/ant-design/ant-design/blob/master/components/date-picker/locale/example.json
     */
    @Input() locale: any = LOCALE.default;


    /** 组件是否可见 */
    @Input()
    get visible(): boolean {
        return this._visible;
    }
    set visible(visible: boolean) {
        const value = toBoolean(visible);
        if (this._visible !== value) {
            this._visible = value;
            this.updateClassMap();
        }
    }
    private _visible = false;


    /** 选择事件 */
    @Output() valueUpdate = new EventEmitter<{ value: moment.Moment, cause: string }>();

    /** 变更事件 */
    @Output() change = new EventEmitter<moment.Moment>();

    /** 清空事件 */
    @Output() clear = new EventEmitter<any>();

    /** 键盘事件 */
    @Output() keyesc = new EventEmitter<KeyboardEvent>();


    /** 使光标可以聚焦，然后可以使用键盘导航 */
    @HostBinding('attr.tabIndex') tabIndex = '0';

    /** 内部值(代表实际值，来源于value) */
    public innerValue: moment.Moment;

    /** 时间选择控件是否可见 */
    public isTimePickerVisible = false;

    /** 获取不可用的小时列表 */
    public disabledHours: () => number[];
    /** 获取不可用的分钟列表 */
    public disabledMinutes: (hour: number) => number[];
    /** 获取不可用的秒钟列表 */
    public disabledSeconds: (hour: number, minute: number) => number[];


    constructor(
        protected el: ElementRef,
        protected updateClassService: UpdateClassService) {

    }

    ngOnInit(): void {
        // 推荐在入口文件全局设置 locale
        // import 'moment/locale/zh-cn';
        moment.locale(this.lang || 'zh-cn');

        // 构建数据
        this.buildData();

        // 初始化样式
        this.updateClassMap();
    }

    buildData(): void {
        const value = this.value;
        this.innerValue = value ? moment(value) : null;
        this.buildTimeConfig();
    }

    buildTimeConfig(): void {
        if (this.showTimePicker) {
            const cfg = getDisabledTime(this.innerValue, this.disabledTime);
            this.disabledHours = cfg.disabledHours;
            this.disabledMinutes = cfg.disabledMinutes;
            this.disabledSeconds = cfg.disabledSeconds;
        }
    }

    /** The underlying host native element */
    getHostElement(): HTMLElement {
        return this.el.nativeElement as HTMLElement;
    }

    private updateClassMap(): void {
        const classes = {
            [`${this.prefixCls}`]: true,
            [`${this.prefixCls}-${this.mode}`]: this.mode,
            [`${this.prefixCls}-week-number`]: this.showWeekNumber,
            [`${this.prefixCls}-hidden`]: !this.visible,
            [`${this.className}`]: this.className
        };
        this.updateClassService.update(this.el.nativeElement, classes);
    }

    private isNavKeyCode(keyCode: number): boolean {
        return [
            KeyCode.DOWN, KeyCode.UP, KeyCode.LEFT, KeyCode.RIGHT,
            KeyCode.HOME, KeyCode.END, KeyCode.PAGE_DOWN, KeyCode.PAGE_UP
        ].indexOf(keyCode) >= 0;
    }

    @HostListener('keydown', ['$event'])
    onKeyDown(event: KeyboardEvent): void {
        const keyCode = event.keyCode;

        // 如果时间选择控件出现，则不对日期变更
        if (this.isTimePickerVisible && this.isNavKeyCode(keyCode)) {
            return;
        }

        // mac
        const ctrlKey = event.ctrlKey || event.metaKey;
        const disabledDate = this.disabledDate;

        switch (keyCode) {
            case KeyCode.DOWN:
                this.goWeek(1);
                event.preventDefault();
                return;
            case KeyCode.UP:
                this.goWeek(-1);
                event.preventDefault();
                return;
            case KeyCode.LEFT:
                if (ctrlKey) {
                    this.goYear(-1);
                } else {
                    this.goDay(-1);
                }
                event.preventDefault();
                return;
            case KeyCode.RIGHT:
                if (ctrlKey) {
                    this.goYear(1);
                } else {
                    this.goDay(1);
                }
                event.preventDefault();
                return;
            case KeyCode.HOME:
                this.goStartMonth.call(this);
                event.preventDefault();
                return;
            case KeyCode.END:
                this.goEndMonth.call(this);
                event.preventDefault();
                return;
            case KeyCode.PAGE_DOWN:
                this.goMonth(1);
                event.preventDefault();
                return;
            case KeyCode.PAGE_UP:
                this.goMonth(-1);
                event.preventDefault();
                return;
            case KeyCode.ENTER:
                const value = this.innerValue;
                if (!disabledDate || !disabledDate(value)) {
                    this.onSelect(value, 'keyboard');
                }
                event.preventDefault();
                return;
            case KeyCode.ESC:
                this.keyesc.emit(event);
                return;
            default:
                // this.keydown.emit(event);
                return;
        }
    }



    onClear(): void {
        this.clear.emit();
    }

    onChange(value: moment.Moment): void {
        if (value) {
            this.onSelect(value, 'dateInput');
        }
    }

    onDateTableSelect(value: moment.Moment): void {
        this.onSelect(value, 'dateTable');
    }

    onConfirmSelect(event: any): void {
        const value = event.value as moment.Moment;
        const cause = event.cause as string;
        if (!this.isAllowedDate(value)) {
            return;
        }

        this.setValue(value);
        this.onSelect(value, cause);
    }

    onTimePickerOpenChange(open: boolean): void {
        this.isTimePickerVisible = open;
    }


    isAllowedDate(value: moment.Moment): boolean {
        if (!value) {
            return true;
        }

        const disabledDate = this.disabledDate;
        if (disabledDate && disabledDate(value)) {
            return false;
        }

        if (this.showTimePicker) { // 只有显示时间选择框才验证时间
            const disabledTime = this.disabledTime;
            if (disabledTime && isTimeInvalid(value, disabledTime)) {
                return false;
            }
        }

        return true;
    }


    setValue(newValue: moment.Moment): void {
        if (!newValue || !newValue.isSame(this.innerValue)) {
            this.innerValue = newValue;
            this.buildTimeConfig();
            this.change.emit(newValue);
        }
    }

    /**
     * 选中值
     *
     * @param value 被选中的日期时间值
     * @param cause 选择的起因，例如：todayButton、okButton、dateInput、keyboard等
     */
    onSelect(value: moment.Moment, cause: string): void {
        this.valueUpdate.emit({ value, cause });
        if (value) {
            this.setValue(value);
        }
    }

    /** 获取日期/时间的显示格式（用于日历上的输入框的显示） */
    getFormat(): string {
        const l = this.locale;
        const format = this.format;
        return format || (this.showTimePicker ? l.dateTimeFormat : l.dateFormat);
    }


    goStartMonth(): void {
        const newValue = this.innerValue.clone();
        this.setValue(newValue.startOf('month'));
    }

    goEndMonth(): void {
        const newValue = this.innerValue.clone();
        this.setValue(newValue.endOf('month'));
    }

    goTime(direction: any, unit: string): void {
        const newValue = this.innerValue.clone();
        newValue.add(direction, unit);
        this.setValue(newValue);
    }

    goMonth(direction: any): void {
        return this.goTime(direction, 'months');
    }

    goYear(direction: any): void {
        return this.goTime(direction, 'years');
    }

    goWeek(direction: any): void {
        return this.goTime(direction, 'weeks');
    }

    goDay(direction: any): void {
        return this.goTime(direction, 'days');
    }

}
