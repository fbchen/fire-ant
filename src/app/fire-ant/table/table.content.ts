/**
 * @license
 * Copyright 厦门乾元盛世科技有限公司 All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file.
 */

import { Component, ViewEncapsulation, ElementRef, OnInit, Inject, Host, forwardRef } from '@angular/core';
import { UpdateClassService } from '../core/service/update.class.service';

import { Table } from './table';


/**
 * 表格：内容
 */
@Component({
    selector: 'table-content',
    templateUrl: './table.content.html',
    preserveWhitespaces: false,
    encapsulation: ViewEncapsulation.None,
    providers: [ UpdateClassService ]
})
export class TableContent implements OnInit {

    /** 样式前缀 */
    get prefixCls(): string {
        return this.table && this.table.prefixCls || '';
    }

    constructor(
        protected el: ElementRef,
        protected updateClassService: UpdateClassService,
        @Inject(forwardRef(() => Table)) @Host() public table: Table) {

    }

    ngOnInit(): void {
        this.updateClassMap();
    }

    protected updateClassMap(): void {
        const classes = {
            [`${this.prefixCls}-content`]: true
        };
        this.updateClassService.update(this.el.nativeElement, classes);
    }

}
