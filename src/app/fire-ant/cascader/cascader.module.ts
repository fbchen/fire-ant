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
import { OverlayModule } from '@angular/cdk/overlay';

import { IconModule } from '../icon/icon.module';
import { InputModule } from '../input/input.module';

import { Cascader } from './cascader';

export { Cascader } from './cascader';


/**
 * @name CascaderModule
 * @author fbchen 2017-07-31
 */
@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        OverlayModule,
        IconModule,
        InputModule
    ],
    declarations: [
        Cascader
    ],
    exports: [
        Cascader
    ],
    entryComponents: [

    ],
    providers: [

    ]
})
export class CascaderModule {

}
