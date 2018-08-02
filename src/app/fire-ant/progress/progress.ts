/**
 * @license
 * Copyright 厦门乾元盛世科技有限公司 All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file.
 */

import { Component, Input, ViewEncapsulation, ElementRef, ContentChild, TemplateRef, OnInit } from '@angular/core';
import { UpdateClassService } from '../core/service/update.class.service';
import { isPresent, toBoolean, toNumber } from '../util/lang';

const statusColorMap = {
    normal: '#108ee9',
    exception: '#ff5500',
    success: '#87d068',
};


/**
 * Progress 进度条
 */
@Component({
    selector: 'ant-progress',
    templateUrl: './progress.html',
    styleUrls: ['./style/index.scss', './style/patch.scss'],
    preserveWhitespaces: false,
    encapsulation: ViewEncapsulation.None,
    providers: [ UpdateClassService ]
})
export class Progress implements OnInit {

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
    private _prefixCls = 'ant-progress';


    /** 类型，可选 `line` `circle` `dashboard`，默认为`line` */
    @Input()
    get type(): 'line' | 'circle' | 'dashboard' {
        return this._type;
    }
    set type(type: 'line' | 'circle' | 'dashboard') {
        if (this._type !== type) {
            this._type = type;
            this.updateClassMap();
        }
    }
    private _type: 'line' | 'circle' | 'dashboard' = 'line';


    /** 状态，可选：`success` `exception` `active` */
    @Input()
    get status(): 'normal' | 'success' | 'active' | 'exception' {
        return this._status;
    }
    set status(status: 'normal' | 'success' | 'active' | 'exception') {
        if (this._status !== status) {
            this._status = status;
            this.updateClassMap();
        }
    }
    private _status: 'normal' | 'success' | 'active' | 'exception';


    /** 百分比 */
    @Input()
    get percent(): number {
        return this._percent;
    }
    set percent(percent: number) {
        if (isPresent(percent)) {
            const value = toNumber(percent, null);
            if (this._percent !== value) {
                this._percent = value;
                this.updateClassMap();
            }
        }
    }
    private _percent = 0;


    /** 是否显示进度数值或状态图标 */
    @Input()
    get showInfo(): boolean {
        return this._showInfo;
    }
    set showInfo(showInfo: boolean) {
        const value = toBoolean(showInfo);
        if (this._showInfo !== value) {
            this._showInfo = value;
            this.updateClassMap();
        }
    }
    private _showInfo = true;


    /** 内容的模板函数 */
    @Input() format: (percent: number) => string;

    /**
     * 当`type`为`line`时，指进度条线的宽度，单位 px
     * 当`type`为`circle`时，指圆形进度条线的宽度，单位是进度条画布宽度的百分比
     */
    @Input() strokeWidth: number;

    /** 圆形进度条线的轮廓颜色 */
    @Input() trailColor = '#f3f3f3';

    /** 圆形进度条画布宽度，单位 px */
    @Input() width: number;

    /** 圆形进度条缺口角度，可取值 0 ~ 360 */
    @Input() gapDegree = 0;

    /** 圆形进度条缺口位置 */
    @Input() gapPosition: 'top' | 'bottom' | 'left' | 'right';

    /** 自定义显示模板 */
    @ContentChild('infoRender') infoRender: TemplateRef<any>;


    constructor(
        protected el: ElementRef,
        protected updateClassService: UpdateClassService) {

    }

    ngOnInit(): void {
        this.updateClassMap();
    }

    protected updateClassMap(): void {
        const progressStatus = this.getProgressStatus();
        const classes = {
            [`${this.prefixCls}`]: true,
            [`${this.prefixCls}-line`]: this.type === 'line',
            [`${this.prefixCls}-circle`]: this.type === 'circle' || this.type === 'dashboard',
            [`${this.prefixCls}-status-${progressStatus}`]: true,
            [`${this.prefixCls}-show-info`]: this.showInfo
        };
        this.updateClassService.update(this.el.nativeElement, classes);
    }

    getProgressStatus(): string {
        return this.status || (this.percent >= 100 ? 'success' : 'normal');
    }

    getLineStyle(): any {
        return {
            width: `${this.percent}%`,
            height: `${this.strokeWidth || 10}px`,
        };
    }

    getCircleStyle(): any {
        const circleSize = this.width || 132;
        return {
            width: `${circleSize}px`,
            height: `${circleSize}px`,
            fontSize: `${circleSize * 0.16 + 6}px`,
        };
    }

    getCircleColor(): string {
        const progressStatus = this.getProgressStatus();
        return statusColorMap[progressStatus];
    }

    getCircleGapDegree(): number {
        return this.gapDegree || (this.type === 'dashboard' && 75);
    }

    getCircleGapPosition(): string {
        return this.gapPosition || (this.type === 'dashboard' && 'bottom') || 'top';
    }

    getIconType(): string {
        return (this.type === 'circle' || this.type === 'dashboard') ? '' : '-circle';
    }
}
