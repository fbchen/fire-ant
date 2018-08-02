/**
 * @license
 * Copyright 厦门乾元盛世科技有限公司 All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file.
 */

import { Component, Input, ViewEncapsulation, ElementRef, ContentChild, OnInit } from '@angular/core';
import { UpdateClassService } from '../core/service/update.class.service';
import { toBoolean } from '../util/lang';

import { TableHeader } from './table.header';
import { TableFooter } from './table.footer';


const defaultLocale = {
    filterTitle: '筛选',
    filterConfirm: '确定',
    filterReset: '重置',
    emptyText: '暂无数据',
    selectAll: '全选当页',
    selectInvert: '反选当页',
};

/**
 * 表格
 */
@Component({
    selector: 'ant-table',
    templateUrl: './table.html',
    styleUrls: ['./style/index.scss', './style/patch.scss'],
    preserveWhitespaces: false,
    encapsulation: ViewEncapsulation.None,
    providers: [ UpdateClassService ]
})
export class Table implements OnInit {

    /** 样式前缀 */
    @Input()
    get prefixCls(): string {
        return this._prefixCls;
    }
    set prefixCls(prefixCls: string) {
        if (this._prefixCls !== prefixCls) {
            this._prefixCls = prefixCls;
            this.updateClassMap();
            this.updateTableClasses();
        }
    }
    private _prefixCls = 'ant-table';


    /** 大小类型：正常型、紧凑型或迷你型，`default`, `middle`, `small`，默认为`default` */
    @Input()
    get size(): 'default' | 'middle' | 'small' {
        return this._size;
    }
    set size(size: 'default' | 'middle' | 'small') {
        if (this._size !== size) {
            this._size = size;
            // this.updateClassMap();
            this.updateTableClasses();
        }
    }
    private _size: 'default' | 'middle' | 'small' = 'default';


    /** 是否展示外边框和列边框 */
    @Input()
    get bordered(): boolean {
        return this._bordered;
    }
    set bordered(bordered: boolean) {
        const value = toBoolean(bordered);
        if (this._bordered !== value) {
            this._bordered = value;
            this.updateTableClasses();
        }
    }
    private _bordered = false;


    /** 是否没有数据 */
    @Input()
    get isEmpty(): boolean {
        return this._isEmpty;
    }
    set isEmpty(isEmpty: boolean) {
        const value = toBoolean(isEmpty);
        if (this._isEmpty !== value) {
            this._isEmpty = value;
            this.updateTableClasses();
        }
    }
    private _isEmpty = false;


    /** 是否显示表头 */
    @Input()
    get showHeader(): boolean {
        return this._showHeader;
    }
    set showHeader(showHeader: boolean) {
        const value = toBoolean(showHeader);
        if (this._showHeader !== value) {
            this._showHeader = value;
            this.updateTableClasses();
        }
    }
    private _showHeader = true;


    /** 固定列头 */
    @Input()
    get fixedHeader(): boolean {
        return this._fixedHeader;
    }
    set fixedHeader(fixedHeader: boolean) {
        const value = toBoolean(fixedHeader);
        if (this._fixedHeader !== value) {
            this._fixedHeader = value;
            this.updateTableClasses();
            this.updateBodyStyles();
        }
    }
    private _fixedHeader = false;


    @Input()
    get scrollPosition(): 'left'|'right'|'both'|'middle' {
        return this._scrollPosition;
    }
    set scrollPosition(scrollPosition: 'left'|'right'|'both'|'middle') {
        if (this._scrollPosition !== scrollPosition) {
            this._scrollPosition = scrollPosition;
            this.updateTableClasses();
        }
    }
    private _scrollPosition: 'left'|'right'|'both'|'middle' = 'left';

    /** 固定表头或者固定列的设置，例如 { y: 240 } 表示内容部分的高度为240px，超出范围的内容需要滚动查看 */
    @Input()
    get scroll(): {x?: number, y?: number} {
        return this._scroll;
    }
    set scroll(scroll: {x?: number, y?: number}) {
        this._scroll = scroll;
        this.updateContentTableClass();
        this.updateBodyStyles();
    }
    private _scroll: {x?: number, y?: number};


