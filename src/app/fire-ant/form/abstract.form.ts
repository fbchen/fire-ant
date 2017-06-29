/**
 * @license
 * Copyright 厦门乾元盛世科技有限公司 All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file.
 */

import { Optional, Self } from '@angular/core';
import { NgForm } from '@angular/forms';

/**
 * 控件与提示信息，例如：<code>
 * {
 *     username: {
 *         required: '用户名不能为空',
 *         maxlength: '请输入小于10位长度的字符',
 *         ......
 *     }
 * }
 * </code>
 */
export interface FieldMessages {
    [key: string]: {
        [key: string]: string
    };
}

/**
 * 提供了表单验证的统一方法：validate()
 *
 * @author fbchen
 * @version 1.0 2016-11-26
 */
export abstract class AbstractForm {

    /** 验证结果 */
    protected formErrors = {

    };

    protected defaultValidationMessages = {
        required: '该项为必填项',
        email: '请输入有效的电子邮件',
        url: '请输入有效的网址',
        date: '请输入有效的日期',
        dateISO: '请输入有效的日期 (YYYY-MM-DD)',
        number: '请输入正确的数字',
        digits: '只可输入数字',
        alphanumeric: '只可输入字母、数字及下划线',
        maxlength: '最多 {0} 个字符',
        minlength: '最少 {0} 个字符',
        rangelength: '请输入长度为 {0} 至 {1} 之间的字符',
        range: '请输入 {0} 至 {1} 之间的数值',
        max: '请输入不大于 {0} 的数值',
        min: '请输入不小于 {0} 的数值'
    };

    constructor( @Optional() @Self() protected form: NgForm) { }

    /**
     * 验证表单，结果存入formErrors
     *
     * @param formCtrl 表单控件(NgForm)
     * @param fieldMsgs 验证控件的自定义错误消息，可选，默认采用默认错误消息。
     * @return 验证结果: true-success, false-fail
     */
    protected validateForm(formCtrl: NgForm, fieldMsgs: FieldMessages = {}): boolean {
        const formErrors = {};
        const form = formCtrl.form;

        for (const field in form.controls) {
            if (form.controls.hasOwnProperty(field)) {
                const control = form.get(field);
                const errors = control && control.errors || {};

                if (control && control.invalid && (control.dirty || formCtrl.submitted)) {
                    const messages = fieldMsgs[field] || {};
                    if (errors['required']) {
                        formErrors[field] = messages['required'] || this.defaultValidationMessages['required'];
                        continue; // 默认先验证必填消息
                    }

                    for (const key in errors) {
                        if (errors.hasOwnProperty(key)) {
                            formErrors[field] = messages[key] || this.defaultValidationMessages[key];
                            continue; // 若一个输入框存在多个验证器，即使存在多个错误消息，也仅取一条错误消息
                        }
                    }
                }
            }
        }
        this.formErrors = formErrors;
        return formCtrl.valid;
    }

    /**
     * 验证表单，结果存入formErrors
     *
     * @param fieldMsgs 验证控件的自定义错误消息，可选，默认采用默认错误消息。
     * @return 验证结果: true-success, false-fail
     */
    public validate(fieldMsgs?: FieldMessages): boolean {
        return this.validateForm(this.form, fieldMsgs);
    }

    /** 是否已submitted */
    public isSubmitted(): boolean {
        return this.form.submitted;
    }

    /**
     * 是否存在错误
     */
    public hasError(): boolean {
        for (const key in this.formErrors) {
            if (this.formErrors[key]) {
                return true;
            }
        }
        return false;
    }

    /**
     * 当存在多个错误消息时，用此方法获取其中的第一个非空错误显示
     */
    public firstError(): string {
        for (const key in this.formErrors) {
            if (this.formErrors[key]) {
                return this.formErrors[key];
            }
        }
        return null;
    }

    /**
     * 获取控件的一个错误
     *
     * @param name 控件name
     * @return 控件错误消息，或者空(没有错误)
     */
    public getError(name: string): string {
        return this.formErrors[name];
    }

}
