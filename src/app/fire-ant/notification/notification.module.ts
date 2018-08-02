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

import { ButtonModule } from '../button/button.module';
import { IconModule } from '../icon/icon.module';

import { NotificationBox } from './notification.box';
import { Notification } from './notification';
import { Notice } from './notice';

export { NotificationBox } from './notification.box';
export { Notification } from './notification';
export { Notice } from './notice';


/**
 * @name NotificationModule
 * @author fbchen 2017-07-31
 */
@NgModule({
    imports: [
        CommonModule,
        ButtonModule,
        IconModule
    ],
    declarations: [
        NotificationBox,
        Notice
    ],
    exports: [
        NotificationBox,
        Notice
    ],
    entryComponents: [
        NotificationBox
    ],
    providers: [
        Notification
    ]
})
export class NotificationModule {

}
