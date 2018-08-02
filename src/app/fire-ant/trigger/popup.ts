/**
 * @license
 * Copyright 厦门乾元盛世科技有限公司 All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file.
 */

import { Component, Input, ElementRef, Renderer2, ViewEncapsulation, OnInit, OnDestroy } from '@angular/core';
import { UpdateClassService } from '../core/service/update.class.service';

import { isPresent, toNumber } from '../util/lang';
import { Align } from './align';
import { getPopupClassNameFromAlign, getAlignFromPlacement } from './utils';



export type PopupPlacement =
    'top' | 'left' | 'right' | 'bottom' |
    'topLeft' | 'topRight' | 'bottomLeft' | 'bottomRight' |
    'leftTop' | 'leftBottom' | 'rightTop' | 'rightBottom';

/**
 * Popup
 * 参考 https://github.com/react-component/trigger
 */
@Component({
    selector: 'ant-popup',
    template: `
        <div #mask
           [ngStyle]="zIndexStyle"
           [ngClass]="maskClassName"></div>
        <div #popup
           [ngStyle]="popupStyles"
           [ngClass]="popupClassName"
           (mouseEnter)="onMouseEnter($event)" (mouseLeave)="onMouseLeave($event)"></div>
    `,
    encapsulation: ViewEncapsulation.None,
    providers: [ UpdateClassService ]
})
export class Popup extends Align implements OnInit, OnDestroy {

    @Input()
    get prefixCls(): string {
        return this._prefixCls;
    }
    set prefixCls(prefixCls: string) {
        if (this._prefixCls !== prefixCls) {
            this._prefixCls = prefixCls;
            this.updateClassMap();
            this.updatePrefixCls();
        }
    }
    private _prefixCls: string;


    @Input()
    get className(): string {
        return this._className;
    }
    set className(className: string) {
        if (this._className !== className) {
            this._className = className;
            this.updateClassMap();
        }
    }
    private _className: string;


    @Input()
    public get popupStyle(): object {
        return this._popupStyle;
    }
    public set popupStyle(popupStyle: object) {
        if (this._popupStyle !== popupStyle) {
            this._popupStyle = popupStyle;
            this.updatePopupStyles();
        }
    }
    private _popupStyle: object;

    @Input()
    public get zIndex(): number {
        return this._zIndex;
    }
    public set zIndex(zIndex: number) {
        if (isPresent(zIndex)) {
            const value = toNumber(zIndex, null);
            if (this._zIndex !== value) {
                this._zIndex = value;
                this.updateZIndexStyle();
                this.updatePopupStyles();
            }
        }
    }
    private _zIndex: number;


    /**
     * 气泡框位置，可选 top left right bottom topLeft topRight bottomLeft bottomRight leftTop leftBottom rightTop rightBottom。
     * 默认值为top。
     */
    @Input()
    public get placement(): PopupPlacement {
        return this._placement;
    }
    public set placement(placement: PopupPlacement) {
        if (this._placement !== placement) {
            this._placement = placement;
            this.updateClassMap();
        }
    }
    private _placement: PopupPlacement = 'top';


    @Input() destroyPopupOnHide: boolean;

    @Input() action: string | string[];

    @Input() animation: any;

    @Input() transitionName: string | object;

    /**
     * 是否已遮罩
     */
    @Input() mask: boolean;

    /**
     * 遮罩动画名
     */
    @Input() maskAnimation: string;

    /**
     * 遮罩过渡效果
     */
    @Input() maskTransitionName: string | object;

    /** 可用的位置 */
    @Input() builtinPlacements: Object;

    /**
     * 冒泡触发器：目标Element
     */
    private _triggerElement: HTMLElement;


    @Input()
    get visible(): boolean {
        return this._visible;
    }
    set visible(visible: boolean) {
        this._visible = visible;
        this.disabled = !visible;
        this.currentAlignClassName = null;
        this.updateClassMap();
    }
    private _visible: boolean;


