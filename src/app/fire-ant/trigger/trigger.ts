/**
 * @license
 * Copyright 厦门乾元盛世科技有限公司 All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file.
 */

import {
    Input, Output, EventEmitter, ElementRef, Renderer2, OnInit, OnDestroy, OnChanges, SimpleChanges,
    ComponentFactoryResolver, ComponentRef, ApplicationRef, Injector, Type, AfterViewInit, HostListener
} from '@angular/core';
import { ɵgetDOM as getDOM } from '@angular/platform-browser';
import { DomUtils } from '../util/dom.utils';
import { onNextFrame } from '../util/anim.frame';
import { Popup } from './popup';



const defaultPopupAttributes = {
    'prefixCls': 'prefixCls',
    'destroyPopupOnHide': 'destroyPopupOnHide',
    'popupVisible': 'visible',
    'popupClass': 'className',
    'placement': 'placement',
    'action': 'action',
    'popupAnimation': 'animation',
    'popupTransitionName': 'transitionName',
    'mask': 'mask',
    'maskAnimation': 'maskAnimation',
    'maskTransitionName': 'maskTransitionName',
    'popupStyle': 'popupStyle',
    'zIndex': 'zIndex',
    'disabled': 'disabled'
};

/**
 * Abstract Trigger。
 * 参考 https://github.com/react-component/trigger
 */
export class Trigger implements OnInit, OnDestroy, OnChanges, AfterViewInit {

    @Input() prefixCls;

    /** 当属性冲突时，可以使用popupPrefixCls来代替prefixCls */
    @Input() set popupPrefixCls(popupPrefixCls: string) {
        this.prefixCls = popupPrefixCls;
    }

    @Input() destroyPopupOnHide = false;

    @Input() popupClass: string;

    /**
     * 气泡框位置，可选 top left right bottom topLeft topRight bottomLeft bottomRight leftTop leftBottom rightTop rightBottom。
     * 默认值为top。
     */
    @Input() placement = 'top';

    @Input() popupStyle = {};

    @Input() popupAnimation: any;

    @Input() popupTransitionName: string | Object;

    /**
     * 是否不可用
     */
    @Input() disabled = false;

    /**
     * 是否已遮罩
     */
    @Input() mask = false;

    /**
     * 点击遮罩是否可关闭冒泡
     */
    @Input() maskClosable = true;

    /**
     * 遮罩动画名
     */
    @Input() maskAnimation: string;

    /**
     * 遮罩过渡效果
     */
    @Input() maskTransitionName: string | Object;


    /**
     * 鼠标移入后显示延迟时间（秒）
     */
    @Input() mouseEnterDelay = 0;

    /**
     * 鼠标移出后隐藏延迟时间（秒）
     */
    @Input() mouseLeaveDelay = 0.1;

    /**
     * 聚焦后显示延迟时间（秒）
     */
    @Input() focusDelay = 0;

    /**
     * 失焦后显示延迟时间（秒）
     */
    @Input() blurDelay = 0.15;

    @Input() zIndex: number;


    @Input() action: string | string[] = [];
    @Input() showAction: string | string[] = [];
    @Input() hideAction: string | string[] = [];

    // How to create popup container
    @Input() autoMountPopup = false;
    @Input() autoDestroyPopup = true;

    /** 触发前事件 */
    @Output() beforeTrigger = new EventEmitter<Event>();

    /**
     * 冒泡可视事件变更
     */
    @Output() popupVisibleChange = new EventEmitter<boolean>();

    /**
     * 记录聚焦时的开始时间
     */
    private focusTime: number;

    /**
     * 记录点击(MouseDown)的开始时间
     */
    private preClickTime: number;

    /**
     * 记录触摸(TouchStart)的开始时间
     */
    private preTouchTime: number;

    // 点击Document的事件（一般用于触发点击后隐藏冒泡组件）
    private clickOutsideHandler: Function;
    private touchOutsideHandler: Function;

    // 冒泡相关控件
    public popupComponentType: Type<Popup>;

    private _popup_container: HTMLElement;

