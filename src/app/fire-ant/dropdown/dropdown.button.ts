/**
 * @license
 * Copyright 厦门乾元盛世科技有限公司 All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file.
 */


import { Component, Input, ViewEncapsulation, ElementRef, ContentChild, OnInit } from '@angular/core';
import { UpdateClassService } from '../core/service/update.class.service';
import { ButtonGroup } from '../button/button.group';
import { Button } from '../button/button';
import { Menu } from '../menu/menu';

export type DropdownPlacement = 'topLeft' | 'topCenter' | 'topRight' | 'bottomLeft' | 'bottomCenter' | 'bottomRight';


/**
 * Dropdown Button
 */
@Component({
    selector: 'ant-dropdown-button',
    template: `
        <ng-content></ng-content>
        <ant-button dropdown [type]="buttonType" [disabled]="disabled" [dropdownPlacement]="placement">
            <ant-icon type="down"></ant-icon>
            <ng-content select="ant-menu"></ng-content>
        </ant-button>
    `,
    styleUrls: [
        './style/index.scss',
        '../button/style/button.group.scss'
    ],
    preserveWhitespaces: false,
    encapsulation: ViewEncapsulation.None,
    providers: [ UpdateClassService ]
})
export class DropdownButton extends ButtonGroup implements OnInit {

    @Input()
    get dropdownPrefixCls(): string {
        return this._dropdownPrefixCls;
    }
    set dropdownPrefixCls(dropdownPrefixCls: string) {
        if (this._dropdownPrefixCls !== dropdownPrefixCls) {
            this._dropdownPrefixCls = dropdownPrefixCls;
            this.updateClassMap();
        }
    }
    _dropdownPrefixCls = 'ant-dropdown-button';


    /**
     * 菜单弹出位置：`bottomLeft` `bottomCenter` `bottomRight` `topLeft` `topCenter` `topRight`
     */
    @Input() placement: DropdownPlacement = 'bottomRight';

    /**
     * 按钮组中的第一个按钮
     */
    @ContentChild(Button) button: Button;

    /** 菜单 */
    @ContentChild(Menu) menu: Menu;

    constructor(
        protected el: ElementRef,
        protected updateClassService: UpdateClassService) {
        super(el, updateClassService);
    }

    ngOnInit(): void {
        this.updateClassMap();
    }

    protected updateClassMap(): void {
        const classes = {
            [`${this.prefixCls}`]: true,
            [`${this.prefixCls}-lg`]: this.size === 'large',
            [`${this.prefixCls}-sm`]: this.size === 'small',
            [`${this.dropdownPrefixCls}`]: this.dropdownPrefixCls
        };
        this.updateClassService.update(this.el.nativeElement, classes);
    }

    get buttonType(): string {
        return (this.button && this.button.type) || 'default';
    }

    get disabled(): boolean {
        return (this.button && this.button.disabled) || false;
    }

}
