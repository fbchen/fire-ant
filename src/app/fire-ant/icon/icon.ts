/**
 * @license
 * Copyright 厦门乾元盛世科技有限公司 All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file.
 */

import { Component, Input, ViewEncapsulation, ElementRef } from '@angular/core';
import { UpdateClassService } from '../core/service/update.class.service';
import { toBoolean } from '../util/lang';

/**
 * 语义化的矢量图形。<br>
 * 我们为每个图标赋予了语义化的命名，命名规则如下:
 * - 实心和描线图标保持同名，用 `-o` 来区分，比如 `question-circle`（实心） 和 `question-circle-o`（描线）；
 * - 命名顺序：`[图标名]-[形状?]-[描线?]-[方向?]`。
 * > `?` 为可选。<br>
 * 完整的图标设计规范请访问 [图标规范](/docs/spec/icon)。<br>
 * 由于图标字体本质上还是文字，可以使用 `style` 和 `class` 设置图标的大小和颜色。
 */
@Component({
    selector: 'ant-icon',
    template: `<ng-content></ng-content>`,
    styleUrls: ['./style/index.scss'],
    preserveWhitespaces: false,
    encapsulation: ViewEncapsulation.None,
    providers: [ UpdateClassService ]
})
export class Icon {

    /** 设置字体，如fa */
    @Input()
    get font(): string {
        return this._font;
    }
    set font(font: string) {
        if (this._font !== font) {
            this._font = font;
            this.updateClassMap();
        }
    }
    private _font: string;

    /** 设置图标类型 */
    @Input()
    get type(): string {
        return this._type;
    }
    set type(type: string) {
        if (this._type !== type) {
            this._type = type;
            this.updateClassMap();
        }
    }
    private _type: string;


    /** 是否有旋转动画 */
    @Input()
    get spin(): boolean {
        return this._spin;
    }
    set spin(spin: boolean) {
        const value = toBoolean(spin);
        if (this._spin !== value) {
            this._spin = value;
            this.updateClassMap();
        }
    }
    private _spin = false;


    /** 样式前缀 */
    @Input() title: string;


    constructor(
        private el: ElementRef,
        private updateClassService: UpdateClassService) {

    }

    private updateClassMap(): void {
        const classes = {
            [`anticon`]: true,
            [`anticon-spin`]: !!this.spin || this.type === 'loading',
            [`anticon-${this.type}`]: true,
            [`fa`]: this.font === 'fa',
            [`fa-${this.type}`]: this.font === 'fa',
        };
        this.updateClassService.update(this.el.nativeElement, classes);
    }

}
