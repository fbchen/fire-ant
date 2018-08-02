/**
 * @license
 * Copyright 厦门乾元盛世科技有限公司 All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file.
 */
import { Directive, forwardRef } from '@angular/core';
import { Validator, AbstractControl, ValidatorFn, NG_VALIDATORS } from '@angular/forms';


const IDENTITY_REGEX = /^[1-9]\d{5}[1-9]\d{3}((0\d)|(1[0-2]))(([0|1|2]\d)|3[0-1])\d{4}$/;

/**
 * Provider which adds {@link identityValidator} to {@link NG_VALIDATORS}.
 *
 * ## Example:
 *
 * {@example common/forms/ts/validators/validators.ts region='max'}
 */
export const IDENTITY_VALIDATOR: any = {
    provide: NG_VALIDATORS,
    useExisting: forwardRef(() => IdentityValidatorDirective),
    multi: true
};

/**
 * 假设身份证的长度为18位，且格式符合要求，还需要对最后一位的验证码进行验证
 *
 * @param id 身份证号码
 */
function verifyId(id: string): boolean {
    const i01 = parseInt(id.substr(0, 1), 10) * 7;
    const i02 = parseInt(id.substr(1, 1), 10) * 9;
    const i03 = parseInt(id.substr(2, 1), 10) * 10;
    const i04 = parseInt(id.substr(3, 1), 10) * 5;
    const i05 = parseInt(id.substr(4, 1), 10) * 8;
    const i06 = parseInt(id.substr(5, 1), 10) * 4;
    const i07 = parseInt(id.substr(6, 1), 10) * 2;
    const i08 = parseInt(id.substr(7, 1), 10) * 1;
    const i09 = parseInt(id.substr(8, 1), 10) * 6;
    const i10 = parseInt(id.substr(9, 1), 10) * 3;
    const i11 = parseInt(id.substr(10, 1), 10) * 7;
    const i12 = parseInt(id.substr(11, 1), 10) * 9;
    const i13 = parseInt(id.substr(12, 1), 10) * 10;
    const i14 = parseInt(id.substr(13, 1), 10) * 5;
    const i15 = parseInt(id.substr(14, 1), 10) * 8;
    const i16 = parseInt(id.substr(15, 1), 10) * 4;
    const i17 = parseInt(id.substr(16, 1), 10) * 2;
    const imod = (i01 + i02 + i03 + i04 + i05 + i06 + i07 + i08 + i09 + i10 + i11 + i12 + i13 + i14 + i15 + i16 + i17) % 11;

    let code = null;
    switch (imod) {
        case 1: code = '0'; break;
        case 2: code = 'X'; break;
        case 3: code = '9'; break;
        case 4: code = '8'; break;
        case 5: code = '7'; break;
        case 6: code = '6'; break;
        case 7: code = '5'; break;
        case 8: code = '4'; break;
        case 9: code = '3'; break;
        case 10: code = '2'; break;
    }

    return id.substr(17, 1) === code;
}

/**
 * 身份证号码验证
 */
export function identityValidator(): ValidatorFn {
    return (control: AbstractControl): { [key: string]: any } => {
        const value = control.value;
        if (!value) { // 为空时不验证合法性
            return null;
        }

        let valid = IDENTITY_REGEX.test(value);
        if (valid) {
            valid = verifyId(value);
        }

        return !valid ? { 'identity': { value } } : null;
    };
}


/**
 * 身份证号码验证
 *
 * @author fbchen
 * @version 1.0 2016-12-02
 */
@Directive({
    selector: '[identity][formControlName],[identity][formControl],[identity][ngModel]',
    providers: [IDENTITY_VALIDATOR],
})
export class IdentityValidatorDirective implements Validator {

    private validateAt = identityValidator();

    /**
     * 验证控件
     */
    validate(control: AbstractControl): { [key: string]: any } {
        return this.validateAt(control);
    }

}
