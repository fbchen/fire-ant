/**
 * @license
 * Copyright 厦门乾元盛世科技有限公司 All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file.
 */

import { Pipe, PipeTransform } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';

/**
 * Safe Html Pipe
 *
 * @author fbchen
 * @version 1.0 2017-09-01
 */
@Pipe({ name: 'safeHtml' })
export class SafeHtmlPipe implements PipeTransform {

    constructor(private sanitized: DomSanitizer) { }

    transform(value) {
        return this.sanitized.bypassSecurityTrustHtml(value);
    }

}
