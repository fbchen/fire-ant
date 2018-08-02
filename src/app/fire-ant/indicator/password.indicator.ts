/**
 * @license
 * Copyright 厦门乾元盛世科技有限公司 All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file.
 */


import { Component, Input, ElementRef, OnInit, ViewEncapsulation } from '@angular/core';

import { UpdateClassService } from '../core/service/update.class.service';
import { toBoolean, toNumber } from '../util/lang';


/**
 * 密码强度指示器
 */
@Component({
    selector: 'ant-password-indicator',
    templateUrl: './password.indicator.html',
    styleUrls: ['./style/index.scss'],
    preserveWhitespaces: false,
    encapsulation: ViewEncapsulation.None,
    providers: [ UpdateClassService ]
})
export class PasswordIndicator implements OnInit {

    /** 样式前缀 */
    @Input()
    get prefixCls(): string {
        return this._prefixCls;
    }
    set prefixCls(prefixCls: string) {
        if (this._prefixCls !== prefixCls) {
            this._prefixCls = prefixCls;
            this.updateClassMap();
        }
    }
    protected _prefixCls = 'ant-password-indicator';


    /** 密码强度，取值：0-无，1-弱，2-中等，3-强 */
    @Input()
    get indicator(): number {
        return this._indicator;
    }
    set indicator(indicator: number) {
        const value = toNumber(indicator, null);
        if (this._indicator !== value) {
            this._indicator = value;
            this.updateClassMap();
        }
    }
    protected _indicator = 0;


    /** 是否显示文字 */
    @Input()
    get showText(): boolean {
        return this._showText;
    }
    set showText(showText: boolean) {
        const value = toBoolean(showText);
        if (this._showText !== value) {
            this._showText = value;
            this.updateClassMap();
        }
    }
    private _showText = true;


    constructor(
        protected el: ElementRef,
        protected updateClassService: UpdateClassService) {

    }

    ngOnInit(): void {
        this.updateClassMap();
    }

    protected updateClassMap(): void {
        const classes = {
            [`${this.prefixCls}`]: true,
            [`${this.prefixCls}-1`]: this.indicator === 1,
            [`${this.prefixCls}-2`]: this.indicator === 2,
            [`${this.prefixCls}-3`]: this.indicator === 3,
        };
        this.updateClassService.update(this.el.nativeElement, classes);
    }

    get _indicatorCls1(): any {
        return {
            [`${this.prefixCls}-item`]: true,
            [`${this.prefixCls}-item1`]: this.indicator >= 1
        };
    }

    get _indicatorCls2(): any {
        return {
            [`${this.prefixCls}-item`]: true,
            [`${this.prefixCls}-item2`]: this.indicator >= 2
        };
    }

    get _indicatorCls3(): any {
        return {
            [`${this.prefixCls}-item`]: true,
            [`${this.prefixCls}-item3`]: this.indicator >= 3
        };
    }

    get _text(): string {
        return this.indicator === 3 ? '强' : this.indicator === 2 ? '中' : this.indicator === 1 ? '弱' : '';
    }
}

