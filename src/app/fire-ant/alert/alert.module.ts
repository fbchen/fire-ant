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

import { Alert } from './alert';

export { Alert } from './alert';


/**
 * @name AlertModule
 * @author fbchen 2017-07-31
 */
@NgModule({
    imports: [
        CommonModule,
        IconModule
    ],
    declarations: [
        Alert
    ],
    exports: [
        Alert
    ],
    entryComponents: [

    ],
    providers: [

    ]
})
export class AlertModule {

}
