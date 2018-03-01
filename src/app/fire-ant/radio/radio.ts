/**
 * @license
 * Copyright 厦门乾元盛世科技有限公司 All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file.
 */


import { Component, Input, Output, EventEmitter, ElementRef, Renderer2, ViewEncapsulation } from '@angular/core';
import { OnInit, Inject, Optional, Host, forwardRef } from '@angular/core';
import { NG_VALUE_ACCESSOR, COMPOSITION_BUFFER_MODE } from '@angular/forms';

import { FormControl } from '../input/form.control';
import { RadioGroup } from './radio.group';

const INPUT_CONTROL_VALUE_ACCESSOR: any = {
    provide: NG_VALUE_ACCESSOR,
    useExisting: forwardRef(() => Radio),
    multi: true
};

@Component({
    selector: 'ant-radio',
    templateUrl: './radio.html',
    styleUrls: ['./style/index.scss', './style/patch.scss'],
    encapsulation: ViewEncapsulation.None,
    providers: [INPUT_CONTROL_VALUE_ACCESSOR],
    exportAs: 'radio'
})
export class Radio extends FormControl implements OnInit {

    /** 样式前缀 */
    @Input() prefixCls = 'ant-radio';

    /** 指定当前是否选中 */
    @Input() checked = false;

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
    public type = 'radio';

    /** 是否禁用状态，默认为 false */
    @Input() set disabled(disabled: boolean) {
        this._disabled = disabled;
    }
    get disabled(): boolean {
        return this._disabled || this.isGroupDisabled() || false;
    }

    private _disabled = false;

    constructor(
        renderer: Renderer2,
        elementRef: ElementRef,
        @Optional() @Inject(COMPOSITION_BUFFER_MODE) compositionMode: boolean,
        @Inject(forwardRef(() => RadioGroup)) @Optional() @Host() private group: RadioGroup) {

        super(renderer, elementRef, compositionMode);
        this.value = 'on';
    }

    getWrapperClass(): any {
        return {
            [`${this.getPrefixCls()}-wrapper`]: 1,
            [`${this.getPrefixCls()}-wrapper-checked`]: this.checked,
            [`${this.getPrefixCls()}-wrapper-disabled`]: this.disabled,
            [`${this.class}`]: this.class
        };
    }

    getBoxClass(): any {
        return {
            [`${this.getPrefixCls()}`]: 1,
            [`${this.getPrefixCls()}-checked`]: this.checked,
            [`${this.getPrefixCls()}-disabled`]: this.disabled
        };
    }

    getPrefixCls(): string {
        if (this.group && this.group.mode === 'button') {
            return `${this.prefixCls}-button`;
        }
        return this.prefixCls;
    }

    isGroupDisabled(): boolean {
        return this.group && this.group.disabled;
    }

    ngOnInit(): void {
        // 处理CheckboxGroup的初始值
        if (this.group && this.value) {
            this.checked = this.group.value === this.value;
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
        this.onChange(value); // Angular need this
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


