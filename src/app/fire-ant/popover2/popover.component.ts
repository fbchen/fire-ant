/**
 * @license
 * Copyright 厦门乾元盛世科技有限公司 All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file.
 */

import {
    Component, Input, Output, EventEmitter, Renderer2, ElementRef, ViewEncapsulation,
    OnInit, OnChanges, OnDestroy, AfterViewInit, SimpleChanges, ChangeDetectionStrategy,
    ChangeDetectorRef, ViewChild, ContentChild, TemplateRef,
    ComponentRef, ComponentFactoryResolver, ApplicationRef, Injector, EmbeddedViewRef, Type
} from '@angular/core';
import { ConnectionPositionPair, ConnectedOverlayDirective } from '@angular/cdk/overlay';

import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { Subject } from 'rxjs/Subject';
import { Subscription } from 'rxjs/Subscription';
import { throttleTime, distinctUntilChanged } from 'rxjs/operators';

import { FadeAnimation } from '../core/animations/fade-animations';
import { POSITION_MAP, DEFAULT_4_POSITIONS } from '../core/overlay/overlay-position-map';
import { onNextFrame } from '../util/anim.frame';

import { PopoverDirective } from './popover.directive';


const CLICK = 'click';
const HOVER = 'hover';
const FOCUS = 'focus';
export type Trigger = 'click' | 'hover' | 'focus';
export type ShowTrigger = 'click' | 'mouseenter' | 'focus';
export type HideTrigger = 'click' | 'mouseleave' | 'blur';

/**
 * Popover
 */
@Component({
    selector: 'ant-popover2',
    template: `
        <ng-content></ng-content>
        <ng-template
            cdkConnectedOverlay
            #overlay="cdkConnectedOverlay"
            [cdkConnectedOverlayOrigin]="_origin"
            [cdkConnectedOverlayHasBackdrop]="_hasBackdrop"
            (backdropClick)="onBackdropClick()"
            (detach)="onDetachOverlay()"
            (attach)="onAttachOverlay()"
            (positionChange)="onPositionChange($event)"
            [cdkConnectedOverlayPositions]="positions"
            [cdkConnectedOverlayOpen]="visible$ | async"
            [cdkConnectedOverlayHeight]="nzOverlayHeight"
            [cdkConnectedOverlayWidth]="nzOverlayWidth"
            [cdkConnectedOverlayMinHeight]="nzOverlayMinHeight"
            [cdkConnectedOverlayMinWidth]="nzOverlayMinWidth"
        >
            <div [ngClass]="getOverlayClass()" [ngStyle]="nzOverlayStyle"
                [@fadeAnimation]="''+(visible$ | async)"
                (@fadeAnimation.done)="_afterVisibilityAnimation($event)"
            >
                <div class="{{prefixCls}}-content">
                    <div class="{{prefixCls}}-arrow">{{nzArrow}}</div>
                    <div class="{{prefixCls}}-inner">
                        <div [ngClass]="getTitleClass()" *ngIf="nzTitle || nzTitleTemplate">
                            {{nzTitle}}
                            <ng-template *ngIf="nzTitleTemplate"
                                [ngTemplateOutlet]="nzTitleTemplate"></ng-template>
                        </div>
                        <div [ngClass]="getContentClass()" #container>
                            {{nzContent}}
                            <ng-template *ngIf="nzTemplate"
                                [ngTemplateOutlet]="nzTemplate"
                                [ngTemplateOutletContext]="{ $implicit: nzTemplateData }"></ng-template>
                        </div>
                    </div>
                </div>
            </div>
        </ng-template>
    `,
    styleUrls: ['./style/index.scss', './style/patch.scss'],
    preserveWhitespaces: false,
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    animations: [FadeAnimation],
    exportAs: 'popover'
})
export class PopoverComponent implements OnInit, AfterViewInit, OnChanges, OnDestroy {

    /** 样式前缀 */
    @Input() prefixCls = 'ant-popover2';

    /** 标题，将被当做成弹出的内容或标题 */
    @Input() nzTitle: string;

