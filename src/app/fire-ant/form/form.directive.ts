/**
 * @license
 * Copyright 厦门乾元盛世科技有限公司 All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file.
 */


import { Directive, Input, HostBinding, Optional, Self } from '@angular/core';
import { NgForm } from '@angular/forms';
import { classnames } from '../util/classnames';

import { AbstractForm } from './abstract.form';

@Directive({
    selector: 'form:not([ngNoForm]):not([formGroup]),ngForm,[ngForm]',
    exportAs: 'faForm'
})
export class FormDirective extends AbstractForm {

    /** 样式前缀 */
    @Input() prefixCls = 'ant-form';

    /** 表单布局，可选值为`horizontal`, `vertical`, `inline`，默认为`horizontal` */
    @Input() layout: 'horizontal' | 'inline' | 'vertical' = 'horizontal';

    /** 隐藏所有表单项的必选标记 */
    @Input() hideRequiredMark = false;

    /** 用户CSS样式 */
    @Input() class: string;

    constructor( @Optional() @Self() form: NgForm ) {
        super(form);
    }

    @HostBinding('class')
    get classes(): string {
        return this.getFormClasses();
    }

    getFormClasses(): string {
        return classnames(this.prefixCls, {
            [`${this.prefixCls}-horizontal`]: this.isHorizontal(),
            [`${this.prefixCls}-vertical`]: this.isVertical(),
            [`${this.prefixCls}-inline`]: this.isInline(),
            [`${this.prefixCls}-hide-required-mark`]: this.hideRequiredMark,
            [`ng-submitted`]: this.isSubmitted() // 增加AngularJS1.0样式
        }, this.class);
    }

    isVertical(): boolean {
        return this.layout === 'vertical';
    }

    isHorizontal(): boolean {
        return this.layout === 'horizontal' || this.layout == null;
    }

    isInline(): boolean {
        return this.layout === 'inline';
    }

}

