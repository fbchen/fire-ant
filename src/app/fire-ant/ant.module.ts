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
import { FormsModule } from '@angular/forms';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

// Import FireAnt UI Components
import { FormControl } from './input/form.control';
import { FormDirective } from './form/form.directive';
import { FormItem } from './form/form.item';
import { FormLabel } from './form/form.label';
import { FormHelp } from './form/form.help';
import { Checkbox } from './checkbox/checkbox';
import { CheckboxGroup } from './checkbox/checkbox.group';
import { Radio } from './radio/radio';
import { RadioGroup } from './radio/radio.group';


/**
 * @name AntModule
 * @description
 * AntModule is an NgModule that provides AntDesign-style TypeScript/JavaScript components.
 * @author fbchen 2017-05-15
 */
@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        BrowserAnimationsModule
    ],
    declarations: [
        FormControl,
        Checkbox, CheckboxGroup,
        Radio, RadioGroup,
        FormDirective, FormItem, FormLabel, FormHelp
    ],
    exports: [
        FormControl,
        Checkbox, CheckboxGroup,
        Radio, RadioGroup,
        FormDirective, FormItem, FormLabel, FormHelp
    ],
    entryComponents: [

    ],
    providers: [
        // Layer
    ]
})
export class AntModule {

}
