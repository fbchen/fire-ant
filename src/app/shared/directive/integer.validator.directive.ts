/**
 * @license
 * Copyright 厦门乾元盛世科技有限公司 All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file.
 */
import { Directive, forwardRef } from '@angular/core';
import { Validator, AbstractControl, ValidatorFn, NG_VALIDATORS } from '@angular/forms';

import { isInteger } from '../utils/lang';

/**
 * Provider which adds {@link integerValidator} to {@link NG_VALIDATORS}.
 *
 * ## Example:
 *
 * {@example common/forms/ts/validators/validators.ts region='max'}
 */
export const INTEGER_VALIDATOR: any = {
    provide: NG_VALIDATORS,
    useExisting: forwardRef(() => IntegerValidatorDirective),
    multi: true
};

/**
 * 验证函数
 */
export function integerValidator(): ValidatorFn {
    return (control: AbstractControl): { [key: string]: any } => {
        const value = control.value;
        if (!value) { // 为空或者0时，不验证合法性
            return null;
        }

        let valid = true;
        if (typeof value === 'string') {
            valid = /^\d+$/.test(value);
        }
        if (typeof value === 'number') {
            valid = isInteger(value);
        }

        return !valid ? { 'integer': { value } } : null;
    };
}


/**
 * 整数验证
 *
 * @author fbchen
 * @version 1.0 2016-12-02
 */
@Directive({
    selector: '[faInteger][formControlName],[faInteger][formControl],[faInteger][ngModel]',
    providers: [INTEGER_VALIDATOR]
})
export class IntegerValidatorDirective implements Validator {

    private validateAt = integerValidator();

    /**
     * 验证控件
     */
    validate(control: AbstractControl): { [key: string]: any } {
        return this.validateAt(control);
    }

}
