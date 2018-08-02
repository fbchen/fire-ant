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
import { OverlayModule } from '@angular/cdk/overlay';
import { IconModule } from '../icon/icon.module';

import { Tree } from './tree';
import { TreeNode } from './tree.node';
import { TreeMenuContainer } from './tree.menu.container';
import { TreeMenuService } from './tree.menu.service';

export { Tree } from './tree';
export { TreeNode } from './tree.node';

/**
 * @name TreeModule
 * @author fbchen 2018-02-26
 */
@NgModule({
    imports: [
        CommonModule,
        OverlayModule,
        IconModule
    ],
    declarations: [
        Tree,
        TreeNode,
        TreeMenuContainer
    ],
    exports: [
        Tree,
        TreeNode
    ],
    entryComponents: [
        TreeMenuContainer
    ],
    providers: [
        TreeMenuService
    ]
})
export class TreeModule {

}
