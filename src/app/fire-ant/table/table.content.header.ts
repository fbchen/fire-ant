/**
 * @license
 * Copyright 厦门乾元盛世科技有限公司 All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file.
 */

import { Directive, ElementRef, Renderer2, AfterViewInit, Inject, Optional, Host, forwardRef } from '@angular/core';

import { Table } from './table';


/**
 * 表格：thead
 */
@Directive({
    // tslint:disable-next-line:directive-selector
    selector: 'thead'
})
export class TableContentHeader implements AfterViewInit {

    /** 样式前缀 */
    get prefixCls(): string {
        return this.table && this.table.prefixCls || '';
    }

    constructor(
        private renderer: Renderer2,
        private elementRef: ElementRef,
        @Inject(forwardRef(() => Table)) @Optional() @Host() private table: Table) {

    }

    ngAfterViewInit(): void {
        const prefixCls = this.prefixCls;
        if (prefixCls) {
            const el = this.elementRef.nativeElement;
            this.renderer.addClass(el, `${this.prefixCls}-thead`);
        }
    }


}
