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
import { FormsModule } from '@angular/forms';

import { SelectModule } from '../select/select.module';

import { Pagination } from './pagination';

export { Pagination } from './pagination';



/**
 * @name PaginationModule
 * @author fbchen 2017-07-31
 */
@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        SelectModule
    ],
    declarations: [
        Pagination
    ],
    exports: [
        Pagination
    ],
    entryComponents: [

    ],
    providers: [

    ]
})
export class PaginationModule {

}
