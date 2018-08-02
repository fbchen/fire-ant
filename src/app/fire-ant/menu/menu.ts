/**
 * @license
 * Copyright 厦门乾元盛世科技有限公司 All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file.
 */

import {
    Component, Input, Output, EventEmitter, ElementRef, ViewEncapsulation, QueryList,
    OnInit, AfterContentInit, HostBinding, HostListener, ContentChildren, forwardRef
} from '@angular/core';
import { UpdateClassService } from '../core/service/update.class.service';
import { toBoolean } from '../util/lang';

import { KeyCode } from '../util/key.code';
import * as scrollIntoView from 'dom-scroll-into-view';

import { MenuItem } from './menu.item';
import { SubMenu } from './submenu';


export interface SelectParam {
    key: string;
    // keyPath: string[];
    item: MenuItem | SubMenu;
    domEvent: Event;
    selectedKeys?: string[];
}

export interface ClickParam {
    key: string;
    // keyPath: string[];
    item: MenuItem | SubMenu;
    domEvent: Event;
}

export interface OpenParam {
    key: string;
    item: MenuItem | SubMenu;
    trigger?: string;
    open?: boolean;
    originalEvent?: Event;
}

export interface HoverParam {
    key: string;
    item: MenuItem | SubMenu;
    hover?: boolean;
    domEvent: Event;
    trigger: string;
    openChanges?: OpenParam[];
}

export interface OpenChangeParam {
    openKeys: string[];
    menu: Menu;
}


function allDisabled(arr: Array<any>) {
    if (!arr.length) {
        return true;
    }
    return arr.every(c => !!c.props.disabled);
}


/**
 * Menu导航菜单
 * 参考: https://github.com/react-component/menu
 */
@Component({
    selector: 'ant-menu',
    template: '<ng-content></ng-content>',
    styleUrls: ['./style/index.scss'],
    encapsulation: ViewEncapsulation.None,
    providers: [ UpdateClassService ]
})
export class Menu implements OnInit, AfterContentInit {
    /** 控件计数器 */
    private static guid_counter = 0;

    /** 样式前缀 */
    @Input()
    get prefixCls(): string {
        return this._prefixCls;
    }
    set prefixCls(prefixCls: string) {
        if (this._prefixCls !== prefixCls) {
            this._prefixCls = prefixCls;
            this.updateClassMap();
            this.updateSubMenuPrefixCls();
            this.updateMenuItemPrefixCls();
        }
    }
    private _prefixCls = 'ant-menu';


    /**
     * 菜单类型，现在支持垂直、水平、和内嵌模式三种: `vertical` `horizontal` `inline`。默认为 `vertical`。
     */
    @Input()
    get mode(): 'vertical' | 'horizontal' | 'inline' {
        return this._mode;
    }
    set mode(mode: 'vertical' | 'horizontal' | 'inline') {
        if (this._mode !== mode) {
            this._mode = mode;
            this.updateClassMap();
            this.updateSubMenuMode();
            this.updateMenuItemMode();
        }
    }
    private _mode: 'vertical' | 'horizontal' | 'inline' = 'vertical';


    /** 主题颜色，可选项为`light` `dark`，默认为`light`。 */
    @Input()
    get theme(): string {
        return this._theme;
    }
    set theme(theme: string) {
        if (this._theme !== theme) {
            this._theme = theme;
            this.updateClassMap();
        }
    }
    private _theme = 'light';


    /**
     * 当前选中的菜单项 key 数组
     */
    @Input()
    get selectedKeys(): string[] {
        return this._selectedKeys;
    }
    set selectedKeys(selectedKeys: string[]) {
        this._selectedKeys = selectedKeys || [];
        this.onSelectedKeysChange();
    }
    private _selectedKeys: string[] = [];