    // 排列后的样式，如：ant-tooltip-placement-leftTop
    private get currentAlignClassName(): string {
        return this._currentAlignClassName;
    }
    private set currentAlignClassName(currentAlignClassName: string) {
        if (this._currentAlignClassName !== currentAlignClassName) {
            this._currentAlignClassName = currentAlignClassName;
            this.updateClassMap();
        }
    }
    private _currentAlignClassName: string;


    onMouseEnterFn: (_: any) => void;
    onMouseLeaveFn: (_: any) => void;


    // 内部样式
    public maskClassName: any;
    public popupClassName: any;
    public popupStyles: any = {};
    public zIndexStyle: any = {};


    constructor(
        public renderer: Renderer2,
        public elementRef: ElementRef,
        public updateClassService: UpdateClassService) {
        super(renderer, elementRef);
        this.monitorWindowResize = true;
    }

    ngOnInit(): void {
        super.ngOnInit();
        this.updatePrefixCls();
        this.updateClassMap();
    }

    ngOnDestroy(): void {
        super.ngOnDestroy();
    }

    // will be override
    protected updatePrefixCls(): void {
        this.popupClassName = `${this.prefixCls}-content`;
        this.maskClassName = {
            [`${this.prefixCls}-mask`]: true,
            [`${this.prefixCls}-mask-hidden`]: !this.visible
        };
    }

    protected updateClassMap(): void {
        const align = this.getAlign();
        const alignClass = this.currentAlignClassName || this.getClassNameFromAlign(align);
        const classes = {
            [`${this.prefixCls}`]: true,
            [`${this.prefixCls}-hidden`]: !this.visible,
            [`${alignClass}`]: alignClass,
            [`${this.className}`]: this.className
        };
        this.updateClassService.update(this.elementRef.nativeElement, classes);
    }

    protected updateZIndexStyle(): void {
        this.zIndexStyle = { 'z-index': this.zIndex  };
    }

    protected updatePopupStyles(): void {
        this.popupStyles = { ...this.zIndexStyle, ...this.popupStyle };
    }

    setVisible(visible: boolean): void {
        this.visible = visible;
    }

    // 获取ClassName
    getClassNameFromAlign(align: any): any {
        const classes = [];
        if (this.placement && this.builtinPlacements) {
            classes.push(getPopupClassNameFromAlign(this.builtinPlacements, this.prefixCls, align));
        }
        return classes.join(' ');
    }

    getAlign(): {} {
        const align = super.getAlign();
        if (this.placement && this.builtinPlacements) {
            return getAlignFromPlacement(this.builtinPlacements, this.placement, align);
        }
        return align;
    }

    // override from Align Component
    onAlign(align: any): void {
        super.onAlign(align);
        this.currentAlignClassName = this.getClassNameFromAlign(align);
    }

    registerTriggerElement(triggerElement: HTMLElement): void {
        this._triggerElement = triggerElement;
    }

    registerOnMouseEnter(fn: ((_: any) => void)): void {
        this.onMouseEnterFn = fn;
    }

    registerOnMouseLeave(fn: ((_: any) => void)): void {
        this.onMouseLeaveFn = fn;
    }

    /**
     * <ant-popup> element: The underlying host native element
     */
    getHostElement(): HTMLElement {
        return this.elementRef.nativeElement as HTMLElement;
    }

    // overrides from Align
    getBaseTarget(): any {
        return this._triggerElement;
    }

    getMaskTransitionName() {
        let transitionName = this.maskTransitionName;
        const animation = this.maskAnimation;
        if (!transitionName && animation) {
            transitionName = `${this.prefixCls}-${animation}`;
        }
        return transitionName;
    }

    getTransitionName() {
        let transitionName = this.transitionName;
        if (!transitionName && this.animation) {
            transitionName = `${this.prefixCls}-${this.animation}`;
        }
        return transitionName;
    }

    onMouseEnter(event: Event): void {
        if (this.onMouseEnterFn) {
            this.onMouseEnterFn(event);
        }
    }

    onMouseLeave(event: Event): void {
        if (this.onMouseLeaveFn) {
            this.onMouseLeaveFn(event);
        }
    }
}

