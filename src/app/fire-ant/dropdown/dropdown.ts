/**
 * @license
 * Copyright 厦门乾元盛世科技有限公司 All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file.
 */


import {
    Directive, Input, ElementRef, Renderer2, HostListener, Host, Optional,
    AfterViewInit, AfterContentInit, ContentChild, Output, EventEmitter
} from '@angular/core';
import { ɵgetDOM as getDOM } from '@angular/platform-browser';
import { placements } from './placements';

import { Menu, ClickParam } from '../menu/menu';
import { DropdownButton } from './dropdown.button';
import { DomUtils } from '../util/dom.utils';
import { onNextFrame } from '../util/anim.frame';
import { getPopupClassNameFromAlign, getAlignFromPlacement } from '../trigger/utils';
import * as align from 'dom-align';


export type DropdownPlacement = 'topLeft' | 'topCenter' | 'topRight' | 'bottomLeft' | 'bottomCenter' | 'bottomRight';
export type DropdownTriggerType = 'click' | 'hover';

/**
 * Dropdown - 下拉菜单
 */
@Directive({
    selector: '[dropdown]'
})
export class Dropdown implements AfterContentInit, AfterViewInit {

    /** 样式前缀 */
    @Input() dropdownPrefixCls = 'ant-dropdown';

    /** 触发下拉的行为，可选取值：Array<'click'|'hover'> */
    @Input() triggerAction: DropdownTriggerType | DropdownTriggerType[] = ['hover'];

    /** 触发标签的selector，默认为空，表示当前标签 */
    @Input() triggerAt: string;

    /**
     * 菜单弹出位置：`bottomLeft` `bottomCenter` `bottomRight` `topLeft` `topCenter` `topRight`
     */
    @Input() dropdownPlacement: DropdownPlacement = 'bottomLeft';

    /** 位置信息 */
    @Input() builtinPlacements: Object = placements;

    /**
     * 下拉菜单的最小宽度与触发的组件宽度一致
     */
    @Input() dropdownMatchTriggerWidth = true;

    /** 缩略写法：action placement */
    @Input() set dropdown(dropdown: string) {
        if (dropdown && dropdown.length) {
            const str = dropdown.split('[ ,]');

            const triggerAction: DropdownTriggerType[] = [];
            for (let i = 0; i < str.length; i++) {
                if (str[i] === 'click' || str[i] === 'hover') {
                    triggerAction.push(str[i] as DropdownTriggerType);
                }
                if (['topLeft', 'topCenter', 'topRight', 'bottomLeft', 'bottomCenter', 'bottomRight'].includes(str[i])) {
                    this.dropdownPlacement = str[i] as DropdownPlacement;
                }
            }
            if (triggerAction.length) {
                this.triggerAction = triggerAction;
            }
        }
    }

    /**
     * 一个钩子函数: 默认点击菜单后将关闭菜单，如果此函数返回false，将停止关闭菜单。
     */
    @Input() menuClickHanlder: (event: any) => boolean;

    /** 是否禁用状态，默认为 false */
    @Input() disabled = false;

    /** 鼠标移入后显示菜单的延迟时间（秒）*/
    @Input() mouseEnterDelay = 0.15; // 秒

    /** 鼠标移出后隐藏菜单的延迟时间（秒）*/
    @Input() mouseLeaveDelay = 0.15; // 秒


    /** 菜单 */
    @ContentChild(Menu) menu: Menu;

    /** 菜单显示事件 */
    @Output() menuVisibleChange = new EventEmitter<boolean>();


    /** 菜单显示或隐藏相关 */
    private popupVisible = false;
    private popupContainer: HTMLElement;
    private delayTimer: any; // 延迟计时
    private alignClass: string;

    // 点击Document的事件（一般用于触发点击后隐藏冒泡组件）
    private clickOutsideHandler: Function;
    private touchOutsideHandler: Function;

    constructor(
        private renderer: Renderer2,
        private elementRef: ElementRef,
        @Optional() @Host() private dropdownButton: DropdownButton) {

    }

    ngAfterContentInit(): void {
        if (!this.menu && this.dropdownButton) {
            this.menu = this.dropdownButton.menu;
        }
        if (!this.menu) {
            throw new Error('must contain a Menu...');
        }

        onNextFrame(() => {
            this.menu.visible = false;
            this.menu.prefixCls = `${this.dropdownPrefixCls}-menu`;
        });

        // 订阅菜单的Click事件
        this.menu.menuClick.subscribe((event: ClickParam) => this.onMenuClick(event));
    }

    onMenuClick(event: ClickParam): void {
        // 可以通过注入的menuClickHanlder钩子阻止菜单的消失
        if (this.menuClickHanlder && this.menuClickHanlder(event) === false) {
            return;
        }

        // 也可以通过原生Event的preventDefault属性来阻止菜单的消失
        const domEvent: Event = event.domEvent;
        if (domEvent && domEvent.defaultPrevented) {
            return;
        }
        // 菜单隐藏
        this.delaySetPopupVisible(false, 0.1);
    }

    ngAfterViewInit(): void {
        this.renderer.addClass(
            this.elementRef.nativeElement, `${this.dropdownPrefixCls}-trigger`);

        // 对按钮(ant-button)作特殊处理
        if (this.elementRef.nativeElement.nodeName === 'ANT-BUTTON') {
            this.triggerAt = this.triggerAt || 'button';
        }

        // 将菜单移入绝对定位的Element内部
        // <div style="position: absolute; top: 0px; left: 0px; width: 100%;">
        const container = this.getPopupContainer();
        container.appendChild(this.getMenuElement());
    }

