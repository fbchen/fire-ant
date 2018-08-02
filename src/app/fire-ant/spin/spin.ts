/**
 * @license
 * Copyright 厦门乾元盛世科技有限公司 All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file.
 */

import { Component, Input, ElementRef, Renderer2, ViewEncapsulation, ViewChild, OnInit, OnDestroy } from '@angular/core';
import { UpdateClassService } from '../core/service/update.class.service';
import { toBoolean } from '../util/lang';

import * as cssAnimate from 'css-animation';
import { FadeAnimation } from '../core/animations/fade-animations';

/**
 * Spin 加载中
 */
@Component({
    selector: 'ant-spin',
    template: `
        <div [ngClass]="nestedLoadingClasses">
            <div>
                <div [ngClass]="spinClasses" *ngIf="spinning">
                    <span class="{{prefixCls}}-dot">
                        <i></i><i></i><i></i><i></i>
                    </span>
                    <div class="{{prefixCls}}-text" *ngIf="tip">{{tip}}</div>
                </div>
            </div>
            <div #container [ngClass]="containerClasses" (cdkObserveContent)="checkNested()" [@fadeAnimation]>
                <ng-content></ng-content>
            </div>
        </div>
    `,
    styleUrls: ['./style/index.scss'],
    preserveWhitespaces: false,
    encapsulation: ViewEncapsulation.None,
    animations: [ FadeAnimation ],
    providers: [ UpdateClassService ]
})
export class Spin implements OnInit, OnDestroy {

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
    private _prefixCls = 'ant-spin';


    /** 组件大小，可选值为 `small` `default` `large` */
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


    /** 是否旋转 */
    @Input()
    get spinning(): boolean {
        return this._spinning;
    }
    set spinning(spinning: boolean) {
        const value = toBoolean(spinning);
        if (this._spinning !== value) {
            this._spinning = value;
            this.updateClassMap();
        }
    }
    private _spinning = true;


    /** 当作为包裹元素时，可以自定义描述文案 */
    @Input()
    get tip(): string {
        return this._tip;
    }
    set tip(tip: string) {
        if (this._tip !== tip) {
            this._tip = tip;
            this.updateClassMap();
        }
    }
    private _tip: string;

    // 是否包含子结点
    protected get isNested(): boolean {
        return this._isNested;
    }
    protected set isNested(isNested: boolean) {
        if (this._isNested !== isNested) {
            this._isNested = isNested;
            this.updateClassMap();
        }
    }
    private _isNested = false;


    /** 内容容器Element */
    @ViewChild('container') container: ElementRef;

    private notCssAnimationSupported = false;

    // 内部样式
    public spinClasses: any;
    public containerClasses: any;
    public nestedLoadingClasses: any;


    constructor(
        protected renderer: Renderer2,
        protected el: ElementRef) {
    }

    ngOnInit(): void {
        this.notCssAnimationSupported = !cssAnimate.isCssAnimationSupported;
        this.updateClassMap();
    }

    ngOnDestroy(): void {
        this.spinning = false;
    }

    protected updateClassMap(): void {
        this.spinClasses = {
            [`${this.prefixCls}`]: true,
            [`${this.prefixCls}-sm`]: this.size === 'small',
            [`${this.prefixCls}-lg`]: this.size === 'large',
            [`${this.prefixCls}-spinning`]: this.spinning,
            [`${this.prefixCls}-show-text`]: !!this.tip || this.notCssAnimationSupported
        };
        this.containerClasses = {
            [`${this.prefixCls}-container`]: true,
            [`${this.prefixCls}-blur`]: this.spinning
        };
        this.nestedLoadingClasses = {
            [`${this.prefixCls}-nested-loading`]: this.isNested
        };
    }

    checkNested(): void {
        const el: HTMLElement = this.container.nativeElement;
        this.isNested = el.childElementCount > 0;
    }
}
