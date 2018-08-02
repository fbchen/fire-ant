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

import { Menu } from './menu';
import { MenuItem } from './menu.item';
import { SubMenu } from './submenu';
import { MenuItemGroup } from './menu.item.group';
import { Divider } from './divider';

export { Menu } from './menu';
export { MenuItem } from './menu.item';
export { SubMenu } from './submenu';
export { MenuItemGroup } from './menu.item.group';
export { Divider } from './divider';


/**
 * @name MenuModule
 * @author fbchen 2017-07-31
 */
@NgModule({
    imports: [
        CommonModule,
    ],
    declarations: [
        Menu,
        MenuItem,
        SubMenu,
        MenuItemGroup,
        Divider,
    ],
    exports: [
        Menu,
        MenuItem,
        SubMenu,
        MenuItemGroup,
        Divider,
    ],
    entryComponents: [

    ],
    providers: [

    ]
})
export class MenuModule {

}
