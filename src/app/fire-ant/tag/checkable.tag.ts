/**
 * @license
 * Copyright 厦门乾元盛世科技有限公司 All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file.
 */

import { Component, Input, Output, OnInit, ElementRef, EventEmitter, HostListener, ViewEncapsulation } from '@angular/core';
import { UpdateClassService } from '../core/service/update.class.service';
import { toBoolean } from '../util/lang';

@Component({
    selector: 'ant-checkable-tag',
    template: `<ng-content></ng-content>`,
    styleUrls: ['./style/index.scss', './style/patch.scss'],
    encapsulation: ViewEncapsulation.None,
    providers: [ UpdateClassService ]
})
export class CheckableTag implements OnInit {

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
    private _prefixCls = 'ant-tag';


    /** 标签是否可以关闭 */
    @Input()
    get closable(): boolean {
        return this._closable;
    }
    set closable(closable: boolean) {
        const value = toBoolean(closable);
        if (this._closable !== value) {
            this._closable = value;
        }
    }
    private _closable = false;


    /** 设置标签的选中状态 */
    @Input()
    get checked(): boolean {
        return this._checked;
    }
    set checked(checked: boolean) {
        const value = toBoolean(checked);
        if (this._checked !== value) {
            this._checked = value;
            this.updateClassMap();
        }
    }
    private _checked = false;


    /** 是否可选择 */
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



    /** 点击标签时触发的事件 */
    @Output() beforeChange = new EventEmitter<{ event: Event, checked: boolean }>();

    /** 点击标签时触发的事件 */
    @Output() change = new EventEmitter<boolean>();

    constructor(
        protected el: ElementRef,
        protected updateClassService: UpdateClassService) {

    }

    ngOnInit(): void {
        this.updateClassMap();
    }

    protected updateClassMap(): void {
        const classes = {
            [`${this.prefixCls}`]: true,
            [`${this.prefixCls}-checkable`]: true,
            [`${this.prefixCls}-checkable-checked`]: this.checked,
            [`${this.prefixCls}-checkable-disabled`]: this.disabled
        };
        this.updateClassService.update(this.el.nativeElement, classes);
    }

    @HostListener('click', ['$event'])
    handleClick(event: Event): void {
        if (this.disabled) {
            return;
        }

        this.beforeChange.emit({ event, checked: this.checked });
        if (event.defaultPrevented) {
            return;
        }
        this.change.emit(!this.checked);
    }

}
