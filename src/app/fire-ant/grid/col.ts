/**
 * @license
 * Copyright 厦门乾元盛世科技有限公司 All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file.
 */

import { Component, Input, ElementRef, ViewEncapsulation, HostBinding, Optional, Host, OnInit } from '@angular/core';
import { UpdateClassService } from '../core/service/update.class.service';
import { isPresent, toNumber } from '../util/lang';
import { Row } from './row';
import { DomUtils } from '../util/dom.utils';

export interface ColSize {
    span?: number;
    order?: number;
    offset?: number;
    push?: number;
    pull?: number;
}

/**
 * 24 栅格系统 之 Column
 * 布局的栅格化系统，我们是基于行（row）和列（col）来定义信息区块的外部框架，以保证页面的每个区域能够稳健地排布起来。下面简单介绍一下它的工作原理：
 *
 * - 通过`row`在水平方向建立一组`column`（简写col）
 * - 你的内容应当放置于`col`内，并且，只有`col`可以作为`row`的直接元素
 * - 栅格系统中的列是指1到24的值来表示其跨越的范围。例如，三个等宽的列可以使用`.col-8`来创建
 * - 如果一个`row`中的`col`总和超过 24，那么多余的`col`会作为一个整体另起一行排列
 */
@Component({
    selector: 'ant-col, [ant-col]',
    template: `
        <ng-content></ng-content>
    `,
    preserveWhitespaces: false,
    encapsulation: ViewEncapsulation.None,
    providers: [UpdateClassService]
})
export class Col implements OnInit {

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
    protected _prefixCls = 'ant-col';


    /* 栅格占位格数，为 0 时相当于 display: none */
    @Input()
    get span(): number {
        return this._span;
    }
    set span(span: number) {
        if (isPresent(span)) {
            const value = toNumber(span, null);
            if (this._span !== value) {
                this._span = value;
                this.updateClassMap();
            }
        }
    }
    protected _span: number;


    /** 栅格顺序，flex 布局模式下有效 */
    @Input()
    get order(): number {
        return this._order;
    }
    set order(order: number) {
        if (isPresent(order)) {
            const value = toNumber(order, null);
            if (this._order !== value) {
                this._order = value;
                this.updateClassMap();
            }
        }
    }
    protected _order = 0;


    /** 栅格左侧的间隔格数，间隔内不可以有栅格 */
    @Input()
    get offset(): number {
        return this._offset;
    }
    set offset(offset: number) {
        if (isPresent(offset)) {
            const value = toNumber(offset, null);
            if (this._offset !== value) {
                this._offset = value;
                this.updateClassMap();
            }
        }
    }
    protected _offset = 0;


    /** 栅格向右移动格数 */
    @Input()
    get push(): number {
        return this._push;
    }
    set push(push: number) {
        if (isPresent(push)) {
            const value = toNumber(push, null);
            if (this._push !== value) {
                this._push = value;
                this.updateClassMap();
            }
        }
    }
    protected _push = 0;


    /** 栅格向左移动格数 */
    @Input()
    get pull(): number {
        return this._pull;
    }
    set pull(pull: number) {
        if (isPresent(pull)) {
            const value = toNumber(pull, null);
            if (this._pull !== value) {
                this._pull = value;
                this.updateClassMap();
            }
        }
    }
    protected _pull = 0;


    /** <768px 响应式栅格，可为栅格数或一个包含其他属性的对象 */
    @Input()
    get xs(): number | ColSize {
        return this._xs;
    }
    set xs(xs: number | ColSize) {
        this._xs = xs;
        this.updateClassMap();
    }
    protected _xs: number | ColSize;


    /** >=768px 响应式栅格，可为栅格数或一个包含其他属性的对象 */
    @Input()
    get sm(): number | ColSize {
        return this._sm;
    }
    set sm(sm: number | ColSize) {
        this._sm = sm;
        this.updateClassMap();
    }
    protected _sm: number | ColSize;