    protected getPopupContainer(): HTMLElement {
        if (!this.popupContainer) {
            const popupContainer = getDOM().createElement('div');
            // Make sure default popup container will never cause scrollbar appearing
            // https://github.com/react-component/trigger/issues/41
            // popupContainer.style.position = 'absolute';
            // popupContainer.style.top = '0';
            // popupContainer.style.left = '0';
            // popupContainer.style.width = '100%';
            popupContainer.className = this.dropdownPrefixCls;

            // const mountNode = this.getPopupContainer() || getDocument().body;
            const mountNode = this.getHostElement();
            mountNode.appendChild(popupContainer);
            this.popupContainer = popupContainer;
        }

        return this.popupContainer;
    }

    /** The underlying host native element */
    getHostElement(): HTMLElement {
        return this.elementRef.nativeElement as HTMLElement;
    }

    getTiggerElement(): HTMLElement {
        const host: HTMLElement = this.getHostElement();
        return this.triggerAt ? host.querySelector(this.triggerAt) as HTMLElement : host;
    }

    getMenuElement(): HTMLElement {
        return this.menu.getHostElement();
    }

    @HostListener('click', ['$event'])
    onTriggerClick(event: MouseEvent): void {
        if (this.disabled) {
            return;
        }
        if (this.isClickTiggerAction()) {
            this.delaySetPopupVisible(!this.popupVisible, 0.1);
        }
    }

    @HostListener('mouseenter', ['$event'])
    onTriggerMouseEnter(event: MouseEvent): void {
        if (this.disabled) {
            return;
        }
        if (this.isPointerTiggerAction()) {
            this.delaySetPopupVisible(true, this.mouseEnterDelay);
        }
    }

    @HostListener('mouseleave', ['$event'])
    onTriggerMouseLeave(event: MouseEvent): void {
        if (this.disabled) {
            return;
        }
        if (!this.isPopupVisible()) {
            return;
        }
        if (this.isPointerTiggerAction()) {
            const container = this.getPopupContainer();
            if (DomUtils.contains(container, event.relatedTarget as Node)
                || DomUtils.contains(container, event.target as Node)) {
                return; // 还在菜单内部
            }
            this.delaySetPopupVisible(false, this.mouseLeaveDelay);
        }
    }

    isClickTiggerAction() {
        if (typeof this.triggerAction === 'string') {
            return this.triggerAction === 'click';
        }
        return this.triggerAction.indexOf('click') !== -1;
    }

    isPointerTiggerAction() {
        if (typeof this.triggerAction === 'string') {
            return this.triggerAction === 'hover';
        }
        return this.triggerAction.indexOf('hover') !== -1;
    }


    getAlign(): {} {
        return getAlignFromPlacement(this.builtinPlacements, this.dropdownPlacement, {});
    }

    forceAlign(): void {
        if (!this.disabled) {
            const baseTarget = this.getTiggerElement(); // 基准组件，位置不会变
            const alignTarget = this.getPopupContainer();

            // https://www.npmjs.com/package/dom-align
            const alignConfig = this.getAlign();
            this.onAlign(align(alignTarget, baseTarget, alignConfig));
        }
    }

    onAlign(_align: any): void {
        const alignClass = getPopupClassNameFromAlign(
            this.builtinPlacements, this.dropdownPrefixCls, _align);

        // 先删除旧的样式，再添加新的样式
        if (this.alignClass !== alignClass) {
            const target = this.getPopupContainer();
            if (this.alignClass) {
                this.renderer.removeClass(target, this.alignClass);
            }
            this.renderer.addClass(target, alignClass);
            this.alignClass = alignClass;
        }
    }

    /**
     * 显示或者隐藏菜单
     *
     * @param visible true-显示，false-隐藏
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

    isPopupVisible(): boolean {
        return this.popupVisible;
    }

    setPopupVisible(popupVisible: boolean): void {
        if (this.disabled) {
            return;
        }

        if (this.popupVisible !== popupVisible) {
            this.popupVisible = popupVisible;
            this.menu.visible = popupVisible;

            // We must listen to `mousedown` or `touchstart`, edge case:
            // https://github.com/ant-design/ant-design/issues/5804
            // https://github.com/react-component/calendar/issues/250
            // https://github.com/react-component/trigger/issues/50
            if (popupVisible) {
                if (!this.clickOutsideHandler) {
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

            this.menuVisibleChange.emit(popupVisible);
            this.afterPopupVisibleChange(popupVisible);
        }
    }

    afterPopupVisibleChange(popupVisible: boolean): void {
        if (popupVisible) {
            onNextFrame(() => {
                this.forceAlign();

                // calc dropdownMatchTriggerWidth
                if (this.dropdownMatchTriggerWidth) {
                    const hostEl: HTMLElement = this.getHostElement();
                    const popuEl: HTMLElement = this.getMenuElement();
                    // const width = this.dropdownMatchTriggerWidth ? 'width' : 'minWidth';
                    this.renderer.setStyle(popuEl, 'minWidth', `${hostEl.offsetWidth}px`);
                }
            });
        }
    }


    onDocumentClick(event: MouseEvent): void {
        const target = event.target as Node;
        const root = this.getHostElement();
        const popupEl = this.getMenuElement();
        if (!DomUtils.contains(root, target) && !DomUtils.contains(popupEl, target)) {
            this.setPopupVisible(false);
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

    clearDelayTimer(): void {
        if (this.delayTimer) {
            clearTimeout(this.delayTimer);
            this.delayTimer = null;
        }
    }

}

