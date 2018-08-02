/**
 * @license
 * Copyright 厦门乾元盛世科技有限公司 All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file.
 */


import {
    Component, Input, ViewEncapsulation, ElementRef, OnInit,
    AfterContentInit, ContentChildren, forwardRef, QueryList
} from '@angular/core';
import { UpdateClassService } from '../core/service/update.class.service';
import { isPresent, toBoolean, toNumber } from '../util/lang';

import { onNextFrame } from '../util/anim.frame';
import { Step } from './step';


@Component({
    selector: 'ant-steps',
    template: `<ng-content></ng-content>`,
    styleUrls: ['./style/index.scss', './style/patch.scss'],
    preserveWhitespaces: false,
    encapsulation: ViewEncapsulation.None,
    providers: [ UpdateClassService ]
})
export class Steps implements AfterContentInit, OnInit {

    /** 样式前缀 */
    @Input()
    get prefixCls(): string {
        return this._prefixCls;
    }
    set prefixCls(prefixCls: string) {
        if (this._prefixCls !== prefixCls) {
            this._prefixCls = prefixCls;
            this.updateClassMap();
            this.updateChildren();
        }
    }
    private _prefixCls = 'ant-steps';


    /** Icon样式前缀 */
    @Input() iconPrefix = 'ant';

    /** 指定当前步骤，从 0 开始记数。 */
    @Input()
    get current(): number {
        return this._current;
    }
    set current(current: number) {
        if (isPresent(current)) {
            const value = toNumber(current, null);
            if (this._current !== value) {
                this._current = value;
                this.updateStepStatus();
                this.updateClassMap();
            }
        }
    }
    private _current = 0;


    /** 指定当前步骤的状态，可选 `wait` `process` `finish` `error`。在子 Step 元素中，可以通过 `status` 属性覆盖状态。 */
    @Input()
    get status(): string {
        return this._status;
    }
    set status(status: string) {
        if (this._status !== status) {
            this._status = status;
            this.updateStepStatus();
            this.updateClassMap();
        }
    }
    private _status = 'process';


    /** 指定大小，目前支持普通（`default`）和迷你（`small`） */
    @Input()
    get size(): 'default' | 'small' | null {
        return this._size;
    }
    set size(size: 'default' | 'small' | null) {
        if (this._size !== size) {
            this._size = size;
            this.updateClassMap();
        }
    }
    private _size: 'default' | 'small' | null;


    /** 指定步骤条方向。目前支持水平（`horizontal`）和竖直（`vertical`）两种方向 */
    @Input()
    get direction(): 'horizontal' | 'vertical' {
        return this._direction;
    }
    set direction(direction: 'horizontal' | 'vertical') {
        if (this._direction !== direction) {
            this._direction = direction;
            this.updateClassMap();
        }
    }
    private _direction: 'horizontal' | 'vertical' = 'horizontal';


    /** 点状步骤条 */
    @Input()
    get progressDot(): boolean {
        return this._progressDot;
    }
    set progressDot(progressDot: boolean) {
        const value = toBoolean(progressDot);
        if (this._progressDot !== value) {
            this._progressDot = value;
            this.updateClassMap();
        }
    }
    private _progressDot = false;


    /** 所有的子步骤 */
    @ContentChildren(forwardRef(() => Step)) steps: QueryList<Step>;

    private labelPlacement = 'horizontal';

    /** 最后的步骤的宽度 */
    public lastStepOffsetWidth = 100;


    constructor(
        protected el: ElementRef,
        protected updateClassService: UpdateClassService) {

    }

    ngAfterContentInit(): void {
        this.steps.changes.subscribe(() => this.updateChildren);
        this.updateChildren();
        onNextFrame(() => {
            this.updateStepStatus();
        });
    }

    ngOnInit(): void {
        this.updateClassMap();
    }

    private updateChildren(): void {
        this.steps.forEach((step, index, array) => {
            step.prefixCls = this.prefixCls;
            step.iconPrefix = this.iconPrefix;
            step.stepIndex = index;
            step.stepCount = array.length;
        });
    }

    private updateStepStatus(): void {
        if (this.steps && this.steps.length) {
            this.steps.forEach((step: Step, index: number) => {
                if (index === this.current) {
                    step.status = this.status;
                } else if (index < this.current) {
                    step.status = 'finish';
                } else {
                    step.status = 'wait';
                }
            });

            this.steps.forEach((step: Step, index: number) => {
                step.isNextError = this.status === 'error' && index === this.current - 1;
            });
        }
    }

    protected updateClassMap(): void {
        const adjustedlabelPlacement = this.progressDot ? 'vertical' : this.labelPlacement;
        const classes = {
            [`${this.prefixCls}`]: true,
            [`${this.prefixCls}-${this.direction}`]: true,
            [`${this.prefixCls}-${this.size}`]: this.size,
            [`${this.prefixCls}-label-${adjustedlabelPlacement}`]: this.direction === 'horizontal',
            [`${this.prefixCls}-dot`]: this.progressDot
        };
        this.updateClassService.update(this.el.nativeElement, classes);
    }


    /**
     * 获取总步骤数
     */
    getStepCount(): number {
        return this.steps && this.steps.length;
    }

}