    /** 当固定列头时，可指定内容部分的最大高度 */
    @Input()
    get bodyMaxHeight(): number {
        return this._bodyMaxHeight;
    }
    set bodyMaxHeight(scroll: number) {
        this._bodyMaxHeight = scroll;
        this.updateBodyStyles();
    }
    private _bodyMaxHeight: number;


    /** 内容部分的overflow样式 */
    @Input()
    get overflowY(): 'auto' | 'scroll' | 'hidden' | 'visible' | 'overlay' {
        return this._overflowY;
    }
    set overflowY(scroll: 'auto' | 'scroll' | 'hidden' | 'visible' | 'overlay') {
        this._overflowY = scroll;
        this.updateBodyStyles();
    }
    private _overflowY: 'auto' | 'scroll' | 'hidden' | 'visible' | 'overlay' = 'auto';



    /** 表格标题 */
    @Input() caption: string;

    /** 表格脚注 */
    @Input() footer: string;

    /** 页面是否加载中 */
    @Input() loading = false;

    /** 展示树形数据时，每层缩进的宽度，以 px 为单位 */
    @Input() indentSize = 20;

    /** 国际化 */
    @Input() locale: { [key: string]: string };


    /** 用户自定表格标题 */
    @ContentChild(TableHeader) tableHeader: TableHeader;

    /** 用户自定表格脚注 */
    @ContentChild(TableFooter) tableFooter: TableFooter;


    // 内部样式
    public tableClasses: any;
    public contentTableClasses: any;
    public bodyStyles: any;

    constructor(
        protected el: ElementRef,
        protected updateClassService: UpdateClassService) {

    }

    ngOnInit(): void {
        this.updateClassMap();
        this.updateTableClasses();
        this.updateContentTableClass();
        this.updateBodyStyles();
    }

    protected updateClassMap(): void {
        const classes = {
            [`${this.prefixCls}-wrapper`]: true
        };
        this.updateClassService.update(this.el.nativeElement, classes);
    }

    private updateTableClasses(): void {
        this.tableClasses = {
            [`${this.prefixCls}`]: true,
            [`${this.prefixCls}-${this.size}`]: true,
            [`${this.prefixCls}-bordered`]: this.bordered,
            [`${this.prefixCls}-empty`]: this.isEmpty,
            [`${this.prefixCls}-without-column-header`]: !this.showHeader,
            [`${this.prefixCls}-fixed-header`]: this.fixedHeader,
            [`${this.prefixCls}-scroll-position-left`]: this.scrollPosition === 'left' || this.scrollPosition === 'both',
            [`${this.prefixCls}-scroll-position-right`]: this.scrollPosition === 'right' || this.scrollPosition === 'both',
            [`${this.prefixCls}-scroll-position-middle`]: this.scrollPosition === 'middle'
        };
    }

    private updateContentTableClass(): any {
        const scroll = this.scroll || {};
        this.contentTableClasses = {
            [`${this.prefixCls}-fixed`]: (!!scroll.x)
        };
    }

    private updateBodyStyles(): void {
        if (this.isHeaderFixed()) {
            const scroll = this.scroll || {};
            const height = (this.bodyMaxHeight || scroll.y) || 0;
            this.bodyStyles = {
                maxHeight: height > 0 ? `${height}px` : null,
                overflowY: this.overflowY || 'scroll'
            };
        } else {
            this.bodyStyles = null;
        }
    }


    getLocale() {
        return Object.assign({}, defaultLocale, this.locale);
    }

    /** 表格内容是否可滚动（表格列头将固定，或者左右列将固定） */
    isScrollable(): boolean {
        const scroll = this.scroll || {};
        return /*isAnyColumnsFixed()||*/ (!!scroll.x) || (!!scroll.y);
    }

    isHeaderFixed(): boolean {
        const scroll = this.scroll || {};
        return (!!scroll.y) || this.fixedHeader;
    }

}
