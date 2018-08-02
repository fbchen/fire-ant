/**
 * @license
 * Copyright 厦门乾元盛世科技有限公司 All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file.
 */

import { Component, Input, ElementRef, HostBinding, ViewEncapsulation, OnInit, ContentChild, TemplateRef } from '@angular/core';

import { UpdateClassService } from '../core/service/update.class.service';
import { toBoolean } from '../util/lang';


@Component({
    selector: 'ant-tabpane',
    template: `<ng-content></ng-content>`,
    encapsulation: ViewEncapsulation.None,
    providers: [ UpdateClassService ]
})
export class TabPane implements OnInit {

    /** 样式前缀 */
    @Input()
    get prefixCls(): string {
        return this._prefixCls;
    }
    set prefixCls(prefixCls: string) {
        if (this._prefixCls !== prefixCls) {
            this._prefixCls = prefixCls;
            this.updateClassMap();
            this.updateHeaderClass();
        }
    }
    private _prefixCls = 'ant-tabs';


    /** 是否已经激活 */
    @Input()
    get active(): boolean {
        return this._active;
    }
    set active(active: boolean) {
        const value = toBoolean(active);
        if (this._active !== value) {
            this._active = value;
            this.updateClassMap();
            this.updateHeaderClass();
        }
    }
    private _active = false;


    /** 标签是否可以可访问（或已禁用） */
    @Input()
    get disabled(): boolean {
        return this._disabled;
    }
    set disabled(disabled: boolean) {
        const value = toBoolean(disabled);
        if (this._disabled !== value) {
            this._disabled = value;
            this.updateClassMap();
            this.updateHeaderClass();
        }
    }
    private _disabled = false;


    /** 标签是否可以关闭 */
    @Input()
    get closable(): boolean {
        return this._closable;
    }
    set closable(closable: boolean) {
        const value = toBoolean(closable);
        if (this._closable !== value) {
            this._closable = value;
            this.updateHeaderClass();
        }
    }
    private _closable = false;


    /** 标签色 */
    @Input()
    get color(): string {
        return this._color;
    }
    set color(color: string) {
        if (this._color !== color) {
            this._color = color;
            this.updateClassMap();
        }
    }
    private _color: string;


    /** 选项卡Key */
    @Input() key: string;

    /** 选项卡头显示文字，也可以通过子标签<tab-pane-title>来定义 */
    @Input() tabTitle: string;

    /** 选项卡标题，Template注入 */
    @ContentChild('nzTabTitle') nzTabTitleTemplate: TemplateRef<any>;

    // 内部样式
    public headerClasses: any;

    constructor(
        protected el: ElementRef,
        protected updateClassService: UpdateClassService) {

    }

    ngOnInit(): void {
        this.updateClassMap();
        this.updateHeaderClass();
    }

    protected updateClassMap(): void {
        const classes = {
            [`${this.prefixCls}-tabpane`]: true,
            [`${this.prefixCls}-tabpane-inactive`]: !this.active,
            [`${this.prefixCls}-tabpane-active`]: this.active
        };
        this.updateClassService.update(this.el.nativeElement, classes);
    }

    protected updateHeaderClass(): void {
        this.headerClasses = {
            [`${this.prefixCls}-tab`]: 1,
            [`${this.prefixCls}-tab-active`]: this.active,
            [`${this.prefixCls}-tab-disabled`]: this.disabled,
            [`${this.prefixCls}-tab-closable`]: this.closable
        };
    }

    @HostBinding('attr.role') get role(): string {
        return 'tabpanel';
    }

    @HostBinding('attr.aria-hidden') get ariaHidden(): string {
        return this.active ? 'false' : 'true';
    }

    /** The underlying host native element */
    getHostElement(): HTMLElement {
        return this.el.nativeElement as HTMLElement;
    }

    /** 是否已禁用 */
    isDisabled(): boolean {
        return this.disabled;
    }

}

