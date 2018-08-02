/**
 * @license
 * Copyright 厦门乾元盛世科技有限公司 All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file.
 */

import { Component, Input, ElementRef, ViewEncapsulation, OnInit, OnDestroy } from '@angular/core';
import { toBoolean } from '../util/lang';

@Component({
    selector: 'ant-button',
    template: `
        <button
            [ngClass]="classMap"
            [disabled]="disabled"
            [type]="htmlType"
            (click)="handleClick($event)"
            (mouseup)="handleMouseUp($event)"
        >
            <ant-icon [type]="iconType" *ngIf="iconType"></ant-icon>
            <span><ng-content></ng-content></span>
        </button>
    `,
    styleUrls: ['./style/index.scss'],
    preserveWhitespaces: false,
    encapsulation: ViewEncapsulation.None,
    exportAs: 'button'
})
export class Button implements OnInit, OnDestroy {

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
    private _prefixCls = 'ant-btn';


    /**
     * 设置按钮类型，可选值为 `primary` `dashed` `danger`，或者不设 <br>
     * 按钮类型，取值：default、primary、warn等。默认为default。<br>
     * 自定义的颜色名称与色值，可以定义在 工程根目录/src/theme/variables.scss 文件中的 $colors 对象。
     */
    @Input()
    get type(): string {
        return this._type;
    }
    set type(type: string) {
        if (this._type !== type) {
            this._type = type;
            this.updateClassMap();
        }
    }
    private _type: string;


    /**
     * 设置按钮的图标类型。例如：search、download等。<br>
     * 当需要在 <code>Button</code> 内嵌入 <code>Icon</code> 时，可以设置 <code>icon</code> 属性，或者直接在 <code>Button</code> 内使用 <code>Icon</code> 组件。<br>
     * 如果想控制 <code>Icon</code> 具体的位置，只能直接使用 <code>Icon</code> 组件，而非 <code>icon</code> 属性。
     */
    @Input()
    get icon(): string {
        return this._icon;
    }
    set icon(icon: string) {
        if (this._icon !== icon) {
            this._icon = icon;
            this.updateClassMap();
        }
    }
    private _icon: string;


    /** 设置按钮形状，可选值为 `circle` 或者不设。可选值为`circle`, `circle-outline'`。 */
    @Input()
    get shape(): string {
        return this._shape;
    }
    set shape(shape: string) {
        if (this._shape !== shape) {
            this._shape = shape;
            this.updateClassMap();
        }
    }
    private _shape: string;


    /** 设置按钮大小。可选值为`large`, `small`, `default`，默认取值为`default` */
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
    private _size: 'large' | 'small' | 'default';


    /** 设置按钮载入状态。默认为false。 */
    @Input()
    get loading(): boolean {
        return this._loading;
    }
    set loading(loading: boolean) {
        const value = toBoolean(loading);
        if (this._loading !== value) {
            this._loading = value;
            this.updateClassMap();
        }
    }
    private _loading = false;


    /** 禁用样式 */
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


    /** 幽灵属性，使按钮背景透明 */
    @Input()
    get ghost(): boolean {
        return this._ghost;
    }
    set ghost(ghost: boolean) {
        const value = toBoolean(ghost);
        if (this._ghost !== value) {
            this._ghost = value;
            this.updateClassMap();
        }
    }
    private _ghost = false;


    /** 按钮CSS样式 */
    @Input()
    get btnClass(): string {
        return this._btnClass;
    }
    set btnClass(btnClass: string) {
        if (this._btnClass !== btnClass) {
            this._btnClass = btnClass;
            this.updateClassMap();
        }
    }
    private _btnClass: string;


    /**
     * 设置 `button` 原生的 `type` 值，可选值请参考 [HTML 标准](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/button#attr-type) <br>
     * 可选值为`submit`, `button`, `reset`，默认取值为`button`。
     */
    @Input() htmlType = 'button';

    public classMap: any;
    private clicked = false;
    private timeout: any; // NodeJS.Timer

    constructor(
        private el: ElementRef) {

    }

    ngOnInit(): void {
        this.updateClassMap();
    }

    private updateClassMap(): void {
        const el = this.el.nativeElement as HTMLElement;
        const hasText = el.querySelector('span').hasChildNodes();
        this.classMap = {
            [`${this.prefixCls}`]: 1,
            [`${this.prefixCls}-${this.type}`]: this.type,
            [`${this.prefixCls}-${this.shape}`]: this.shape,
            [`${this.prefixCls}-lg`]: this.size === 'large',
            [`${this.prefixCls}-sm`]: this.size === 'small',
            [`${this.prefixCls}-icon-only`]: this.icon && !hasText,
            [`${this.prefixCls}-loading`]: this.loading,
            [`${this.prefixCls}-clicked`]: this.clicked,
            [`${this.prefixCls}-background-ghost`]: this.ghost,
            [`${this.btnClass}`]: this.btnClass
        };
    }

    get iconType(): string {
        return this.loading ? 'loading' : this.icon;
    }

    ngOnDestroy(): void {
        if (this.timeout) {
            clearTimeout(this.timeout);
        }
    }

    handleClick(e: MouseEvent): void {
        // Add click effect
        this.clicked = true;
        this.updateClassMap();

        if (this.timeout) {
            clearTimeout(this.timeout);
        }
        this.timeout = setTimeout(() => {
            this.clicked = false;
            this.updateClassMap();
        }, 500);
    }

    handleMouseUp(e: MouseEvent) {
        this.el.nativeElement.querySelector('button').blur();
    }

}
