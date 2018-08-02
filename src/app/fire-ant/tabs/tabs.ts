/**
 * @license
 * Copyright 厦门乾元盛世科技有限公司 All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file.
 */

import {
    Component, Input, Output, EventEmitter, ElementRef, ViewEncapsulation,
    OnInit, AfterViewInit, AfterContentInit, ViewChild, ContentChild, ContentChildren, QueryList, TemplateRef
} from '@angular/core';

import { UpdateClassService } from '../core/service/update.class.service';
import { isPresent, toBoolean, toNumber } from '../util/lang';

import { transitionLeave } from '../core/animation/transition';
import { DomUtils } from '../util/dom.utils';
import { onNextFrame } from '../util/anim.frame';
import { KeyCode } from '../util/key.code';
import { TabPane } from './tab.pane';


export type TabsType = 'line' | 'card';
export type TabsPosition = 'top' | 'right' | 'bottom' | 'left';

@Component({
    selector: 'ant-tabs',
    templateUrl: './tabs.html',
    styleUrls: ['./style/index.scss'],
    preserveWhitespaces: false,
    encapsulation: ViewEncapsulation.None,
    providers: [ UpdateClassService ],
    exportAs: 'tabs'
})
export class Tabs implements OnInit, AfterContentInit, AfterViewInit {

    /** 样式前缀 */
    @Input()
    get prefixCls(): string {
        return this._prefixCls;
    }
    set prefixCls(prefixCls: string) {
        if (this._prefixCls !== prefixCls) {
            this._prefixCls = prefixCls;
            this.updateClassMap();
            this.updateBarClass();
        }
    }
    private _prefixCls = 'ant-tabs';


    /** 页签的基本样式，可选 `line`、`card` 类型 */
    @Input()
    get type(): TabsType {
        return this._type;
    }
    set type(type: TabsType) {
        if (this._type !== type) {
            this._type = type;
            this.updateClassMap();
        }
    }
    private _type: TabsType = 'line';


    /** 页签位置，可选值有 `top` `right` `bottom` `left`。默认为`top`。 */
    @Input()
    get tabPosition(): TabsPosition {
        return this._tabPosition;
    }
    set tabPosition(tabPosition: TabsPosition) {
        if (this._tabPosition !== tabPosition) {
            this._tabPosition = tabPosition;
            this.updateClassMap();
            this.updateContentStyle();
        }
    }
    private _tabPosition: TabsPosition = 'top';


    /** 大小，提供 `default` 和 `small` 两种大小，仅当 `type="line"` 时生效。 */
    @Input()
    get size(): 'default' | 'small' {
        return this._size;
    }
    set size(size: 'default' | 'small') {
        if (this._size !== size) {
            this._size = size;
            this.updateClassMap();
        }
    }
    private _size: 'default' | 'small' = 'default';


    /** 标签色 */
    @Input()
    get color(): string {
        return this._color;
    }
    set color(color: string) {
        if (this._color !== color) {
            this._color = color;
            // this.updateClassMap();
        }
    }
    private _color: string;


    /** 用户CSS样式 */
    @Input()
    get barCls(): string {
        return this._barCls;
    }
    set barCls(barCls: string) {
        if (this._barCls !== barCls) {
            this._barCls = barCls;
            this.updateBarClass();
        }
    }
    private _barCls: string;


    /** 当前激活 tab 面板的 key */
    @Input()
    get activeKey(): string {
        return this._activeKey;
    }
    set activeKey(activeKey: string) {
        if (this._activeKey !== activeKey) {
            this.setActiveKey(activeKey);
        }
    }
    private _activeKey: string;


    /** 是否使用动画切换 Tabs，在 `tabPosition=top|bottom` 时有效 */
    @Input()
    get animated(): boolean | { inkBar: boolean; tabPane: boolean; } {
        return this._animated;
    }
    set animated(animated: boolean | { inkBar: boolean; tabPane: boolean; }) {
        this._animated = animated;
        this.updateClassMap();
        this.updateContentClass();
    }
    private _animated: boolean | { inkBar: boolean; tabPane: boolean; } = true;


    @Input()
    get scrollAnimated(): boolean {
        return this._scrollAnimated;
    }
    set scrollAnimated(scrollAnimated: boolean) {
        const value = toBoolean(scrollAnimated);
        if (this._scrollAnimated !== value) {
            this._scrollAnimated = value;
            this.updateNavClass();
        }
    }
    private _scrollAnimated = true;



