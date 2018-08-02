/**
 * @license
 * Copyright 厦门乾元盛世科技有限公司 All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file.
 */

import { Component, TemplateRef, ViewEncapsulation } from '@angular/core';

@Component({
    selector: 'ant-tree-menu-container',
    template: `
        <ng-template [ngTemplateOutlet]="menu"></ng-template>
    `,
    preserveWhitespaces: false,
    encapsulation: ViewEncapsulation.None,
})
export class TreeMenuContainer {

    constructor(public menu: TemplateRef<any>) {

    }

}
