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

import { GridModule } from '../grid/grid.module';

import { FormDirective } from './form.directive';
import { FormItem } from './form.item';
import { FormLabel } from './form.label';
import { FormHelp } from './form.help';
import { FormValidation } from './form.validation';

export { FormDirective } from './form.directive';
export { FormItem } from './form.item';
export { FormLabel } from './form.label';
export { FormHelp } from './form.help';
export { FormValidation } from './form.validation';


/**
 * @name FormModule
 * @author fbchen 2017-07-31
 */
@NgModule({
    imports: [
        CommonModule,
        GridModule
    ],
    declarations: [
        FormDirective,
        FormItem,
        FormLabel,
        FormHelp,
        FormValidation
    ],
    exports: [
        FormDirective,
        FormItem,
        FormLabel,
        FormHelp,
        FormValidation
    ],
    entryComponents: [

    ],
    providers: [

    ]
})
export class FormModule {

}
