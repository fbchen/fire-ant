/**
 * @license
 * Copyright 厦门乾元盛世科技有限公司 All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file.
 */

import {
    Component, Input, Output, EventEmitter,
    OnInit, OnDestroy, ViewChild, ViewContainerRef, TemplateRef
} from '@angular/core';

import { Overlay, OverlayRef, OverlayConfig } from '@angular/cdk/overlay';
import { ESCAPE } from '@angular/cdk/keycodes';
import { TemplatePortal } from '@angular/cdk/portal';
// import { Subscription } from 'rxjs/Subscription';
import { Subject } from 'rxjs/Subject';
import { takeUntil } from 'rxjs/operators/takeUntil';
// import { take } from 'rxjs/operators/take';
import { filter } from 'rxjs/operators/filter';
import { tap } from 'rxjs/operators/tap';
import { toBoolean } from '../util/lang';

/**
 * Overlay
 */
@Component({
    selector: 'ant-overlay',
    template: `
        <ng-template #template><ng-content></ng-content></ng-template>
    `,
    styleUrls: ['./style/index.scss'],
    preserveWhitespaces: false,
    exportAs: 'overlay'
})
export class OverlayComponent implements OnInit, OnDestroy {


    private overlayHeight: number | string;
    private overlayWidth: number | string;
    private overlayMinHeight: number | string;
    private overlayMinWidth: number | string;
    private _isVisible = false;

    /** Emits when the popover is opened. */
    private popoverOpened = new Subject<void>();

    /** Emits when the popover is closed. */
    private popoverClosed = new Subject<void>();

    /** Emits when the directive is destroyed. */
    private _onDestroy = new Subject<void>();


    @Input()
    get isVisible(): boolean {
        return this._isVisible;
    }
    set isVisible(isVisible: boolean) {
        const value = toBoolean(isVisible);
        if (this._isVisible !== value) {
            this._isVisible = isVisible;
        }
    }

    /** 样式前缀 */
    @Input() prefixCls = 'ant-overlay';

    /** 浮层样式 */
    @Input() nzOverlayCls: string;

    /** 浮层样式 */
    @Input() nzOverlayStyle: any;

    /** 浮层高度 */
    @Input()
    get nzOverlayHeight(): number | string {
        return this.overlayHeight;
    }
    set nzOverlayHeight(height: number | string) {
        this.updateOverlayHeight();
        this.overlayHeight = height;
    }

    /** 浮层宽度 */
    @Input()
    get nzOverlayWidth(): number | string {
        return this.overlayWidth;
    }
    set nzOverlayWidth(width: number | string) {
        this.updateOverlayWidth();
        this.overlayWidth = width;
    }

    /** 浮层最小高度 */
    @Input()
    get nzOverlayMinHeight(): number | string {
        return this.overlayMinHeight;
    }
    set nzOverlayMinHeight(height: number | string) {
        this.overlayMinHeight = height;
        this.updateOverlayMinHeight();
    }

    /** 浮层最小宽度 */
    @Input()
    get nzOverlayMinWidth(): number | string {
        return this.overlayMinWidth;
    }
    set nzOverlayMinWidth(width: number | string) {
        this.overlayMinWidth = width;
        this.updateOverlayMinWidth();
    }

    /** Whether the popover should have a backdrop (includes closing on click). */
    @Input()
    get hasBackdrop() { return this._hasBackdrop; }
    set hasBackdrop(val: boolean) {
        this._hasBackdrop = toBoolean(val);
    }
    private _hasBackdrop = true;

    /** Whether the popover should close when the user clicks the backdrop or presses ESC. */
    @Input()
    get interactiveClose() { return this._interactiveClose; }
    set interactiveClose(val: boolean) {
        this._interactiveClose = toBoolean(val);
    }
    private _interactiveClose = true;

    /** afterOpen */
    @Output() afterOpen: EventEmitter<any> = new EventEmitter();

    /** afterClose */
    @Output() afterClose: EventEmitter<any> = new EventEmitter();

    /** Emits when the backdrop is clicked. */
    @Output() backdropClicked = new EventEmitter<void>();

    /** Emits when a keydown event is targeted to this popover's overlay. */
    @Output() overlayKeydown = new EventEmitter<KeyboardEvent>();

    @ViewChild('template') templateRef: TemplateRef<any>;

