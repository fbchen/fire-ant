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

import { IconModule } from '../icon/icon.module';

import { FormControl } from './form.control';
import { InputBox } from './input';
import { Search } from './search';
import { Addon } from './addon';
import { InputGroup } from './group';

export { FormControl } from './form.control';
export { InputBox } from './input';
export { Search } from './search';
export { Addon } from './addon';
export { InputGroup } from './group';



/**
 * @name InputModule
 * @author fbchen 2017-07-31
 */
@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        IconModule
    ],
    declarations: [
        FormControl,
        InputBox,
        Search,
        Addon,
        InputGroup
    ],
    exports: [
        FormControl,
        InputBox,
        Search,
        Addon,
        InputGroup
    ],
    entryComponents: [

    ],
    providers: [

    ]
})
export class InputModule {

}
