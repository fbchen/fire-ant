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
import { OverlayModule } from '@angular/cdk/overlay';

import { PopoverDirective } from './popover.directive';
import { PopoverComponent } from './popover.component';

export { PopoverDirective } from './popover.directive';
export { PopoverComponent } from './popover.component';


/**
 * @name Popover2Module
 * @author fbchen 2017-07-31
 */
@NgModule({
    imports: [
        CommonModule,
        OverlayModule
    ],
    declarations: [
        PopoverComponent,
        PopoverDirective
    ],
    exports: [
        PopoverComponent,
        PopoverDirective
    ],
    entryComponents: [

    ],
    providers: [

    ]
})
export class Popover2Module {

}
