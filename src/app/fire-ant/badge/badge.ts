/**
 * @license
 * Copyright 厦门乾元盛世科技有限公司 All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file.
 */

import { Component, Input, ElementRef, Renderer2, ViewEncapsulation, HostBinding, OnInit, AfterViewInit } from '@angular/core';

import { UpdateClassService } from '../core/service/update.class.service';
import { isPresent, toBoolean, toNumber } from '../util/lang';

type StatusType = 'success' | 'processing' | 'default' | 'error' | 'warning';

/**
 * 徽标数
 */
@Component({
    selector: 'ant-badge',
    templateUrl: './badge.html',
    styleUrls: ['./style/index.scss', './style/patch.scss'],
    preserveWhitespaces: false,
    encapsulation: ViewEncapsulation.None,
    providers: [ UpdateClassService ]
})
export class Badge implements OnInit, AfterViewInit {

    /** Offset: [marginTop, marginLeft] */
    @Input() offset?: [number | string, number | string];

    /** 样式前缀 */
    @Input()
    get prefixCls(): string {
        return this._prefixCls;
    }
    set prefixCls(prefixCls: string) {
        if (this._prefixCls !== prefixCls) {
            this._prefixCls = prefixCls;
            this.updateClassMap();
            this.updateStatusClass();
            this.updateStatusTextClass();
            this.updateScrollNumberCls();
            if (this.isViewInit) {
                this.updateWrapperClass();
            }
        }
    }
    private _prefixCls = 'ant-badge';


    /** 展示的数字，大于 overflowCount 时显示为 `${overflowCount}+`，为 0 时隐藏。 Number to show in badge */
    @Input()
    get count(): number {
        return this._count;
    }
    set count(count: number) {
        if (isPresent(count)) {
            const value = toNumber(count, null);
            if (this._count !== value) {
                this._count = value;
                this.updateCountText();
                this.updateCountTextVisible();
            }
        }
    }
    private _count: number;


    /** 当数值为 0 时，是否展示 Badge */
    @Input()
    get showZero(): boolean {
        return this._showZero;
    }
    set showZero(showZero: boolean) {
        const value = toBoolean(showZero);
        if (this._showZero !== value) {
            this._showZero = value;
            this.updateCountTextVisible();
        }
    }
    private _showZero = false;


    /** 展示封顶的数字值。Max count to show */
    @Input()
    get overflowCount(): number {
        return this._overflowCount;
    }
    set overflowCount(overflowCount: number) {
        if (isPresent(overflowCount)) {
            const value = toNumber(overflowCount, null);
            if (this._overflowCount !== value) {
                this._overflowCount = value;
                this.updateCountText();
            }
        }
    }
    private _overflowCount = 99;


    /** 不展示数字，只有一个小红点。 whether to show red dot without number */
    @Input()
    get dot(): boolean {
        return this._dot;
    }
    set dot(dot: boolean) {
        const value = toBoolean(dot);
        if (this._dot !== value) {
            this._dot = value;
            this.updateCountText();
            this.updateCountTextVisible();
            this.updateScrollNumberCls();
        }
    }
    private _dot = false;


    /** 设置 Badge 为状态点 */
    @Input()
    get status(): StatusType {
        return this._status;
    }
    set status(status: StatusType) {
        if (this._status !== status) {
            this._status = status;
            this.updateClassMap();
            this.updateStatusClass();
            this.updateScrollNumberCls();
        }
    }
    private _status: StatusType;


    /**
     * 颜色，取值：default、primary、warn等。默认为default。<br>
     * 自定义的颜色名称与色值，可以定义在 工程根目录/src/theme/variables.scss 文件中的 $colors 对象。
     */
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
    private _color = 'default';


    /**  在设置了 `status` 的前提下有效，设置状态点的文本 */
    @Input() text: string;

    /** 内部徽标样式 */
    @Input() badgeStyle: any;


    /** 徽标（数字） */
    public countText: string;
    public isCountTextVisible = false;

    // 内部样式
    public statusClass: {[key: string]: any};
    public statusTextClass: string;
    public scrollNumberCls: {[key: string]: any};

    private isViewInit = false;

    constructor(
        private renderer: Renderer2,
        private el: ElementRef,
        private updateClassService: UpdateClassService) {

    }

    ngOnInit(): void {
        this.updateCountText();
        this.updateClassMap();
        this.updateStatusClass();
        this.updateStatusTextClass();
        this.updateScrollNumberCls();
        this.updateCountTextVisible();
    }

    ngAfterViewInit(): void {
        this.isViewInit = true;
        this.updateWrapperClass();
    }

    @HostBinding('style.marginTop')
    get marginTop(): string {
        const margin = this.offset && this.offset[0];
        return typeof margin === 'number' ? `${margin}px` : margin;
    }

    @HostBinding('style.marginLeft')
    get marginLeft(): string {
        const margin = this.offset && this.offset[1];
        return typeof margin === 'number' ? `${margin}px` : margin;
    }

    private updateClassMap(): void {
        const classes = {
            [`${this.prefixCls}`]: true,
            [`${this.prefixCls}-status`]: !!this.status,
            [`${this.prefixCls}-color-${this.color}`]: this.color
        };
        this.updateClassService.update(this.el.nativeElement, classes);
    }

    private updateStatusClass(): void {
        this.statusClass = {
            [`${this.prefixCls}-status-dot`]: !!this.status,
            [`${this.prefixCls}-status-${this.status}`]: true,
        };
    }

    private updateStatusTextClass(): void {
        this.statusTextClass = `${this.prefixCls}-status-text`;
    }

    private updateScrollNumberCls(): void {
        const isDot = this.dot || !!this.status;
        this.scrollNumberCls = {
            [`${this.prefixCls}-dot`]: isDot,
            [`${this.prefixCls}-count`]: !isDot,
            [`${this.prefixCls}-multiple-words`]: !isDot && this.count && this.count.toString().length > 1,
            [`${this.prefixCls}-status`]: !!this.status
        };
    }

    private updateWrapperClass(): void {
        const el = this.el.nativeElement as HTMLElement;
        if (el) {
            const childCount = el.childElementCount - el.querySelectorAll('scroll-number').length;
            if (childCount <= 0) {
                this.renderer.addClass(el, `${this.prefixCls}-not-a-wrapper`);
            } else {
                this.renderer.removeClass(el, `${this.prefixCls}-not-a-wrapper`);
            }
        }
    }

    private updateCountText(): void {
        const isDot = this.dot;
        this.countText = !isDot && this.isOverflowCount() ? `${this.overflowCount}+` : null;
    }


    isOverflowCount(): boolean {
        return this.count > this.overflowCount;
    }

    _isCountTextVisible(): boolean {
        const isDot = this.dot;
        if (isDot) {
            return true;
        }
        if (isPresent(this.count)) {
            return (this.count > 0) || (this.count === 0 && this.showZero);
        }
        return false;
    }

    private updateCountTextVisible(): void {
        this.isCountTextVisible = this._isCountTextVisible();
    }

}
