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

import { Align } from './align';
import { Popup } from './popup';

export { Align } from './align';
export { Popup } from './popup';


/**
 * @name TriggerModule
 * @author fbchen 2017-07-31
 */
@NgModule({
    imports: [
        CommonModule
    ],
    declarations: [
        Align,
        Popup
    ],
    exports: [
        Align,
        Popup
    ],
    entryComponents: [

    ],
    providers: [

    ]
})
export class TriggerModule {

}
