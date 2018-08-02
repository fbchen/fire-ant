/**
 * @license
 * Copyright 厦门乾元盛世科技有限公司 All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file.
 */

import {
    Component, Directive, Input, Output, EventEmitter, ElementRef, Renderer2, ViewEncapsulation,
    OnInit, OnChanges, SimpleChanges, ComponentFactoryResolver, ApplicationRef, Injector, Inject
} from '@angular/core';
import { DOCUMENT } from '@angular/platform-browser';

import { UpdateClassService } from '../core/service/update.class.service';
import { Popover, PopoverTrgger } from '../popover/popover';


/**
 * Popconfirm
 */
@Component({
    selector: 'ant-popconfirm',
    template: `
        <div #mask
           [ngStyle]="zIndexStyle"
           [ngClass]="maskClassName"></div>
        <div #popup
           [ngStyle]="popupStyles"
           [ngClass]="popupClassName"
           (mouseEnter)="onMouseEnter($event)" (mouseLeave)="onMouseLeave($event)">
            <div [class]="arrowClass">{{arrowContent}}</div>
            <div [class]="popupBodyClass">
                <div [class]="contentClass">
                    <div class="{{prefixCls}}-message">
                        <ant-icon type="exclamation-circle"></ant-icon>
                        <div class="{{prefixCls}}-message-title"><pre [innerHtml]="title"></pre></div>
                    </div>
                    <div class="{{prefixCls}}-buttons">
                        <ant-button (click)="onCancel($event)" size="small">
                            {{cancelText || locale.cancelText}}
                        </ant-button>
                        <ant-button (click)="onConfirm($event)" type="primary" size="small">
                            {{okText || locale.okText}}
                        </ant-button>
                    </div>
                </div>
            </div>
        </div>
    `,
    styleUrls: ['../popover/style/index.scss'],
    preserveWhitespaces: false,
    encapsulation: ViewEncapsulation.None,
    providers: [ UpdateClassService ]
})
export class Popconfirm extends Popover {

    /** 本地化 */
    @Input() locale = {
        cancelText: '取消',
        okText: '确定'
    };

    /** 确定按钮 */
    @Input() okText: string;

    /** 取消按钮 */
    @Input() cancelText: string;

    /** 点击确定按钮的事件 */
    @Output() confirm = new EventEmitter<any>();

    /** 点击取消按钮的事件 */
    @Output() cancel = new EventEmitter<any>();

    constructor(
        public renderer: Renderer2,
        public elementRef: ElementRef,
        public updateClassService: UpdateClassService) {
        super(renderer, elementRef, updateClassService);
    }

    onConfirm(event: Event): void {
        event.preventDefault();
        this.setVisible(false);
        this.confirm.emit();
    }

    onCancel(event: Event): void {
        event.preventDefault();
        this.setVisible(false);
        this.cancel.emit();
    }


}


/**
 * 用法：
 * <ant-button popconfirm title="delete the file?" (confirm)="delete()">Delete</ant-button>
 */
@Directive({
    selector: '[popconfirm]',
    exportAs: 'popconfirm'
})
export class PopconfirmTrgger extends PopoverTrgger implements OnInit, OnChanges {

    /** 确定按钮 */
    @Input() okText: string;

    /** 取消按钮 */
    @Input() cancelText: string;

    /** 点击确定按钮的事件 */
    @Output() confirm = new EventEmitter<any>();

    /** 点击取消按钮的事件 */
    @Output() cancel = new EventEmitter<any>();

    constructor(
        public renderer: Renderer2,
        public elementRef: ElementRef,
        public componentFactoryResolver: ComponentFactoryResolver,
        public appRef: ApplicationRef,
        public injector: Injector,
        @Inject(DOCUMENT) public doc: Document) {
        super(renderer, elementRef, componentFactoryResolver, appRef, injector, doc);
        this.trigger = 'click';
    }

    ngOnInit(): void {
        super.ngOnInit();
        this.popupComponentType = Popconfirm; // 设定冒泡的类型为指定的类型
    }

    afterRenderPopupComponent(): void {
        super.afterRenderPopupComponent();
        super.setPopupAttribute('okText', this.okText);
        super.setPopupAttribute('cancelText', this.cancelText);

        const instance = this._popup as Popconfirm;
        instance.confirm.subscribe(() => {
            this.confirm.emit();
        });
        instance.cancel.subscribe(() => {
            this.cancel.emit();
        });
    }

    ngOnChanges(changes: SimpleChanges): void {
        super.ngOnChanges(changes);
        if (changes['okText']) {
            super.setPopupAttribute('okText', this.okText);
        }
        if (changes['cancelText']) {
            super.setPopupAttribute('cancelText', this.cancelText);
        }
    }


}

