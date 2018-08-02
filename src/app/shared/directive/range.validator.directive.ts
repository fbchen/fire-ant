/**
 * @license
 * Copyright 厦门乾元盛世科技有限公司 All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file.
 */

import { Input } from '@angular/core';
import { FormControl, ValidatorFn, Validators } from '@angular/forms';
import { isPresent } from '../utils/lang';

/**
 * 数字大小验证
 */
export function numberValidator(prms: { min?: number, max?: number } = {}): ValidatorFn {
    return (control: FormControl): { [key: string]: any } => {
        if (isPresent(Validators.required(control))) {
            return null;
        }

        let min: number, max: number;
        const value: number = +control.value;
        if (isNaN(value)) {
            return { 'number': { value } };
        }
        if (!isNaN(prms.min) && value < (min = +prms.min)) {
            return { 'number': { value, min } };
        }
        if (!isNaN(prms.max) && value > (max = +prms.max)) {
            return { 'number': { value, max } };
        }
        return null;
    };
}


import { Directive } from '@angular/core';
import { Validator, NG_VALIDATORS } from '@angular/forms';

/**
 * 数字大小验证
 *
 * @author fbchen
 * @version 1.0 2016-12-02
 */
@Directive({
    selector: '[max],[min]',
    providers: [{ provide: NG_VALIDATORS, useExisting: RangeValidatorDirective, multi: true }]
})
export class RangeValidatorDirective implements Validator {

    @Input() max: number;
    @Input() min: number;

    /**
     * 验证控件
     */
    validate(control: FormControl): { [key: string]: any } {
        return numberValidator({ min: this.min, max: this.max })(control);
    }

}
