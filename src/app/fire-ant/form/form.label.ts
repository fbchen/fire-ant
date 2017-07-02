/**
 * @license
 * Copyright 厦门乾元盛世科技有限公司 All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file.
 */


import { Component, ViewEncapsulation } from '@angular/core';

@Component({
    selector: 'form-label',
    template: `<ng-content></ng-content>`,
    encapsulation: ViewEncapsulation.None
})
export class FormLabel {

    constructor() {

    }

}

