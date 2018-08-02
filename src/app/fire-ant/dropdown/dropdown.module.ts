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
import { ButtonModule } from '../button/button.module';

import { Dropdown } from './dropdown';
import { DropdownButton } from './dropdown.button';

export { Dropdown } from './dropdown';
export { DropdownButton } from './dropdown.button';


/**
 * @name DropdownModule
 * @author fbchen 2017-07-31
 */
@NgModule({
    imports: [
        CommonModule,
        ButtonModule,
        IconModule
    ],
    declarations: [
        Dropdown,
        DropdownButton,
    ],
    exports: [
        Dropdown,
        DropdownButton,
    ],
    entryComponents: [

    ],
    providers: [

    ]
})
export class DropdownModule {

}
