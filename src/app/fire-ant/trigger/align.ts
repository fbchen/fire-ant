/**
 * @license
 * Copyright 厦门乾元盛世科技有限公司 All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file.
 */

import {
    Directive, Input, ElementRef, Renderer2,
    OnInit, OnDestroy, AfterViewInit, OnChanges, SimpleChanges
} from '@angular/core';

import { Subject } from 'rxjs/Subject';
import { Subscription } from 'rxjs/Subscription';
import { debounceTime } from 'rxjs/operators';
import * as align from 'dom-align';

/**
 * Align
 * 参考 https://github.com/react-component/align
 */
@Directive({
    // tslint:disable-next-line:directive-selector
    selector: 'nothing-to-do-here'
})
export class Align implements OnInit, OnDestroy, OnChanges, AfterViewInit {

    /**
     * https://www.npmjs.com/package/dom-align
     */
    @Input() align: object = {};

    @Input() disabled: boolean;

    @Input() monitorWindowResize = false;

    @Input() monitorBufferTime = 50;

    private alignTarget: any;

    private resizeHandler: Function;

    private resizeEvents = new Subject<any>();

    private resizeIndex = 0; // 每个事件递增

    private _resizeEventsSubscription: Subscription;


    constructor(
        public renderer: Renderer2,
        public elementRef: ElementRef) {

    }

    ngOnInit(): void {
        this._resizeEventsSubscription = this.resizeEvents.pipe(
            debounceTime(this.monitorBufferTime)    // wait for 50ms pause in events
        ).subscribe((event: any) => {
            this.forceAlign();
        });
    }

    ngOnDestroy(): void {
        this.stopMonitorWindowResize();
        if (this._resizeEventsSubscription) {
            this._resizeEventsSubscription.unsubscribe();
        }
    }

    ngAfterViewInit(): void {
        this.alignTarget = this.getAlignTarget();

        this.forceAlign();
        if (!this.disabled && this.monitorWindowResize) {
            this.startMonitorWindowResize();
        }
    }

    ngOnChanges(changes: SimpleChanges): void {
        if (changes['disabled']) {
            if (this.monitorWindowResize && !this.disabled) {
                this.startMonitorWindowResize();
            } else {
                this.stopMonitorWindowResize();
            }
        }
    }

    getHostElement(): HTMLElement {
        return this.elementRef.nativeElement as HTMLElement;
    }

    /**
     * 需要调整位置的组件，调用align()方法后位置将发生变化
     */
    getAlignTarget(): any {
        return this.getHostElement();
    }

    /**
     * 基准组件，位置不会变
     */
    getBaseTarget(): any {
        return null; // will be overrided by subclass
    }

    startMonitorWindowResize(): void {
        if (!this.resizeHandler) {
            this.resizeHandler = this.renderer.listen('window', 'resize', () => {
                this.resizeEvents.next(this.resizeIndex++);
            });
        }
    }

    stopMonitorWindowResize(): void {
        if (this.resizeHandler) {
            this.resizeEvents.complete();
            this.resizeHandler(); // remove event listener
            this.resizeHandler = null;
        }
    }

    getAlign(): any {
        return this.align;
    }

    forceAlign(): void {
        if (!this.disabled) {
            const baseTarget = this.getBaseTarget(); // 基准组件，位置不会变
            if (baseTarget && this.alignTarget) {
                // https://www.npmjs.com/package/dom-align
                const alignConfig = this.getAlign();
                this.onAlign(align(this.alignTarget, baseTarget, alignConfig));
            }
        }
    }

    onAlign(alignCfg: any): void {
        // will be overrided by subclass
    }

}

