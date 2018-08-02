/**
 * @license
 * Copyright 厦门乾元盛世科技有限公司 All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file.
 */

import { Component, Input, ViewEncapsulation, ElementRef, OnInit } from '@angular/core';
import { UpdateClassService } from '../core/service/update.class.service';
import { Notice } from '../notification/notice';

export type NoticeType = 'info' | 'success' | 'error' | 'warning' | 'loading';


@Component({
    selector: 'ant-message-box',
    template: `
        <div class="{{prefixCls}}-notice-content">
            <div class="{{prefixCls}}-custom-content {{prefixCls}}-{{type}}">
                <ant-icon [type]="iconName"></ant-icon>
                <span>{{content}}</span>
            </div>
        </div>
        <a tabIndex="0" (click)="close($event)" class="{{prefixCls}}-notice-close" *ngIf="closable">
            <span class="{{prefixCls}}-notice-close-x"></span>
        </a>
    `,
    styleUrls: ['./style/index.scss'],
    preserveWhitespaces: false,
    encapsulation: ViewEncapsulation.None,
    providers: [ UpdateClassService ]
})
export class MessageBox extends Notice implements OnInit {

    /** 类型 */
    @Input()
    get type(): NoticeType {
        return this._type;
    }
    set type(type: NoticeType) {
        if (this._type !== type) {
            this._type = type;
            this.updateIconName();
        }
    }
    protected _type: NoticeType = 'info';


    /** 内容 */
    @Input() content: string;


    // 内部图标
    public iconName: string;

    constructor(
        public el: ElementRef,
        protected updateClassService: UpdateClassService) {
        super(el, updateClassService);
    }

    ngOnInit(): void {
        this.updateIconName();
        super.ngOnInit();
    }

    updateIconName(): void {
        this.iconName = ({
            info: 'info-circle',
            success: 'check-circle',
            error: 'cross-circle',
            warning: 'exclamation-circle',
            loading: 'loading',
        })[this.type];
    }

}
