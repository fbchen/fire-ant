/**
 * @license
 * Copyright 厦门乾元盛世科技有限公司 All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file.
 */
import { coerceBooleanProperty, coerceNumberProperty } from '@angular/cdk/coercion';

export function isPresent(obj: any): boolean {
    return obj !== undefined && obj !== null;
}

export function isDate(obj: any): boolean {
    return !/Invalid|NaN/.test(new Date(obj).toString());
}

export function isNumeric(value: any): boolean {
    return !isNaN(value - parseFloat(value));
}


export function isEmptyArray(arr: any): boolean {
    if (Array.isArray(arr)) {
        return arr.length === 0 || arr.every(i => !i);
    }
    return false;
}

export function arrayEquals<T>(array1: T[], array2: T[]): boolean {
    if (!array1 || !array2 || array1.length !== array2.length) {
        return false;
    }

    const len = array1.length;
    for (let i = 0; i < len; i++) {
        if (array1[i] !== array2[i]) {
            return false;
        }
    }
    return true;
}

export function toArray<T>(value: T | T[]): T[] {
    let ret: T[];
    if (value === undefined || value == null) {
        ret = [];
    } else if (!Array.isArray(value)) {
        ret = [value];
    } else {
        ret = value;
    }
    return ret;
}

export function toBoolean(value: boolean | string): boolean {
  return coerceBooleanProperty(value);
}

export function toNumber<D>(value: number | string, fallback: D): number | D {
  return coerceNumberProperty(value, fallback);
}
