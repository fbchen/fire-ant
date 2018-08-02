/**
 * @license
 * Copyright 厦门乾元盛世科技有限公司 All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file.
 */

import { Component, Input, ElementRef, ViewEncapsulation, OnInit } from '@angular/core';
import { UpdateClassService } from '../core/service/update.class.service';


/**
 * Avatar头像
 * 用来代表用户或事物，支持图片、图标或字符展示。
 */
@Component({
    selector: 'ant-avatar',
    template: `
        <img [src]="src" *ngIf="src" />
        <ant-icon [type]="icon" *ngIf="icon"></ant-icon>
        <span *ngIf="!src && !icon" #textnode
            [class]="textNodeClass" [ngStyle]="getTextNodeStyle(textnode)">
            {{text}}<ng-content></ng-content>
        </span>
    `,
    styleUrls: ['./style/index.scss'],
    preserveWhitespaces: false,
    encapsulation: ViewEncapsulation.None,
    providers: [ UpdateClassService ]
})
export class Avatar implements OnInit {

    /** 样式前缀 */
    @Input()
    get prefixCls(): string {
        return this._prefixCls;
    }
    set prefixCls(prefixCls: string) {
        if (this._prefixCls !== prefixCls) {
            this._prefixCls = prefixCls;
            this.updateClassMap();
            this.updateTextClass();
        }
    }
    private _prefixCls = 'ant-avatar';

    /** 指定头像的形状; Shape of avatar, options:`circle`, `square` */
    @Input()
    get shape(): 'circle' | 'square' {
        return this._shape;
    }
    set shape(shape: 'circle' | 'square') {
        if (this._shape !== shape) {
            this._shape = shape;
            this.updateClassMap();
        }
    }
    private _shape: 'circle' | 'square' = 'circle';

    /** 设置头像的大小; Size of avatar, options:`large`, `small`, `default` */
    @Input()
    get size(): 'large' | 'small' | 'default' {
        return this._size;
    }
    set size(size: 'large' | 'small' | 'default') {
        if (this._size !== size) {
            this._size = size;
            this.updateClassMap();
        }
    }
    private _size: 'large' | 'small' | 'default' = 'default';

    /** 图片类头像的资源地址; Src of image avatar */
    @Input()
    get src(): string {
        return this._src;
    }
    set src(src: string) {
        if (this._src !== src) {
            this._src = src;
            this.updateClassMap();
        }
    }
    private _src: string;

    /** 设置头像的图标类型，参考 `Icon` 组件; Type of the Icon to be used in avatar */
    @Input()
    get icon(): string {
        return this._icon;
    }
    set icon(icon: string) {
        if (this._icon !== icon) {
            this._icon = icon;
            this.updateClassMap();
        }
    }
    private _icon: string;

    /** 直接指定的文本 */
    @Input()
    get text(): string {
        return this._text;
    }
    set text(text: string) {
        if (this._text !== text) {
            this._text = text;
        }
    }
    private _text: string;

    /** 样式 */
    public textNodeClass: string;
    private textNodeStyle: any;
    private scale: number;

    constructor(
        protected el: ElementRef,
        protected updateClassService: UpdateClassService) {

    }

    ngOnInit(): void {
        this.updateClassMap();
        this.updateTextClass();
    }

    private updateClassMap(): void {
        const classes = {
            [`${this.prefixCls}`]: true,
            [`${this.prefixCls}-${this.shape}`]: this.shape,
            [`${this.prefixCls}-image`]: this.src,
            [`${this.prefixCls}-icon`]: this.icon,
            [`${this.prefixCls}-lg`]: this.size === 'large',
            [`${this.prefixCls}-sm`]: this.size === 'small'
        };
        this.updateClassService.update(this.el.nativeElement, classes);
    }

    private updateTextClass(): void {
        this.textNodeClass = `${this.prefixCls}-string`;
    }

    public getTextNodeStyle(textNode: HTMLElement): any {
        const textWidth = textNode.offsetWidth;
        const totalWidth = this.getHostElement().offsetWidth;

        let scale = 1; // 放大或缩小的倍数
        // add 4px gap for each side to get better performance
        if (totalWidth - 8 < textWidth) {
            scale = (totalWidth - 8) / textWidth;
        }
        if (this.scale !== scale) {
            this.scale = scale;
            this.textNodeStyle = {
                'display': 'inline-block',
                '-ms-transform': `scale(${scale})`,
                '-webkit-transform': `scale(${scale})`,
                'transform': `scale(${scale})`
            };
        }
        return this.textNodeStyle;
    }

    /** The underlying host native element */
    getHostElement(): HTMLElement {
        return this.el.nativeElement as HTMLElement;
    }

}
