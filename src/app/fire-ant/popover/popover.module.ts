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

import { Popover, PopoverTrgger } from './popover';
import { PopoverContent } from './popover.content';

export { Popover, PopoverTrgger } from './popover';
export { PopoverContent } from './popover.content';


/**
 * @name PopoverModule
 * @author fbchen 2017-07-31
 */
@NgModule({
    imports: [
        CommonModule
    ],
    declarations: [
        Popover,
        PopoverTrgger,
        PopoverContent
    ],
    exports: [
        Popover,
        PopoverTrgger,
        PopoverContent
    ],
    entryComponents: [
        Popover
    ],
    providers: [

    ]
})
export class PopoverModule {

}
