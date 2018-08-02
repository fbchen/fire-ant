/**
 * @license
 * Copyright 厦门乾元盛世科技有限公司 All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file.
 */

import { Component, Input, ElementRef, OnInit, ViewEncapsulation } from '@angular/core';
import { UpdateClassService } from '../core/service/update.class.service';
import { toBoolean } from '../util/lang';

@Component({
    selector: 'ant-input-group',
    template: `<ng-content></ng-content>`,
    preserveWhitespaces: false,
    encapsulation: ViewEncapsulation.None,
    providers: [ UpdateClassService ]
})
export class InputGroup implements OnInit {

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
    private _prefixCls = 'ant-input-group';


    /** 控件大小。注：标准表单内的输入框大小限制为 `large`。可选 `large` `default` `small`。 */
    @Input()
    get size(): 'large' | 'default' | 'small' {
        return this._size;
    }
    set size(size: 'large' | 'default' | 'small') {
        if (this._size !== size) {
            this._size = size;
            this.updateClassMap();
        }
    }
    private _size: 'large' | 'default' | 'small' = 'default';


    /** 是否用紧凑模式，默认为 false */
    @Input()
    get compact(): boolean {
        return this._compact;
    }
    set compact(compact: boolean) {
        const value = toBoolean(compact);
        if (this._compact !== value) {
            this._compact = value;
            this.updateClassMap();
        }
    }
    private _compact = false;


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
            [`${this.prefixCls}-lg`]: this.size === 'large',
            [`${this.prefixCls}-sm`]: this.size === 'small',
            [`${this.prefixCls}-compact`]: this.compact
        };
        this.updateClassService.update(this.el.nativeElement, classes);
    }

}
