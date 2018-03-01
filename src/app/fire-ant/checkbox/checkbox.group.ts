/**
 * @license
 * Copyright 厦门乾元盛世科技有限公司 All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file.
 */


import { Component, Input, Output, EventEmitter, ElementRef, Renderer2, ViewEncapsulation } from '@angular/core';
import { OnInit, HostListener, Inject, Optional, ContentChildren, QueryList, forwardRef } from '@angular/core';
import { NG_VALUE_ACCESSOR, COMPOSITION_BUFFER_MODE } from '@angular/forms';

import { FormControl } from '../input/form.control';
import { Checkbox } from './checkbox';


function toArray(value: any): any[] {
    let ret = value;
    if (value === undefined || value === null) {
        ret = [];
    } else if (!Array.isArray(value)) {
        ret = [value];
    }
    return ret;
}

const INPUT_CONTROL_VALUE_ACCESSOR: any = {
    provide: NG_VALUE_ACCESSOR,
    useExisting: forwardRef(() => CheckboxGroup),
    multi: true
};

@Component({
    selector: 'ant-checkbox-group',
    template: `<ng-content></ng-content>`,
    encapsulation: ViewEncapsulation.None,
    providers: [INPUT_CONTROL_VALUE_ACCESSOR]
})
export class CheckboxGroup extends FormControl implements OnInit {

    /** 样式前缀 */
    @Input() prefixCls = 'ant-checkbox-group';

    /** 用户CSS样式 */
    @Input() class: string;

    /** 值变更事件 */
    @Output() change = new EventEmitter<any>();

    /** 子列表 */
    @ContentChildren(forwardRef(() => Checkbox), {descendants: true}) children: QueryList<Checkbox>;

    constructor(
        public renderer: Renderer2,
        public elementRef: ElementRef,
        @Optional() @Inject(COMPOSITION_BUFFER_MODE) public compositionMode: boolean) {

        super(renderer, elementRef, compositionMode);
        this.value = [];
    }

    @HostListener('click', ['$event'])
    onClick(): void {
        this.onTouched(); // set your control to 'touched'
    }

    ngOnInit(): void {
        this.value = toArray(this.value);
    }

    writeValue(value: any): void {
        if (value !== null) {
            this.value = toArray(value);
            // 更新子列表的checked状态
            this.toggleChildren();
        }
    }

    hasValue(value: any): boolean {
        return toArray(this.value).includes(value);
    }

    /** 当子选项发生变更时，也变更Group自身的值 */
    toggle(value: any, checked: boolean): void {
        if (typeof value !== 'undefined') {
            const array: any[] = this.value = toArray(this.value);
            const contains = this.hasValue(value);
            if (checked && !contains) {
                array.push(value);
            }
            if (!checked && contains) {
                this.value = array.filter(v => v !== value);
            }
            this.onChange(this.value); // Angular need this
            this.change.emit(this.value);
        }
    }

    /** 更新子列表的checked状态 */
    toggleChildren(): void {
        this.children.forEach(checkbox => {
            checkbox.checked = this.hasValue(checkbox.value);
        });
    }
}
