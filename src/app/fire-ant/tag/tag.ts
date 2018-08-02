/**
 * @license
 * Copyright 厦门乾元盛世科技有限公司 All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file.
 */

import { Component, Input, Output, OnInit, EventEmitter, ElementRef, HostBinding, ViewEncapsulation } from '@angular/core';
import { UpdateClassService } from '../core/service/update.class.service';
import { toBoolean } from '../util/lang';

import { transitionLeave } from '../core/animation/transition';


@Component({
    selector: 'ant-tag',
    template: `
        <span [class]="textClasses"><ng-content></ng-content></span>
        <ant-icon type="cross" (click)="doClose($event)" *ngIf="closable"></ant-icon>
    `,
    styleUrls: ['./style/index.scss'],
    preserveWhitespaces: false,
    encapsulation: ViewEncapsulation.None,
    providers: [ UpdateClassService ]
    /*
    animations: [
        trigger('state', [
            state('closed', style({ opacity: 0 })),
            transition('* => closed', [animate('300ms ease-out', keyframes([
                style({ transform: 'scale(1)', opacity: 1, offset: 0 }),
                style({ transform: 'scale(0.2)', opacity: 0, offset: 1 })
            ]))])
        ])
    ]*/
})
export class Tag implements OnInit {

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
    private _prefixCls = 'ant-tag';


    /** 标签是否可以关闭 */
    @Input()
    get closable(): boolean {
        return this._closable;
    }
    set closable(closable: boolean) {
        const value = toBoolean(closable);
        if (this._closable !== value) {
            this._closable = value;
        }
    }
    private _closable = false;


    /** 标签色 */
    @Input()
    get color(): string {
        return this._color;
    }
    set color(color: string) {
        if (this._color !== color) {
            this._color = color;
            this.updateClassMap();
        }
    }
    private _color: string;



    /** 关闭前事件 */
    @Output() beforeClose = new EventEmitter<Event>();

    /** 关闭后事件 */
    @Output() close = new EventEmitter<Event>();


    /** 状态 */
    public closed = false;

    /*
    // 动画触发角
    @HostBinding('@state')
    get state(): string {
        return closed ? 'closed' : null;
    }
    */

    // 内部样式
    public textClasses: string;

    constructor(
        protected el: ElementRef,
        protected updateClassService: UpdateClassService) {

    }

    ngOnInit(): void {
        this.updateClassMap();
        this.updateTextClass();
    }

    protected updateClassMap(): void {
        const isPresetColor = this.isPresetColor(this.color);
        const classes = {
            [`${this.prefixCls}`]: true,
            [`${this.prefixCls}-${this.color}`]: isPresetColor,
            [`${this.prefixCls}-has-color`]: (this.color && !isPresetColor)
        };
        this.updateClassService.update(this.el.nativeElement, classes);
    }

    private updateTextClass(): void {
        this.textClasses = `${this.prefixCls}-text`;
    }

    @HostBinding('style.backgroundColor') get backgroundColor(): string {
        const isPresetColor = this.isPresetColor(this.color);
        return (this.color && !isPresetColor) ? this.color : null;
    }

    @HostBinding('attr.data-show') get dataShow(): boolean {
        return !this.closed;
    }

    get transitionName(): string {
        return `${this.prefixCls}-zoom`;
    }

    /** The underlying host native element */
    getHostElement(): HTMLElement {
        return this.el.nativeElement as HTMLElement;
    }

    doClose(event: Event): void {
        this.beforeClose.emit(event);
        if (event.defaultPrevented) {
            return;
        }

        const dom = this.getHostElement();
        dom.style.width = `${dom.getBoundingClientRect().width}px`;
        // It's Magic Code, don't know why
        dom.style.width = `${dom.getBoundingClientRect().width}px`;

        // 执行动画
        transitionLeave(dom, this.transitionName, () => {
            this.closed = true;
            this.close.emit(event);
            this.el.nativeElement.remove(); // remove from dom tree
        });
    }

    isPresetColor(color: string): boolean {
        return /^(pink|red|yellow|orange|cyan|green|blue|purple)(-inverse)?$/.test(color);
    }

}

