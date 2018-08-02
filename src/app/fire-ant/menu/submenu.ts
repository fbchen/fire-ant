/**
 * @license
 * Copyright 厦门乾元盛世科技有限公司 All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file.
 */

import {
    Component, Input, Output, EventEmitter, ElementRef, ViewEncapsulation,
    OnInit, OnDestroy, AfterContentInit, Host, Optional, forwardRef, Inject,
    ContentChildren, HostListener, QueryList
} from '@angular/core';
import { UpdateClassService } from '../core/service/update.class.service';
import { isPresent, toBoolean, toNumber } from '../util/lang';
import { KeyCode } from '../util/key.code';

import { Menu } from './menu';
import { MenuItem } from './menu.item';
import { MenuItemGroup } from './menu.item.group';


/**
 * 子菜单
 * 参考: https://github.com/react-component/menu
 */
@Component({
    selector: 'ant-submenu',
    template: `
        <div [class]="titleClasses" aria-haspopup="true"
             [style.paddingLeft]="titlePaddingLeft" [attr.aria-expanded]="opened"
             (mouseenter)="onTitleMouseEnter($event)"
             (mouseleave)="onTitleMouseLeave($event)" (click)="onTitleClick($event)">
            <ng-content select="[ant-submenu-title]"></ng-content>
        </div>
        <div [ngClass]="subClasses" role="menu" aria-activedescendant="">
            <ng-content></ng-content>
        </div>
    `,
    preserveWhitespaces: false,
    encapsulation: ViewEncapsulation.None,
    providers: [ UpdateClassService ]
})
export class SubMenu /*extends Menu*/ implements OnInit, OnDestroy, AfterContentInit {
    public isMenuItem = 0;
    public isSubMenu = 1;

    // tslint:disable-next-line:no-input-rename
    @Input('key') eventKey: string;

    /** 模式的菜单缩进宽度，默认为24px */
    @Input() inlineIndent = 24;

    /** 默认激活第一个菜单项 */
    @Input() defaultActiveFirst = true;

    /** 样式前缀 */
    @Input()
    get prefixCls(): string {
        return this._prefixCls;
    }
    set prefixCls(prefixCls: string) {
        if (this._prefixCls !== prefixCls) {
            this._prefixCls = prefixCls;
            this.updateClassMap();
            this.updateSubClasses();
            this.updateTitleClasses();
            this.updateMenuItemPrefixCls();
        }
    }
    private _prefixCls: string;


    @Input()
    get mode(): 'vertical' | 'horizontal' | 'inline' {
        return this._mode;
    }
    set mode(mode: 'vertical' | 'horizontal' | 'inline') {
        if (this._mode !== mode) {
            this._mode = mode;
            this.updateClassMap();
            this.updateSubClasses();
            this.updateMenuItemMode();
        }
    }
    private _mode: 'vertical' | 'horizontal' | 'inline' = 'vertical';


    @Input()
    public set active(active: boolean) {
        const value = toBoolean(active);
        if (this._active !== value) {
            this._active = value;
            this.updateClassMap();
        }
    }
    public get active(): boolean {
        return this._active;
    }
    private _active = false;


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


    @Input()
    get opened(): boolean {
        return this._opened;
    }
    set opened(opened: boolean) {
        const value = toBoolean(opened);
        if (this._opened !== value) {
            this._opened = value;
            this.updateClassMap();
            this.updateSubClasses();
        }
    }
    private _opened = false;


    @Input()
    get level(): number {
        return this._level;
    }
    set level(level: number) {
        if (isPresent(level)) {
            const value = toNumber(level, null);
            if (this._level !== value) {
                this._level = value;
                this.updateClassMap();
                this.updateMenuItemLevel();
            }
        }
    }
    private _level = 1;


    /**
     * menuItem 被点击时的事件，参数为：({ item, key })
     */
    @Output() titleClick = new EventEmitter<{ key: string, domEvent: Event }>();

    /**
     * menuItem 事件，参数为：({ item, key })
     */
    @Output() titleMouseEnter = new EventEmitter<{ key: string, domEvent: Event }>();

    /**
     * menuItem 事件，参数为：({ item, key })
     */
    @Output() titleMouseLeave = new EventEmitter<{ key: string, domEvent: Event }>();


    @ContentChildren(forwardRef(() => MenuItem)) itemList: QueryList<MenuItem>;
    @ContentChildren(forwardRef(() => SubMenu)) submenuList: QueryList<SubMenu>;
    @ContentChildren(forwardRef(() => MenuItemGroup)) itemGroupList: QueryList<MenuItemGroup>;

