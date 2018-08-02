/**
 * @license
 * Copyright 厦门乾元盛世科技有限公司 All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file.
 */

// Import Angular
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { Breadcrumb } from './breadcrumb';
import { BreadcrumbItem } from './breadcrumb.item';

export { Breadcrumb } from './breadcrumb';
export { BreadcrumbItem } from './breadcrumb.item';


/**
 * @name BreadcrumbModule
 * @author fbchen 2017-07-31
 */
@NgModule({
    imports: [
        CommonModule
    ],
    declarations: [
        Breadcrumb,
        BreadcrumbItem,
    ],
    exports: [
        Breadcrumb,
        BreadcrumbItem,
    ],
    entryComponents: [

    ],
    providers: [

    ]
})
export class BreadcrumbModule {

}
