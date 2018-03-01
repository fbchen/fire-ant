/**
 * @license
 * Copyright 厦门乾元盛世科技有限公司 All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file.
 */

import { Optional, Self, Input } from '@angular/core';
import { NgForm } from '@angular/forms';


import { FieldMessage, FieldMessages, MessageFormater } from './message.formater';

/**
 * 提供了表单验证的统一方法：validate()
 *
 * @author fbchen
 * @version 1.0 2016-11-26
 */
export abstract class AbstractForm {

    /** 自定义错误消息 */
    @Input() messages: FieldMessages = {};

    /** 验证结果，例如: [{username: '必须填写'}, {password: '输入非法'}] */
    protected formErrors: FieldMessage[] = [];

    private messageFormatter = new MessageFormater();

    constructor( @Optional() @Self() protected form: NgForm) {
        form.ngSubmit.subscribe(this.onSubmit.bind(this));
    }

    /** Form验证后，自动执行消息提示匹配 */
    onSubmit(): void {
        this.validate();
    }


    public validateControl(name: string): void {
        this.formErrors = this.formErrors.filter(e => e.name !== name);
        const control = this.form.controls[name];

        const errors = control && control.errors || {};
        if (control && control.invalid && (control.dirty || this.form.submitted)) {
            const messages = (this.messages && this.messages[name]) || {};
            const message = this.messageFormatter.getMessage(errors, messages);
            this.formErrors.push({ name, message });
        }
    }

    validateControlOnDirty(name: string): void {
        const c = this.form.controls[name];
        if (c && ((c.dirty && c.touched) || this.isSubmitted())) {
            this.validateControl(name);
        }
    }

    /**
     * 验证表单，结果存入formErrors
     *
     * @return 验证结果: true-success, false-fail
     */
    public validate(): boolean {
        const form: NgForm = this.form;
        for (const name in form.controls) {
            if (form.controls.hasOwnProperty(name)) {
                this.validateControl(name);
            }
        }
        return form.valid;
    }

    /** 是否已submitted */
    public isSubmitted(): boolean {
        return this.form.submitted;
    }

    /**
     * 是否存在错误
     *
     * @param name 指定控件的名称，可选。若为空则检查表单是否存在错误。
     */
    public hasError(name?: string): boolean {
        if (name) {
            // 对控件单独校验
            this.validateControlOnDirty(name);
            return this.getError(name) !== null;
        }
        return this.formErrors.length > 0;
    }

    /**
     * 当存在多个错误消息时，用此方法获取其中的第一个非空错误显示
     */
    public firstError(): string | null {
        const err = this.formErrors[0];
        return (err && err.message) || null;
    }

    /**
     * 获取控件的一个错误
     *
     * @param name 控件name
     * @return 控件错误消息，或者空(没有错误)
     */
    public getError(name: string): string | null {
        const err = this.formErrors.find(e => e.name === name);
        return (err && err.message) || null;
    }


}
