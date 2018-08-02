/**
 * @license
 * Copyright 厦门乾元盛世科技有限公司 All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file.
 */
import { Directive, Input, OnChanges, SimpleChanges, forwardRef } from '@angular/core';
import { Validator, AbstractControl, ValidatorFn, ValidationErrors, NG_VALIDATORS } from '@angular/forms';
import * as moment from 'moment';


/**
 * Provider which adds {@link MaxDateValidator} to {@link NG_VALIDATORS}.
 *
 * ## Example:
 *
 * {@example common/forms/ts/validators/validators.ts region='max'}
 */
export const MAX_DATE_VALIDATOR: any = {
    provide: NG_VALIDATORS,
    useExisting: forwardRef(() => MaxDateValidator),
    multi: true
};


/**
 * 最大日期限制
 */
export function maxDateValidator(maxDate: Date): ValidatorFn {
    return (control: AbstractControl): { [key: string]: any } => {
        const value = control.value;
        if (!value) { // 为空时不验证合法性
            return null;
        }

        const dateValue = moment(value);
        if (!dateValue.isValid()) {
            return null; // 无效日期值不验证
        }

        return dateValue.isAfter(maxDate, 'day') ? {
            'maxDate': {
                'max': moment(maxDate).format('YYYY-MM-DD'),
                'actual': dateValue.format('YYYY-MM-DD')
            }
        } : null;
    };
}


/**
 * A directive which installs the {@link MaxDateValidator} for any `formControlName,
 * `formControl`,
 * or control with `ngModel` that also has a `maxDate` attribute.
 *
 * @stable
 */
@Directive({
    selector: '[maxDate][formControlName],[maxDate][formControl],[maxDate][ngModel]',
    providers: [MAX_DATE_VALIDATOR]
})
export class MaxDateValidator implements Validator, OnChanges {
    private _validator: ValidatorFn;
    private _onChange: () => void;

    @Input() maxDate: Date;

    ngOnChanges(changes: SimpleChanges): void {
        if ('maxDate' in changes) {
            this._createValidator();
            if (this._onChange) {
                this._onChange();
            }
        }
    }

    validate(c: AbstractControl): ValidationErrors | null {
        return this.maxDate != null ? this._validator(c) : null;
    }

    registerOnValidatorChange(fn: () => void): void { this._onChange = fn; }

    private _createValidator(): void {
        this._validator = maxDateValidator(this.maxDate);
    }
}
