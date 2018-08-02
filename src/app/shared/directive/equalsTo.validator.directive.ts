/**
 * @license
 * Copyright 厦门乾元盛世科技有限公司 All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file.
 */
import { Directive, Input, OnInit, forwardRef } from '@angular/core';
import { FormControl, Validator, AbstractControl, ValidatorFn, ValidationErrors, NG_VALIDATORS } from '@angular/forms';


/**
 * Provider which adds {@link EqualsToValidator} to {@link NG_VALIDATORS}.
 *
 * ## Example:
 *
 * {@example common/forms/ts/validators/validators.ts region='max'}
 */
export const EQUALS_TO_VALIDATOR: any = {
    provide: NG_VALIDATORS,
    useExisting: forwardRef(() => EqualsToValidator),
    multi: true
};


/**
 * 验证
 */
export function equalsTo(equalControl: AbstractControl): ValidatorFn {
    let subscribe = false;

    return (control: AbstractControl): { [key: string]: boolean } => {
        if (!subscribe) {
            subscribe = true;
            equalControl.valueChanges.subscribe(() => {
                control.updateValueAndValidity();
            });
        }

        const value = control.value;
        return equalControl.value === value ? null : { equalsTo: true };
    };
}


/**
 * A directive which installs for any `formControlName,
 * `formControl`,
 * or control with `ngModel` that also has a `equalsTo` attribute.
 *
 * @stable
 */
@Directive({
    selector: '[equalsTo][formControlName],[equalsTo][formControl],[equalsTo][ngModel]',
    providers: [EQUALS_TO_VALIDATOR]
})
export class EqualsToValidator implements Validator, OnInit {
    private validator: ValidatorFn;

    @Input() equalsTo: FormControl;

    ngOnInit() {
        this.validator = equalsTo(this.equalsTo);
    }

    validate(c: AbstractControl): ValidationErrors | null {
        return this.equalsTo != null ? this.validator(c) : null;
    }

}