    private _popupComponentRef: ComponentRef<Popup>;

    protected _popup: Popup;

    protected _popupVisible = false;

    /**
     * 延迟计时器（显示或隐藏冒泡）
     */
    private delayTimer: any;

    constructor(
        public renderer: Renderer2,
        public elementRef: ElementRef,
        public componentFactoryResolver: ComponentFactoryResolver,
        public appRef: ApplicationRef,
        public injector: Injector,
        public doc: Document) {

    }

    ngOnInit(): void {

    }

    ngAfterViewInit(): void {
        if (this.autoMountPopup) {
            this.renderPopupComponent();
        }
    }

    ngOnDestroy(): void {
        this.clearDelayTimer();
        this.clearOutsideHandler();

        if (this.autoDestroyPopup) {
            this.removePopupContainer();
        }
    }

    /** The underlying host native element */
    getHostElement(): HTMLElement {
        return this.elementRef.nativeElement as HTMLElement;
    }

    @Input() set popupVisible(popupVisible: boolean) {
        this.setPopupVisible(popupVisible);
    }

    get popupVisible(): boolean {
        return this._popupVisible;
    }

    protected _getPopupContainer(): HTMLElement {
        if (!this._popup_container) {
            const popupContainer = getDOM().createElement('div');
            // Make sure default popup container will never cause scrollbar appearing
            // https://github.com/react-component/trigger/issues/41
            popupContainer.style.position = 'absolute';
            popupContainer.style.top = '0';
            popupContainer.style.left = '0';
            popupContainer.style.width = '100%';

            const mountNode = this.getPopupContainer() || this.doc.body;
            mountNode.appendChild(popupContainer);
            this._popup_container = popupContainer;
        }

        return this._popup_container;
    }

    // this method can be overrided by subclass
    getPopupContainer(): HTMLElement {
        return null;
    }

    removePopupContainer(): void {
        if (this._popup_container) {
            // 销毁冒泡组件
            this._popupComponentRef.destroy();
            // 销毁冒泡组件的容器
            const container = this._popup_container;
            container.parentNode.removeChild(container);
            this._popup_container = null;
        }
    }

    renderPopupComponent(): void {
        if (this._popup) {
            return;
        }

        const componentFactory = this.componentFactoryResolver.resolveComponentFactory(this.popupComponentType);
        const componentRef: ComponentRef<Popup> = componentFactory.create(this.injector);
        this.appRef.attachView(componentRef.hostView);

        // At this point the component has been instantiated, so we move it to the location in the DOM
        // where we want it to be rendered.
        const popupContainer: HTMLElement = this._getPopupContainer();
        popupContainer.appendChild(DomUtils.getComponentRootNode(componentRef));
        this._popupComponentRef = componentRef;
        this._popup = componentRef.instance;

        // 将Trigger的属性赋值给Popup
        for (const name in defaultPopupAttributes) {
            if (defaultPopupAttributes.hasOwnProperty(name)) {
                this.setPopupAttribute(defaultPopupAttributes[name], this[name]);
            }
        }

        // 将Popup组件(元素)与Trigger组件(元素)关联起来
        this.registerTriggerElement(this.getHostElement());
        if (this.isMouseEnterToShow()) {
            this._popup.registerOnMouseEnter(this.onPopupMouseEnter.bind(this));
        }
        if (this.isMouseLeaveToHide()) {
            this._popup.registerOnMouseLeave(this.onPopupMouseLeave.bind(this));
        }
        this.afterRenderPopupComponent();
    }

    afterRenderPopupComponent(): void {
        // can be overrided by subclasss
    }

    registerTriggerElement(triggerElement: HTMLElement): void {
        this._popup.registerTriggerElement(triggerElement);
    }

    setPopupAttribute(name: string, value: any): void {
        if (this._popup) {
            this._popup[name] = value;
        }
    }

