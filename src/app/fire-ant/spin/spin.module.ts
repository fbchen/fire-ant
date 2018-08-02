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
import { ObserversModule } from '@angular/cdk/observers';

import { Spin } from './spin';

export { Spin } from './spin';


/**
 * @name SpinModule
 * @author fbchen 2017-07-31
 */
@NgModule({
    imports: [
        CommonModule,
        ObserversModule
    ],
    declarations: [
        Spin
    ],
    exports: [
        Spin
    ],
    entryComponents: [

    ],
    providers: [

    ]
})
export class SpinModule {

}
