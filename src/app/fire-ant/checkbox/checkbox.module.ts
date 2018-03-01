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

import { Checkbox } from './checkbox';
import { CheckboxGroup } from './checkbox.group';

export { Checkbox } from './checkbox';
export { CheckboxGroup } from './checkbox.group';


/**
 * @name CheckboxModule
 * @author fbchen 2017-07-31
 */
@NgModule({
    imports: [
        CommonModule,
        FormsModule
    ],
    declarations: [
        Checkbox,
        CheckboxGroup
    ],
    exports: [
        Checkbox,
        CheckboxGroup
    ],
    entryComponents: [

    ],
    providers: [

    ]
})
export class CheckboxModule {

}