    /**
     * 鼠标移出的一定时间后(如100毫秒)，再执行隐藏子菜单的操作
     */
    private mouseLeaveTimer: any;
    private mouseLeaveTitleTimer: any;

    // 内部样式
    public titleClasses: string;
    public subClasses: any;


    constructor(
        protected el: ElementRef,
        protected updateClassService: UpdateClassService,
        @Inject(forwardRef(() => Menu)) @Optional() @Host() private parentMenu: Menu) {

    }

    protected updateMenuItemMode(): void {
        if (this.itemList) {
            this.itemList.forEach(item => {
                item.mode = this.mode === 'horizontal' ? 'vertical' : this.mode;
            });
        }
        /*
        if (this.submenuList) {
            this.submenuList.forEach(item => {
                if (item !== this) {
                    item.mode = this.mode;
                }
            });
        }
        */
    }

    protected updateMenuItemPrefixCls(): void {
        if (this.itemList && this.itemList.length) {
            this.itemList.forEach(item => {
                item.prefixCls = this.prefixCls;
            });
        }
        if (this.itemGroupList && this.itemGroupList.length) {
            this.itemGroupList.forEach(item => {
                item.prefixCls = this.prefixCls;
            });
        }
    }

    protected updateMenuItemLevel(): void {
        this.submenuList.forEach(item => {
            if (item !== this) {
                item.level = this.level + 1;
            }
        });
        this.itemList.forEach(item => {
            item.level = this.level + 1;
        });
    }

    // 内联菜单的展开关闭设置
    public isOpenSubMenuOnMouseEnter() {
        return this.mode === 'inline' ? false : true;
    }
    public isCloseSubMenuOnMouseLeave() {
        return this.mode === 'inline' ? false : true;
    }

    ngOnInit(): void {
        // 更新样式
        this.updateClassMap();
        this.updateSubClasses();
        this.updateTitleClasses();
    }

    ngAfterContentInit(): void {
        this.updateMenuItemLevel();
        this.updateMenuItemMode();
        this.updateMenuItemPrefixCls();
    }

    ngOnDestroy(): void {
        const parentMenu: Menu = this.parentMenu;
        this.clearMouseLeaveTimer();
        if (parentMenu) {
            parentMenu.onDestroy(this.eventKey);
        }
    }

    protected updateClassMap(): void {
        const classes = {
            [`${this.prefixCls}-submenu`]: true,
            [`${this.prefixCls}-submenu-${this.mode}`]: this.mode,
            [`${this.prefixCls}-submenu-active`]: !this.disabled && this.active,
            [`${this.prefixCls}-submenu-selected`]: this.isChildrenSelected(),
            [`${this.prefixCls}-submenu-open`]: this.opened,
            [`${this.prefixCls}-submenu-disabled`]: this.disabled
        };
        this.updateClassService.update(this.el.nativeElement, classes);
    }

    private updateTitleClasses(): void {
        this.titleClasses = `${this.prefixCls}-submenu-title`;
    }

    private updateSubClasses(): void {
        const mode = this.mode === 'horizontal' ? 'vertical' : this.mode;
        this.subClasses = {
            [`${this.prefixCls}`]: true,
            [`${this.prefixCls}-${mode}`]: mode,
            [`${this.prefixCls}-hidden`]: !this.opened,
            [`${this.prefixCls}-sub`]: true
        };
    }


    get titlePaddingLeft(): string {
        if (this.mode === 'inline') {
            return (this.inlineIndent * this.level) + 'px';
        }
        return null;
    }

    /** The underlying host native element */
    getHostElement(): HTMLElement {
        return this.el.nativeElement as HTMLElement;
    }

    @HostListener('keydown', ['$event'])
    onKeyDown(event: KeyboardEvent): void {
        const keyCode = event.keyCode;
        const isOpen = this.opened;
        const parentMenu: Menu = this.parentMenu;

        if (keyCode === KeyCode.ENTER) {
            this.onTitleClick(event);
            this.defaultActiveFirst = true;
            return;
        }

        if (keyCode === KeyCode.RIGHT) {
            if (!isOpen) {
                this.triggerOpenChange(true);
                this.defaultActiveFirst = true;
            }
            return;
        }
        if (keyCode === KeyCode.LEFT) {
            if (isOpen) {
                this.triggerOpenChange(false);
            }
            return;
        }

        if (isOpen && (keyCode === KeyCode.UP || keyCode === KeyCode.DOWN)) {
            if (parentMenu) {
                parentMenu.onKeyDown(event);
            }
        }
    }

