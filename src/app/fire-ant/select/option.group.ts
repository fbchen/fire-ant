/**
 * @license
 * Copyright 厦门乾元盛世科技有限公司 All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file.
 */


import { Component, Input, HostBinding, ViewEncapsulation, ElementRef, ContentChildren, QueryList, OnInit } from '@angular/core';
import { UpdateClassService } from '../core/service/update.class.service';

import { Option } from './option';


@Component({
    selector: 'ant-option-group',
    template: `
        <div [class]="titleClass">{{label}}</div>
        <div [class]="listClass">
            <ng-content></ng-content>
        </div>
    `,
    encapsulation: ViewEncapsulation.None,
    providers: [ UpdateClassService ]
})
export class OptionGroup implements OnInit {

    public isSelectOptGroup = true;
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
        }
    }
    private _prefixCls = 'ant-select-dropdown-menu';


    /** Label */
    @Input() label: string;

    // 所有的选项
    @ContentChildren(Option) public options: QueryList<Option>;

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
        const classes = {
            [`${this.prefixCls}-item-group`]: true
        };
        this.updateClassService.update(this.el.nativeElement, classes);

        this.titleClass = `${this.prefixCls}-item-group-title`;
        this.listClass = `${this.prefixCls}-item-group-list`;
    }

    @HostBinding('attr.hidden') get willHide(): any {
        return this.isFiltered ? 'hidden' : null;
    }

    get isFiltered(): boolean {
        return !(this.options.some(option => !option.isFiltered));
    }

    getOptions(): Option[] {
        if (this.options.length) {
            return this.options.toArray();
        }
        return [];
    }

}

