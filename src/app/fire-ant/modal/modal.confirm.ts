/**
 * @license
 * Copyright 厦门乾元盛世科技有限公司 All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file.
 */

import { Component, Input, ElementRef, ViewEncapsulation, Inject, AfterViewInit } from '@angular/core';
import { DOCUMENT } from '@angular/platform-browser';

import { ModalDialog } from './modal.dialog';

export type DialogType = 'info' | 'success' | 'error' | 'warning' | 'confirm';

@Component({
    selector: 'ant-modal-confirm',
    templateUrl: './modal.confirm.html',
    styleUrls: ['./style/index.scss'],
    encapsulation: ViewEncapsulation.None
})
export class ModalConfirm extends ModalDialog implements AfterViewInit {

    /** 样式前缀 */
    @Input() subPrefixCls = 'ant-confirm';

    /** 对话框宽度 */
    @Input() width = 416;

    /** 内容 */
    @Input() content: string;

    /** 图标类型 */
    @Input() icon = 'question-circle';

    /** Comfirm类型 */
    @Input() type: DialogType = 'info';

    constructor(
        @Inject(DOCUMENT) public _doc: Document,
        public _elementRef: ElementRef) {
        super(_doc, _elementRef);
    }

    /** Override from super class */
    getDialogClass(): any {
        const cls = super.getDialogClass();
        return Object.assign(cls, {
            [`${this.subPrefixCls}`]: 1,
            [`${this.subPrefixCls}-${this.type}`]: true,
        });
    }

}
