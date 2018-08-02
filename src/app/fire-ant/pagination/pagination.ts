/**
 * @license
 * Copyright 厦门乾元盛世科技有限公司 All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file.
 */


import {
    Component, Input, Output, EventEmitter, OnInit, OnChanges, ViewEncapsulation,
    SimpleChanges, ContentChild, TemplateRef
} from '@angular/core';
import { UpdateClassService } from '../core/service/update.class.service';
import { StringUtils } from '../util/string.utils';
import { KeyCode } from '../util/key.code';

function isInteger(value: number): boolean {
    return typeof value === 'number' &&
        isFinite(value) &&
        Math.floor(value) === value;
}

const EDIT_KEYS = [KeyCode.LEFT, KeyCode.RIGHT, KeyCode.UP, KeyCode.DOWN, KeyCode.DELETE, KeyCode.BACKSPACE];

@Component({
    selector: 'ant-pagination',
    templateUrl: './pagination.html',
    styleUrls: ['./style/index.scss', './style/patch.scss'],
    preserveWhitespaces: false,
    encapsulation: ViewEncapsulation.None,
    providers: [ UpdateClassService ]
})
export class Pagination implements OnInit, OnChanges {

    /** 样式前缀 */
    @Input() prefixCls = 'ant-pagination';

    /** 数据总数 */
    @Input() total = 0;

    /** 当前页数，默认1 */
    @Input() current = 1;

    /** 每页条数，默认10 */
    @Input() pageSize = 10;

    /** 是否可以改变 pageSize。默认为false */
    @Input() showSizeChanger = false;

    /** 指定每页可以显示多少条 */
    @Input() pageSizeOptions: number[] = [10, 20, 30, 40];

    /** 每页数选择器中的下拉选项格式，默认形如：`10条/页` */
    @Input() pageSizeOptionFormat = '{pageSize}{perPage}';

    /** 是否可以快速跳转至某页。默认为false */
    @Input() showQuickJumper: boolean | any = false;

    /** 当为「small」时，是小尺寸分页 */
    @Input() size: string;

    /** 当添加该属性时，显示为简单分页 */
    @Input() simple = false;

    /** 向前后一次跳多少页：showLess为3，否则为5 */
    @Input() showLessItems = false;

    /** 是否在按钮上显示title */
    @Input() showTitle = true;

    /** 是否显示记录总数和当前记录范围 */
    @Input() showTotal = false;

    /** 本地化 */
    @Input() locale = {
        // Options
        items_per_page: '条/页',
        jump_to: '跳至',
        jump_to_confirm: '确定',
        page: '页',
        emptyText: '没有数据',

        // Pagination
        prev_page: '上一页',
        next_page: '下一页',
        prev_5: '向前 5 页',
        next_5: '向后 5 页',
        prev_3: '向前 3 页',
        next_3: '向后 3 页',
    };

    /** pageSize变更事件 */
    @Output() sizeChange = new EventEmitter<number>();

    /** page变更事件 */
    @Output() pageChange = new EventEmitter<number>();

    /** 自定义显示总数的模板，参数：total-总数，current-当前页码，pageSize-每页记录数 */
    @ContentChild('showTotal') showTotalTemplate: TemplateRef<any>;

    public _current: number;
    public _pageSize: number;

    public _pagerRange: number[] = [];

    constructor() {

    }

    ngOnInit(): void {
        this._current = this.current;
        this._pageSize = this.pageSize;
        this._pagerRange = this._getPagerRange();
    }

    ngOnChanges(changes: SimpleChanges): void {
        let changed = false;
        for (const prop of Object.keys(changes)) {
            if (!changes[prop].isFirstChange()) {
                changed = true;
                break;
            }
        }

        if (changed) {
            this._pagerRange = this._getPagerRange();
        }
    }

    /** 根据「总数」和「每页条数」计算「总页数」 */
    public getPageCount(): number {
        return Math.floor((this.total - 1) / this.pageSize) + 1;
    }

    private isValid(page: number): boolean {
        return isInteger(page) && page >= 1 && page !== this.current;
    }

    public hasPrev(): boolean {
        return this.current > 1;
    }

    public hasNext(): boolean {
        return this.current < this.getPageCount();
    }

    /** 前一页 */
    public prev(): void {
        if (this.hasPrev()) {
            this.handleChange(this.current - 1);
        }
    }

    /** 后一页 */
    public next(): void {
        if (this.hasNext()) {
            this.handleChange(this.current + 1);
        }
    }

