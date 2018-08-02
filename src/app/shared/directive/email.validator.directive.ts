/**
 * @license
 * Copyright 厦门乾元盛世科技有限公司 All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file.
 */
import { Directive, forwardRef } from '@angular/core';
import { Validator, AbstractControl, ValidatorFn, NG_VALIDATORS } from '@angular/forms';


// tslint:disable-next-line:max-line-length
const EMAIL_REGEX = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

/**
 * Provider which adds {@link emailValidator} to {@link NG_VALIDATORS}.
 *
 * ## Example:
 *
 * {@example common/forms/ts/validators/validators.ts region='max'}
 */
export const EMAIL_VALIDATOR: any = {
    provide: NG_VALIDATORS,
    useExisting: forwardRef(() => EmailValidatorDirective),
    multi: true
};

/**
 * Email验证
 */
export function emailValidator(): ValidatorFn {
    return (control: AbstractControl): { [key: string]: any } => {
        const value = control.value;
        if (!value) { // 为空时不验证合法性
            return null;
        }
        const valid = EMAIL_REGEX.test(value);
        return !valid ? { 'email': { value } } : null;
    };
}


/**
 * Email验证
 *
 * @author fbchen
 * @version 1.0 2016-12-02
 */
@Directive({
    selector: '[email][formControlName],[email][formControl],[email][ngModel]'
        + '[type=email][formControlName],[type=email][formControl],[type=email][ngModel]',
    providers: [EMAIL_VALIDATOR],
})
export class EmailValidatorDirective implements Validator {

    private validateAt = emailValidator();

    /**
     * 验证控件
     */
    validate(control: AbstractControl): { [key: string]: any } {
        return this.validateAt(control);
    }

}
