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

import { Popconfirm, PopconfirmTrgger } from './popconfirm';

export { Popconfirm, PopconfirmTrgger } from './popconfirm';


/**
 * @name PopconfirmModule
 * @author fbchen 2017-07-31
 */
@NgModule({
    imports: [
        CommonModule,
        ButtonModule,
        IconModule
    ],
    declarations: [
        Popconfirm,
        PopconfirmTrgger
    ],
    exports: [
        Popconfirm,
        PopconfirmTrgger
    ],
    entryComponents: [
        Popconfirm
    ],
    providers: [

    ]
})
export class PopconfirmModule {

}
