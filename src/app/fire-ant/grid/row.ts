/**
 * @license
 * Copyright 厦门乾元盛世科技有限公司 All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file.
 */

import { Component, Input, ElementRef, ViewEncapsulation, HostBinding, OnInit } from '@angular/core';
import { UpdateClassService } from '../core/service/update.class.service';


/**
 * 24 栅格系统 之 Row
 * 布局的栅格化系统，我们是基于行（row）和列（col）来定义信息区块的外部框架，以保证页面的每个区域能够稳健地排布起来。下面简单介绍一下它的工作原理：
 *
 * - 通过`row`在水平方向建立一组`column`（简写col）
 * - 你的内容应当放置于`col`内，并且，只有`col`可以作为`row`的直接元素
 * - 栅格系统中的列是指1到24的值来表示其跨越的范围。例如，三个等宽的列可以使用`.col-8`来创建
 * - 如果一个`row`中的`col`总和超过 24，那么多余的`col`会作为一个整体另起一行排列
 */
@Component({
    selector: 'ant-row, [ant-row]',
    template: `
        <ng-content></ng-content>
    `,
    styleUrls: ['./style/index.scss'],
    preserveWhitespaces: false,
    encapsulation: ViewEncapsulation.None,
    providers: [ UpdateClassService ]
})
export class Row implements OnInit {

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
    protected _prefixCls = 'ant-row';


    /*
     * 布局模式，可选 flex，现代浏览器 下有效。默认为空。
     */
    @Input()
    get type(): 'flex' | null {
        return this._type;
    }
    set type(type: 'flex' | null) {
        if (this._type !== type) {
            this._type = type;
            this.updateClassMap();
        }
    }
    private _type: 'flex' = null;


    /**
     * flex 布局下的垂直对齐方式：top middle bottom stretch
     */
    @Input()
    get align(): 'top' | 'middle' | 'bottom' | 'stretch' {
        return this._align;
    }
    set align(align: 'top' | 'middle' | 'bottom' | 'stretch') {
        if (this._align !== align) {
            this._align = align;
            this.updateClassMap();
        }
    }
    private _align: 'top' | 'middle' | 'bottom' | 'stretch' = 'top';


    /**
     * flex 布局下的水平排列方式：start end center space-around space-between
     */
    @Input()
    get justify(): 'start' | 'end' | 'center' | 'space-around' | 'space-between' {
        return this._justify;
    }
    set justify(justify: 'start' | 'end' | 'center' | 'space-around' | 'space-between') {
        if (this._justify !== justify) {
            this._justify = justify;
            this.updateClassMap();
        }
    }
    private _justify: 'start' | 'end' | 'center' | 'space-around' | 'space-between' = 'start';


    /**
     * 栅格间隔。默认为0。
     */
    @Input() gutter = 0;


    constructor(
        protected el: ElementRef,
        protected updateClassService: UpdateClassService) {

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

    getClasses(): any {
        return {
            [`${this.prefixCls}`]: !this.type,
            [`${this.prefixCls}-${this.type}`]: this.type,
            [`${this.prefixCls}-${this.type}-${this.justify}`]: this.type && this.justify,
            [`${this.prefixCls}-${this.type}-${this.align}`]: this.type && this.align
        };
    }

    /**
     * 特殊样式
     */
    @HostBinding('style.margin-left') get marginLeft(): any {
        return (this.gutter > 0) ? (this.gutter / -2) + 'px' : null;
    }

    /**
     * 特殊样式
     */
    @HostBinding('style.margin-right') get marginRight(): any {
        return (this.gutter > 0) ? (this.gutter / -2) + 'px' : null;
    }

}
