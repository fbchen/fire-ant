/**
 * @license
 * Copyright 厦门乾元盛世科技有限公司 All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file.
 */

import { Input, Renderer, ElementRef, Inject, Optional } from '@angular/core';
import { DefaultValueAccessor } from '@angular/forms';
import { COMPOSITION_BUFFER_MODE } from '@angular/forms';

/**
 * 输入类表单控件
 */
// AOT编译时提示 Cannot determine the module for class FormControl in **.ts, so comment out `abstract`
export /*abstract*/ class FormControl extends DefaultValueAccessor {
    /** @internal */
    public static count = 0;

    /** 控件ID: 输入框的 id */
    @Input() id: string;

    /** 控件name */
    @Input() name: string;

    /** 控件 label */
    @Input() label: string;

    /** 是否禁用状态，默认为 false */
    @Input() disabled = false;

    /**
     * 定义与输入控件相关联的值，主要用途如下：<ul>
     * <li> type="button", "reset", "submit" - 定义按钮上的显示的文本 </li>
     * <li> type="checkbox", "radio", "image" - 定义与输入相关联的值，如选中时返回该值，不选中时返回空值(即无值) </li>
     * </ul>
     * 注意：<br>
     * 区别于下列情况的输入框，当输入框的type为如下情况时不应该设置value属性，而应该直接使用[(ngModel)]="x"来绑定值：
     * text, password, hidden, textarea, date, time, datetime, month, week, number, tel, email, search, select 等。
     *
     * <p>注释：&lt;input type="checkbox"&gt; 和 &lt;input type="radio"&gt; 中必须设置 <code>value</code> 属性。</p>
     */
    @Input() value: any;

    /** 额外样式 */
    @Input() additionalCls: string;


    /** @internal */
    public static registerControl(): string {
        return 'ant-control-' + (++FormControl.count).toString();
    }

    constructor(
        @Inject(Renderer) private __renderer: Renderer,
        @Inject(ElementRef) private __elementRef: ElementRef,
        @Optional() @Inject(COMPOSITION_BUFFER_MODE) private __compositionMode: boolean) {
        super(__renderer, __elementRef, __compositionMode);
        this.id = FormControl.registerControl();
    }


    /**
     * Write a new value to the element.
     *
     * @Override (From ControlValueAccessor interface)
     */
    writeValue(value: any): void {

    }

    /**
     * @Override (From ControlValueAccessor interface)
     */
    setDisabledState(isDisabled: boolean): void {
        this.disabled = isDisabled;
    }
}
