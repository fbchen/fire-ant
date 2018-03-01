/**
 * @license
 * Copyright 厦门乾元盛世科技有限公司 All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file.
 */

import { isPresent } from '../util/lang';
import { StringUtils } from '../util/string.utils';


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

export interface FieldMessage {
    name: string;
    message: string;
}

/**
 * 消息转换
 */
export class MessageFormater {

    private readonly defaultValidationMessages = {
        required: '该项为必填项',
        email: '请输入有效的电子邮件',
        url: '请输入有效的网址',
        date: '请输入有效的日期',
        dateISO: '请输入有效的日期 (YYYY-MM-DD)',
        number: '请输入正确的数字',
        integer: '只可输入整数',
        digits: '只可输入数字',
        price: '金额格式不正确',
        alphanumeric: '只可输入字母、数字及下划线',
        identity: '请输入有效的居民身份证号码',
        maxlength: '最多 {0} 个字符',
        minlength: '最少 {0} 个字符',
        rangelength: '请输入长度为 {0} 至 {1} 之间的字符',
        range: '请输入 {0} 至 {1} 之间的数值',
        max: '请输入不大于 {0} 的数值',
        min: '请输入不小于 {0} 的数值',
        pattern: '输入数据的格式不符合要求',
        phoneNumber: '手机号码格式不正确',
        maxhanzi: '最多 {0} 个中文字符',
        maxDate: '请输入不大于 {0} 的日期',
        minDate: '请输入不小于 {0} 的日期',
        badChar: '输入值包含非法字符'
    };

    // 错误排序
    private sortedErrorNames = ['required', 'number', 'min', 'max', 'pattern'];

    constructor( ) {
    }

    // 对错误提示进行格式化（用实际值替换占位符）
    _formatError(msg: string, key: string, e: any): string {
        if (key === 'maxlength' || key === 'minlength') {
            return StringUtils.format(msg, e.requiredLength, e.actualLength);
        }
        if (key === 'maxhanzi') {
            return StringUtils.format(msg, e.requiredLength, e.actualLength);
        }
        if (key === 'min') {
            return StringUtils.format(msg, e.min, e.actual);
        }
        if (key === 'max') {
            return StringUtils.format(msg, e.max, e.actual);
        }
        if (key === 'minDate') {
            return StringUtils.format(msg, e.min, e.actual);
        }
        if (key === 'maxDate') {
            return StringUtils.format(msg, e.max, e.actual);
        }
        if (key === 'range' || key === 'rangelength') {
            return StringUtils.format(msg, e.min, e.max, e.actual);
        }
        if (key === 'number') {
            if (isPresent(e['max'])) {
                msg = this.defaultValidationMessages.max;
                return StringUtils.format(msg, e.max, e.actual);
            }
            if (isPresent(e['min'])) {
                msg = this.defaultValidationMessages.min;
                return StringUtils.format(msg, e.min, e.actual);
            }
        }
        return msg;
    }

    /**
     * 获取第一个错误消息
     *
     * @param errors 控件的实际错误
     * @param messages 客户化的错误消息
     */
    public getMessage(errors: {[key: string]: any}, messages: {[key: string]: string}): string {
        let fieldError: string = null;

        const foundError = this.sortedErrorNames.some((key: string): boolean => {
            if (errors.hasOwnProperty(key) && errors[key]) {
                const raw = messages[key] || this.defaultValidationMessages[key];
                fieldError = this._formatError(raw, key, errors[key]);
                return true;
            }
        });
        if (!foundError) {
            for (const key in errors) {
                if (errors.hasOwnProperty(key)) {
                    const raw = messages[key] || this.defaultValidationMessages[key];
                    fieldError = this._formatError(raw, key, errors[key]);
                    break; // 若一个输入框存在多个验证器，即使存在多个错误消息，也仅取一条错误消息
                }
            }
        }

        return fieldError;
    }

}
