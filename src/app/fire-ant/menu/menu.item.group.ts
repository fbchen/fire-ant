/**
 * @license
 * Copyright 厦门乾元盛世科技有限公司 All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file.
 */

import { Component, OnInit, Input, ElementRef, ViewEncapsulation, forwardRef, ContentChildren, QueryList } from '@angular/core';
import { UpdateClassService } from '../core/service/update.class.service';

import { MenuItem } from './menu.item';

/**
 * Menu导航菜单
 * 参考: https://github.com/react-component/menu
 */
@Component({
    selector: 'ant-menu-item-group',
    template: `
        <div [class]="titleClass">
            <ng-content select="[ant-menu-group-title]"></ng-content>
        </div>
        <div [class]="listClass">
            <ng-content></ng-content>
        </div>
    `,
    preserveWhitespaces: false,
    encapsulation: ViewEncapsulation.None,
    providers: [ UpdateClassService ]
})
export class MenuItemGroup implements OnInit {
    public isMenuItemGroup = true;
    public disabled = true;

    /** 样式前缀 */
    @Input()
    get prefixCls(): string {
        return this._prefixCls;
    }
    set prefixCls(prefixCls: string) {
        if (this._prefixCls !== prefixCls) {
            this._prefixCls = prefixCls;
            this.updateClassMap();
            // this.updateMenuItemPrefixCls();
        }
    }
    private _prefixCls: string;


    // 子菜单项
    @ContentChildren(forwardRef(() => MenuItem)) itemList: QueryList<MenuItem>;

    // 内部样式
    public titleClass: string;
    public listClass: string;

    constructor(
        protected el: ElementRef,
        protected updateClassService: UpdateClassService) {

    }


    ngOnInit(): void {
        this.updateClassMap();
    }

    protected updateClassMap(): void {
        const classes = `${this.prefixCls}-item-group`;
        this.updateClassService.update(this.el.nativeElement, classes);

        this.titleClass = `${this.prefixCls}-item-group-title`;
        this.listClass = `${this.prefixCls}-item-group-list`;
    }

    /*
    protected updateMenuItemPrefixCls(): void {
        if (this.itemList && this.itemList.length) {
            this.itemList.forEach(item => {
                item.prefixCls = this.prefixCls;
            });
        }
    }
    */

}
