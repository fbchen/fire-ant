/**
 * @license
 * Copyright 厦门乾元盛世科技有限公司 All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file.
 */
import { Directive, forwardRef } from '@angular/core';
import { Validator, AbstractControl, ValidatorFn, NG_VALIDATORS } from '@angular/forms';

import { isPrice } from '../utils/lang';

/**
 * Provider which adds {@link priceValidator} to {@link NG_VALIDATORS}.
 *
 * ## Example:
 *
 * {@example common/forms/ts/validators/validators.ts region='max'}
 */
export const PRICE_VALIDATOR: any = {
    provide: NG_VALIDATORS,
    useExisting: forwardRef(() => PriceValidatorDirective),
    multi: true
};

/**
 * 验证函数
 */
export function priceValidator(): ValidatorFn {
    return (control: AbstractControl): { [key: string]: any } => {
        const value = control.value;
        if (!value) { // 为空或者0时，不验证合法性
            return null;
        }

        let valid = true;
        if (typeof value === 'string') {
            valid = /^[\d]+(\.[\d]{1,2})?$/.test(value);
        }
        if (typeof value === 'number') {
            valid = isPrice(value);
        }

        return !valid ? { 'price': { value } } : null;
    };
}


/**
 * 价格格式验证：最多包含2位小数
 *
 * @author fbchen
 * @version 1.0 2016-12-02
 */
@Directive({
    selector: '[faPrice][formControlName],[faPrice][formControl],[faPrice][ngModel]',
    providers: [PRICE_VALIDATOR]
})
export class PriceValidatorDirective implements Validator {

    private validateAt = priceValidator();

    /**
     * 验证控件
     */
    validate(control: AbstractControl): { [key: string]: any } {
        return this.validateAt(control);
    }

}
