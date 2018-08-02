/**
 * @license
 * Copyright 厦门乾元盛世科技有限公司 All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file.
 */

import {
    Component, Input, ElementRef, Output, OnInit, EventEmitter, Renderer2,
    ViewEncapsulation, HostBinding, AfterViewInit, ViewChild, TemplateRef
} from '@angular/core';

import { UpdateClassService } from '../core/service/update.class.service';
import { toBoolean } from '../util/lang';

import { transitionLeave } from '../core/animation/transition';
import { onNextFrame } from '../util/anim.frame';


type AlertType = 'success' | 'info' | 'warning' | 'error';


/**
 * Alert 警告提示
 * 警告提示，展现需要关注的信息。
 */
@Component({
    selector: 'ant-alert',
    template: `
        <ant-icon class="{{prefixCls}}-icon" [type]="iconType" *ngIf="isShowIcon"></ant-icon>
        <span class="{{prefixCls}}-message">
            {{message}}
            <ng-template *ngIf="messageTemplate" [ngTemplateOutlet]="messageTemplate"></ng-template>
        </span>
        <span class="{{prefixCls}}-description" #description><ng-content></ng-content></span>
        <a (click)="handleClose($event)" class="{{prefixCls}}-close-icon" *ngIf="closeText">
            {{closeText}}
        </a>
        <a (click)="handleClose($event)" class="{{prefixCls}}-close-icon" *ngIf="!closeText && closable">
            <ant-icon type="cross"></ant-icon>
        </a>
    `,
    styleUrls: ['./style/index.scss'],
    preserveWhitespaces: false,
    encapsulation: ViewEncapsulation.None,
    providers: [ UpdateClassService ]
})
export class Alert implements OnInit, AfterViewInit {

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
    private _prefixCls = 'ant-alert';

    /**
     * 指定警告提示的样式，有四种选择 `success`、`info`、`warning`、`error`。
     * 默认为`info`，`banner` 模式下默认值为 `warning`。
     * Type of Alert styles, options:`success`, `info`, `warning`, `error`
     */
    @Input()
    get type(): AlertType {
        return this._type;
    }
    set type(type: AlertType) {
        if (this._type !== type) {
            this._type = type;
            this.updateInnerType();
            this.updateClassMap();
        }
    }
    private _type: AlertType = 'info';

    /** 是否显示辅助图标，默认为false，`banner` 模式下默认值为 true。 Whether to show icon */
    @Input()
    get showIcon(): boolean {
        return this._showIcon;
    }
    set showIcon(showIcon: boolean) {
        const value = toBoolean(showIcon);
        if (this._showIcon !== value) {
            this._showIcon = value;
            this.updateIsShowIcon();
            this.updateClassMap();
        }
    }
    private _showIcon = false;

    /** 是否用作顶部公告 */
    @Input()
    get banner(): boolean {
        return this._banner;
    }
    set banner(banner: boolean) {
        const value = toBoolean(banner);
        if (this._banner !== value) {
            this._banner = value;
            this.updateIsShowIcon();
            this.updateInnerType();
            this.updateClassMap();
        }
    }
    private _banner = false;

    /**
     * 默认不显示关闭按钮
     * Whether Alert can be closed
     */
    @Input()
    get closable(): boolean {
        return this._closable;
    }
    set closable(closable: boolean) {
        this._closable = toBoolean(closable);
    }
    private _closable = false;

    /** 自定义关闭按钮, Close text to show */
    @Input() closeText: string;

    /** 警告提示内容 Content of Alert */
    @Input() message: string;

    /** 警告提示内容 Content of Alert */
    @Input() messageTemplate: TemplateRef<any>;


    /** Close事件 */
    @Output() close = new EventEmitter<any>();

    @ViewChild('description') description: ElementRef;


    public closing = true;
    public closed = false;
    private hasContent = false;

    /** alert type 的实际值 */
    private innerType: string;
    /** icon type 的实际值 */
    public iconType: string;
    /** 是否显示图标 */
    public isShowIcon = false;

    constructor(
        private renderer: Renderer2,
        private el: ElementRef,
        private updateClassService: UpdateClassService) {

    }

    ngOnInit(): void {
        this.updateInnerType();
        this.updateClassMap();
    }

    ngAfterViewInit(): void {
        this.checkHasContent();
    }

    checkHasContent(): void {
        onNextFrame(() => {
            const el = this.description.nativeElement as HTMLElement;
            this.hasContent = el.childNodes.length > 0;
            this.updateInnerType();
            this.updateClassMap();
        });
    }

    /** The underlying host native element */
    getHostElement(): HTMLElement {
        return this.el.nativeElement as HTMLElement;
    }

    /** 设置 icon type */
    private updateIconType(): void {
        const type = this.innerType;

        let iconType = '';
        switch (type) {
        case 'success':
            iconType = 'check-circle';
            break;
        case 'info':
            iconType = 'info-circle';
            break;
        case 'error':
            iconType = 'cross-circle';
            break;
        case 'warning':
            iconType = 'exclamation-circle';
            break;
        default:
            iconType = 'default';
        }

        // use outline icon in alert with description
        if (this.hasContent) {
            iconType += '-o';
        }
        this.iconType = iconType;
    }

    private updateIsShowIcon(): void {
        // banner模式默认有 Icon
        this.isShowIcon = this.banner ? true : this.showIcon;
    }

    private updateInnerType(): void {
        // banner模式默认为警告
        this.innerType = this.banner && this.type === undefined ? 'warning' : this.type || 'info';
        this.updateIconType();
    }

    private updateClassMap(): void {
        const classes = {
            [`${this.prefixCls}`]: true,
            [`${this.prefixCls}-${this.innerType}`]: true,
            [`${this.prefixCls}-close`]: !this.closing,
            [`${this.prefixCls}-with-description`]: this.hasContent,
            [`${this.prefixCls}-no-icon`]: !this.isShowIcon,
            [`${this.prefixCls}-banner`]: this.banner,
        };
        this.updateClassService.update(this.el.nativeElement, classes);
    }

    @HostBinding('attr.data-show')
    get _attrDataShow(): string {
        return this.closing ? 'true' : null;
    }


    handleClose(event: Event): void {
        event.preventDefault();

        const dom = this.getHostElement();
        this.renderer.setStyle(dom, 'height', `${dom.offsetHeight}px`);
        // Magic code
        // 重复一次后才能正确设置 height
        this.renderer.setStyle(dom, 'height', `${dom.offsetHeight}px`);

        this.closing = false;
        // 执行动画
        transitionLeave(dom, `${this.prefixCls}-slide-up`, () => {
            this.closed = this.closing = true;
            this.close.emit(event);
            this.el.nativeElement.remove(); // remove from dom tree
        });
    }


}
