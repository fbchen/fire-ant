/**
 * @license
 * Copyright 厦门乾元盛世科技有限公司 All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file.
 */


import {
    Component, Input,  Output, EventEmitter, ElementRef, ViewEncapsulation,
    AfterViewInit, OnInit, HostListener, ViewChild
} from '@angular/core';

import { UpdateClassService } from '../../core/service/update.class.service';
import { isPresent, toBoolean, toNumber } from '../../util/lang';


function scrollTo(element: HTMLElement, to: number, duration: number): void {
    const requestAnimationFrame = window.requestAnimationFrame ||
        function requestAnimationFrameTimeout(): number {
            return setTimeout(arguments[0], 10);
        };

    // jump to target if duration zero
    if (duration <= 0) {
        element.scrollTop = to;
        return;
    }

    const difference = to - element.scrollTop;
    const perTick = difference / duration * 10;

    requestAnimationFrame(() => {
        element.scrollTop = element.scrollTop + perTick;
        if (element.scrollTop === to) {
            return;
        }
        scrollTo(element, to, duration - 10);
    });
}


/**
 * 时间选项
 */
@Component({
    selector: 'ant-time-option',
    templateUrl: './time.option.html',
    preserveWhitespaces: false,
    encapsulation: ViewEncapsulation.None,
    providers: [ UpdateClassService ]
})
export class TimeOption implements AfterViewInit, OnInit {

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


    // 是否已激活
    get active(): boolean {
        return this._active;
    }
    set active(active: boolean) {
        const value = toBoolean(active);
        if (this._active !== value) {
            this._active = value;
            this.updateClassMap();
        }
    }
    private _active = false;


    /** 选中的记录的index */
    @Input()
    get selectedIndex(): number {
        return this._selectedIndex;
    }
    set selectedIndex(selectedIndex: number) {
        if (isPresent(selectedIndex)) {
            const value = toNumber(selectedIndex, null);
            this._selectedIndex = value;
            if (this.isViewInited) {
                this.scrollToSelected(120);
            }
        }
    }
    private _selectedIndex: number;


    /** 选项列表 */
    @Input() options: any[];

    /** 隐藏禁止选择的选项 */
    @Input() hideDisabledOptions = false;

    @ViewChild('list') list: ElementRef;

    /** `选择`事件 */
    @Output() valueUpdate = new EventEmitter<number>();

    // 视图是否已创建
    private isViewInited = false;

    constructor(
        protected el: ElementRef,
        protected updateClassService: UpdateClassService) {

    }

    ngOnInit(): void {
        this.updateClassMap();
    }

    private updateClassMap(): void {
        const classes = {
            [`${this.prefixCls}`]: true,
            [`${this.prefixCls}-active`]: this.active
        };
        this.updateClassService.update(this.el.nativeElement, classes);
    }

    ngAfterViewInit(): void {
        this.isViewInited = true;
        this.scrollToSelected(0);
    }

    /** The underlying host native element */
    getHostElement(): HTMLElement {
        return this.el.nativeElement as HTMLElement;
    }

    /** 滚动到选中的选项 */
    scrollToSelected(duration: number): void {
        if (!this.options || !this.options.length) {
            return; // 没有选项
        }

        // move to selected item
        const optionEl = this.getHostElement();
        const list = this.list.nativeElement as HTMLElement;

        const index = this.selectedIndex < 0 ? 0 : this.selectedIndex;
        const topOption = list.querySelector(`LI:nth-child(${index})`) as HTMLElement;
        if (topOption) {
            const to = topOption.offsetTop;
            scrollTo(optionEl, to, duration);
        }
    }


    @HostListener('mouseenter', ['$event'])
    handleMouseEnter(event: Event): void {
        this.active = true;
    }

    @HostListener('mouseleave', ['$event'])
    handleMouseLeave(event: Event): void {
        this.active = false;
    }

    getOptionClass(item: any, index: number): any {
        return {
            [`${this.prefixCls}-option-selected`]: this.selectedIndex === index,
            [`${this.prefixCls}-option-disabled`]: item.disabled
        };
    }

    isHideOption(item: any): boolean {
        return this.hideDisabledOptions && item.disabled;
    }

    onClickOption(item: any, event: Event): void {
        event.preventDefault();
        if (item.disabled) {
            return;
        }
        this.valueUpdate.emit(item.value);
    }

}
