/**
 * @license
 * Copyright 厦门乾元盛世科技有限公司 All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file.
 */

import { Component, ViewEncapsulation, ElementRef, OnInit, Host, Optional, forwardRef, Inject } from '@angular/core';
import { UpdateClassService } from '../core/service/update.class.service';

import { Menu } from './menu';


/**
 * Menu导航菜单
 * 参考: https://github.com/react-component/menu
 */
@Component({
    selector: 'ant-divider',
    template: '<ng-content></ng-content>',
    preserveWhitespaces: false,
    encapsulation: ViewEncapsulation.None,
    providers: [ UpdateClassService ]
})
export class Divider implements OnInit {
    public disabled = true;

    constructor(
        protected el: ElementRef,
        protected updateClassService: UpdateClassService,
        @Inject(forwardRef(() => Menu)) @Optional() @Host() private parentMenu: Menu) {

    }

    /** 样式前缀 */
    get prefixCls(): string {
        return this.parentMenu && this.parentMenu.prefixCls || '';
    }

    ngOnInit(): void {
        const classes = `${this.prefixCls}-item-divider`;
        this.updateClassService.update(this.el.nativeElement, classes);
    }

}

