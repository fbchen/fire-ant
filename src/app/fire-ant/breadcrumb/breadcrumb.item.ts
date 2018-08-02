/**
 * @license
 * Copyright 厦门乾元盛世科技有限公司 All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file.
 */

import { Component, Input, ElementRef, ViewEncapsulation, OnInit, AfterViewInit, Optional, Host } from '@angular/core';
import { UpdateClassService } from '../core/service/update.class.service';
import { Breadcrumb } from './breadcrumb';

/**
 * Breadcrumb 面包屑
 */
@Component({
    selector: 'ant-breadcrumb-item',
    template: `
        <span><ng-content></ng-content></span>
        <span [class]="separatorClass">{{separator}}</span>
    `,
    styleUrls: ['./style/index.scss'],
    preserveWhitespaces: false,
    encapsulation: ViewEncapsulation.None,
    providers: [ UpdateClassService ]
})
export class BreadcrumbItem implements OnInit, AfterViewInit {

    /** 样式前缀 */
    @Input()
    get prefixCls(): string {
        return this._prefixCls;
    }
    set prefixCls(prefixCls: string) {
        if (this._prefixCls !== prefixCls) {
            this._prefixCls = prefixCls;
            this.updateSeparatorClass();
        }
    }
    private _prefixCls = 'ant-breadcrumb';


    public separatorClass: string;


    constructor(
        private el: ElementRef,
        @Optional() @Host() private breadcrumb: Breadcrumb) {

    }

    ngOnInit(): void {
        this.updateSeparatorClass();
    }

    private updateSeparatorClass(): void {
        this.separatorClass = `${this.prefixCls}-separator`;
    }

    public get separator(): string {
        return this.breadcrumb && this.breadcrumb.separator;
    }

    ngAfterViewInit(): void {
        const el: HTMLElement = this.el.nativeElement;
        [].forEach.call(el.querySelectorAll('a'), link => {
            link.classList.add(`${this.prefixCls}-link`);
        });
    }

}

