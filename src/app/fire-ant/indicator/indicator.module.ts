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

import { PasswordIndicator } from './password.indicator';


@NgModule({
    imports: [
        CommonModule
    ],
    declarations: [
        PasswordIndicator
    ],
    exports: [
        PasswordIndicator
    ],
    entryComponents: [

    ],
    providers: [

    ]
})
export class IndicatorModule {

}
