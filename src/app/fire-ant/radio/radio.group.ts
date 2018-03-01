/**
 * @license
 * Copyright 厦门乾元盛世科技有限公司 All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file.
 */


import { Component, Input, Output, EventEmitter, ElementRef, Renderer2, ViewEncapsulation } from '@angular/core';
import { HostBinding, HostListener, Inject, Optional, ContentChildren, QueryList, forwardRef } from '@angular/core';
import { NG_VALUE_ACCESSOR, COMPOSITION_BUFFER_MODE } from '@angular/forms';

import { classnames } from '../util/classnames';

import { FormControl } from '../input/form.control';
import { Radio } from './radio';


const INPUT_CONTROL_VALUE_ACCESSOR: any = {
    provide: NG_VALUE_ACCESSOR,
    useExisting: forwardRef(() => RadioGroup),
    multi: true
};

@Component({
    selector: 'ant-radio-group',
    template: `<ng-content></ng-content>`,
    encapsulation: ViewEncapsulation.None,
    providers: [INPUT_CONTROL_VALUE_ACCESSOR]
})
export class RadioGroup extends FormControl {

    /** 样式前缀 */
    @Input() prefixCls = 'ant-radio-group';

    /** 控件大小。注：只对按钮样式生效。可选 `large` `default` `small`，默认为`default`。 */
    @Input() size: 'large' | 'default' | 'small' = 'default';

    /** 如果设置为`button`模式，则显示RadioButton的样式 */
    @Input() mode: string;

    /** 用户CSS样式 */
    @Input() class: string;

    /** 值变更事件 */
    @Output() change = new EventEmitter<any>();

    /** 子列表 */
    @ContentChildren(forwardRef(() => Radio), { descendants: true }) children: QueryList<Radio>;

    constructor(
        public renderer: Renderer2,
        public elementRef: ElementRef,
        @Optional() @Inject(COMPOSITION_BUFFER_MODE) public compositionMode: boolean) {

        super(renderer, elementRef, compositionMode);
    }

    /** 样式 */
    @HostBinding('class')
    get classes(): string {
        const classes = classnames(this.prefixCls, {
            [`${this.prefixCls}-${this.size}`]: this.size
        }, this.class);
        return classes;
    }

    @HostListener('click', ['$event'])
    onClick(): void {
        this.onTouched(); // set your control to 'touched'
    }

    writeValue(value: any): void {
        if (value !== null) {
            this.value = value;
            // 更新子列表的checked状态
            this.toggleChildren();
        }
    }

    /** 当子选项发生变更时，也变更Group自身的值 */
    toggle(value: any, checked: boolean): void {
        if (typeof value !== 'undefined') {
            this.value = value;
            this.onChange(this.value); // Angular need this
            this.change.emit(this.value);
            this.toggleChildren();
        }
    }

    /** 更新子列表的checked状态 */
    toggleChildren(): void {
        this.children.forEach(checkbox => {
            checkbox.checked = this.value === checkbox.value;
        });
    }
}
