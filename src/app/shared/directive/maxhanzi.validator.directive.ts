/**
 * @license
 * Copyright 厦门乾元盛世科技有限公司 All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file.
 */
import { Directive, Input, OnChanges, SimpleChanges, forwardRef } from '@angular/core';
import { Validator, AbstractControl, ValidatorFn, ValidationErrors, NG_VALIDATORS } from '@angular/forms';


/**
 * Provider which adds {@link MaxHanziValidator} to {@link NG_VALIDATORS}.
 *
 * ## Example:
 *
 * {@example common/forms/ts/validators/validators.ts region='max'}
 */
export const MAX_HANZI_VALIDATOR: any = {
    provide: NG_VALIDATORS,
    useExisting: forwardRef(() => MaxHanziValidator),
    multi: true
};


/**
 * 计算字符串的字节长度，其中汉字等双字节字符=2×字节
 *
 * @param str 字符串
 */
function getActaulLength(str: string): number {
    const m = str.match(/[^\x00-\xff]/ig);
    return str.length + (m == null ? 0 : m.length);
}

/**
 * 最大中文字符个数验证
 */
export function maxHanziValidator(max: number): ValidatorFn {
    return (control: AbstractControl): { [key: string]: any } => {
        const value = control.value;
        if (!value) { // 为空时不验证合法性
            return null;
        }
        const length = getActaulLength(value) / 2;
        return length > max ? { 'maxhanzi': { 'requiredLength': max, 'actualLength': length } } : null;
    };
}


/**
 * A directive which installs the {@link MaxHanziValidator} for any `formControlName,
 * `formControl`,
 * or control with `ngModel` that also has a `maxhanzi` attribute.
 *
 * @stable
 */
@Directive({
    selector: '[maxhanzi][formControlName],[maxhanzi][formControl],[maxhanzi][ngModel]',
    providers: [MAX_HANZI_VALIDATOR],
    // tslint:disable-next-line:use-host-property-decorator
    host: { '[attr.maxhanzi]': 'maxhanzi ? maxhanzi : null' }
})
export class MaxHanziValidator implements Validator, OnChanges {
    private _validator: ValidatorFn;
    private _onChange: () => void;

    @Input() maxhanzi: string;

    ngOnChanges(changes: SimpleChanges): void {
        if ('maxhanzi' in changes) {
            this._createValidator();
            if (this._onChange) {
                this._onChange();
            }
        }
    }

    validate(c: AbstractControl): ValidationErrors | null {
        return this.maxhanzi != null ? this._validator(c) : null;
    }

    registerOnValidatorChange(fn: () => void): void { this._onChange = fn; }

    private _createValidator(): void {
        this._validator = maxHanziValidator(parseInt(this.maxhanzi, 10));
    }
}
