/**
 * @license
 * Copyright 厦门乾元盛世科技有限公司 All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file.
 */

import {
    Component, Input, ElementRef, ViewEncapsulation,
    OnInit, OnDestroy, HostBinding, HostListener, Host, Optional, forwardRef, Inject
} from '@angular/core';
import { UpdateClassService } from '../core/service/update.class.service';
import { isPresent, toBoolean, toNumber } from '../util/lang';

import { KeyCode } from '../util/key.code';
import { Menu } from './menu';
import { SubMenu } from './submenu';


/**
 * Menu导航菜单
 * 参考: https://github.com/react-component/menu
 */
@Component({
    selector: 'ant-menu-item',
    template: '<ng-content></ng-content>',
    preserveWhitespaces: false,
    encapsulation: ViewEncapsulation.None,
    providers: [ UpdateClassService ]
})
export class MenuItem implements OnInit, OnDestroy {
    public isMenuItem = 1;
    public isSubMenu = 0;

    @Input() title: string;

    // tslint:disable-next-line:no-input-rename
    @Input('key') eventKey: string;

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
    private _prefixCls: string;


    @Input()
    get mode(): 'vertical' | 'horizontal' | 'inline' {
        return this._mode;
    }
    set mode(mode: 'vertical' | 'horizontal' | 'inline') {
        if (this._mode !== mode) {
            this._mode = mode;
            this.updateClassMap();
        }
    }
    private _mode: 'vertical' | 'horizontal' | 'inline';


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
    get selected(): boolean {
        return this._selected;
    }
    set selected(selected: boolean) {
        const value = toBoolean(selected);
        if (this._selected !== value) {
            this._selected = value;
            this.updateClassMap();
        }
    }
    private _selected = false;


    /**
     * 是否允许多选，默认为false
     */
    @Input()
    get multiple(): boolean {
        return this._multiple;
    }
    set multiple(multiple: boolean) {
        const value = toBoolean(multiple);
        if (this._multiple !== value) {
            this._multiple = value;
            this.updateClassMap();
        }
    }
    private _multiple = false;


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
            }
        }
    }
    private _level = 1;


    /**
     * 模式的菜单缩进宽度，默认为24px
     */
    @Input() inlineIndent = 24;

    @HostBinding('attr.role') role = 'menuitem';


    /**
     * 鼠标移出的一定时间后(如30毫秒)，再执行隐藏子菜单的操作
     */
    private mouseLeaveTimer: any;

    constructor(
        protected el: ElementRef,
        protected updateClassService: UpdateClassService,
        @Inject(forwardRef(() => Menu)) @Optional() @Host() private parentMenu: Menu,
        @Inject(forwardRef(() => SubMenu)) @Optional() @Host() private submenu: SubMenu) {
    }

    ngOnInit(): void {
        if (!this.eventKey && this.parentMenu) {
            const prefix = (this.submenu && this.submenu.eventKey) || 'menu';
            this.eventKey = this.parentMenu.getGUID(prefix);
        }

        // 更新样式
        this.updateClassMap();
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
            [`${this.prefixCls}-item`]: true,
            [`${this.prefixCls}-item-active`]: !this.disabled && this.active,
            [`${this.prefixCls}-item-selected`]: this.selected,
            [`${this.prefixCls}-item-disabled`]: this.disabled
        };
        this.updateClassService.update(this.el.nativeElement, classes);
    }

    @HostBinding('style.paddingLeft') get paddingLeft(): string {
        if (this.mode === 'inline') {
            return (this.inlineIndent * this.level) + 'px';
        }
        return null;
    }

    @HostBinding('attr.aria-selected') get ariaselected(): any {
        return this.selected ? 'true' : null;
    }

    @HostBinding('attr.aria-disabled') get ariadisabled(): any {
        return this.disabled ? 'true' : null;
    }

    @HostListener('click', ['$event'])
    onClick(event: Event): void {
        if (this.disabled) {
            return;
        }

        const selected = this.selected;
        const eventKey = this.eventKey;
        const info = {
            key: eventKey,
            item: this,
            domEvent: event
        };

        const parentMenu: Menu = this.parentMenu;
        if (parentMenu) {
            parentMenu.onClick(info);

            if (this.multiple) {
                if (selected) {
                    parentMenu.onDeselect(info);
                } else {
                    parentMenu.onSelect(info);
                }
            } else if (!selected) {
                parentMenu.onSelect(info);
            }
        }
    }

    @HostListener('mouseenter', ['$event'])
    onMouseEnter(event: MouseEvent): void {
        if (this.disabled) {
            return;
        }

        const parentMenu: Menu = this.parentMenu;
        this.clearMouseLeaveTimer();

        // first is mouse-enter
        parentMenu.onMouseEnter({
            key: this.eventKey,
            item: this,
            domEvent: event,
            trigger: 'mouseenter'
        });

        // and then is item-hover
        parentMenu.onItemHover({
            key: this.eventKey,
            item: this,
            hover: true,
            domEvent: event,
            trigger: 'mouseenter'
        });
    }

    @HostListener('mouseleave', ['$event'])
    onMouseLeave(event: MouseEvent): void {
        if (this.disabled) {
            return;
        }

        const parentMenu: Menu = this.parentMenu;
        this.mouseLeaveTimer = setTimeout(() => {
            // we will trigger hover=false event later
            if (this.active) {
                parentMenu.onItemHover({
                    key: this.eventKey,
                    item: this,
                    hover: false,
                    domEvent: event,
                    trigger: 'mouseleave'
                });
            }
        }, 30);

        parentMenu.onMouseLeave({
            key: this.eventKey,
            item: this,
            domEvent: event,
            trigger: 'mouseleave'
        });
    }

    @HostListener('keydown', ['$event'])
    onKeyDown(event: KeyboardEvent): void {
        const keyCode = event.keyCode;
        if (keyCode === KeyCode.ENTER) {
            this.onClick(event);
        }
    }

    /** The underlying host native element */
    getHostElement(): HTMLElement {
        return this.el.nativeElement as HTMLElement;
    }

    /** 获取内部的文本 */
    getText(): string {
        return this.getHostElement().innerText.trim();
    }

    clearMouseLeaveTimer(): void {
        if (this.mouseLeaveTimer) {
            clearTimeout(this.mouseLeaveTimer);
            this.mouseLeaveTimer = null;
        }
    }

}

