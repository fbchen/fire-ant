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

import { Button } from './button';
import { ButtonGroup } from './button.group';

export { Button } from './button';
export { ButtonGroup } from './button.group';


/**
 * @name ButtonModule
 * @author fbchen 2017-07-31
 */
@NgModule({
    imports: [
        CommonModule,
        IconModule
    ],
    declarations: [
        Button,
        ButtonGroup,
    ],
    exports: [
        Button,
        ButtonGroup,
    ],
    entryComponents: [

    ],
    providers: [

    ]
})
export class ButtonModule {

}