    /**
     * 当前展开的 SubMenu 菜单项 key 数组
     */
    @Input()
    get openKeys(): string[] {
        return this._openKeys;
    }
    set openKeys(openKeys: string[]) {
        this._openKeys = openKeys || [];
        this.onOpenKeysChange();
    }
    private _openKeys: string[] = [];


    /**
     * 当前被激活的菜单
     */
    @Input()
    get activeKey(): string {
        return this._activeKey;
    }
    set activeKey(activeKey: string) {
        if (this._activeKey !== activeKey) {
            this._activeKey = activeKey;

            // 设置子菜单的激活状态
            this.allItemList.forEach(item => item.active = activeKey === item.eventKey);
            this.allSubmList.forEach(item => item.active = activeKey === item.eventKey);
        }
    }
    private _activeKey: string;


    @Input()
    public set visible(visible: boolean) {
        const value = toBoolean(visible);
        if (this._visible !== value) {
            this._visible = value;
            this.updateClassMap();
        }
    }
    public get visible(): boolean {
        return this._visible;
    }
    private _visible = true;


    @Input() defaultActiveFirst = true;

    @Input() openSubMenuOnMouseEnter = true;
    @Input() closeSubMenuOnMouseLeave = true;

    @Input() selectable = true;

    @Input() focusable = true;

    /**
     * 是否允许多选，默认为false
     */
    @Input() multiple = false;

    /**
     * 模式的菜单缩进宽度，默认为24px
     */
    @Input() inlineIndent = 24;


    /**
     * SubMenu 展开/关闭的事件，参数为：({openKeys: string[], menu: Menu})
     */
    @Output() openChange = new EventEmitter<OpenChangeParam>();

    /**
     * menuItem 被选中时的事件，参数为：({ item, key, selectedKeys })
     */
    @Output() select = new EventEmitter<SelectParam>();

    /**
     * menuItem 取消选中时的事件，仅在 multiple 生效，参数为：({ item, key, selectedKeys })
     */
    @Output() deselect = new EventEmitter<SelectParam>();

    /**
     * menuItem 被点击时的事件，参数为：({ item, key, keyPath, domEvent })
     */
    @Output() menuClick = new EventEmitter<ClickParam>();

    /**
     * menuItem 事件，参数为：({ item, key })
     */
    @Output() menuEnter = new EventEmitter<HoverParam>();

    /**
     * menuItem 事件，参数为：({ item, key })
     */
    @Output() menuLeave = new EventEmitter<HoverParam>();

    @HostBinding('attr.role') role = 'menu';
    @HostBinding('attr.aria-activedescendant') activedescendant = '';


    /** 子菜单项列表（直属） */
    @ContentChildren(forwardRef(() => MenuItem)) itemList: QueryList<MenuItem>;
    /** 子菜单列表（所有） */
    @ContentChildren(forwardRef(() => SubMenu), { descendants: true }) allSubmList: QueryList<SubMenu>;
    /** 子菜单项列表（所有） */
    @ContentChildren(forwardRef(() => MenuItem), { descendants: true }) allItemList: QueryList<MenuItem>;



    constructor(
        protected el: ElementRef,
        protected updateClassService: UpdateClassService) {

    }

    /**
     * 属性：tabIndex
     */
    @HostBinding('attr.tabIndex') get tabIndex(): number {
        return this.focusable ? 0 : null;
    }

    protected updateClassMap(): void {
        const classes = {
            [`${this.prefixCls}`]: true,
            [`${this.prefixCls}-${this.theme}`]: this.theme,
            [`${this.prefixCls}-${this.mode}`]: this.mode,
            [`${this.prefixCls}-hidden`]: !this.visible,
            [`${this.prefixCls}-root`]: true
        };
        this.updateClassService.update(this.el.nativeElement, classes);
    }

    protected updateMenuItemPrefixCls(): void {
        if (this.allItemList) {
            this.allItemList.forEach(item => {
                item.prefixCls = this.prefixCls;
            });
        }
    }

