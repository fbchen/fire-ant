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

import { MessageBox } from './message.box';
import { Message } from './message';

export { MessageBox } from './message.box';
export { Message } from './message';


/**
 * @name MessageModule
 * @author fbchen 2017-07-31
 */
@NgModule({
    imports: [
        CommonModule,
        IconModule
    ],
    declarations: [
        MessageBox,
    ],
    exports: [
        MessageBox,
    ],
    entryComponents: [
        MessageBox
    ],
    providers: [
        Message,
    ]
})
export class MessageModule {

}
