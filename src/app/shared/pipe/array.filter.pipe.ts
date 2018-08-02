/**
 * @license
 * Copyright 厦门乾元盛世科技有限公司 All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file.
 */

import { Pipe, PipeTransform } from '@angular/core';

/**
 * 数组过滤(提供function)
 *
 * @author fbchen
 * @version 1.0 2016-12-06
 */
@Pipe({ name: 'arrayfilter' })
export class ArrayFilterPipe implements PipeTransform {

    transform(array: Array<any>, fn: (value: any, index: number, array: any[]) => boolean): any {
        return array ? array.filter(fn) : array;
    }

}
