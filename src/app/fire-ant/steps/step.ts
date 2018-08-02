/**
 * @license
 * Copyright 厦门乾元盛世科技有限公司 All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file.
 */


import {
    Component, Input, ElementRef, ViewEncapsulation,
    Host, HostBinding, ContentChild, TemplateRef, Inject, forwardRef, OnInit, AfterViewInit
} from '@angular/core';

import { UpdateClassService } from '../core/service/update.class.service';
import { isPresent, toNumber, toBoolean } from '../util/lang';
import { onNextFrame } from '../util/anim.frame';
import { Steps } from './steps';


@Component({
    selector: 'ant-step',
    templateUrl: './step.html',
    preserveWhitespaces: false,
    encapsulation: ViewEncapsulation.None,
    providers: [ UpdateClassService ]
})
export class Step implements OnInit, AfterViewInit {

    /** 样式前缀 */
    @Input()
    get prefixCls(): string {
        return this._prefixCls;
    }
    set prefixCls(prefixCls: string) {
        if (this._prefixCls !== prefixCls) {
            this._prefixCls = prefixCls;
            this.updateClassMap();
        }
    }
    private _prefixCls: string;


    @Input()
    get iconPrefix(): string {
        return this._iconPrefix;
    }
    set iconPrefix(iconPrefix: string) {
        if (this._iconPrefix !== iconPrefix) {
            this._iconPrefix = iconPrefix;
            this.updateIconClass();
        }
    }
    private _iconPrefix: string;


    /** 标题 */
    @Input()
    get nzTitle(): string {
        return this._nzTitle;
    }
    set nzTitle(nzTitle: string) {
        this._nzTitle = nzTitle;
    }
    private _nzTitle: string;


    /** 步骤的详情描述，可选 */
    @Input()
    get description(): string {
        return this._description;
    }
    set description(description: string) {
        this._description = description;
    }
    private _description: string;


    /** 指定当前步骤的状态，可选 `wait` `process` `finish` `error`。在子 Step 元素中，可以通过 `status` 属性覆盖状态。 */
    @Input()
    get status(): string {
        return this._status;
    }
    set status(status: string) {
        if (this._status !== status) {
            this._status = status;
            this.updateClassMap();
            this.updateIconClass();
        }
    }
    private _status: string;


    /** 步骤图标的类型，可选 */
    @Input()
    get icon(): string {
        return this._icon;
    }
    set icon(icon: string) {
        if (this._icon !== icon) {
            this._icon = icon;
            this.updateClassMap();
            this.updateIconClass();
        }
    }
    private _icon: string;


    /** 步骤索引值 */
    @Input()
    get stepIndex(): number {
        return this._stepIndex;
    }
    set stepIndex(stepIndex: number) {
        if (isPresent(stepIndex)) {
            const value = toNumber(stepIndex, null);
            if (this._stepIndex !== value) {
                this._stepIndex = value;
                this.updateClassMap();
            }
        }
    }
    private _stepIndex = 0;


    /** 总步骤数 */
    @Input()
    get stepCount(): number {
        return this._stepCount;
    }
    set stepCount(stepCount: number) {
        if (isPresent(stepCount)) {
            const value = toNumber(stepCount, null);
            if (this._stepCount !== value) {
                this._stepCount = value;
                this.updateClassMap();
            }
        }
    }
    private _stepCount = 1;


    @Input()
    get isNextError(): boolean {
        return this._isNextError;
    }
    set isNextError(isNextError: boolean) {
        const value = toBoolean(isNextError);
        if (this._isNextError !== value) {
            this._isNextError = value;
            this.updateClassMap();
        }
    }
    private _isNextError = false;



    /** 步骤图标的类型，可选 */
    @ContentChild('icon') iconTemplate: TemplateRef<any>;

    /** 步骤的详情描述，可选 */
    @ContentChild('description') descriptionTemplate: TemplateRef<any>;

    /** 步骤的详情描述，可选 */
    @ContentChild('progressDot') progressDotTemplate: TemplateRef<any>;


    // 内部样式
    public iconClasses: any;


    constructor(
        protected el: ElementRef,
        protected updateClassService: UpdateClassService,
        @Inject(forwardRef(() => Steps)) @Host() private steps: Steps) {

    }

    // 显示用
    get progressDot(): boolean {
        return this.steps.progressDot;
    }

    // 显示用
    get stepNumber(): number {
        return this.stepIndex + 1;
    }

    // 内部用
    get isLast(): boolean {
        return this.stepIndex === this.stepCount - 1;
    }

    // 内部用
    get direction(): string {
        return this.steps.direction;
    }

    get lastStepOffsetWidth(): number {
        return this.steps.lastStepOffsetWidth;
    }

    ngAfterViewInit(): void {
        if (this.isLast) {
            onNextFrame(() => {
                const el: HTMLElement = this.el.nativeElement;
                this.steps.lastStepOffsetWidth = el.offsetWidth;
            });
        }
    }

    ngOnInit(): void {
        this.updateClassMap();
    }

    protected updateClassMap(): void {
        const status = this.status || 'wait';
        const classes = {
            [`${this.prefixCls}-item`]: 1,
            [`${this.prefixCls}-item-last`]: this.isLast,
            [`${this.prefixCls}-status-${status}`]: 1,
            [`${this.prefixCls}-custom`]: this.icon,
            [`${this.prefixCls}-next-error`]: this.isNextError
        };
        this.updateClassService.update(this.el.nativeElement, classes);
    }

    private updateIconClass(): void {
        this.iconClasses = {
            [`${this.prefixCls}-icon`]: true,
            [`${this.iconPrefix}icon`]: true,
            [`${this.iconPrefix}icon-${this.icon}`]: this.icon,
            [`${this.iconPrefix}icon-check`]: !this.icon && this.status === 'finish',
            [`${this.iconPrefix}icon-cross`]: !this.icon && this.status === 'error'
        };
    }

    @HostBinding('style.width')
    get _hostWidth(): string {
        if (!this.isLast) {
            const count = this.steps.getStepCount();
            return count > 1 ? `${100 / (count - 1)}%` : `100%`;
        }
        return null;
    }

    @HostBinding('style.marginRight')
    get _hostMarginRight(): string {
        if (!this.isLast) {
            const count = this.stepCount;
            const width = this.lastStepOffsetWidth;
            return count > 1 ? `${(-(width / (count - 1) + 5))}px` : null;
        }
        return null;
    }

    get _tailStyle(): any {
        if (!this.isLast && this.direction === 'horizontal') {
            const count = this.stepCount;
            const width = this.lastStepOffsetWidth;
            return {
                'paddingRight': `${(width / (count - 1) + 5)}px`
            };
        }
        return null;
    }

    _showIcon(): boolean {
        return  isPresent(this.icon) || this.status === 'finish' || this.status === 'error';
    }
}