    /** 第一页 */
    public first(): void {
        this.handleChange(1);
    }

    /** 末一页 */
    public last(): void {
        this.handleChange(this.getPageCount());
    }

    /** 向前跳3页或5页 */
    public jumpPrev(): void {
        this.handleChange(Math.max(1, this.current - (this.showLessItems ? 3 : 5)));
    }

    /** 向后跳3页或5页 */
    public jumpNext(): void {
        const pageCount: number = this.getPageCount();
        this.handleChange(Math.min(pageCount, this.current + (this.showLessItems ? 3 : 5)));
    }

    public getJumpPrevTitle(): string {
        return this.showLessItems ? this.locale.prev_3 : this.locale.prev_5;
    }

    public getJumpNextTitle(): string {
        return this.showLessItems ? this.locale.next_3 : this.locale.next_5;
    }

    public isJumpPrevVisible(): boolean {
        const pageCount = this.getPageCount();
        const pageBufferSize = this.showLessItems ? 1 : 2;
        if (pageCount <= 5 + pageBufferSize * 2) {
            return false;
        }
        return (this.current - 1 >= pageBufferSize * 2) && (this.current !== 1 + 2);
    }

    public isJumpNextVisible(): boolean {
        const pageCount = this.getPageCount();
        const pageBufferSize = this.showLessItems ? 1 : 2;
        if (pageCount <= 5 + pageBufferSize * 2) {
            return false;
        }
        return (pageCount - this.current >= pageBufferSize * 2) && (this.current !== pageCount - 2);
    }

    public isFirstPagerVisible(): boolean {
        return !this._pagerRange.includes(1);
    }

    public isLastPagerVisible(): boolean {
        const pageCount = this.getPageCount();
        return pageCount > 0 && !this._pagerRange.includes(pageCount);
    }

    /** 导航至不同的页码 */
    public handleChange(value: any): void {
        let page = Number(value);
        if (this.isValid(page)) {
            const pageCount: number = this.getPageCount();

            if (page > pageCount) {
                page = pageCount;
            }
            this.current = this._current = page;
            this.pageChange.emit(page);
        }
    }

    /** 更改「每页条数」 */
    public handlePageSizeChange(): void {
        const newPageSize: number = Number(this._pageSize);
        if (this.pageSize !== newPageSize) {
            this.pageSize = this._pageSize = newPageSize;
            this.pageChange.emit(newPageSize);
        }
    }

    /** 获取页码显示的范围 */
    _getPagerRange(): number[] {
        const pageCount = this.getPageCount();
        const pageBufferSize = this.showLessItems ? 1 : 2;

        let left = 1;
        let right = pageCount;
        if (pageCount > 5 + pageBufferSize * 2) {
            left = Math.max(1, this.current - pageBufferSize);
            right = Math.min(this.current + pageBufferSize, pageCount);
            if (this.current - 1 <= pageBufferSize) {
                right = 1 + pageBufferSize * 2;
            }
            if (pageCount - this.current <= pageBufferSize) {
                left = pageCount - pageBufferSize * 2;
            }
        }

        const range: number[] = [];
        for (; left <= right; left++) {
            range.push(left);
        }
        return range;
    }

    getTotalText(): string {
        if (this.total === 0) {
            return this.locale.emptyText;
        }

        let start = (this.current - 1) * this.pageSize + 1;
        const end = Math.min(this.current * this.pageSize, this.total);
        start = Math.min(start, end);
        return `显示${start}-${end}，共${this.total}条数据`;
    }

    /**
     * 每页数选择器中的下拉选项格式，默认形如：`10条/页`
     * @param n 每页条数
     */
    getOptionText(n: number): string {
        return StringUtils.format(this.pageSizeOptionFormat, {
            pageSize: n,
            perPage: this.locale.items_per_page
        });
    }

    getPaginationClass(): any {
        return {
            [`${this.prefixCls}`]: 1,
            [`${this.prefixCls}-simple`]: this.simple,
            [`mini`]: this.size === 'small'
        };
    }

    handleInputNum(event: KeyboardEvent): void {
        const keyCode: number = event.keyCode;
        if (!KeyCode.isNumberKey(keyCode) &&
            !EDIT_KEYS.includes(keyCode)
        ) {
            event.preventDefault();
        }
    }

    handleGoTO(event: Event): void {
        if (event.type === 'click' ||
            (event instanceof KeyboardEvent && event.keyCode === KeyCode.ENTER)) {
            this.handleChange(this._current);
        }
    }

}
