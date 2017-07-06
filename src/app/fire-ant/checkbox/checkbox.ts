/**
 * @license
 * Copyright 厦门乾元盛世科技有限公司 All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file.
 */


import { Component, Input, Output, EventEmitter, ElementRef, Renderer, ViewEncapsulation } from '@angular/core';
import { OnInit, Inject, Optional, Host, forwardRef } from '@angular/core';
import { NG_VALUE_ACCESSOR, COMPOSITION_BUFFER_MODE } from '@angular/forms';

import { FormControl } from '../input/form.control';
import { CheckboxGroup } from './checkbox.group';

const INPUT_CONTROL_VALUE_ACCESSOR: any = {
    provide: NG_VALUE_ACCESSOR,
    useExisting: forwardRef(() => Checkbox),
    multi: true
};

@Component({
    selector: 'ant-checkbox',
    templateUrl: './checkbox.html',
    styleUrls: ['./style/index.scss'],
    encapsulation: ViewEncapsulation.None,
    providers: [INPUT_CONTROL_VALUE_ACCESSOR],
    exportAs: 'checkbox'
})
export class Checkbox extends FormControl implements OnInit {

    /** 样式前缀 */
    @Input() prefixCls = 'ant-checkbox';

    /** 指定当前是否选中 */
    @Input() checked = false;

    /** 设置 indeterminate 状态，只负责样式控制 */
    @Input() indeterminate = false;

    /** 是否只读状态，默认为 false */
    @Input() readOnly = false;

    /** 用户CSS样式 */
    @Input() class: string;

    /** 内部输入控件的tabIndex属性，默认情况下无需关注 */
    @Input() tabIndex: string;

    /** 未选中状态下的值，默认为空字符串值 */
    @Input() uncheckedValue: any;

    /** 值变更事件 */
    @Output() change = new EventEmitter<any>();

    /** Check变更事件 */
    @Output() check = new EventEmitter<boolean>();

    /** 内部默认的控件 */
    public type = 'checkbox';

    /** 是否禁用状态，默认为 false */
    @Input() set disabled(disabled: boolean) {
        this._disabled = disabled;
    }
    get disabled(): boolean {
        return this._disabled || this.isGroupDisabled() || false;
    }

    private _disabled = false;

    constructor(
        private renderer: Renderer,
        private elementRef: ElementRef,
        @Optional() @Inject(COMPOSITION_BUFFER_MODE) private compositionMode: boolean,
        @Inject(forwardRef(() => CheckboxGroup)) @Optional() @Host() private group: CheckboxGroup) {

        super(renderer, elementRef, compositionMode);
        this.value = 'on';
    }

    getWrapperClass(): any {
        return {
            [`${this.getPrefixCls()}-wrapper`]: 1,
            [`${this.class}`]: this.class
        };
    }

    getBoxClass(): any {
        return {
            [`${this.getPrefixCls()}`]: 1,
            [`${this.getPrefixCls()}-checked`]: this.checked,
            [`${this.getPrefixCls()}-disabled`]: this.disabled,
            [`${this.getPrefixCls()}-indeterminate`]: this.indeterminate
        };
    }

    getPrefixCls(): string {
        return this.prefixCls;
    }

    isGroupDisabled(): boolean {
        return this.group && this.group.disabled;
    }

    ngOnInit(): void {
        // 处理CheckboxGroup的初始值
        if (this.group && this.value) {
            this.checked = this.group.hasValue(this.value);
        }
        this._disabled = this._disabled || this.isGroupDisabled() || false;
    }

    /**
     * 通过ngModel控制的checked状态，当ngModel的值与控件的value一样时为checked
     * @param value ngModel对应的值
     */
    writeValue(value: any): void {
        if (value !== null) {
            this.checked = this.value === value;
        }
    }

    handleChange(event: Event): void {
        event.preventDefault();
        event.stopPropagation();
        if (this.disabled) {
            return;
        }
        this.checked = !this.checked;

        const value = this.checked ? this.value : (this.uncheckedValue || '');
        this.onChange(value);
        this.check.emit(this.checked);
        this.change.emit(value);
        this.makeGroupChange();
    }

    /**
     * 如果Checkbox在CheckboxGroup内部，则触发CheckboxGroup的值变化
     */
    makeGroupChange() {
        if (this.group) {
            this.group.toggle(this.value, this.checked);
        }
    }

}