    protected updateSubMenuPrefixCls(): void {
        if (this.allSubmList) {
            this.allSubmList.forEach(item => {
                item.prefixCls = this.prefixCls;
            });
        }
    }

    protected updateMenuItemMode(): void {
        if (this.itemList) {
            this.itemList.forEach(item => {
                item.mode = this.mode;
            });
        }
    }

    protected updateSubMenuMode(): void {
        if (this.allSubmList) {
            this.allSubmList.forEach(item => {
                item.mode = this.mode;
            });
        }
    }

    // all keyboard events callbacks run from here at first
    @HostListener('keydown', ['$event'])
    onKeyDown(event: KeyboardEvent): void {
        if (!this.focusable) {
            return;
        }

        const keyCode = event.keyCode;

        let activeItem: MenuItem = null;
        if (keyCode === KeyCode.UP || keyCode === KeyCode.DOWN) {
            activeItem = this.step(keyCode === KeyCode.UP ? -1 : 1);
        }
        if (activeItem) {
            event.preventDefault();
            this.activeKey = activeItem.eventKey;
            scrollIntoView(activeItem.getHostElement(), this.getHostElement(), {
                onlyScrollIfNeeded: true,
            });
        } else if (activeItem === undefined) {
            event.preventDefault();
            this.activeKey = null;
        }
    }

    /** The underlying host native element */
    getHostElement(): HTMLElement {
        return this.el.nativeElement as HTMLElement;
    }

    ngOnInit(): void {
        this.updateClassMap();
    }

    ngAfterContentInit(): void {
        this.onOpenKeysChange();
        this.onSelectedKeysChange();

        this.updateMenuItemMode();
        this.updateMenuItemPrefixCls();

        this.updateSubMenuMode();
        this.updateSubMenuPrefixCls();

        this.allItemList.changes.subscribe(() => {
            this.updateMenuItemMode();
            this.updateMenuItemPrefixCls();
        });
        this.allSubmList.changes.subscribe(() => {
            this.updateSubMenuMode();
            this.updateSubMenuPrefixCls();
        });
    }

    /**
     * 当要销毁子菜单/子菜单项时
     *
     * @param key 菜单项的Key
     */
    onDestroy(key: string): void {
        let index = this.selectedKeys.indexOf(key);
        if (index !== -1) {
            this.selectedKeys.splice(index, 1);
        }
        index = this.openKeys.indexOf(key);
        if (index !== -1) {
            this.openKeys.splice(index, 1);
        }
    }

    onClick(info: ClickParam): void {
        // There is `this.openKeys` for closing vertical popup submenu after click it
        if (this.mode !== 'inline') {
            this.openKeys = [];
        }
        this.menuClick.emit(info);
    }

    onMouseEnter(info: HoverParam) {
        this.menuEnter.emit(info);
    }

    onMouseLeave(info: HoverParam) {
        this.menuLeave.emit(info);
    }

    onItemHover(e: HoverParam): void {
        const item: MenuItem | SubMenu = e.item;
        let { openChanges = [] } = e;

        // special for top sub menu
        if (this.mode !== 'inline' && !this.closeSubMenuOnMouseLeave && item.isSubMenu) {
            const activeItem = this.allItemList.filter(c => c.active)[0];
            if (activeItem && activeItem.active) {
                openChanges = openChanges.concat({
                    key: item.eventKey,
                    item: item,
                    originalEvent: e.domEvent,
                    open: true
                });
            }
        }

        openChanges = openChanges.concat(this.getOpenChangesOnItemHover(e));
        if (openChanges.length) {
            this.onOpenChange(openChanges);
        }
    }