    @Input() animatedWithMargin = true;

    @Input() inkBarAnimated = true;

    /** TabBar的用户样式 */
    @Input() tabBarStyle: any;

    /** 是否隐藏“加号图标”(新增Tab按钮)，在 `type="card"` 时有效，默认为false */
    @Input() showAddButton = false;


    // per page show how many tabs
    @Input()
    get pageSize(): number {
        return this._pageSize;
    }
    set pageSize(pageSize: number) {
        if (isPresent(pageSize)) {
            const value = toNumber(pageSize, null);
            if (this._pageSize !== value) {
                this._pageSize = value;
                this.updateTabStyle();
            }
        }
    }
    private _pageSize = 5;


    // swipe speed, 1 to 10, more bigger more faster
    @Input() speed = 7;


    /** 点击tab事件 */
    @Output() tabClick = new EventEmitter<{ event: Event, tabPane: TabPane }>();

    /** 变换tab事件，折射参数为 activeKey: string */
    @Output() tabChange = new EventEmitter<string>();

    /** 新增tab事件 */
    @Output() add = new EventEmitter<Event>();

    /** 删除tab事件 */
    @Output() delete = new EventEmitter<TabPane>();

    /** 删除tab前的事件，可以通过event.preventDefault()来禁止删除 */
    @Output() beforeDelete = new EventEmitter<{ tab: TabPane, event: Event }>();


    /** 初始化的标签列表 */
    @ContentChildren(TabPane) tabPanes: QueryList<TabPane>;

    /** 标签栏的附加部分 */
    @ContentChild('nzTabBarSuffix') nzTabBarSuffix: TemplateRef<any>;



    @ViewChild('swipe') swipeEl: ElementRef;
    @ViewChild('nav') navNode: ElementRef;
    @ViewChild('navWrap') navWrap: ElementRef;


    private cache: any = {};

    private hasPrevPage = false;
    private hasNextPage = false;
    public showPrevButton = false;
    public showNextButton = false;
    private offset = 0;
    private isViewInited = false;


    // 内部样式
    public barClasses: any;
    public navClasses: any;
    public navContainerClasses: any;
    public navNextButtonClasses: any;
    public navPrevButtonClasses: any;
    public contentClasses: any;
    public navStyles: any;
    public tabStyles: any;
    public contentStyles: any;

    constructor(
        protected el: ElementRef,
        protected updateClassService: UpdateClassService) {

    }

    /** The underlying host native element */
    getHostElement(): HTMLElement {
        return this.el.nativeElement as HTMLElement;
    }

    ngOnInit(): void {
        if (this.type.indexOf('card') >= 0 && this.size === 'small') {
            console.error('Tabs[type=card] doesn\'t have small size, it\'s by designed.');
        }

        // 更新样式
        this.updateClassMap();
        this.updateBarClass();
        this.updateNavClass();
        this.updateNavContainerClass();
        this.updateNavButtonClass();
        this.updateContentClass();
        this.updateNavStyle();
        this.updateTabStyle();
        this.updateContentStyle();
    }

    ngAfterContentInit(): void {
        if (!this.activeKey && this.tabPanes.length) {
            this._activeKey = this.getTabPaneByIndex(0).key; // 默认选中第一个
        }
        onNextFrame(() => {
            this.updateTabPaneState();
        });
    }

    ngAfterViewInit(): void {
        this.isViewInited = true;

        const sizeProp = this.isVertical() ? 'offsetHeight' : 'offsetWidth';
        const _viewSize: number = this.getHostElement()[sizeProp];
        const _tabWidth = _viewSize / this.pageSize;
        this.cache = {
            totalAvaliableDelta: _tabWidth * this.tabPanes.length - _viewSize,
            tabWidth: _tabWidth,
        };

        // 选中的Tab居中显示
        this.setSwipePositionByKey(this.activeKey);

        onNextFrame(() => {
            // 设置向前/向后翻页按钮是否可见
            this.setNextPrev();
        });
    }

    isVertical(): boolean {
        return this.tabPosition === 'left' || this.tabPosition === 'right';
    }

    isAddButtonVisible(): boolean {
        return this.type === 'card' && this.showAddButton;
    }

    getTransitionName(): string {
        return `${this.prefixCls}-zoom`;
    }


