/**
 * @license
 * Copyright 厦门乾元盛世科技有限公司 All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file.
 */


import {
    Component, Input, Output, EventEmitter, ElementRef, Renderer2, ViewEncapsulation,
    OnInit, Inject, Optional, forwardRef, ContentChild, ViewChild, TemplateRef
} from '@angular/core';
import { NG_VALUE_ACCESSOR, COMPOSITION_BUFFER_MODE } from '@angular/forms';

import { UpdateClassService } from '../core/service/update.class.service';
import { toBoolean } from '../util/lang';
import { getOffsetLeft } from './util';
import { FormControl } from '../input/form.control';

const INPUT_CONTROL_VALUE_ACCESSOR: any = {
    provide: NG_VALUE_ACCESSOR,
    useExisting: forwardRef(() => Rate),
    multi: true
};

@Component({
    selector: 'ant-rate',
    templateUrl: './rate.html',
    styleUrls: ['./style/index.scss'],
    preserveWhitespaces: false,
    encapsulation: ViewEncapsulation.None,
    providers: [ UpdateClassService, INPUT_CONTROL_VALUE_ACCESSOR ],
    exportAs: 'rate'
})
export class Rate extends FormControl implements OnInit {

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
    private _prefixCls = 'ant-rate';


    /** 是否禁用状态，默认为 false */
    @Input()
    get disabled(): boolean {
        return this._disabled;
    }
    set disabled(disabled: boolean) {
        const value = toBoolean(disabled);
        if (this._disabled !== value) {
            this._disabled = value;
            this.updateClassMap();
        }
    }
    private _disabled = false;


    /** 自定义字符，默认：★ */
    @ContentChild('character') character: TemplateRef<any>;

    /** star 总数 */
    @Input() count = 5;

    /** 是否允许半选 */
    @Input() allowHalf = false;




    /** 值变更事件 */
    @Output() change = new EventEmitter<number>();

    /** HoverChange事件 */
    @Output() hoverChange = new EventEmitter<number>();

    @ViewChild('ulElem') ulElement: ElementRef;

    /** 实际值 */
    public actualValue = 0;

    /** 鼠标悬停时的值 */
    public hoverValue = 0;

    // 内部样式
    public wrapperClasses: any;


    constructor(
        public renderer: Renderer2,
        public elementRef: ElementRef,
        public updateClassService: UpdateClassService,
        @Optional() @Inject(COMPOSITION_BUFFER_MODE) public compositionMode: boolean) {
        super(renderer, elementRef, compositionMode);
    }


    ngOnInit(): void {
        this.updateClassMap();
    }

    protected updateClassMap(): void {
        this.wrapperClasses = {
            [`${this.prefixCls}`]: true,
            [`${this.prefixCls}-disabled`]: this.disabled
        };
    }


    getStarClass(index: number): any {
        const value = this.hoverValue || this.actualValue || 0;
        const starValue = index + 1;

        if (this.allowHalf && value + 0.5 === starValue) {
            return {
                [`${this.prefixCls}-star`]: 1,
                [`${this.prefixCls}-star-half`]: 1,
                [`${this.prefixCls}-star-active`]: 1,
            };
        }
        if (starValue <= value) {
            return {
                [`${this.prefixCls}-star`]: 1,
                [`${this.prefixCls}-star-full`]: 1,
            };
        } else {
            return {
                [`${this.prefixCls}-star`]: 1,
                [`${this.prefixCls}-star-zero`]: 1,
            };
        }
    }

    getStars(): any[] {
        const stars = [];
        for (let i = 0; i < this.count; i++) {
            stars.push(i);
        }
        return stars;
    }

    /**
     * 鼠标滑出控件
     */
    onMouseLeave(): void {
        if (this.disabled) {
            return;
        }
        this.hoverValue = 0;
        this.hoverChange.emit(this.hoverValue);
    }

    /**
     * 点击星星
     *
     * @param event 点击事件
     * @param index 索引
     */
    onClick(event: MouseEvent, index: number): void {
        if (this.disabled) {
            return;
        }

        const value = this.getStarValue(index, event.pageX);
        this.actualValue = value;
        this.onMouseLeave();
        this.onChange(value); // Angular need this
        this.change.emit(value);
    }

    /**
     * 划过星星
     *
     * @param event 点击事件
     * @param index 索引
     */
    onHover(event: MouseEvent, index: number): void {
        if (this.disabled) {
            return;
        }

        const hoverValue = this.getStarValue(index, event.pageX);
        this.hoverValue = hoverValue;
        this.hoverChange.emit(hoverValue);
    }

    /**
     * 根据点击的位置获取星星值
     *
     * @param index 星星的索引
     * @param x pageX
     */
    getStarValue(index: number, x: number): number {
        let value = index + 1;
        if (this.allowHalf) {
            const leftEdge = getOffsetLeft(this.getStarDOM(0));
            const width = getOffsetLeft(this.getStarDOM(1)) - leftEdge;
            if ((x - leftEdge - width * index) < width / 2) {
                value -= 0.5;
            }
        }
        return value;
    }

    /**
     * 获取第N个星星
     *
     * @param index 索引
     */
    getStarDOM(index: number): HTMLElement {
        const ul: HTMLElement = this.ulElement.nativeElement;
        return ul.children.item(index) as HTMLElement;
    }

    /**
     * 通过ngModel控制的checked状态，当ngModel的值与控件的value一样时为checked
     * @param value ngModel对应的值
     */
    writeValue(value: number): void {
        if (value === null || value === undefined) {
            this.actualValue = null;
        }
        if (typeof value === 'number') {
            this.actualValue = value;
        }
    }

    /**
     * @Override (From ControlValueAccessor interface)
     */
    setDisabledState(isDisabled: boolean): void {
        this.disabled = isDisabled;
    }
}

