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

import { Icon } from './icon';


export { Icon } from './icon';


/**
 * @name IconModule
 * @author fbchen 2017-07-31
 */
@NgModule({
    imports: [
        CommonModule
    ],
    declarations: [
        Icon
    ],
    exports: [
        Icon
    ],
    entryComponents: [

    ],
    providers: [

    ]
})
export class IconModule {

}
