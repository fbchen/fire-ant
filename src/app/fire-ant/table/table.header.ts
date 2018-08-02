/**
 * @license
 * Copyright 厦门乾元盛世科技有限公司 All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file.
 */

import { Component, ViewEncapsulation, OnInit, ElementRef, Inject, Optional, Host, forwardRef } from '@angular/core';
import { UpdateClassService } from '../core/service/update.class.service';

import { Table } from './table';


/**
 * 表格：标题
 */
@Component({
    selector: 'table-header',
    template: `<ng-content></ng-content>`,
    preserveWhitespaces: false,
    encapsulation: ViewEncapsulation.None,
    providers: [ UpdateClassService ]
})
export class TableHeader implements OnInit {

    /** 样式前缀 */
    get prefixCls(): string {
        return this.table && this.table.prefixCls || '';
    }

    constructor(
        protected el: ElementRef,
        protected updateClassService: UpdateClassService,
        @Inject(forwardRef(() => Table)) @Optional() @Host() private table: Table) {

    }

    ngOnInit(): void {
        this.updateClassMap();
    }

    protected updateClassMap(): void {
        const classes = {
            [`${this.prefixCls}-title`]: true
        };
        this.updateClassService.update(this.el.nativeElement, classes);
    }

}
