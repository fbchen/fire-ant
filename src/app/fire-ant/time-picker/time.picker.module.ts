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

import { SelectModule } from '../select/select.module';

import { TimePicker } from './time.picker';
import { TimeSelect } from './time.select';

export { TimePicker } from './time.picker';
export { TimeSelect } from './time.select';



/**
 * @name TimePickerModule
 * @author fbchen 2017-07-31
 */
@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        SelectModule
    ],
    declarations: [
        TimePicker,
        TimeSelect
    ],
    exports: [
        TimePicker,
        TimeSelect
    ],
    entryComponents: [

    ],
    providers: [

    ]
})
export class TimePickerModule {

}