    onOpenChange(e_: OpenParam | OpenParam[]): void {
        const openKeys = this.openKeys.concat();
        let changed = false;
        const processSingle = (e: OpenParam) => {
            let oneChanged = false;
            if (e.open) {
                oneChanged = openKeys.indexOf(e.key) === -1;
                if (oneChanged) {
                    openKeys.push(e.key);
                }
            } else {
                const index = openKeys.indexOf(e.key);
                oneChanged = index !== -1;
                if (oneChanged) {
                    openKeys.splice(index, 1);
                }
            }
            changed = changed || oneChanged;
        };

        if (Array.isArray(e_)) {
            e_.forEach(processSingle); // batch change call
        } else {
            processSingle(e_);
        }

        if (changed) {
            this.openKeys = openKeys;
            this.openChange.emit({openKeys, menu: this}); // emit events
        }
    }

    onOpenKeysChange(): void {
        if (this.allSubmList) {
            this.allSubmList.forEach(sm => {
                sm.opened = this.openKeys.indexOf(sm.eventKey) >= 0;
            });
        }
    }

    onSelect(selectInfo: SelectParam): void {
        if (this.selectable) {
            // root menu
            let selectedKeys = this.selectedKeys;
            const selectedKey = selectInfo.key;
            if (this.multiple) {
                selectedKeys = selectedKeys.concat([selectedKey]);
            } else {
                selectedKeys = [selectedKey];
            }
            this.selectedKeys = selectedKeys;

            // emit events
            this.select.emit(selectInfo);
        }
    }

    onDeselect(selectInfo: SelectParam): void {
        if (this.selectable) {
            const selectedKeys = this.selectedKeys.concat();
            const selectedKey = selectInfo.key;
            const index = selectedKeys.indexOf(selectedKey);
            if (index !== -1) {
                selectedKeys.splice(index, 1);
            }
            this.selectedKeys = selectedKeys;

            // emit events
            this.deselect.emit(selectInfo);
        }
    }

    onSelectedKeysChange(): void {
        // 设置子菜单的 选择 状态
        if (this.allItemList) {
            this.allItemList.forEach(item => {
                item.selected = this.selectedKeys.indexOf(item.eventKey) >= 0;
            });
        }
    }

    isInlineMode(): boolean {
        return this.mode === 'inline';
    }


    step(direction: number): MenuItem {
        let children = this.itemList.toArray();
        const activeKey = this.activeKey;
        const len = children.length;
        if (!len) {
            return null;
        }

        if (direction < 0) {
            children = children.concat().reverse();
        }

        // find current activeIndex
        let activeIndex = -1;
        children.every((c, index) => {
            if (c && c.eventKey === activeKey) {
                activeIndex = index;
                return false;
            }
        });
        if (!this.defaultActiveFirst && activeIndex !== -1) {
            if (allDisabled(children.slice(activeIndex, len - 1))) {
                return undefined;
            }
        }

        const start = (activeIndex + 1) % len;
        let i = start;
        while (true) {
            const child = children[i];
            if (!child || child.disabled) {
                i = (i + 1 + len) % len;
                // complete a loop
                if (i === start) {
                    return null;
                }
            } else {
                return child;
            }
        }
    }

    getOpenChangesOnItemHover(e: HoverParam): OpenParam | OpenParam[] {
        const mode = this.mode;
        const { key, hover, trigger } = e;
        if (!trigger || hover ||
            this.closeSubMenuOnMouseLeave || !e.item.isSubMenu || mode === 'inline') {
            this.activeKey = hover ? key : null; // 当前激活的菜单
        } else {
            // keep active for sub menu for click active
            // empty
        }

        // clear last open status
        if (hover && mode !== 'inline') {
            const activeItem = this.itemList.filter(c => c.active)[0];
            if (activeItem && activeItem.isSubMenu && activeItem.eventKey !== key) {
                return {
                    item: activeItem,
                    originalEvent: e.domEvent,
                    key: activeItem.eventKey,
                    open: false,
                };
            }
        }
        return [];
    }

    getGUID(prefix: string): string {
        return `${prefix}-item-${Menu.guid_counter++}`;
    }

    getSubMenu(key: string): SubMenu {
        return this.allSubmList.find(sm => sm.eventKey === key);
    }

}