    /** 简单内容 */
    @Input() nzContent: string;

    /** 复杂内容 */
    @Input() nzComponent: Type<any>;

    /** 复杂内容的参数，用于Component形式 */
    @Input() nzComponentData: any;

    /** 复杂内容 inject by Template */
    @ContentChild('nzTemplate') nzTemplate: TemplateRef<any>;

    /** 复杂内容的参数，用于Template形式 */
    @Input() nzTemplateData: any;

    /** 标题 inject by Template */
    @ContentChild('nzTitle') nzTitleTemplate: TemplateRef<any>;

    @Input() positions: ConnectionPositionPair[] = [ ...DEFAULT_4_POSITIONS ];

    /**
     * 箭头是否指向目标元素中心
     */
    @Input() arrowPointAtCenter = false;

    /**
     * 是否不可用
     */
    @Input() disabled = false;

    /** 点击遮罩是否可关闭浮层 */
    @Input() maskClosable = true;

    /** 箭头内容 */
    @Input() nzArrow: string;

    /** 浮层样式 */
    @Input() nzOverlayCls: string;

    /** 浮层样式 */
    @Input() nzOverlayStyle: any;

    /** 浮层高度 */
    @Input() nzOverlayHeight: number | string;

    /** 浮层宽度 */
    @Input() nzOverlayWidth: number | string;

    /** 浮层最小高度 */
    @Input() nzOverlayMinHeight: number | string;

    /** 浮层最小宽度 */
    @Input() nzOverlayMinWidth: number | string;

    /** 触发条件：click, hover, focus */
    @Input() nzTrigger: Trigger | Trigger[] = [HOVER];
    /** 自定义的显示条件：click, focus, mouseenter */
    @Input() nzShowTrigger: ShowTrigger | ShowTrigger[] = [];
    /** 自定义的隐藏条件：click, blur, mouseleave */
    @Input() nzHideTrigger: HideTrigger | HideTrigger[] = [];

    /** 如果是`hover`方式触发，则可以设置鼠标移入后的延迟时间 */
    @Input() mouseEnterDelay = 100;

    /** 如果是`hover`方式触发，则可以设置鼠标移出后的延迟时间 */
    @Input() mouseLeaveDelay = 100;

    /** 触发组件 */
    @ContentChild(PopoverDirective) _origin: PopoverDirective;

    /** 浮层对象 */
    @ViewChild('overlay') overlay: ConnectedOverlayDirective;

    /** 弹窗内容的Parent容器 */
    @ViewChild('container') container: ElementRef;

    /** VisibleChange事件 */
    @Output() nzVisibleChange: EventEmitter<boolean> = new EventEmitter();

    public _hasBackdrop = false;

    public _placement = 'top';

    // 位置变化的监控
    private _positionChanging = new Subject<any>();
    private _positionChangingSubscription: Subscription;

    // 可见性的监控
    private _visibleSource = new BehaviorSubject<boolean>(false);
    public visible$ = this._visibleSource.asObservable();

    // 原生组件的事件监听
    private _detachClickHandler: Function;
    private _detachFocusHandler: Function;
    private _detachBlurHandler: Function;
    private _detachMouseEnterHandler: Function;
    private _detachMouseLeaveHandler: Function;

    /** 延迟计时器（显示或隐藏冒泡） */
    private _delayTimer: any;

    /** 通过Component方式创建的对象，要记得销毁 */
    private _childComponentRef: ComponentRef<any>;


    constructor(
        private renderer: Renderer2,
        private cdr: ChangeDetectorRef,
        private componentFactoryResolver: ComponentFactoryResolver,
        private appRef: ApplicationRef,
        private injector: Injector) {

    }

    /**
     * 气泡框位置，可选 top left right bottom topLeft topRight bottomLeft bottomRight leftTop leftBottom rightTop rightBottom。
     * 默认值为top。
     */
    @Input()
    get nzPlacement() {
        return this._placement;
    }
    set nzPlacement(value) {
        if (this._placement !== value) {
            this._placement = value;
            this.positions.unshift(POSITION_MAP[this.nzPlacement]);
        }
    }

