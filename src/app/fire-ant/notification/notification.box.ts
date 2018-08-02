/**
 * @license
 * Copyright 厦门乾元盛世科技有限公司 All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file.
 */

import { Component, Input, ViewEncapsulation, ElementRef, OnInit } from '@angular/core';
import { UpdateClassService } from '../core/service/update.class.service';
import { Notice } from './notice';

export type NoticeType = 'info' | 'success' | 'error' | 'warning' | 'default';


@Component({
    selector: 'ant-notification-box',
    template: `
        <div class="{{prefixCls}}-notice-content">
            <div [class]="wrapClasses">
                <ant-icon [ngClass]="iconClasses" [type]="iconName" *ngIf="!!iconName"></ant-icon>
                <div class="{{prefixCls}}-notice-message">
                    <span class="{{prefixCls}}-notice-message-single-line-auto-margin" *ngIf="!description && !!iconName"></span>
                    {{message}}
                </div>
                <div class="{{prefixCls}}-notice-description">{{description}}</div>
                <span class="{{prefixCls}}-notice-btn" *ngIf="btn">
                    <ant-button [type]="btn.type" [size]="btn.size||'small'" (click)="onBtnClick()">{{btn.text}}</ant-button>
                </span>
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
export class NotificationBox extends Notice implements OnInit {

    /** 类型 */
    @Input()
    get type(): NoticeType {
        return this._type;
    }
    set type(type: NoticeType) {
        if (this._type !== type) {
            this._type = type;
            this.updateIconName();
            this.updateIconClass();
        }
    }
    protected _type: NoticeType;


    /** 通知提醒标题，必选 */
    @Input() message: string;

    /** 通知提醒内容，必选 */
    @Input() description: string;

    /** 按钮内容 */
    @Input() btn: {
        text: string;
        type?: string;
        size?: string;
        click?: Function;
    };

    /** 自定义图标 */
    @Input()
    get icon(): string {
        return this._icon;
    }
    set icon(icon: string) {
        if (this._icon !== icon) {
            this._icon = icon;
            this.updateIconName();
            this.updateIconClass();
            this.updateWrapClass();
        }
    }
    protected _icon: string;


    /** 自定义图标样式 */
    @Input()
    get iconCls(): string {
        return this._iconCls;
    }
    set iconCls(iconCls: string) {
        if (this._iconCls !== iconCls) {
            this._iconCls = iconCls;
            this.updateIconClass();
        }
    }
    protected _iconCls: string;


    /** 自动关闭之前的等待时间 */
    @Input() duration = 4.5;

    /** 默认可关闭 */
    @Input() closable = true;

    // 内部样式
    public wrapClasses: string;
    public iconClasses: any;
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

    protected updateClassMap(): void {
        super.updateClassMap();
        this.updateWrapClass();
        this.updateIconClass();
    }

    updateWrapClass(): void {
        this.wrapClasses = this.iconName ? `${this.prefixCls}-notice-with-icon` : '';
    }

    updateIconName(): void {
        if (this.icon) {
            this.iconName = this.icon;
        } else {
            this.iconName = ({
                info: 'info-circle-o',
                success: 'check-circle-o',
                error: 'cross-circle-o',
                warning: 'exclamation-circle-o',
                'default': 'info-circle',
            })[this.type];
        }
    }

    updateIconClass(): void {
        this.iconClasses = {
            [`${this.prefixCls}-notice-icon`]: 1,
            [`${this.prefixCls}-notice-icon-${this.type}`]: this.type,
            [`${this.iconCls}`]: this.iconCls
        };
    }

    onBtnClick(): void {
        if (this.btn.click) {
            this.btn.click();
        }
    }
}