    protected updateClassMap(): void {
        const classes = {
            [`${this.prefixCls}`]: true,
            [`${this.prefixCls}-${this.type}`]: true,
            [`${this.prefixCls}-${this.tabPosition}`]: 1,
            [`${this.prefixCls}-mini`]: this.size === 'small' || this.size as string === 'mini',
            [`${this.prefixCls}-vertical`]: this.tabPosition === 'left' || this.tabPosition === 'right',
            [`${this.prefixCls}-card`]: this.type.indexOf('card') >= 0,
            [`${this.prefixCls}-no-animation`]: !this.animated
        };
        this.updateClassService.update(this.el.nativeElement, classes);
    }

    private updateBarClass(): void {
        this.barClasses = {
            [`${this.prefixCls}-bar`]: 1,
            [`${this.barCls}`]: this.barCls
        };
    }

    private updateNavContainerClass(): void {
        this.navContainerClasses = {
            [`${this.prefixCls}-nav-container`]: 1,
            [`${this.prefixCls}-nav-container-scrolling`]: this.isNavButtonVisible(),
            // page classname can be used to render special style when there has a prev/next page
            [`${this.prefixCls}-prevpage`]: this.hasPrevPage,
            [`${this.prefixCls}-nextpage`]: this.hasNextPage
        };
    }

    private updateNavClass(): void {
        this.navClasses = {
            [`${this.prefixCls}-nav`]: 1,
            [`${this.prefixCls}-nav-animated`]: this.scrollAnimated,
            [`${this.prefixCls}-nav-no-animated`]: !this.scrollAnimated,
        };
    }

    private updateNavButtonClass(): void {
        this.navNextButtonClasses = {
            [`${this.prefixCls}-tab-next`]: 1,
            [`${this.prefixCls}-tab-btn-disabled`]: !this.showNextButton
        };
        this.navPrevButtonClasses = {
            [`${this.prefixCls}-tab-prev`]: 1,
            [`${this.prefixCls}-tab-btn-disabled`]: !this.showPrevButton
        };
    }

    private updateContentClass(): void {
        this.contentClasses = {
            [`${this.prefixCls}-content`]: true,
            [`${this.prefixCls}-content-animated`]: this.animated,
            [`${this.prefixCls}-content-no-animated`]: !this.animated,
        };
    }

    private updateNavStyle(): void {
        const value = this.offset;
        const transformSupported = DomUtils.isTransformSupported();
        if (this.isVertical()) {
            if (transformSupported) {
                this.navStyles = DomUtils.getTransform(`translate3d(0,${value}px,0)`);
            } else {
                this.navStyles = { 'top': `${value}px` };
            }
        } else {
            if (transformSupported) {
                this.navStyles = DomUtils.getTransform(`translate3d(${value}px,0,0)`);
            } else {
                this.navStyles = { 'left': `${value}px` };
            }
        }
    }

    private updateTabStyle(): void {
        const _flexWidth = `${1 / this.pageSize * 100}%`;
        this.tabStyles = {
            WebkitFlexBasis: _flexWidth,
            flexBasis: _flexWidth,
        };
    }

    private updateContentStyle(): void {
        const activeIndex = this.getActiveIndex();
        if (this.animatedWithMargin) {
            const marginDirection = this.isVertical() ? 'marginTop' : 'marginLeft';
            this.contentStyles = {
                [marginDirection]: `${-activeIndex * 100}%`,
            };
        } else {
            const translate = this.isVertical() ? 'translateY' : 'translateX';
            const transform = `${translate}(${-activeIndex * 100}%) translateZ(0)`;
            this.contentStyles = DomUtils.getTransform(transform);
        }
    }


    /** 向前/向后的翻页的按钮是否显示 */
    isNavButtonVisible(): boolean {
        return this.showPrevButton || this.showNextButton;
    }


    /**
     * 新增Tab （这里只是发射一个新增事件，并没有真正添加一个Tab）
     * @param event 点击事件
     */
    addNewTab(event: Event): void {
        this.add.emit(event);
    }

