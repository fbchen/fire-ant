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
import { OverlayModule as CDKOverlayModule } from '@angular/cdk/overlay';

import { OverlayComponent } from './overlay.component';

export { OverlayComponent } from './overlay.component';


/**
 * @name OverlayModule
 * @author fbchen 2017-07-31
 */
@NgModule({
    imports: [
        CommonModule,
        CDKOverlayModule
    ],
    declarations: [
        OverlayComponent
    ],
    exports: [
        OverlayComponent
    ],
    entryComponents: [

    ],
    providers: [

    ]
})
export class OverlayModule {

}