    /** ≥992px 响应式栅格，可为栅格数或一个包含其他属性的对象 */
    @Input()
    get md(): number | ColSize {
        return this._md;
    }
    set md(md: number | ColSize) {
        this._md = md;
        this.updateClassMap();
    }
    protected _md: number | ColSize;


    /** ≥1200px 响应式栅格，可为栅格数或一个包含其他属性的对象 */
    @Input()
    get lg(): number | ColSize {
        return this._lg;
    }
    set lg(lg: number | ColSize) {
        this._lg = lg;
        this.updateClassMap();
    }
    protected _lg: number | ColSize;


    /** ≥1600px 响应式栅格，可为栅格数或一个包含其他属性的对象 */
    @Input()
    get xl(): number | ColSize {
        return this._xl;
    }
    set xl(xl: number | ColSize) {
        this._xl = xl;
        this.updateClassMap();
    }
    protected _xl: number | ColSize;

    /** ≥2000px 响应式栅格，可为栅格数或一个包含其他属性的对象 */
    @Input()
    get xxl(): number | ColSize {
        return this._xxl;
    }
    set xxl(xxl: number | ColSize) {
        this._xxl = xxl;
        this.updateClassMap();
    }
    protected _xxl: number | ColSize;



    constructor(
        protected el: ElementRef,
        protected updateClassService: UpdateClassService,
        @Optional() @Host() private row: Row) {

    }

    /** The underlying host native element */
    getHostElement(): HTMLElement {
        return this.el.nativeElement as HTMLElement;
    }

    ngOnInit(): void {
        this.updateClassMap();
    }

    protected updateClassMap(): void {
        const classes = this.getClasses();
        this.updateClassService.update(this.el.nativeElement, classes);
    }

    /**
     * 最终样式
     */
    getClasses(): any {
        let sizeClassObj = {};

        ['xs', 'sm', 'md', 'lg', 'xl', 'xxl'].forEach(size => {

            let sizeProps: ColSize = {};
            if (typeof this[size] === 'number') {
                sizeProps.span = this[size];
            } else if (typeof this[size] === 'object') {
                sizeProps = this[size] || {};
            }

            sizeClassObj = Object.assign(sizeClassObj, {
                [`${this.prefixCls}-${size}-${sizeProps.span}`]: sizeProps.span !== undefined,
                [`${this.prefixCls}-${size}-order-${sizeProps.order}`]: sizeProps.order || sizeProps.order === 0,
                [`${this.prefixCls}-${size}-offset-${sizeProps.offset}`]: sizeProps.offset || sizeProps.offset === 0,
                [`${this.prefixCls}-${size}-push-${sizeProps.push}`]: sizeProps.push || sizeProps.push === 0,
                [`${this.prefixCls}-${size}-pull-${sizeProps.pull}`]: sizeProps.pull || sizeProps.pull === 0,
            });
        });

        const classes = {
            [`${this.prefixCls}-${this.span}`]: this.span !== undefined && this.span !== null,
            [`${this.prefixCls}-order-${this.order}`]: this.order,
            [`${this.prefixCls}-offset-${this.offset}`]: this.offset,
            [`${this.prefixCls}-push-${this.push}`]: this.push,
            [`${this.prefixCls}-pull-${this.pull}`]: this.pull,
            ...sizeClassObj
        };
        return classes;
    }

    /**
     * 特殊样式
     */
    @HostBinding('style.padding-left') get marginLeft(): any {
        if (this.row && this.row.gutter > 0
            && DomUtils.isParentChild(this.row.getHostElement(), this.getHostElement())) {
            return (this.row.gutter / 2) + 'px';
        }
        return null;
    }

    /**
     * 特殊样式
     */
    @HostBinding('style.padding-right') get marginRight(): any {
        if (this.row && this.row.gutter > 0
            && DomUtils.isParentChild(this.row.getHostElement(), this.getHostElement())) {
            return (this.row.gutter / 2) + 'px';
        }
        return null;
    }

}
