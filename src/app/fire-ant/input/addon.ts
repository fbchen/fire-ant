/**
 * @license
 * Copyright 厦门乾元盛世科技有限公司 All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file.
 */

import { Component, Input, ElementRef, OnInit, ContentChild, ViewEncapsulation, TemplateRef } from '@angular/core';
import { UpdateClassService } from '../core/service/update.class.service';


/**
 * 在输入框的前后加“拼接”组件<br>
 * 注意：
 * <span class="ant-input-group-addon"></span> 中间不能包含空格、换行等，否则:empty样式不起作用
 */
@Component({
    selector: 'ant-addon',
    template: `
        <span [ngClass]="wrapperClasses">
            <span [class]="addonClasses" *ngIf="beforeTpl">
                <ng-template [ngTemplateOutlet]="beforeTpl"></ng-template>
            </span>
            <ng-content></ng-content>
            <span [class]="addonClasses" *ngIf="afterTpl">
                <ng-template [ngTemplateOutlet]="afterTpl"></ng-template>
            </span>
        </span>
    `,
    preserveWhitespaces: false,
    encapsulation: ViewEncapsulation.None,
    providers: [ UpdateClassService ]
})
export class Addon implements OnInit {

    /** 样式前缀 */
    @Input()
    get prefixCls(): string {
        return this._prefixCls;
    }
    set prefixCls(prefixCls: string) {
        if (this._prefixCls !== prefixCls) {
            this._prefixCls = prefixCls;
            this.updateClassMap();
            this.updateAddonClass();
            this.updateWrapperClasses();
        }
    }
    private _prefixCls = 'ant-input';


    /** 前置内容 */
    @ContentChild('before') beforeTpl: TemplateRef<any>;

    /** 后置内容 */
    @ContentChild('after') afterTpl: TemplateRef<any>;

    // 内部样式
    public addonClasses: string;
    public wrapperClasses: any;


    constructor(
        protected el: ElementRef,
        protected updateClassService: UpdateClassService) {

    }

    ngOnInit(): void {
        this.updateClassMap();
        this.updateAddonClass();
        this.updateWrapperClasses();
    }

    protected updateClassMap(): void {
        const classes = {
            [`${this.prefixCls}-group-wrapper`]: true
        };
        this.updateClassService.update(this.el.nativeElement, classes);
    }

    /** 样式 */
    updateWrapperClasses(): void {
        this.wrapperClasses = {
            [`${this.prefixCls}-wrapper`]: true,
            [`${this.prefixCls}-group`]: true
        };
    }

    updateAddonClass(): void {
        this.addonClasses = `${this.prefixCls}-group-addon`;
    }

}