    @HostListener('mouseenter', ['$event'])
    onMouseEnter(event: MouseEvent): void {
        const parentMenu: Menu = this.parentMenu;
        this.clearMouseLeaveSubMenuTimer();

        parentMenu.onMouseEnter({
            key: this.eventKey,
            item: this,
            domEvent: event,
            trigger: 'mouseenter'
        });
    }

    @HostListener('mouseleave', ['$event'])
    onMouseLeave(event: MouseEvent): void {
        const parentMenu: Menu = this.parentMenu;

        // prevent popup menu and submenu gap
        this.mouseLeaveTimer = setTimeout(() => {
            // leave whole sub tree
            // still active
            if (this.mode !== 'inline') {
                const isOpen = this.opened;
                if (isOpen && this.isCloseSubMenuOnMouseLeave() && this.active) {
                    parentMenu.onItemHover({
                        key: this.eventKey,
                        item: this,
                        hover: false,
                        trigger: 'mouseleave',
                        domEvent: event,
                        openChanges: [{
                            key: this.eventKey,
                            item: this,
                            trigger: 'mouseleave',
                            open: false
                        }]
                    });
                } else {
                    if (this.active) {
                        parentMenu.onItemHover({
                            key: this.eventKey,
                            item: this,
                            hover: false,
                            trigger: 'mouseleave',
                            domEvent: event
                        });
                    }
                    if (isOpen && this.isCloseSubMenuOnMouseLeave()) {
                        this.triggerOpenChange(false);
                    }
                }
            }
        }, 100);

        // trigger mouseleave
        parentMenu.onMouseLeave({
            key: this.eventKey,
            item: this,
            domEvent: event,
            trigger: 'mouseleave'
        });
    }

    onTitleMouseEnter(event: Event): void {
        const parentMenu: Menu = this.parentMenu;
        const eventKey: string = this.eventKey;

        this.clearMouseLeaveTitleTimer();

        const openChanges = [];
        if (this.isOpenSubMenuOnMouseEnter()) {
            openChanges.push({
                key: eventKey,
                item: this,
                trigger: 'mouseenter',
                open: true
            });
        }
        parentMenu.onItemHover({
            key: eventKey,
            item: this,
            hover: true,
            trigger: 'mouseenter',
            domEvent: event,
            openChanges
        });
        this.defaultActiveFirst = false;

        this.titleMouseEnter.emit({
            key: eventKey,
            domEvent: event
        });
    }

    onTitleMouseLeave(event: Event): void {
        const parentMenu: Menu = this.parentMenu;
        const eventKey: string = this.eventKey;

        this.mouseLeaveTitleTimer = setTimeout(() => {
            if (this.mode === 'inline' && this.active) {
                parentMenu.onItemHover({
                    key: eventKey,
                    item: this,
                    hover: false,
                    trigger: 'mouseleave',
                    domEvent: event
                });
            }
            this.titleMouseLeave.emit({
                key: eventKey,
                domEvent: event
            });
        }, 100);
    }

    onTitleClick(event: Event): void {
        this.titleClick.emit({
            key: this.eventKey,
            domEvent: event
        });

        if (this.isOpenSubMenuOnMouseEnter()) {
            return;
        }
        this.triggerOpenChange(!this.opened, 'click');
        this.defaultActiveFirst = false;
    }

    triggerOpenChange(open: boolean, type?: string): void {
        const key = this.eventKey;
        const parentMenu: Menu = this.parentMenu;
        parentMenu.onOpenChange({
            key,
            item: this,
            trigger: type,
            open
        });
    }

    isChildrenSelected(): boolean {
        return this.itemList && this.itemList.find(item => item.selected) != null;
    }

    clearMouseLeaveTimer(): void {
        this.clearMouseLeaveSubMenuTimer();
        this.clearMouseLeaveTitleTimer();
    }

    clearMouseLeaveSubMenuTimer(): void {
        if (this.mouseLeaveTimer) {
            clearTimeout(this.mouseLeaveTimer);
            this.mouseLeaveTimer = null;
        }
    }

    clearMouseLeaveTitleTimer(): void {
        if (this.mouseLeaveTitleTimer) {
            clearTimeout(this.mouseLeaveTitleTimer);
            this.mouseLeaveTitleTimer = null;
        }
    }

}

