/**
 * @license
 * Copyright 厦门乾元盛世科技有限公司 All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file.
 */

import { Component, Input, Output, EventEmitter, HostBinding, ElementRef, AfterViewInit, OnDestroy, OnInit } from '@angular/core';
import { UpdateClassService } from '../core/service/update.class.service';
import { toBoolean } from '../util/lang';
import { transitionEnter, transitionLeave } from '../core/animation/transition';

/** 弹窗消息的位置 */
export type NotificationPlacement = 'topLeft' | 'topRight' | 'bottomLeft' | 'bottomRight';

/** 弹窗消息的基本配置项 */
export interface NoticeOpt {
    /** 弹窗消息的唯一ID，可防止相同的消息重复打开 */
    key?: string;

    /** 样式前缀，可选 */
    prefixCls?: string;

    /** 弹窗内容，一般作为消息的主体 */
    message: string;

    /** 弹窗内容，一般作为消息的描述 */
    description: string;

    /** 自动关闭之前的等待时间，可根据不同的弹窗消息需要设置不同的延迟时间 */
    duration?: number;

    /** 是否显示关闭按钮[x]，一般默认不显示 */
    closable?: boolean;

    /** 弹窗组件的类型，如：成功、失败、警告等，根据实际弹窗组件设置 */
    type?: string;

    /** 弹窗组件的图标，如：成功、失败、警告等，根据实际弹窗组件设置 */
    icon?: string;

    /** 弹窗组件的图标样式 */
    iconCls?: string;

    /** 弹窗组件的位置设置 */
    placement?: NotificationPlacement;

    /** 弹窗组件的样式 */
    class?: string;

    /** 弹窗组件的位置样式，例如：`left: '50%', top: '50px'` */
    left?: string;

    /** 弹窗组件的位置样式，例如：`left: '50%', top: '50px'` */
    right?: string;

    /** 弹窗组件的位置样式，例如：`left: '50%', top: '50px'` */
    top?: string;

    /** 弹窗组件的位置样式，例如：`left: '50%', top: '50px'` */
    bottom?: string;

    /** 弹窗组件的形状样式：宽度(width)，如: `width: 600px` */
    width?: string;

    /** 弹窗组件的形状样式：高度(height)，如: `height: 300px` */
    height?: string;

    /** 弹窗组件的自定义按钮 */
    btn?: {
        text: string;
        type?: string;
        size?: string;
        click?: Function;
    };
}

/**
 * 弹窗消息组件
 */
@Component({
    selector: 'rc-notice',
    template: `
        <div class="{{prefixCls}}-notice-content">
            <ng-content></ng-content>
        </div>
        <a tabIndex="0" (click)="close($event)" class="{{prefixCls}}-notice-close" *ngIf="closable">
            <span class="{{prefixCls}}-notice-close-x"></span>
        </a>
    `,
    preserveWhitespaces: false,
    providers: [ UpdateClassService ]
})
export class Notice implements AfterViewInit, OnDestroy, OnInit {

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
    protected _prefixCls: string;


    /** 自动关闭之前的等待时间 */
    @Input() duration = 1.5;

    /** 默认不显示关闭按钮 */
    @Input()
    get closable(): boolean {
        return this._closable;
    }
    set closable(closable: boolean) {
        const value = toBoolean(closable);
        if (this._closable !== value) {
            this._closable = value;
            this.updateClassMap();
        }
    }
    private _closable = false;


    /** 唯一键 */
    @Input() key: string;

    /** 位置样式，例如：`left: '50%', top: '50px'` */
    @Input() left: string;

    /** 位置样式，例如：`left: '50%', top: '50px'` */
    @Input() right: string;

    /** 位置样式，例如：`left: '50%', top: '50px'` */
    @Input() top: string;

    /** 位置样式，例如：`left: '50%', top: '50px'` */
    @Input() bottom: string;

    /** 形状样式：宽度(width)，如: `width: 600px` */
    @Input() width: string;

    /** 形状样式：高度(height)，如: `height: 300px` */
    @Input() height: string;

    @Input() transitionName: string;

    /** Close事件 */
    @Output() closed = new EventEmitter<any>();

    private closeTimer: any;

    constructor(
        protected el: ElementRef,
        protected updateClassService: UpdateClassService) {
    }

    /** The underlying host native element */
    getHostElement(): HTMLElement {
        return this.el.nativeElement as HTMLElement;
    }

    ngAfterViewInit(): void {
        transitionEnter(this.getHostElement(), this.transitionName, () => {
            // 有延迟关闭时间的，则在指定时间后关闭；若要手工关闭，可以设置duration=0
            if (this.duration) {
                this.closeTimer = setTimeout(() => {
                    this.close();
                }, this.duration * 1000);
            }
        });
    }

    ngOnDestroy(): void {
        this.clearCloseTimer();
    }

    ngOnInit(): void {
        this.updateClassMap();
    }

    protected updateClassMap(): void {
        const classes = {
            [`${this.prefixCls}-notice`]: 1,
            [`${this.prefixCls}-notice-closable`]: this.closable
        };
        this.updateClassService.update(this.el.nativeElement, classes);
    }

    clearCloseTimer(): void {
        if (this.closeTimer) {
            clearTimeout(this.closeTimer);
            this.closeTimer = null;
        }
    }

    close(): void {
        transitionLeave(this.getHostElement(), this.transitionName, () => {
            this.clearCloseTimer();
            this.closed.emit();
        });
    }

    @HostBinding('style.left')
    get styleLeft(): any {
        return this.left;
    }

    @HostBinding('style.right')
    get styleRight(): any {
        return this.right;
    }

    @HostBinding('style.top')
    get styleTop(): any {
        return this.top;
    }

    @HostBinding('style.bottom')
    get styleBottom(): any {
        return this.bottom;
    }

    @HostBinding('style.width')
    get styleWidth(): any {
        return this.width;
    }

    @HostBinding('style.height')
    get styleHeight(): any {
        return this.height;
    }

}

