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

import { Table } from './table';
import { TableHeader } from './table.header';
import { TableFooter } from './table.footer';
import { TableContent } from './table.content';
import { TableContentHeader } from './table.content.header';
import { TableContentBody } from './table.content.body';

export { Table } from './table';
export { TableHeader } from './table.header';
export { TableFooter } from './table.footer';
export { TableContent } from './table.content';
export { TableContentHeader } from './table.content.header';
export { TableContentBody } from './table.content.body';


/**
 * @name TableModule
 * @author fbchen 2017-07-31
 */
@NgModule({
    imports: [
        CommonModule
    ],
    declarations: [
        Table,
        TableHeader,
        TableFooter,
        TableContent,
        TableContentBody,
        TableContentHeader,
    ],
    exports: [
        Table,
        TableHeader,
        TableFooter,
        TableContent,
        TableContentBody,
        TableContentHeader,
    ],
    entryComponents: [

    ],
    providers: [

    ]
})
export class TableModule {

}
