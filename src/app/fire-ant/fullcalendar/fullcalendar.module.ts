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
import { RadioModule } from '../radio/radio.module';
import { CalendarModule } from '../calendar/calendar.module';
import { FullCalendar } from './fullcalendar';

export { FullCalendar } from './fullcalendar';



/**
 * @name FullCalendarModule
 * @author fbchen 2017-07-31
 */
@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        CalendarModule,
        SelectModule,
        RadioModule
    ],
    declarations: [
        FullCalendar
    ],
    exports: [
        FullCalendar
    ],
    entryComponents: [

    ],
    providers: [

    ]
})
export class FullCalendarModule {

}