    private overlayRef: OverlayRef;
    /** Reference to a template portal where the overlay will be attached. */
    private _portal: TemplatePortal<any>;

    constructor(
        // private elementRef: ElementRef,
        private viewContainerRef: ViewContainerRef,
        private overlay: Overlay) {

    }

    private updateOverlayHeight(): void {
        if (this.overlayRef) {
            this.overlayRef.getConfig().height = this.overlayHeight;
        }
    }

    private updateOverlayWidth(): void {
        if (this.overlayRef) {
            this.overlayRef.getConfig().width = this.overlayWidth;
        }
    }

    private updateOverlayMinHeight(): void {
        if (this.overlayRef) {
            this.overlayRef.getConfig().minHeight = this.overlayMinHeight;
        }
    }

    private updateOverlayMinWidth(): void {
        if (this.overlayRef) {
            this.overlayRef.getConfig().minWidth = this.overlayMinWidth;
        }
    }

    private getOverlayConfig(): OverlayConfig {
        const positionStrategy = this.overlay.position()
            .global()
            .centerHorizontally()
            .centerVertically();
        const overlayConfig = new OverlayConfig({
            hasBackdrop: this.hasBackdrop,
            backdropClass: `${this.prefixCls}-backdrop`,
            panelClass: `${this.prefixCls}-panel`,
            scrollStrategy: this.overlay.scrollStrategies.block(),
            positionStrategy,
            height: this.overlayHeight,
            width: this.overlayWidth,
            minHeight: this.nzOverlayMinHeight,
            minWidth: this.nzOverlayMinWidth
        });

        return overlayConfig;
    }

    private createOverlay(): OverlayRef {
        this._portal = new TemplatePortal(this.templateRef, this.viewContainerRef);

        // Returns an OverlayConfig
        const overlayConfig = this.getOverlayConfig();
        // Returns an OverlayRef
        return this.overlay.create(overlayConfig);
        // this.overlay.overlayElement.appendChild(this.elementRef.nativeElement);
    }

    ngOnInit(): void {
        if (this.isVisible) {
            this.open();
        }
    }

    ngOnDestroy(): void {
        this.destroy();

        this._onDestroy.next();
        this._onDestroy.complete();

        this.popoverOpened.complete();
        this.popoverClosed.complete();
    }

    open(): void {
        if (!this.isVisible) {
            this.isVisible = true;
            if (!this.overlayRef) {
                this.overlayRef = this.createOverlay();
            }
            this.subscribeToBackdrop();
            this.subscribeToEscape();
            this.subscribeToDetachments();
            this.popoverOpened.next();
            this.afterOpen.emit();

            // Actually open the popover
            this.overlayRef.attach(this._portal);
        }
    }

    close(): void {
        if (this.isVisible) {
            this.isVisible = false;
            this.popoverClosed.next();
            this.overlayRef.detach();
            this.afterClose.emit();
        }
    }

    toggle(): void {
        if (this.isVisible) {
            this.close();
        } else {
            this.open();
        }
    }

    isOpen(): boolean {
        return this.isVisible;
    }

    /** Removes the popover from the DOM. Does NOT update open state. */
    private destroy(): void {
        if (this.overlayRef) {
            this.overlayRef.dispose();
            this.overlayRef = null;
        }
    }

    /** Close popover when backdrop is clicked. */
    private subscribeToBackdrop(): void {
        this.overlayRef
            .backdropClick()
            .pipe(
                tap(() => this.backdropClicked.emit()),
                filter(() => this.interactiveClose),
                takeUntil(this.popoverClosed),
                takeUntil(this._onDestroy),
        )
            .subscribe(() => this.close());
    }

    /** Close popover when escape keydown event occurs. */
    private subscribeToEscape(): void {
        this.overlayRef
            .keydownEvents()
            .pipe(
                tap(event => this.overlayKeydown.emit(event)),
                filter(event => event.keyCode === ESCAPE),
                filter(() => this.interactiveClose),
                takeUntil(this.popoverClosed),
                takeUntil(this._onDestroy),
        )
            .subscribe(() => this.close());
    }

    /** Set state back to closed when detached. */
    private subscribeToDetachments(): void {
        this.overlayRef
            .detachments()
            .pipe(takeUntil(this._onDestroy))
            .subscribe(() => {
                this.popoverClosed.next();
            });
    }
}

