/**
 * @license
 * Copyright 厦门乾元盛世科技有限公司 All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file.
 */

import {
    Component, Directive, Input, ElementRef, Renderer2, ViewEncapsulation,
    OnInit, OnDestroy, OnChanges, AfterContentInit, AfterViewInit, SimpleChanges,
    ComponentFactoryResolver, ApplicationRef, Injector, Inject
} from '@angular/core';
import { DOCUMENT } from '@angular/platform-browser';
import { UpdateClassService } from '../core/service/update.class.service';

import { placements, getPlacements } from './placements';
import { getPopupClassNameFromAlign, getAlignFromPlacement } from '../trigger/utils';

import { Popup } from '../trigger/popup';
import { Trigger } from '../trigger/trigger';

export type TriggerType = 'hover' | 'focus' | 'click';
export type PopupPlacement =
    'top' | 'left' | 'right' | 'bottom' |
    'topLeft' | 'topRight' | 'bottomLeft' | 'bottomRight' |
    'leftTop' | 'leftBottom' | 'rightTop' | 'rightBottom';

/**
 * Tooltip
 */
@Component({
    selector: 'ant-tooltip',
    template: `
        <div #mask
           [ngStyle]="zIndexStyle"
           [ngClass]="maskClassName"></div>
        <div #popup
           [ngStyle]="popupStyles"
           [ngClass]="popupClassName"
           (mouseEnter)="onMouseEnter($event)" (mouseLeave)="onMouseLeave($event)">
            <div [class]="arrowClass">{{arrowContent}}</div>
            <div [class]="popupBodyClass">{{title}}</div>
        </div>
    `,
    styleUrls: ['./style/index.scss'],
    preserveWhitespaces: false,
    encapsulation: ViewEncapsulation.None,
    providers: [ UpdateClassService ]
})
export class Tooltip extends Popup {

    /** 提示文字 */
    @Input() title: string;

    /** 气泡框位置，默认为`top` */
    @Input() placement: PopupPlacement = 'top';

    /**
     * 箭头是否指向目标元素中心
     */
    @Input() arrowPointAtCenter = false;

    @Input() arrowContent: string;

    @Input() builtinPlacements: Object = placements;

    // 内部样式
    public popupBodyClass: string;
    public arrowClass: string;

    constructor(
        public renderer: Renderer2,
        public elementRef: ElementRef,
        public updateClassService: UpdateClassService) {
        super(renderer, elementRef, updateClassService);
    }

    protected updatePrefixCls(): void {
        super.updatePrefixCls();
        this.popupBodyClass = `${this.prefixCls}-inner`;
        this.arrowClass = `${this.prefixCls}-arrow`;
    }

    getPlacements() {
        if (this.arrowPointAtCenter) {
            return getPlacements({
                arrowPointAtCenter: this.arrowPointAtCenter,
                verticalArrowShift: 8,
            });
        }
        return this.builtinPlacements;
    }

    // 获取ClassName
    getClassNameFromAlign(align: any): any {
        const classes = [];
        if (this.arrowPointAtCenter) {
            const _placements = this.getPlacements();
            if (this.placement && _placements) {
                classes.push(getPopupClassNameFromAlign(_placements, this.prefixCls, align));
            }
            return classes.join(' ');
        }

        return super.getClassNameFromAlign(align);
    }

    getAlign(): {} {
        if (this.arrowPointAtCenter) {
            const _placements = this.getPlacements();
            if (this.placement && _placements) {
                return getAlignFromPlacement(_placements, this.placement, this.align);
            }
        }

        return super.getAlign();
    }