    /**
     * 删除Tab
     *
     * @param tabPane 被删除的TabPane
     * @param event 点击事件
     */
    removeTab(tabPane: TabPane, event: Event): void {
        event.stopPropagation();
        this.beforeDelete.emit({
            tab: tabPane,
            event: event
        });
        if (event.defaultPrevented) {
            return; // 删除被阻止
        }

        // 若被删除的是当前已激活的TabPane，则删除后将激活前一个TabPane
        let nextActiveIndex = 0;
        if (tabPane.key === this.activeKey) {
            nextActiveIndex = Math.max(this.getActiveIndex() - 1, 0);
        }

        // 执行动画
        const dom = this.getTab(tabPane.key);
        transitionLeave(dom, this.getTransitionName(), () => {
            // 删除对象
            const tabPanes: TabPane[] = this.tabPanes.filter(pane => {
                return pane.key !== tabPane.key;
            });
            this.tabPanes.reset(tabPanes);
            tabPane.getHostElement().remove(); // 彻底删除dom
            this.delete.emit(tabPane);

            // 激活临近的一个TabPane
            const nextActive = this.getTabPaneByIndex(nextActiveIndex);
            if (nextActive) {
                this.setActiveKey(nextActive.key);
            }
        });
    }


    onTabClick(event: Event, tabPane: TabPane): void {
        event.preventDefault();
        if (tabPane.isDisabled()) {
            return;
        }

        this.tabClick.emit({ event, tabPane });
        this.setActiveKey(tabPane.key);
    }


    checkPaginationByKey(activeKey: string): any {
        const index = this.getIndexByKey(activeKey);
        const centerTabCount = Math.floor(this.pageSize / 2);
        // the basic rule is to make activeTab be shown in the center of TabBar viewport
        return {
            hasPrevPage: index - centerTabCount > 0,
            hasNextPage: index + centerTabCount < this.tabPanes.length,
        };
    }

    setSwipePositionByKey(activeKey): void {
        const { hasPrevPage, hasNextPage } = this.checkPaginationByKey(activeKey);
        const { totalAvaliableDelta } = this.cache;

        this.hasPrevPage = hasPrevPage;
        this.hasNextPage = hasNextPage;
        this.updateNavContainerClass();

        let delta;
        if (!hasPrevPage) {
            // the first page
            delta = 0;
        } else if (!hasNextPage) {
            // the last page
            delta = -totalAvaliableDelta;
        } else if (hasNextPage) {
            // the middle page
            delta = this.getDeltaByKey(activeKey);
        }
        this.cache.totalDelta = delta;
        this.setSwipePosition();
    }

    /**
     * used for props.activeKey setting, not for swipe callback
     */
    getDeltaByKey(activeKey): number {
        const pageSize = this.pageSize;
        const index = this.getIndexByKey(activeKey);
        const centerTabCount = Math.floor(pageSize / 2);
        const tabWidth: number = this.cache.tabWidth;
        return (index - centerTabCount) * tabWidth * -1;
    }

    checkPaginationByDelta(delta): any {
        const { totalAvaliableDelta } = this.cache;
        return {
            hasPrevPage: delta < 0,
            hasNextPage: -delta < totalAvaliableDelta,
        };
    }

    setSwipePosition(): void {
        const value = this.cache.totalDelta;
        const isVertical = this.isVertical();

        const tansform = isVertical ? `0px, ${value}px, 0px` : `${value}px, 0px, 0px`;
        DomUtils.setTransform(this.swipeEl.nativeElement.style, `translate3d(${tansform})`);
    }


    /** 点击【向前】按钮 */
    onPrevClick(event: Event): void {
        event.preventDefault();

        const navWrapNode = this.navWrap.nativeElement as HTMLElement;
        const navWrapNodeWH = this.getOffsetWH(navWrapNode);
        this.setOffset(this.offset + navWrapNodeWH);
    }

    /** 点击【向后】按钮 */
    onNextClick(event: Event): void {
        event.preventDefault();

        const navWrapNode = this.navWrap.nativeElement as HTMLElement;
        const navWrapNodeWH = this.getOffsetWH(navWrapNode);
        this.setOffset(this.offset - navWrapNodeWH);
    }

    /** 通过键盘方向键导航 */
    onKeyDown(event: KeyboardEvent): void {
        const keyCode = event.keyCode;
        const goPrev = keyCode === KeyCode.LEFT || keyCode === KeyCode.UP;
        const goNext = keyCode === KeyCode.RIGHT || keyCode === KeyCode.DOWN;
        if (goPrev || goNext) {
            event.preventDefault();
            const index = this.getActiveIndex();
            const len = this.tabPanes.length;
            const nextIndex = goNext ? Math.min(index + 1, len - 1) : Math.max(index - 1, 0);
            const tabPane = this.getTabPaneByIndex(nextIndex);
            this.setActiveKey(tabPane.key);
        }
    }


