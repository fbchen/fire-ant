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

// Import Calendar UI Components
import { Calendar } from './calendar';
import { MonthCalendar } from './month.calendar';
import { RangeCalendar } from './range.calendar';

import { DateInput } from './date/date.input';
import { TimeInput } from './time/time.input';
import { DecadePanel } from './panel/decade.panel';
import { YearPanel } from './panel/year.panel';
import { MonthPanel } from './panel/month.panel';
import { DatePanel } from './panel/date.panel';
import { TimePanel } from './panel/time.panel';
import { CalendarHeader } from './calendar/calendar.header';
import { CalendarFooter } from './calendar/calendar.footer';
import { TimeOption } from './time/time.option';
import { TimeCombobox } from './time/time.combobox';
import { RangePanel } from './range/range.panel';

export { Calendar } from './calendar';
export { MonthCalendar } from './month.calendar';
export { RangeCalendar } from './range.calendar';



/**
 * @name CalendarModule
 * @author fbchen 2017-07-31
 */
@NgModule({
    imports: [
        CommonModule,
        FormsModule
    ],
    declarations: [
        Calendar,
        MonthCalendar,
        RangeCalendar,

        DateInput,
        TimeInput,
        DecadePanel,
        YearPanel,
        MonthPanel,
        DatePanel,
        TimePanel,
        RangePanel,

        CalendarHeader,
        CalendarFooter,
        TimeOption,
        TimeCombobox
    ],
    exports: [
        Calendar,
        MonthCalendar,
        RangeCalendar,

        MonthPanel,
        DatePanel,
    ],
    entryComponents: [
        Calendar,
        MonthCalendar,
        RangeCalendar,
        TimePanel
    ],
    providers: [

    ]
})
export class CalendarModule {

}
