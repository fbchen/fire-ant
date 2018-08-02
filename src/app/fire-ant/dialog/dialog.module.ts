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

import { IconModule } from '../icon/icon.module';

import { Dialog } from './dialog';
import { Layer } from './layer';

export { Dialog } from './dialog';
export { Layer } from './layer';


/**
 * @name DialogModule
 * @author fbchen 2017-07-31
 */
@NgModule({
    imports: [
        CommonModule,
        IconModule
    ],
    declarations: [
        Dialog
    ],
    exports: [
        Dialog
    ],
    entryComponents: [
        Dialog
    ],
    providers: [
        Layer
    ]
})
export class DialogModule {

}