    /** 设置浮层是否可见 */
    @Input()
    get nzVisible() {
        return this._visibleSource.value;
    }
    set nzVisible(visible: boolean) {
        if (this._visibleSource.value !== visible) {
            this._visibleSource.next(visible);
        }
    }

    /** 显示浮层 */
    show(): void {
        if (this.disabled) {
            return;
        }

        this.nzVisible = true;
        this._origin.isOverlayVisible = true;
    }

    /** 隐藏浮层 */
    hide(): void {
        this.nzVisible = false;
        this._origin.isOverlayVisible = false;
    }

    /** 延迟显示 */
    _delayShow(): void {
        this._clearDelayTimer();
        if (this.mouseEnterDelay && this.mouseEnterDelay > 0) {
            this._delayTimer = setTimeout(() => {
                this.show();
                this._clearDelayTimer();
            }, this.mouseEnterDelay);
        } else {
            this.show();
        }
    }

    /** 延迟隐藏 */
    _delayHide(): void {
        this._clearDelayTimer();
        if (this.mouseLeaveDelay && this.mouseLeaveDelay > 0) {
            this._delayTimer = setTimeout(() => {
                this.hide();
                this._clearDelayTimer();
            }, this.mouseLeaveDelay);
        } else {
            this.hide();
        }
    }

    _clearDelayTimer(): void {
        if (this._delayTimer) {
            clearTimeout(this._delayTimer);
            this._delayTimer = null;
        }
    }

    _afterVisibilityAnimation(e: Event): void {
        this.nzVisibleChange.emit(this.nzVisible);
    }

    getOverlayClass(): any {
        return {
            [`${this.prefixCls}`]: 1,
            [`${this.prefixCls}-placement-${this._placement}`]: 1,
            [`${this.nzOverlayCls}`]: this.nzOverlayCls
        };
    }


    getTitleClass(): string {
        return `${this.prefixCls}-title`;
    }

    getContentClass(): string {
        return `${this.prefixCls}-inner-content`;
    }

    ngOnChanges(changes: SimpleChanges): void {
        this._hasBackdrop = this.isClickToShow() || this.isClickToHide();
    }

    ngOnInit(): void {
        this._handlePositionChange();
    }

    _handlePositionChange(): void {
        this._positionChangingSubscription = this._positionChanging.pipe(
            throttleTime(50),
            distinctUntilChanged()
        ).subscribe(e => {
            this.cdr.detectChanges();
        });
    }

    onPositionChange($event: any): void {
        for (const key in POSITION_MAP) {
            if (JSON.stringify($event.connectionPair) === JSON.stringify(POSITION_MAP[key])) {
                this.nzPlacement = key;
                break;
            }
        }

        // emit position change event
        this._positionChanging.next($event);
    }


    private _index(actions: any | any[], action: any): number {
        if (typeof actions === 'string') {
            return actions.indexOf(action);
        } else {
            return actions.indexOf(action);
        }
    }

    isClickToShow(): boolean {
        return this._index(this.nzTrigger, CLICK) >= 0 || this._index(this.nzShowTrigger, CLICK) >= 0;
    }

    isClickToHide(): boolean {
        return this._index(this.nzTrigger, CLICK) >= 0 || this._index(this.nzHideTrigger, CLICK) >= 0;
    }

    isMouseEnterToShow(): boolean {
        if (this.isClickToShow()) {
            return false;
        }
        return this._index(this.nzTrigger, HOVER) >= 0 || this._index(this.nzShowTrigger, 'mouseenter') >= 0;
    }

    isMouseLeaveToHide(): boolean {
        if (this.isClickToHide()) {
            return false;
        }
        return this._index(this.nzTrigger, HOVER) >= 0 || this._index(this.nzHideTrigger, 'mouseleave') >= 0;
    }