    ngOnChanges(changes: SimpleChanges): void {
        if (this._popup) {
            for (const name in defaultPopupAttributes) {
                if (defaultPopupAttributes.hasOwnProperty(name)) {
                    const thisKey = defaultPopupAttributes[name];
                    const change = changes[thisKey];
                    if (change) {
                        this.setPopupAttribute(name, change.currentValue);
                    }
                }
            }
        }
    }

    public setPopupComponentType(popupComponentType: Type<Popup>): void {
        this.popupComponentType = popupComponentType;
    }

    @HostListener('click', ['$event'])
    onClick(event: MouseEvent): void {
        if (this.isClickToHide() || this.isClickToShow()) {
            if (this.cancelTrigger(event)) {
                return;
            }

            // focus will trigger click
            if (this.focusTime) {
                let preTime;
                if (this.preClickTime && this.preTouchTime) {
                    preTime = Math.min(this.preClickTime, this.preTouchTime);
                } else if (this.preClickTime) {
                    preTime = this.preClickTime;
                } else if (this.preTouchTime) {
                    preTime = this.preTouchTime;
                }
                if (Math.abs(preTime - this.focusTime) < 20) {
                    return;
                }
                this.focusTime = 0;
            }
            this.preClickTime = 0;
            this.preTouchTime = 0;
            event.preventDefault();

            const nextVisible = !this.popupVisible;
            if (this.isClickToHide() && !nextVisible || nextVisible && this.isClickToShow()) {
                this.setPopupVisible(!this.popupVisible);
            }
        }
    }

    @HostListener('mousedown', ['$event'])
    onMouseDown(e: MouseEvent): void {
        if (this.isClickToHide() || this.isClickToShow()) {
            this.preClickTime = Date.now();
        }
    }

    @HostListener('touchstart', ['$event'])
    onTouchStart(e: MouseEvent): void {
        if (this.isClickToHide() || this.isClickToShow()) {
            if (this.cancelTrigger(e)) {
                return;
            }
            this.preTouchTime = Date.now();
        }
    }

    @HostListener('focus', ['$event'])
    onFocus(e: any): void {
        if (this.isFocusToShow() || this.isBlurToHide()) {
            // incase focusin and focusout
            this.clearDelayTimer();
            if (this.isFocusToShow()) {
                if (this.cancelTrigger(e)) {
                    return;
                }
                this.focusTime = Date.now();
                this.delaySetPopupVisible(true, this.focusDelay);
            }
        }
    }

    @HostListener('blur', ['$event'])
    onBlur(e: MouseEvent): void {
        if (this.isFocusToShow() || this.isBlurToHide()) {
            this.clearDelayTimer();
            if (this.isBlurToHide()) {
                this.delaySetPopupVisible(false, this.blurDelay);
            }
        }
    }

    @HostListener('mouseenter', ['$event'])
    onMouseEnter(e: MouseEvent): void {
        if (this.isMouseEnterToShow()) {
            if (this.cancelTrigger(e)) {
                return;
            }
            this.delaySetPopupVisible(true, this.mouseEnterDelay);
        }
    }

    @HostListener('mouseleave', ['$event'])
    onMouseLeave(e: MouseEvent): void {
        if (this.isMouseLeaveToHide()) {
            this.delaySetPopupVisible(false, this.mouseLeaveDelay);
        }
    }

    cancelTrigger(event: Event): boolean {
        this.beforeTrigger.emit(event);
        if (event.defaultPrevented) {
            return true;
        }
        return false;
    }

    onPopupMouseEnter(): void {
        this.clearDelayTimer();
    }

    onPopupMouseLeave(e: MouseEvent): void {
        // https://github.com/react-component/trigger/pull/13
        // react bug?
        if (e.relatedTarget && !e.relatedTarget['setTimeout'] &&
            this._popup &&
            DomUtils.contains(this._popup.getHostElement(), e.relatedTarget as Node)) {
            return;
        }
        this.delaySetPopupVisible(false, this.mouseLeaveDelay);
    }

    onDocumentClick(event: MouseEvent): void {
        if (this.mask && !this.maskClosable) {
            return;
        }
        const target = event.target as Node;
        const root = this.getHostElement();
        const popupEl = this.getPopupElement();
        if (!DomUtils.contains(root, target) && !DomUtils.contains(popupEl, target)) {
            this.close();
        }
    }

