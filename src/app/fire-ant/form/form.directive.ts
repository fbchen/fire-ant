/**
 * @license
 * Copyright 厦门乾元盛世科技有限公司 All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file.
 */


import { Directive, Input, Optional, Self, OnInit, ElementRef } from '@angular/core';
import { NgForm } from '@angular/forms';

import { UpdateClassService } from '../core/service/update.class.service';
import { toBoolean } from '../util/lang';
import { AbstractForm } from './abstract.form';

@Directive({
    selector: 'form:not([ngNoForm]):not([formGroup]),ngForm,[ngForm]',
    exportAs: 'faForm',
    providers: [ UpdateClassService ]
})
export class FormDirective extends AbstractForm implements OnInit {

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
    private _prefixCls = 'ant-form';


    /** 表单布局，可选值为`horizontal`, `vertical`, `inline`，默认为`horizontal` */
    @Input()
    get layout(): 'horizontal' | 'inline' | 'vertical' {
        return this._layout;
    }
    set layout(layout: 'horizontal' | 'inline' | 'vertical') {
        if (this._layout !== layout) {
            this._layout = layout;
            this.updateLayoutState();
            this.updateClassMap();
        }
    }
    private _layout: 'horizontal' | 'inline' | 'vertical' = 'horizontal';


    /** 隐藏所有表单项的必选标记 */
    @Input()
    get hideRequiredMark(): boolean {
        return this._hideRequiredMark;
    }
    set hideRequiredMark(hideRequiredMark: boolean) {
        const value = toBoolean(hideRequiredMark);
        if (this._hideRequiredMark !== value) {
            this._hideRequiredMark = hideRequiredMark;
            this.updateClassMap();
        }
    }
    private _hideRequiredMark = false;


    public isVertical = false;
    public isHorizontal = false;
    public isInline = false;

    constructor(
        @Optional() @Self() form: NgForm,
        private el: ElementRef,
        private updateClassService: UpdateClassService ) {
        super(form);
    }

    ngOnInit(): void {
        this.updateLayoutState();
        this.updateClassMap();
        this.form.ngSubmit.subscribe(() => {
            this.updateClassMap();
        });
    }

    private updateLayoutState(): void {
        this.isHorizontal = this.layout === 'horizontal' || this.layout == null;
        this.isVertical = this.layout === 'vertical';
        this.isInline = this.layout === 'inline';
    }

    private updateClassMap(): void {
        const classes = this.getFormClasses();
        this.updateClassService.update(this.el.nativeElement, classes);
    }

    getFormClasses(): any {
        return {
            [`${this.prefixCls}`]: true,
            [`${this.prefixCls}-horizontal`]: this.isHorizontal,
            [`${this.prefixCls}-vertical`]: this.isVertical,
            [`${this.prefixCls}-inline`]: this.isInline,
            [`${this.prefixCls}-hide-required-mark`]: this.hideRequiredMark,
            [`ng-submitted`]: this.isSubmitted() // 增加AngularJS1.0样式
        };
    }

}