    isFocusToShow(): boolean {
        return this._index(this.nzTrigger, FOCUS) >= 0 || this._index(this.nzShowTrigger, FOCUS) >= 0;
    }

    isBlurToHide(): boolean {
        return this._index(this.nzTrigger, FOCUS) >= 0 || this._index(this.nzHideTrigger, 'blur') >= 0;
    }

    _buildListeners(): void {
        const el = this._origin.getHostElement();
        // 鼠标单击
        this._detachClickHandler = this.renderer.listen(el, 'click', (event: MouseEvent) => {
            if (this.isClickToShow()) {
                this.show();
            }
        });
        // 鼠标移入
        this._detachMouseEnterHandler = this.renderer.listen(el, 'mouseenter', (event: MouseEvent) => {
            if (this.isMouseEnterToShow()) {
                this._delayShow();
            }
        });
        // 鼠标移出
        this._detachMouseLeaveHandler = this.renderer.listen(el, 'mouseleave', (event: MouseEvent) => {
            if (this.isMouseLeaveToHide()) {
                this._delayHide();
            }
        });
        // 光标Focus
        this._detachFocusHandler = this.renderer.listen(el, 'focus', (event: Event) => {
            if (this.isFocusToShow()) {
                this.show();
            }
        });
        // 光标Blur
        this._detachBlurHandler = this.renderer.listen(el, 'blur', (event: Event) => {
            if (this.isBlurToHide()) {
                this.hide();
            }
        });
    }

    onBackdropClick(): void {
        if (this.isClickToHide() && this.maskClosable) {
            this.hide();
        }
    }

    _destroyListeners(): void {
        if (this._detachClickHandler) {
            this._detachClickHandler();
        }
        if (this._detachMouseEnterHandler) {
            this._detachMouseEnterHandler();
        }
        if (this._detachMouseLeaveHandler) {
            this._detachMouseLeaveHandler();
        }
        if (this._detachFocusHandler) {
            this._detachFocusHandler();
        }
        if (this._detachBlurHandler) {
            this._detachBlurHandler();
        }
    }

    ngAfterViewInit(): void {
        this._buildListeners();
    }

    ngOnDestroy(): void {
        this.destroyComponent();
        this._destroyListeners();
        this._clearDelayTimer();
        if (this._positionChangingSubscription) {
            this._positionChangingSubscription.unsubscribe();
        }
    }

    private destroyComponent(): any {
        if (this._childComponentRef) {
            this._childComponentRef.destroy();
        }
    }

    /** 创建实例 */
    private createComponent(): void {
        if (!this.nzComponent) {
            return;
        }

        const componentRef = this._createComponent(this.nzComponent);
        if (this.nzComponentData) {
            for (const key of Object.keys(this.nzComponentData)) {
                componentRef.instance[key] = this.nzComponentData[key];
            }
        }

        // At this point the component has been instantiated, so we move it to the location in the DOM
        // where we want it to be rendered.
        const container: HTMLElement = this.container.nativeElement;
        container.appendChild(this._getComponentRootNode(componentRef));

        this._childComponentRef = componentRef;
    }

    private _createComponent<T>(component: Type<T>): ComponentRef<T> {
        const componentFactory = this.componentFactoryResolver.resolveComponentFactory(component);
        const componentRef: ComponentRef<T> = componentFactory.create(this.injector);
        this.appRef.attachView(componentRef.hostView);
        return componentRef;
    }

    /** Gets the root HTMLElement for an instantiated component. */
    private _getComponentRootNode(componentRef: ComponentRef<any>): HTMLElement {
        return (componentRef.hostView as EmbeddedViewRef<any>).rootNodes[0] as HTMLElement;
    }

    onAttachOverlay(): void {
        if (this.nzComponent) {
            onNextFrame(() => {
                this.createComponent();
            });
        }
    }

    onDetachOverlay(): void {
        // do nothing
    }

    // Manually force updating current overlay's position
    updatePosition() {
        if (this.overlay && this.overlay.overlayRef) {
            this.overlay.overlayRef.updatePosition();
        }
    }
}

