/**
 * @license
 * Copyright 厦门乾元盛世科技有限公司 All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file.
 */

import {
    Component, Input, ElementRef, Renderer2, HostBinding, HostListener, ViewEncapsulation,
    OnInit, Inject, Optional, forwardRef
} from '@angular/core';
import { NG_VALUE_ACCESSOR, COMPOSITION_BUFFER_MODE } from '@angular/forms';

import { UpdateClassService } from '../core/service/update.class.service';
import { toBoolean } from '../util/lang';
import { FormControl } from '../input/form.control';

const INPUT_CONTROL_VALUE_ACCESSOR: any = {
    provide: NG_VALUE_ACCESSOR,
    useExisting: forwardRef(() => TimeSelect),
    multi: true
};

@Component({
    selector: 'ant-time-select',
    templateUrl: './time.select.html',
    styleUrls: ['./style/TimeSelect.scss'],
    preserveWhitespaces: false,
    encapsulation: ViewEncapsulation.None,
    providers: [ UpdateClassService, INPUT_CONTROL_VALUE_ACCESSOR ]
})
export class TimeSelect extends FormControl implements OnInit {

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
    private _prefixCls = 'ant-time-select';


    /** 控件大小。注：标准表单内的输入框大小限制为 `large`。可选 `large` `default` `small`。 */
    @Input()
    get size(): 'large' | 'small' | 'default' {
        return this._size;
    }
    set size(size: 'large' | 'small' | 'default') {
        if (this._size !== size) {
            this._size = size;
            this.updateClassMap();
        }
    }
    private _size: 'large' | 'small' | 'default' = 'default';


    /** 开始时间 */
    @Input() start = '00:00';

    /** 结束时间 */
    @Input() end = '23:59';

    /**
     * @cfg {Number} increment
     * The number of minutes between each time value in the list.
     */
    @Input() increment = 15;

    /** 输入框的placeholder */
    @Input() placeholder = '请选择时间';

    /** 是否必填 */
    @Input() required = false;

    /** Whether is disabled */
    @Input()
    get disabled(): boolean {
        return this._disabled;
    }
    set disabled(disabled: boolean) {
        const value = toBoolean(disabled);
        if (this._disabled !== value) {
            this._disabled = value;
            this.updateClassMap();
        }
    }
    private _disabled = false;


    /** 可以触发focus事件 */
    @HostBinding('attr.tabIndex') _tabIndex = 0;

    public items: string[] = [];

    constructor(
        public renderer: Renderer2,
        public el: ElementRef,
        public updateClassService: UpdateClassService,
        @Optional() @Inject(COMPOSITION_BUFFER_MODE) public compositionMode: boolean) {
        super(renderer, el, compositionMode);
    }

    ngOnInit(): void {
        this.buildOptions();
        this.updateClassMap();
    }

    buildOptions(): void {
        const d1 = new Date();
        const d2 = new Date();

        const startHour = parseInt(this.start.substring(0, this.start.indexOf(':')), 10);
        const startMinute = parseInt(this.start.substring(this.start.indexOf(':') + 1), 10);
        d1.setHours(startHour);
        d1.setMinutes(startMinute);

        const endHour = parseInt(this.end.substring(0, this.end.indexOf(':')), 10);
        const endMinute = parseInt(this.end.substring(this.end.indexOf(':') + 1), 10);
        d2.setHours(endHour);
        d2.setMinutes(endMinute);

        while (d1 <= d2) {
            const hour = d1.getHours() < 10 ? '0' + d1.getHours() : d1.getHours();
            const minute = d1.getMinutes() < 10 ? '0' + d1.getMinutes() : d1.getMinutes();
            this.items.push(`${hour}:${minute}`);
            d1.setTime(d1.getTime() + this.increment * 60000);
        }
    }

    protected updateClassMap(): void {
        const classes = {
            [`${this.prefixCls}`]: true,
            [`${this.prefixCls}-lg`]: this.size === 'large',
            [`${this.prefixCls}-sm`]: this.size === 'small'
        };
        this.updateClassService.update(this.el.nativeElement, classes);
    }

    /**
     * Write a new value to the element.
     *
     * @Override (From ControlValueAccessor interface)
     */
    writeValue(value: any): void {
        this.value = value;
    }

    /** 下拉框重新选择值 */
    onValueChange(value): void {
        this.onChange(value); // Angular need this
    }

    @HostListener('focus')
    onOuterFocus(): void {
        this.onTouched(); // set your control to 'touched'
    }

    @HostListener('click', ['$event'])
    onClick(event): void {
        this.onTouched(); // set your control to 'touched'
    }

    /**
     * @Override (From ControlValueAccessor interface)
     */
    setDisabledState(isDisabled: boolean): void {
        this.disabled = isDisabled;
    }

}
