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

import { Circle } from './circle';
import { Progress } from './progress';

export { Circle } from './circle';
export { Progress } from './progress';


/**
 * @name ProgressModule
 * @author fbchen 2017-07-31
 */
@NgModule({
    imports: [
        CommonModule,
        IconModule
    ],
    declarations: [
        Circle,
        Progress
    ],
    exports: [
        Circle,
        Progress
    ],
    entryComponents: [

    ],
    providers: [

    ]
})
export class ProgressModule {

}
