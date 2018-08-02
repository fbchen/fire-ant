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

import { Badge } from './badge';
import { ScrollNumber } from './scroll.number';

export { Badge } from './badge';
export { ScrollNumber } from './scroll.number';


/**
 * @name BadgeModule
 * @author fbchen 2017-07-31
 */
@NgModule({
    imports: [
        CommonModule
    ],
    declarations: [
        Badge,
        ScrollNumber,
    ],
    exports: [
        Badge,
        ScrollNumber,
    ],
    entryComponents: [

    ],
    providers: [

    ]
})
export class BadgeModule {

}
