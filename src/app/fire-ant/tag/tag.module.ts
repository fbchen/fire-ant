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

import { Tag } from './tag';
import { CheckableTag } from './checkable.tag';

export { Tag } from './tag';
export { CheckableTag } from './checkable.tag';


/**
 * @name TagModule
 * @author fbchen 2017-07-31
 */
@NgModule({
    imports: [
        CommonModule,
        IconModule
    ],
    declarations: [
        Tag,
        CheckableTag
    ],
    exports: [
        Tag,
        CheckableTag
    ],
    entryComponents: [

    ],
    providers: [

    ]
})
export class TagModule {

}
