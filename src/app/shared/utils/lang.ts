/**
 * @license
 * Copyright 厦门乾元盛世科技有限公司 All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file.
 */

export function isPresent(obj: any): boolean {
    return obj !== undefined && obj !== null;
}

export function isDate(obj: any): boolean {
    return !/Invalid|NaN/.test(new Date(obj).toString());
}

export function isNumeric(value: any): boolean {
    return !isNaN(value - parseFloat(value));
}

/** 任何整数都会被1整除，即余数是0。利用这个规则来判断是否是整数 */
export function isInteger(value: number): boolean {
    if (typeof value !== 'number' || isNaN(value)) {
        return false;
    }
    return value % 1 === 0;
}

/** 是否金额 */
export function isPrice(value: number): boolean {
    if (typeof value !== 'number' || isNaN(value)) {
        return false;
    }
    const re = /^[\d]+(\.[\d]{1,2})?$/; // 金额格式
    if (!re.test(value + '')) {
        return false;
    }
    return true;
}

export function isEmptyArray(arr: any): boolean {
    if (Array.isArray(arr)) {
        return arr.length === 0 || arr.every(i => !i);
    }
    return false;
}

export function arrayEquals(array1: any[], array2: any[]): boolean {
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

export function toArray(value: any): any[] {
    let ret = value;
    if (value === undefined || value === null) {
        ret = [];
    } else if (!Array.isArray(value)) {
        ret = [value];
    }
    return ret;
}


export function toArrayBuffer(binary: any): ArrayBuffer {
    const length = binary.length;
    const buf = new ArrayBuffer(length);
    const arr = new Uint8Array(buf);
    for (let i = 0; i < length; i++) {
        arr[i] = binary.charCodeAt(i);
    }
    return buf;
}