    /**
     * 动态设置动画点
     *
     * @param align 参考https://www.npmjs.com/package/dom-align
     * @override override from Popup and Align Component
     */
    onAlign(align: any): void {
        super.onAlign(align);

        const _placements = this.getPlacements();
        // 当前返回的位置
        const placement = Object.keys(_placements).filter(
            key => (
                _placements[key].points[0] === align.points[0] &&
                _placements[key].points[1] === align.points[1]
            ),
        )[0];
        if (!placement) {
            return;
        }

        // 根据当前坐标设置动画点
        const el = super.getHostElement();
        const rect = el.getBoundingClientRect();
        const transformOrigin = {
            top: '50%',
            left: '50%',
        };
        if (placement.indexOf('top') >= 0 || placement.indexOf('Bottom') >= 0) {
            transformOrigin.top = `${rect.height - align.offset[1]}px`;
        } else if (placement.indexOf('Top') >= 0 || placement.indexOf('bottom') >= 0) {
            transformOrigin.top = `${-align.offset[1]}px`;
        }
        if (placement.indexOf('left') >= 0 || placement.indexOf('Right') >= 0) {
            transformOrigin.left = `${rect.width - align.offset[0]}px`;
        } else if (placement.indexOf('right') >= 0 || placement.indexOf('Left') >= 0) {
            transformOrigin.left = `${-align.offset[0]}px`;
        }
        el.style.transformOrigin = `${transformOrigin.left} ${transformOrigin.top}`;
    }


    onMouseEnter(event: Event): void {
        super.onMouseEnter(event);
    }

    onMouseLeave(event: Event): void {
        super.onMouseLeave(event);
    }
}


/**
 * 用法：
 * 1. 简单用法：<span ant-tooltip title="prompt text">Tooltip will show when mouse enter.</span>
 * 2. 按钮用法：
 * <ant-button ant-tooltip placement="topLeft" title="Prompt Text" [arrowPointAtCenter]="true">
 *     箭头指向中心 (Arrow points to center)
 * </ant-button>
 */
@Directive({
    // tslint:disable-next-line:directive-selector
    selector: '[ant-tooltip]',
    exportAs: 'tooltip'
})
export class TooltipTrgger extends Trigger implements OnInit, OnDestroy, OnChanges, AfterContentInit, AfterViewInit {

    /** 样式前缀 */
    @Input() prefixCls = 'ant-tooltip';

    /** title属性，将被当做成弹出的内容或标题 */
    @Input() title: string;

    /**
     * 箭头是否指向目标元素中心
     */
    @Input() arrowPointAtCenter = false;

    @Input() mouseEnterDelay = 0.1;
    @Input() mouseLeaveDelay = 0.1;

    @Input() set overlayClass(overlayClass: string) {
        this.popupClass = overlayClass;
    }

    @Input() set overlayStyle(overlayStyle: any) {
        this.popupStyle = overlayStyle;
    }

    @Input() transitionName = 'zoom-big-fast';

    @Input() openClass: string;

    @Input() set trigger(trigger: TriggerType) {
        this.action = [trigger];
    }

    /** 缩略写法：action placement */
    @Input('ant-tooltip') set tooltip(tooltip: string) {
        if (tooltip && tooltip.length) {
            const str = tooltip.split('[ ,]');

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
        this.trigger = 'hover';
    }

    ngOnInit(): void {
        super.ngOnInit();
        this.popupComponentType = Tooltip; // 设定冒泡的类型为指定的类型
    }

    ngOnDestroy(): void {
        super.ngOnDestroy();
    }

    ngAfterContentInit(): void {

    }

    ngAfterViewInit(): void {
        // prevent the default `title` html action
        const el = this.elementRef.nativeElement;
        if (el.nodeType === 1) {
            this.renderer.removeAttribute(this.elementRef.nativeElement, 'title');
        }
        super.ngAfterViewInit();
    }

    afterRenderPopupComponent(): void {
        super.afterRenderPopupComponent();
        super.setPopupAttribute('title', this.title);
        super.setPopupAttribute('arrowPointAtCenter', this.arrowPointAtCenter);
    }

    ngOnChanges(changes: SimpleChanges): void {
        super.ngOnChanges(changes);
        if (changes['title']) {
            super.setPopupAttribute('title', this.title);
        }
        if (changes['arrowPointAtCenter']) {
            super.setPopupAttribute('arrowPointAtCenter', this.arrowPointAtCenter);
        }
    }

}