    setNextPrev(): void {
        const navNode = this.navNode.nativeElement as HTMLElement;
        const navNodeWH = this.getOffsetWH(navNode);
        const navWrapNode = this.navWrap.nativeElement as HTMLElement;
        const navWrapNodeWH = this.getOffsetWH(navWrapNode);

        let offset = this.offset;
        let showPrevButton = this.showPrevButton;
        let showNextButton = this.showNextButton;

        const minOffset = navWrapNodeWH - navNodeWH;
        if (minOffset >= 0) {
            showNextButton = false;
            this.setOffset(0, false);
            offset = 0;
        } else if (minOffset < offset) {
            showNextButton = true;
        } else {
            showNextButton = false;
            this.setOffset(minOffset, false);
            offset = minOffset;
        }

        if (offset < 0) {
            showPrevButton = true;
        } else {
            showPrevButton = false;
        }

        this.showPrevButton = showPrevButton;
        this.showNextButton = showNextButton;
        this.updateNavButtonClass();
        this.updateNavContainerClass();
    }


    getOffsetWH(node: HTMLElement): number {
        return this.isVertical() ? node.offsetHeight : node.offsetWidth;
    }

    getOffsetLT(node: HTMLElement): number {
        const rect = node.getBoundingClientRect();
        return this.isVertical() ? rect.top : rect.left;
    }

    setOffset(offset: number, checkNextPrev = true): void {
        const newOffset = Math.min(0, offset);
        if (this.offset !== newOffset) {
            this.offset = newOffset;
            this.updateNavStyle();

            if (checkNextPrev) {
                this.setNextPrev();
            }
        }
    }

    /** 滚动到已激活的标签（例如有的标签在不可视区域） */
    scrollToActiveTab(): void {
        const activeTab: HTMLElement = this.getActiveTab();
        const navWrapNode = this.navWrap.nativeElement as HTMLElement;

        if (activeTab) {
            const activeTabWH = this.getOffsetWH(activeTab);
            const navWrapNodeWH = this.getOffsetWH(navWrapNode);
            const wrapOffset = this.getOffsetLT(navWrapNode);
            const activeTabOffset = this.getOffsetLT(activeTab);

            let offset = this.offset;
            if (wrapOffset > activeTabOffset) {
                offset += (wrapOffset - activeTabOffset);
                this.setOffset(offset);
            } else if ((wrapOffset + navWrapNodeWH) < (activeTabOffset + activeTabWH)) {
                offset -= (activeTabOffset + activeTabWH) - (wrapOffset + navWrapNodeWH);
                this.setOffset(offset);
            }
        }
    }

    getTabPaneByKey(key: string): TabPane {
        return this.tabPanes.find((item: TabPane) => {
            return item.key === key;
        });
    }

    getTabPaneByIndex(index: number): TabPane {
        return this.tabPanes.find((item: TabPane, i: number) => index === i);
    }

    /** 获取当前已激活的TabPane */
    getActiveTabPane(): TabPane {
        const index = this.getActiveIndex();
        return this.tabPanes[index];
    }

    /** 获取当前已激活的TabPane的标题Element */
    getActiveTab(): HTMLElement {
        return this.getTab(this.activeKey);
    }

    /** 根据key获取TabPane的标题Element */
    getTab(key: string): HTMLElement {
        const el = this.getHostElement();
        return el.querySelector(`[data-tabkey="${key}"]`) as HTMLElement;
    }

    updateTabPaneState(): void {
        if (this.tabPanes && this.tabPanes.length) {
            this.tabPanes.forEach(t => t.active = t.key === this.activeKey);
        }
    }

    setActiveKey(activeKey: string): void {
        if (this._activeKey !== activeKey) {
            this._activeKey = activeKey;
            this.tabChange.emit(activeKey);
            this.updateContentStyle();
            this.updateTabPaneState();

            if (this.isViewInited) {
                onNextFrame(() => {
                    this.scrollToActiveTab(); // 调整位置
                });
            }
        }
    }

    getActiveIndex(): number {
        return this.getIndexByKey(this.activeKey);
    }

    getIndexByKey(key: string): number {
        if (this.tabPanes && this.tabPanes.length) {
            return this.tabPanes.toArray().findIndex(t => t.key === key);
        }
        return 0;
    }

}

