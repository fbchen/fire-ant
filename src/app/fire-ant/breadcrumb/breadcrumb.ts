/**
 * @license
 * Copyright 厦门乾元盛世科技有限公司 All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file.
 */

import { Component, Input, ElementRef, ViewEncapsulation, OnInit } from '@angular/core';
import { UpdateClassService } from '../core/service/update.class.service';

/**
 * Breadcrumb 面包屑
 */
@Component({
    selector: 'ant-breadcrumb',
    template: '<ng-content></ng-content>',
    styleUrls: ['./style/index.scss'],
    preserveWhitespaces: false,
    encapsulation: ViewEncapsulation.None,
    providers: [ UpdateClassService ]
})
export class Breadcrumb implements OnInit {

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
    private _prefixCls = 'ant-breadcrumb';


    /** 分隔符 */
    @Input() separator = '/';

    constructor(
        private el: ElementRef,
        private updateClassService: UpdateClassService) {

    }

    ngOnInit(): void {
        this.updateClassMap();
    }

    private updateClassMap(): void {
        const classes = {
            [`${this.prefixCls}`]: true
        };
        this.updateClassService.update(this.el.nativeElement, classes);
    }

}
