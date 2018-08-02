/**
 * @license
 * Copyright 厦门乾元盛世科技有限公司 All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file.
 */

import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { FileSizePipe } from './pipe/filesize.pipe';
import { FormatDatePipe } from './pipe/format.date.pipe';
import { ArrayFilterPipe } from './pipe/array.filter.pipe';
import { SafeHtmlPipe } from './pipe/safe.html.pipe';

import { EmailValidatorDirective } from './directive/email.validator.directive';
import { IdentityValidatorDirective } from './directive/identity.validator.directive';
import { PhoneNumberValidatorDirective } from './directive/phone.validator.directive';
import { URLValidatorDirective } from './directive/url.validator.directive';
import { RangeValidatorDirective } from './directive/range.validator.directive';
import { MaxHanziValidator } from './directive/maxhanzi.validator.directive';
import { MaxDateValidator } from './directive/maxdate.validator.directive';
import { MinDateValidator } from './directive/mindate.validator.directive';
import { EqualsToValidator } from './directive/equalsTo.validator.directive';
import { BadCharValidatorDirective } from './directive/badchar.validator.directive';
import { IntegerValidatorDirective } from './directive/integer.validator.directive';
import { PriceValidatorDirective } from './directive/price.validator.directive';


export { isPresent, isDate, isNumeric, isInteger, isPrice, isEmptyArray, arrayEquals, toArray, toArrayBuffer } from './utils/lang';
export { StringUtils } from './utils/string.utils';
export { FileUtils } from './utils/file.utils';

export { AbstractService } from './abstract.service';

/**
 * @name SharedModule
 * @description
 * SharedModule is an NgModule that provides SHARED Components, Directive and Pipes.
 * <ul>
 *     <li>它导入了CommonModule，这是因为它的组件需要这些公共指令；</li>
 *     <li>正如我们所期待的，它声明并导出了工具性的管道、指令和组件类；</li>
 *     <li>它重新导出了CommonModule和FormsModule。通过让SharedModule重新导出CommonModule和FormsModule模块，我们可以消除其它组件的模块重复导入。</li>
 * </ul>
 * {@link https://angular.cn/docs/ts/latest/guide/ngmodule.html#!#shared-module}
 *
 * @author fbchen 2017-03-08
 */
@NgModule({
    imports: [
        CommonModule
    ],
    declarations: [
        RangeValidatorDirective,
        EmailValidatorDirective,
        IdentityValidatorDirective,
        PhoneNumberValidatorDirective,
        URLValidatorDirective,
        MaxHanziValidator,
        MaxDateValidator,
        MinDateValidator,
        EqualsToValidator,
        BadCharValidatorDirective,
        IntegerValidatorDirective,
        PriceValidatorDirective,

        FileSizePipe,
        FormatDatePipe,
        ArrayFilterPipe,
        SafeHtmlPipe
    ],
    exports: [
        CommonModule, FormsModule,
        RangeValidatorDirective,
        EmailValidatorDirective,
        IdentityValidatorDirective,
        PhoneNumberValidatorDirective,
        URLValidatorDirective,
        MaxHanziValidator,
        MaxDateValidator,
        MinDateValidator,
        EqualsToValidator,
        BadCharValidatorDirective,
        IntegerValidatorDirective,
        PriceValidatorDirective,

        FileSizePipe, FormatDatePipe,
        ArrayFilterPipe, SafeHtmlPipe
    ],
    entryComponents: [

    ]
})
export class SharedModule { }
