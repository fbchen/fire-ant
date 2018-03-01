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

import { Radio } from './radio';
import { RadioGroup } from './radio.group';

export { Radio } from './radio';
export { RadioGroup } from './radio.group';


/**
 * @name RadioModule
 * @author fbchen 2017-07-31
 */
@NgModule({
    imports: [
        CommonModule,
        FormsModule
    ],
    declarations: [
        Radio,
        RadioGroup
    ],
    exports: [
        Radio,
        RadioGroup
    ],
    entryComponents: [

    ],
    providers: [

    ]
})
export class RadioModule {

}
