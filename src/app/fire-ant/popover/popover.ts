/**
 * @license
 * Copyright 厦门乾元盛世科技有限公司 All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file.
 */

import {
    Component, Directive, Input, ElementRef, Renderer2, ViewEncapsulation,
    OnInit, OnChanges, AfterContentInit, AfterViewInit, ContentChild, ViewChild, SimpleChanges,
    ComponentFactoryResolver, ApplicationRef, Injector, Inject
} from '@angular/core';
import { DOCUMENT } from '@angular/platform-browser';

import { UpdateClassService } from '../core/service/update.class.service';

import { Tooltip, TooltipTrgger, TriggerType } from '../tooltip/tooltip';
import { PopoverContent } from './popover.content';
import { onNextFrame } from '../util/anim.frame';


/**
 * Popover
 */
@Component({
    selector: 'ant-popover',
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
                <div [class]="titleClass" *ngIf="title">{{title}}</div>
                <div [class]="contentClass" #container>{{content}}</div>
            </div>
        </div>
    `,
    styleUrls: ['./style/index.scss'],
    encapsulation: ViewEncapsulation.None,
    providers: [ UpdateClassService ]
})
export class Popover extends Tooltip implements AfterViewInit {

    /** 简单内容 */
    @Input() content: string;

    /** 复杂内容 */
    @Input() child: PopoverContent;

    /** 内容的直接容器 */
    @ViewChild('container') container: ElementRef;

    // 内部样式
    public titleClass: string;
    public contentClass: string;

    constructor(
        public renderer: Renderer2,
        public elementRef: ElementRef,
        public updateClassService: UpdateClassService) {
        super(renderer, elementRef, updateClassService);
    }

    protected updatePrefixCls(): void {
        super.updatePrefixCls();
        this.titleClass = `${this.prefixCls}-title`;
        this.contentClass = `${this.prefixCls}-inner-content`;
    }

    ngAfterViewInit(): void {
        super.ngAfterViewInit();

        if (this.child) {
            onNextFrame(() => {
                const parent = this.container.nativeElement as HTMLElement;
                parent.appendChild(this.child.getHostElement());
                this.forceAlign();
            });
        }
    }

}


/**
 * 用法：
 * 1. 简单用法：
 * <span ant-popover title="prompt text" pop-content="popover content">Popover will show when mouse enter.</span>
 * 2. 按钮用法：
 * <ant-button ant-popover placement="topLeft" title="Prompt Text" pop-content="popover content" [arrowPointAtCenter]="true">
 *     箭头指向中心 (Arrow points to center)
 * </ant-button>
 */
@Directive({
    // tslint:disable-next-line:directive-selector
    selector: '[ant-popover]',
    exportAs: 'popover'
})
export class PopoverTrgger extends TooltipTrgger implements OnInit, OnChanges, AfterContentInit {

    /** 样式前缀 */
    @Input() prefixCls = 'ant-popover';

    // tslint:disable-next-line:no-input-rename
    @Input('pop-content') content: string;

    @Input() transitionName = 'zoom-big';

    /** 自定义的内容 */
    @ContentChild(PopoverContent) child: PopoverContent;

    /** 缩略写法：action placement */
    @Input('ant-popover') set popover(popover: string) {
        if (popover && popover.length) {
            const str = popover.split('[ ,]');

            const triggerAction: TriggerType[] = [];
            for (let i = 0; i < str.length; i++) {
                if (str[i] === 'click' || str[i] === 'hover' || str[i] === 'focus') {
                    triggerAction.push(str[i] as TriggerType);
                }
                if (['top', 'left', 'right', 'bottom', 'topLeft', 'topRight',
                    'bottomLeft', 'bottomRight', 'leftTop', 'leftBottom', 'rightTop', 'rightBottom'].includes(str[i])) {
                    this.placement = str[i];
                }
            }
            if (triggerAction.length) {
                this.action = triggerAction;
            }
        }
    }


    constructor(
        public renderer: Renderer2,
        public elementRef: ElementRef,
        public componentFactoryResolver: ComponentFactoryResolver,
        public appRef: ApplicationRef,
        public injector: Injector,
        @Inject(DOCUMENT) public doc: Document) {
        super(renderer, elementRef, componentFactoryResolver, appRef, injector, doc);
    }

    ngOnInit(): void {
        super.ngOnInit();
        this.popupComponentType = Popover; // 设定冒泡的类型为指定的类型
    }

    afterRenderPopupComponent(): void {
        super.afterRenderPopupComponent();
        super.setPopupAttribute('content', this.content);
        super.setPopupAttribute('child', this.child);
    }

    ngOnChanges(changes: SimpleChanges): void {
        super.ngOnChanges(changes);
        if (changes['content']) {
            super.setPopupAttribute('content', this.content);
        }
    }

    ngAfterContentInit(): void {
        super.ngAfterContentInit();
        if (this.child) {
            this.child.getHostElement().remove();
        }
    }

    /*
    registerTriggerElement(triggerElement: HTMLElement): void {
        // 对按钮(ant-button)作特殊处理
        if (this.__elementRef.nativeElement.nodeName === 'ANT-BUTTON') {
            this._popup.registerTriggerElement(triggerElement.querySelector('button') as HTMLElement);
        } else {
            super.registerTriggerElement(triggerElement);
        }
    }
    */

}

