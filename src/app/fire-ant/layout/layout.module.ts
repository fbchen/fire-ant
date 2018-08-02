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

import { Layout, Header, Footer, Content } from './layout';
import { Sider } from './sider';

export { Layout, Header, Footer, Content } from './layout';
export { Sider } from './sider';

/**
 * @name LayoutModule
 * @author fbchen 2017-07-31
 */
@NgModule({
    imports: [
        CommonModule,
        IconModule
    ],
    declarations: [
        Layout,
        Header,
        Footer,
        Content,
        Sider
    ],
    exports: [
        Layout,
        Header,
        Footer,
        Content,
        Sider
    ],
    entryComponents: [

    ],
    providers: [

    ]
})
export class LayoutModule {

}