    getPopupElement(): HTMLElement {
        return this._popup && this._popup.getHostElement() || null;
    }

    /** 提供主动的hide()方法供外部直接调用 */
    hide(): void {
        this.setPopupVisible(false);
    }

    isPopupVisible(): boolean {
        return this._popupVisible;
    }

    setPopupVisible(popupVisible: boolean): void {
        if (this.disabled) {
            return;
        }

        this.clearDelayTimer();
        if (this._popupVisible !== popupVisible) {
            this._popupVisible = popupVisible;

            // We must listen to `mousedown` or `touchstart`, edge case:
            // https://github.com/ant-design/ant-design/issues/5804
            // https://github.com/react-component/calendar/issues/250
            // https://github.com/react-component/trigger/issues/50
            if (popupVisible) {
                if (!this.clickOutsideHandler && this.isClickToHide()) {
                    this.clickOutsideHandler = this.renderer.listen('document', 'mousedown', this.onDocumentClick.bind(this));
                }
                // always hide on mobile
                if (!this.touchOutsideHandler) {
                    this.touchOutsideHandler = this.renderer.listen('document', 'touchstart', this.onDocumentClick.bind(this));
                }
            }
            if (!popupVisible) {
                this.clearOutsideHandler();
            }

            if (popupVisible) {
                this.renderPopupComponent();
            }
            if (this._popup) {
                this._popup.visible = popupVisible;
            }

            // 强制调整位置
            onNextFrame(() => {
                this.forcePopupAlign();
            });

            this.afterPopupVisibleChange(popupVisible);
            this.popupVisibleChange.emit(popupVisible);
        }
    }

    afterPopupVisibleChange(popupVisible: boolean): void {
        // do nothing here, but can be overrided by subclass
    }

    /**
     * 显示或者隐藏冒泡
     *
     * @param visible true-显示冒泡，false-隐藏冒泡
     * @param delayS 延迟时间（单位：秒）
     */
    delaySetPopupVisible(visible: boolean, delayS: number): void {
        const delay: number = delayS * 1000;
        this.clearDelayTimer();
        if (delay) {
            this.delayTimer = setTimeout(() => {
                this.setPopupVisible(visible);
                this.clearDelayTimer();
            }, delay);
        } else {
            this.setPopupVisible(visible);
        }
    }

    clearDelayTimer(): void {
        if (this.delayTimer) {
            clearTimeout(this.delayTimer);
            this.delayTimer = null;
        }
    }

    clearOutsideHandler(): void {
        if (this.clickOutsideHandler) {
            this.clickOutsideHandler(); // Removes "listen" listener
            this.clickOutsideHandler = null;
        }

        if (this.touchOutsideHandler) {
            this.touchOutsideHandler(); // Removes "listen" listener
            this.touchOutsideHandler = null;
        }
    }

    isClickToShow(): boolean {
        return this.action.indexOf('click') !== -1 || this.showAction.indexOf('click') !== -1;
    }

    isClickToHide(): boolean {
        return this.action.indexOf('click') !== -1 || this.hideAction.indexOf('click') !== -1;
    }

    isMouseEnterToShow(): boolean {
        return this.action.indexOf('hover') !== -1 || this.showAction.indexOf('mouseEnter') !== -1;
    }

    isMouseLeaveToHide(): boolean {
        return this.action.indexOf('hover') !== -1 || this.hideAction.indexOf('mouseLeave') !== -1;
    }

    isFocusToShow(): boolean {
        return this.action.indexOf('focus') !== -1 || this.showAction.indexOf('focus') !== -1;
    }

    isBlurToHide(): boolean {
        return this.action.indexOf('focus') !== -1 || this.hideAction.indexOf('blur') !== -1;
    }

    forcePopupAlign(): void {
        if (this.isPopupVisible() && this._popup) {
            this._popup.forceAlign();
        }
    }

    close(): void {
        this.setPopupVisible(false);
    }

}
