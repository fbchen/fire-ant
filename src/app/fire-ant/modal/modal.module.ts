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

import { ModalConfirm } from './modal.confirm';
import { ModalDialog } from './modal.dialog';
import { Modal } from './modal';

export { ModalConfirm } from './modal.confirm';
export { ModalDialog } from './modal.dialog';
export { Modal } from './modal';


/**
 * @name ModalModule
 * @author fbchen 2017-07-31
 */
@NgModule({
    imports: [
        CommonModule,
        ButtonModule,
        IconModule
    ],
    declarations: [
        ModalDialog,
        ModalConfirm,
    ],
    exports: [
        ModalDialog,
        ModalConfirm,
    ],
    entryComponents: [
        ModalDialog,
        ModalConfirm,
    ],
    providers: [
        Modal,
    ]
})
export class ModalModule {

}
