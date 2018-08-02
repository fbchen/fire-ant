/**
 * @license
 * Copyright 厦门乾元盛世科技有限公司 All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file.
 */
import { Directive, forwardRef } from '@angular/core';
import { Validator, AbstractControl, ValidatorFn, NG_VALIDATORS } from '@angular/forms';


// 坏字符
const regEn = /[`~!@#$%^&*()_+<>?:"{},.\/;'[\]]/i;
const regCn = /[·！#￥（——）：；“”‘、，|《。》？、【】[\]…]/i;

/**
 * Provider which adds {@link badCharValidator} to {@link NG_VALIDATORS}.
 *
 * ## Example:
 *
 * {@example common/forms/ts/validators/validators.ts region='max'}
 */
export const BAD_CHAR_VALIDATOR: any = {
    provide: NG_VALIDATORS,
    useExisting: forwardRef(() => BadCharValidatorDirective),
    multi: true
};

/**
 * BadChar验证
 */
export function badCharValidator(): ValidatorFn {
    return (control: AbstractControl): { [key: string]: any } => {
        const value = control.value;
        if (!value) { // 为空时不验证合法性
            return null;
        }
        const bad = regEn.test(value) || regCn.test(value);
        return bad ? { 'badChar': { value } } : null;
    };
}


/**
 * BadChar验证
 *
 * @author fbchen
 * @version 1.0 2016-12-02
 */
@Directive({
    selector: '[badChar][formControlName],[badChar][formControl],[badChar][ngModel]',
    providers: [BAD_CHAR_VALIDATOR],
})
export class BadCharValidatorDirective implements Validator {

    private validateAt = badCharValidator();

    /**
     * 验证控件
     */
    validate(control: AbstractControl): { [key: string]: any } {
        return this.validateAt(control);
    }

}
