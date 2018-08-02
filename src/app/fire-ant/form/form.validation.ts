/**
 * @license
 * Copyright 厦门乾元盛世科技有限公司 All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file.
 */

import { Component, Input, Host, Optional, HostBinding } from '@angular/core';
import { NgControl } from '@angular/forms';
import { FormDirective } from './form.directive';
import { MessageFormater } from './message.formater';

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

@Component({
    selector: 'form-error',
    template: `
        <ng-container *ngIf="name && hasError(name)">
            <div class="error">{{getError(name)}}</div>
        </ng-container>
        <ng-container *ngIf="control && hasControlError()">
            <div class="error">{{getControlError()}}</div>
        </ng-container>
        <ng-container *ngIf="!name && !control && hasError()">
            <div class="error">{{firstError()}}</div>
        </ng-container>
    `,
    styles: [`
        :host {
            display: block;
            padding-top: 8px;
        }
    `],
    preserveWhitespaces: false
})
export class FormValidation {

    /** 控件名称 */
    @Input() name: string;

    /** 特指控件 */
    @Input() control: NgControl;

    private messageFormatter = new MessageFormater();

    constructor( @Optional() @Host() private _fire: FormDirective ) {
    }

    @HostBinding('style.display')
    get _display(): string {
        const c = this.control;
        if (this.name && this.hasError(this.name)) {
            return 'block';
        }
        if (c && c.invalid && (c.dirty || c.touched)) {
            return 'block';
        }
        if (!this.name && !this.control && this.hasError()) {
            return 'block';
        }
        return 'none';
    }

    /**
     * 是否存在错误
     */
    public hasError(name?: string): boolean {
        return this._fire.hasError(name);
    }

    /**
     * 当存在多个错误消息时，用此方法获取其中的第一个非空错误显示
     */
    public firstError(): string | null {
        return this._fire.firstError();
    }

    /**
     * 获取控件的一个错误
     *
     * @param name 控件name
     * @return 控件错误消息，或者空(没有错误)
     */
    public getError(name: string): string | null {
        return this._fire.getError(name);
    }

    /**
     * 获取控件的一个错误
     *
     * @return 控件错误消息，或者空(没有错误)
     */
    public getControlError(): string | null {
        // const messages = (this.messages && this.messages[name]) || {};
        const control = this.control;
        const errors = control && control.errors || {};
        if (control && control.invalid && (control.dirty || control.touched)) {
            return this.messageFormatter.getMessage(errors, {});
        }
        return null;
    }

    /**
     * 判断控件是否有错误
     */
    public hasControlError(): boolean {
        const errors = this.control && this.control.errors;
        return errors && Object.keys(errors).length > 0;
    }

}
