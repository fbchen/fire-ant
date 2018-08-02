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

import { IconModule } from '../icon/icon.module';

import { DatePicker } from './date.picker';
import { MonthPicker } from './month.picker';
import { RangePicker } from './range.picker';

export { DatePicker } from './date.picker';
export { MonthPicker } from './month.picker';
export { RangePicker } from './range.picker';



/**
 * @name DatePickerModule
 * @author fbchen 2017-07-31
 */
@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        IconModule
    ],
    declarations: [
        DatePicker,
        MonthPicker,
        RangePicker
    ],
    exports: [
        DatePicker,
        MonthPicker,
        RangePicker
    ],
    entryComponents: [

    ],
    providers: [

    ]
})
export class DatePickerModule {

}
