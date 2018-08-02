/**
 * @license
 * Copyright 厦门乾元盛世科技有限公司 All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file.
 */


// matchMedia polyfill for
// https://github.com/WickyNilliams/enquire.js/issues/82
if (typeof window !== 'undefined') {
    const matchMediaPolyfill = function (mediaQuery: string): MediaQueryList {
        return {
            media: mediaQuery,
            matches: false,
            addListener() {
            },
            removeListener() {
            },
        };
    };
    window.matchMedia = window.matchMedia || matchMediaPolyfill;
}


const dimensionMap = {
    xs: '480px',
    sm: '768px',
    md: '992px',
    lg: '1200px',
    xl: '1600px',
};

import { Component, Input, Output, ElementRef, EventEmitter, OnInit, OnDestroy, ViewEncapsulation, Optional, Host } from '@angular/core';
import { UpdateClassService } from '../core/service/update.class.service';
import { toBoolean } from '../util/lang';
import { Layout } from './layout';

export type TriggerType = 'clickTrigger' | 'responsive';

/**
 * Sider
 */
@Component({
    selector: 'ant-layout-sider',
    template: `
        <ng-content></ng-content>
        <div *ngIf="collapsible || (below && collapsedWidth == 0)">
            <div (click)="toggle()" [class]="prefixCls + '-zero-width-trigger'" *ngIf="!collapsedWidth">
                <ant-icon type="bars"></ant-icon>
            </div>
            <div (click)="toggle()" [class]="prefixCls + '-trigger'" *ngIf="collapsedWidth">
                <ant-icon [type]="reverseArrow ? 'left' : 'right' " *ngIf="collapsed"></ant-icon>
                <ant-icon [type]="reverseArrow ? 'right' : 'left' " *ngIf="!collapsed"></ant-icon>
            </div>
        </div>
    `,
    preserveWhitespaces: false,
    encapsulation: ViewEncapsulation.None,
    providers: [ UpdateClassService ]
})
export class Sider implements OnInit, OnDestroy {

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
    private _prefixCls = 'ant-layout-sider';


    @Input()
    get collapsible(): boolean {
        return this._collapsible;
    }
    set collapsible(collapsible: boolean) {
        const value = toBoolean(collapsible);
        if (this._collapsible !== value) {
            this._collapsible = value;
        }
    }
    private _collapsible = false;


    @Input()
    get collapsed(): boolean {
        return this._collapsed;
    }
    set collapsed(collapsed: boolean) {
        const value = toBoolean(collapsed);
        if (this._collapsed !== value) {
            this._collapsed = value;
            this.updateClassMap();
            this.updateHostStyles();
        }
    }
    private _collapsed = false;


    @Input()
    get reverseArrow(): boolean {
        return this._reverseArrow;
    }
    set reverseArrow(reverseArrow: boolean) {
        const value = toBoolean(reverseArrow);
        if (this._reverseArrow !== value) {
            this._reverseArrow = value;
            this.updateClassMap();
        }
    }
    private _reverseArrow = false;


    @Input()
    get width(): number | string {
        return this._width;
    }
    set width(width: number | string) {
        this._width = width;
        this.updateClassMap();
        this.updateHostStyles();
    }
    private _width: number | string = 200;


    @Input()
    get collapsedWidth(): number | string {
        return this._collapsedWidth;
    }
    set collapsedWidth(collapsedWidth: number | string) {
        this._collapsedWidth = collapsedWidth;
        this.updateClassMap();
        this.updateHostStyles();
    }
    private _collapsedWidth: number | string = 64;


    @Input()
    get trigger(): any {
        return this._trigger;
    }
    set trigger(trigger: any) {
        if (this._trigger !== trigger) {
            this._trigger = trigger;
            this.updateClassMap();
        }
    }
    private _trigger: any;


    @Input() breakpoint: 'xs' | 'sm' | 'md' | 'lg' | 'xl';


    /**
     * collapse事件
     */
    @Output() collapse = new EventEmitter<{ collapsed: boolean, type: TriggerType }>();


    public below = false;

    private mql: any;

    private _responsiveHandler: any;

    // 内部样式
    public hostStyles: any;

    constructor(
        public el: ElementRef,
        protected updateClassService: UpdateClassService,
        @Optional() @Host() layout: Layout) {
        if (layout) {
            layout.hasSilder = true;
        }
    }

    /** The underlying host native element */
    getHostElement(): HTMLElement {
        return this.el.nativeElement as HTMLElement;
    }

    ngOnInit(): void {
        let matchMedia;
        if (typeof window !== 'undefined') {
            matchMedia = window.matchMedia;
        }
        if (matchMedia && this.breakpoint && (this.breakpoint in dimensionMap)) {
            this.mql = matchMedia(`(max-width: ${dimensionMap[this.breakpoint]})`);
        }
        if (this.mql) {
            this._responsiveHandler = this.responsiveHandler.bind(this);
            this.mql.addListener(this._responsiveHandler);
            this.responsiveHandler(this.mql);
        }

        // 更新样式
        this.updateClassMap();
        this.updateHostStyles();
    }

    ngOnDestroy(): void {
        if (this.mql) {
            this.mql.removeListener(this._responsiveHandler);
            this.mql = null;
        }
        this._responsiveHandler = null;
    }

    protected updateClassMap(): void {
        const siderWidth = this.collapsed ? this.collapsedWidth : this.width;
        const classes = {
            [`${this.prefixCls}`]: true,
            [`${this.prefixCls}-collapsed`]: this.collapsed,
            [`${this.prefixCls}-has-trigger`]: !!this.trigger,
            [`${this.prefixCls}-below`]: this.below,
            [`${this.prefixCls}-zero-width`]: siderWidth === 0
        };
        this.updateClassService.update(this.el.nativeElement, classes);
    }

    private updateHostStyles(): void {
        const el = this.el.nativeElement as HTMLElement;
        const siderWidth = this.collapsed ? this.getCollapsedWidth() : this.getWidth();
        el.style.flex = `0 0 ${siderWidth}`;
        el.style.width = `${siderWidth}`;
    }

    getWidth(): string {
        return (typeof this.width === 'number') ? `${this.width}px` : this.width;
    }

    getCollapsedWidth(): string {
        return (typeof this.collapsedWidth === 'number') ? `${this.collapsedWidth}px` : this.collapsedWidth;
    }


    responsiveHandler(mql: any): void {
        this.below = mql.matches;
        if (this.collapsed !== mql.matches) {
            this.setCollapsed(mql.matches, 'responsive');
        }
    }

    setCollapsed(collapsed: boolean, type: TriggerType): void {
        this.collapsed = collapsed;
        this.updateHostStyles();
        this.collapse.emit({ collapsed, type });
    }

    toggle(): void {
        const collapsed = !this.collapsed;
        this.setCollapsed(collapsed, 'clickTrigger');
    }

}
