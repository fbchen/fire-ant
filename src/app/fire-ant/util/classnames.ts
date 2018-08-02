/**
 * @license
 * Copyright 厦门乾元盛世科技有限公司 All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file.
 */

const hasOwn = {}.hasOwnProperty;

/**
 * 将字符串、数字、数字、map形式的样式，转换为string格式的字符串
 */
export function classnames(..._arguments: any[]): string {
    const classes: any[] = [];

    for (let i = 0; i < _arguments.length; i++) {
        const arg = _arguments[i];
        if (!arg) {
            continue;
        }

        const argType = typeof arg;

        if (argType === 'string' || argType === 'number') {
            classes.push(arg);
        } else if (Array.isArray(arg)) {
            classes.push(classnames.apply(null, arg));
        } else if (argType === 'object') {
            for (const key in arg) {
                if (hasOwn.call(arg, key) && arg[key]) {
                    classes.push(key);
                }
            }
        }
    }

    return classes.join(' ');
}

/** 替换样式 */
export function replaceClass(el: HTMLElement, newClass: any, oldClass?: any): void {
    const oldcls = classnames(oldClass);
    const newcls = classnames(newClass);
    if (oldcls === newcls) {
        return;
    }

    if (oldcls) {
        el.classList.remove(...oldcls.split(' '));
    }
    if (newcls) {
        el.classList.add(...newcls.split(' '));
    }
}
