/**
 * @license
 * Copyright 厦门乾元盛世科技有限公司 All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file.
 */


import { Component, ViewEncapsulation } from '@angular/core';

@Component({
    selector: 'form-help',
    template: `<ng-content></ng-content>`,
    styleUrls: ['./style/form-help.scss'],
    preserveWhitespaces: false,
    encapsulation: ViewEncapsulation.None
})
export class FormHelp {

    constructor() {

    }

}

