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

import { Steps } from './steps';
import { Step } from './step';

export { Steps } from './steps';
export { Step } from './step';


/**
 * @name StepsModule
 * @author fbchen 2017-07-31
 */
@NgModule({
    imports: [
        CommonModule
    ],
    declarations: [
        Steps,
        Step
    ],
    exports: [
        Steps,
        Step
    ],
    entryComponents: [

    ],
    providers: [

    ]
})
export class StepsModule {

}
