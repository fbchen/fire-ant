/**
 * @license
 * Copyright 厦门乾元盛世科技有限公司 All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file.
 */


import {
    Component, Input, Output, EventEmitter, ElementRef, Renderer2, ViewEncapsulation,
    HostListener, Inject, Optional, ContentChildren, QueryList, forwardRef, OnInit
} from '@angular/core';
import { NG_VALUE_ACCESSOR, COMPOSITION_BUFFER_MODE } from '@angular/forms';

import { UpdateClassService } from '../core/service/update.class.service';
import { toBoolean } from '../util/lang';
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
    preserveWhitespaces: false,
    encapsulation: ViewEncapsulation.None,
    providers: [ UpdateClassService, INPUT_CONTROL_VALUE_ACCESSOR ]
})
export class RadioGroup extends FormControl implements OnInit {

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
    private _prefixCls = 'ant-radio-group';


    /** 控件大小。注：只对按钮样式生效。可选 `large` `default` `small`，默认为`default`。 */
    @Input()
    get size(): 'large' | 'default' | 'small' {
        return this._size;
    }
    set size(size: 'large' | 'default' | 'small') {
        if (this._size !== size) {
            this._size = size;
            this.updateClassMap();
        }
    }
    private _size: 'large' | 'default' | 'small' = 'default';


    /** 如果设置为`button`模式，则显示RadioButton的样式 */
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


    /** Whether is disabled */
    @Input()
    set disabled(disabled: boolean) {
        const value = toBoolean(disabled);
        if (this._disabled !== value) {
            this._disabled = value;
            this.updateClassMap();
        }
    }
    get disabled(): boolean {
        return this._disabled;
    }
    private _disabled = false;


    /** 值变更事件 */
    @Output() change = new EventEmitter<any>();

    /** 子列表 */
    @ContentChildren(forwardRef(() => Radio), { descendants: true }) children: QueryList<Radio>;

    constructor(
        public renderer: Renderer2,
        public elementRef: ElementRef,
        @Optional() @Inject(COMPOSITION_BUFFER_MODE) public compositionMode: boolean,
        protected updateClassService: UpdateClassService) {
        super(renderer, elementRef, compositionMode);
    }

    ngOnInit(): void {
        this.updateClassMap();
    }

    private updateClassMap(): void {
        const classes = {
            [`${this.prefixCls}`]: true,
            [`${this.prefixCls}-${this.size}`]: this.size,
            [`${this.prefixCls}-mode-${this.mode}`]: this.mode
        };
        this.updateClassService.update(this.elementRef.nativeElement, classes);
    }

    @HostListener('click', ['$event'])
    onClick(): void {
        this.onTouched(); // set your control to 'touched'
    }

    writeValue(value: any): void {
        this.value = value;
        // 更新子列表的checked状态
        this.toggleChildren();
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
        if (this.children && this.children.length) {
            this.children.forEach(checkbox => {
                checkbox.checked = this.value === checkbox.value;
            });
        }
    }

    /**
     * @Override (From ControlValueAccessor interface)
     */
    setDisabledState(isDisabled: boolean): void {
        this.disabled = isDisabled;
    }

}
