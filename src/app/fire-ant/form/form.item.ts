/**
 * @license
 * Copyright 厦门乾元盛世科技有限公司 All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file.
 */

import { Component, Input, ElementRef, Renderer, ViewEncapsulation, HostBinding, Optional, Host, ContentChild } from '@angular/core';
import { NgControl } from '@angular/forms';

import { FormDirective } from './form.directive';
import { FormLabel } from './form.label';
import { FormHelp } from './form.help';
import { Row } from '../grid/row';
import { ColSize } from '../grid/col';
import { isPresent } from '../util/lang';

import classNames from 'classnames';


/**
 * 表单项
 */
@Component({
    selector: 'form-item',
    templateUrl: './form.item.html',
    styleUrls: ['../grid/style/index.scss', './style/index.scss'],
    encapsulation: ViewEncapsulation.None
})
export class FormItem extends Row {

    /** 样式前缀 */
    @Input() prefixCls = 'ant-form';

    /** 配合 validateStatus 属性使用，展示校验状态图标，建议只配合 Input 组件使用 */
    @Input() hasFeedback = false;

    /** label 标签的文本 */
    @Input() label: string;

    /** 配合 label 属性使用，表示是否显示 label 后面的冒号 */
    @Input() colon = true;

    /** 标签布局，同 `<Col>` 组件，设置 `span` `offset` 值，如 `{span: 3, offset: 12}` 或 `{sm: {span: 3, offset: 12}}` */
    @Input() labelCol: ColSize | { [key: string]: number | ColSize };

    /** 用户CSS样式 */
    @Input() labelClass: string;

    /** 需要为输入控件设置布局样式时，使用该属性，用法同 labelCol */
    @Input() wrapperCol: ColSize | { [key: string]: number | ColSize };

    /** 用户CSS样式 */
    @Input() wrapperClass: string;

    /** 提示信息，如不设置，则会根据校验规则自动生成 */
    @Input() help: string;

    /** 额外的提示信息，和 help 类似，当需要错误信息和提示文案同时出现时，可以使用这个。 */
    @Input() extra: string;

    /** 是否必填项 */
    @Input() required = false;

    @Input() validateStatus: '' | 'success' | 'warning' | 'error' | 'validating';

    /** 用户CSS样式 */
    @Input() class: string;


    /** 内部输入框 */
    @ContentChild(NgControl) control: NgControl;

    /** 用户自定义label */
    @ContentChild(FormLabel) customLabel: FormLabel;

    /** 用户自定义help文本 */
    @ContentChild(FormHelp) customHelp: FormHelp;

    constructor(
        private renderer: Renderer,
        private elementRef: ElementRef,
        @Optional() @Host() private form: FormDirective) {
        super(renderer, elementRef);
    }

    @HostBinding('class')
    get classes(): string {
        const rowPrefixCls = 'ant-row';
        const rowClassName = {
            [`${rowPrefixCls}`]: !this.type,
            [`${rowPrefixCls}-${this.type}`]: this.type,
            [`${rowPrefixCls}-${this.type}-${this.justify}`]: this.type && this.justify,
            [`${rowPrefixCls}-${this.type}-${this.align}`]: this.type && this.align
        };

        const itemClassName = {
            [`${this.prefixCls}-item`]: true,
            [`${this.prefixCls}-item-with-help`]: this.help,
            [`${this.prefixCls}-item-no-colon`]: !this.colon
        };

        return classNames(rowClassName, itemClassName, this.class);
    }

    getControlWrapperClasses(): any {
        return {
            [`${this.prefixCls}-item-control-wrapper`]: 1,
            [`${this.wrapperClass}`]: this.wrapperClass
        };
    }

    getControlClasses(): any {
        const validateStatus = this.getValidateStatus();
        return {
            [`${this.prefixCls}-item-control`]: 1,
            'has-feedback': this.hasFeedback,
            'has-success': validateStatus === 'success',
            'has-warning': validateStatus === 'warning',
            'has-error': validateStatus === 'error',
            'is-validating': validateStatus === 'validating',
        };
    }

    getLabelWrapperClasses(): any {
        return {
            [`${this.prefixCls}-item-label`]: 1,
            [`${this.labelClass}`]: this.labelClass
        };
    }

    getLabelClasses(): any {
        return {
            [`${this.prefixCls}-item-required`]: this.isRequired()
        };
    }

    getLabelText(): string {
        // Keep label is original where there should have no colon
        const haveColon = this.colon && !this.form.isVertical();
        // Remove duplicated user input colon
        if (haveColon && this.label && this.label.trim() !== '') {
            return this.label.replace(/[：|:]\s*$/, '');
        }
        return this.label;
    }

    getValidateStatus(): string {
        if (isPresent(this.validateStatus) && this.validateStatus !== '') {
            return this.validateStatus;
        }

        const control: NgControl = this.control;
        if (control) {
            const submitted = this.form && this.form.isSubmitted();
            if (control.invalid && (control.touched || submitted)) {
                return 'error';
            }
            if (control.pending) {
                return 'validating';
            }
            if (control.valid && isPresent(control.value) && control.value !== '') {
                return 'success';
            }
        }
        return '';
    }

    public isRequired(): boolean {
        if (this.required) {
            return true;
        }
        return this.control && this.control.valueAccessor['required'];
    }


    private getOwnProperty(obj: any, key: string): any {
        return (obj && obj.hasOwnProperty(key)) ? obj[key] : null;
    }

    getLabelSpan(): number {
        return this.getOwnProperty(this.labelCol, 'span') as number;
    }

    getLabelOffset(): number {
        return this.getOwnProperty(this.labelCol, 'offset') as number || 0;
    }

    getLabelSize(size: string): any {
        return this.getOwnProperty(this.labelCol, size);
    }

    getWrapperSpan(): number {
        return this.getOwnProperty(this.wrapperCol, 'span') as number;
    }

    getWrapperOffset(): number {
        return this.getOwnProperty(this.wrapperCol, 'offset') as number || 0;
    }

    getWrapperSize(size: string): any {
        return this.getOwnProperty(this.wrapperCol, size);
    }
}
