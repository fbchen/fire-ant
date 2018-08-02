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

import { Select } from './select';
import { Option } from './option';
import { OptionGroup } from './option.group';
import { NotFound } from './not.found';

export { Select } from './select';
export { Option } from './option';
export { OptionGroup } from './option.group';
export { NotFound } from './not.found';


/**
 * @name SelectModule
 * @author fbchen 2017-07-31
 */
@NgModule({
    imports: [
        CommonModule,
        FormsModule
    ],
    declarations: [
        Select,
        Option,
        OptionGroup,
        NotFound,
    ],
    exports: [
        Select,
        Option,
        OptionGroup,
        NotFound,
    ],
    entryComponents: [

    ],
    providers: [

    ]
})
export class SelectModule {

}
