/**
 * @license
 * Copyright 厦门乾元盛世科技有限公司 All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file.
 */

import {
    Component, Input, Output, HostBinding, EventEmitter, OnInit, ViewEncapsulation,
    animate, state, style, transition, trigger
} from '@angular/core';



@Component({
    selector: 'ant-dialog',
    template: `
        <div class="ant-mask"></div>
        <div class="{{prefixCls}}">
            <div [ngClass]="wrapperClassMap">
                <ant-icon [ngClass]="iconClassMap" [type]="iconType" *ngIf="iconType"></ant-icon>
                <div class="{{prefixCls}}__wrapper_inner">
                    <div class="{{prefixCls}}__hd"><strong class="{{prefixCls}}__title">{{title}}</strong></div>
                    <div class="{{prefixCls}}__bd">
                        {{content}}
                    </div>
                </div>
            </div>
            <div class="{{prefixCls}}__ft">
                <a href="javascript:;" (click)="negativeClick($event)" *ngIf="showNOButton"
                    class="{{prefixCls}}__btn {{prefixCls}}__btn_default">{{btnNOText || defaults.btnNOText}}</a>
                <a href="javascript:;" (click)="positiveClick($event)"
                    class="{{prefixCls}}__btn {{prefixCls}}__btn_primary">{{btnOKText || defaults.btnOKText}}</a>
            </div>
        </div>
    `,
    styleUrls: ['./style/index.scss'],
    preserveWhitespaces: false,
    encapsulation: ViewEncapsulation.None,
    animations: [trigger('visibility', [
        state('show', style({ opacity: 1, display: 'block' })),
        state('hide', style({ opacity: 0, display: 'none' })),
        transition('hide <=> show', [animate(200)])
    ])]
})
export class Dialog implements OnInit {

    /**
     * @i18n
     */
    defaults: any = {
       btnNOText: '取消',
       btnOKText: '确定'
    };

    /** 样式前缀 */
    @Input() prefixCls = 'ant-dialog';

    /** 标题 */
    @Input() title: string;

    /** 内容 */
    @Input() content: string;

    /** @i18n 取消 */
    @Input() btnNOText: string = this.defaults.btnNOText;

    /** @i18n 确定 */
    @Input() btnOKText: string = this.defaults.btnOKText;

    /** 是否显示“取消”按钮 */
    @Input() showNOButton = true;

    /** 类型，可选：info, success, error, warning, default */
    @Input()
    get type(): string {
        return this._type;
    }
    set type(type: string) {
        if (this._type !== type) {
            this._type = type;
            this.updateIcon();
            this.updateIconClass();
        }
    }
    private _type: string;


    /** 自定义图标 */
    @Input()
    get icon(): string {
        return this._icon;
    }
    set icon(icon: string) {
        if (this._icon !== icon) {
            this._icon = icon;
            this.updateIcon();
            // this.updateIconClass();
        }
    }
    private _icon: string;


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
    private _iconCls: string;


    /** 隐藏对象 */
    @Output() closed = new EventEmitter<any>();

    /**
     * 用于控制动画的触发(trigger)
     */
    @HostBinding('@visibility') get visibility(): string {
        return this.shown ? 'show' : 'hide';
    }

    /** 已显示否 */
    private shown = false;

    /* 用户操作反馈 */
    private resolve: (value?: any) => void;
    /* 用户操作反馈 */
    private reject: (value?: any) => void;

    // 内部样式
    public iconClassMap: any;
    public iconType: string; // 图标
    public wrapperClassMap: any;

    constructor() {

    }

    ngOnInit(): void {
        this.updateIcon();
        this.updateIconClass();
        this.updateWrapperClass();
    }

    updateIcon(): void {
        this.iconType = this.icon || ({
            info: 'info-circle-o',
            success: 'check-circle-o',
            error: 'cross-circle-o',
            warning: 'exclamation-circle-o',
            confirm: 'question-circle-o',
            'default': 'info-circle'
        })[this.type];
        this.updateWrapperClass();
    }

    updateIconClass(): void {
        this.iconClassMap = {
            [`${this.prefixCls}-icon`]: 1,
            [`${this.prefixCls}-icon-${this.type}`]: this.type,
            [`${this.iconCls}`]: this.iconCls
        };
    }

    updateWrapperClass(): void {
        this.wrapperClassMap = {
            [`${this.prefixCls}__wrapper`]: 1,
            [`${this.prefixCls}__wrapper_with_icon`]: this.iconType
        };
    }

    /**
    * 显示对话框
    */
    show(): Promise<any> {
        this.shown = true;

        return new Promise<any>((resolve, reject) => {
            this.resolve = resolve;
            this.reject = reject;
        });
    }

    /**
     * 隐藏对话框
     */
    hide(): void {
        this.shown = false;
        // this.reject();
        this.closed.emit();
    }

    /**
     * 点击【取消】，执行Promise.reject()方法；然后，关闭对话框
     */
    negativeClick(event: MouseEvent): void {
        this.reject();
        this.hide();
    }

    /**
     * 点击【确定】，执行Promise.resolve()方法；然后，关闭对话框
     */
    positiveClick(event: MouseEvent): void {
        this.resolve();
        this.hide();
    }

}
