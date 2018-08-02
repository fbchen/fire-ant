/**
 * @license
 * Copyright 厦门乾元盛世科技有限公司 All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file.
 */

import {
    Component, Input, Output, EventEmitter, ElementRef, ViewEncapsulation, Inject, HostBinding,
    AfterViewInit, OnDestroy, ViewChild, ComponentFactory, TemplateRef, ViewContainerRef, ComponentRef
} from '@angular/core';
import { DOCUMENT } from '@angular/platform-browser';
import { Subject } from 'rxjs/Subject';

import { Scrollbar } from '../util/scrollbar';
import { DomUtils } from '../util/dom.utils';
import { onNextFrame } from '../util/anim.frame';
import { transitionAppear, transitionLeave } from '../core/animation/transition';
import { KeyCode } from '../util/key.code';

export interface ModalCallback {
    dialog: ModalDialog;
    event: Event;
    button: any;
    action: string;
}

@Component({
    selector: 'ant-modal-dialog',
    templateUrl: './modal.dialog.html',
    styleUrls: ['./style/index.scss'],
    preserveWhitespaces: false,
    encapsulation: ViewEncapsulation.None
})
export class ModalDialog implements AfterViewInit, OnDestroy {
    private static _uuid = 0;
    private static _zIndex = 500;

    /** 样式前缀 */
    @Input() prefixCls = 'ant-modal';

    /** 标题 */
    @Input() title: string;

    /** 标题为HTML */
    @Input() titleAsHtml = false;

    /** 标题（模板） */
    @Input() titleTemplate: TemplateRef<any>;

    /** 是否开启键盘监听（例如按【ESC】键退出） */
    @Input() keyboard = true;

    /** 是否显示右上角的关闭按钮，默认为true */
    @Input() closable = true;

    /** 是否出现蒙层，默认为true */
    @Input() mask = true;

    /** 点击蒙层是否允许关闭 */
    @Input() maskClosable = true;

    /** 确认按钮文字 */
    @Input() okText = '确定';

    /** 取消按钮文字 */
    @Input() cancelText = '取消';

    /** 确定、取消按钮居中显示 */
    @Input() buttonAtCenter = false;

    /** 对话框宽度 */
    @Input() width = 520;

    /** 对话框高度 */
    @Input() height = 0;

    /** 对话框位置: top */
    @Input() top: number | 'auto';

    /** 对话框位置: left */
    @Input() left: number | 'auto';

    /** 对话框位置: right */
    @Input() right: number | 'auto';

    /** 对话框位置: bottom */
    @Input() bottom: number | 'auto';

    /** 对话框zIndex */
    @Input() zIndex = 0;

    /** 用户CSS样式 */
    @Input() class: string;

    /** 对话框外层容器的类名 */
    @Input() wrapClassName: string;

    /** 弹窗出现的位置，比如点击按钮的地方 */
    @Input() mousePosition: { x: number, y: number };

    /** 不显示弹窗的注脚 */
    @Input() hideFooter = false;

    /** 不显示【取消】按钮 */
    @Input() hideCancelBtn = false;

    /** 关闭时销毁 */
    @Input() destroyOnClose = true;

    /** 额外的按钮 */
    @Input() buttons: {
        text: string;
        type?: string;
        icon?: string;
        shape?: string;
        size?: string;
        ghost?: boolean;
        loading?: boolean;
        data?: any;
    }[];

    /** 弹窗body部分的样式 */
    @Input() bodyStyle: any;

    /** 弹窗body部分的内容 (TemplateRef) */
    @Input() templateRef: TemplateRef<any>;

    /** 弹窗body部分的内容参数 */
    @Input() templateData: any;

    /** dialog animation css class name */
    @Input() transitionName = 'zoom';
    /** mask animation css class name */
    @Input() maskTransitionName = 'fade';

    /** Modal 关闭前事件 */
    @Output() beforeClose = new EventEmitter<any>();

    /** Modal 关闭后事件 */
    @Output() afterClose = new EventEmitter<any>();

    @ViewChild('sentinel') sentinel: ElementRef;
    @ViewChild('dialog') dialog: ElementRef;
    @ViewChild('wrap') wrap: ElementRef;
    @ViewChild('body') body: ElementRef;

    @ViewChild('noBtn') noBtn: any;
    @ViewChild('okBtn') okBtn: any;

    /** 真正动态渲染内容的地方 */
    @ViewChild('viewContainer', { read: ViewContainerRef }) viewContainer: ViewContainerRef;

    public titleId: string;
    public visible = false;
    private scrollbar: Scrollbar;

    private viewInited = false;
    private initVisible = false;

    private componentRef: ComponentRef<any>;

    /* 用户操作反馈 */
    private subject = new Subject<ModalCallback>();

    @HostBinding('style.display') get display(): string {
        return this.visible ? 'block' : 'none';
    }

    constructor(
        @Inject(DOCUMENT) private doc: Document,
        private elementRef: ElementRef) {

        this.titleId = '_dialog_title_' + (ModalDialog._uuid++);
        this.zIndex = ModalDialog._zIndex++;
        this.scrollbar = new Scrollbar(doc);
    }

    /** 默认使用TemplateRef创建内容 */
    ngAfterViewInit(): void {
        this.viewInited = true;
        // 设置弹窗可见
        if (this.initVisible) {
            onNextFrame(() => {
                this.setVisible(true);
            });
        }
    }

    ngOnDestroy(): void {
        if (this.componentRef) {
            this.componentRef.destroy();
        }
        if (this.viewContainer) {
            this.viewContainer.clear();
        }
    }

    /** 也可以指定组件创建内容 */
    createComponent<C>(componentFactory: ComponentFactory<C>): ComponentRef<C> {
        this.componentRef = this.viewContainer.createComponent(componentFactory);
        return this.componentRef;
    }

    /**
     * 获取内容的组件实例（若通过ComponentFactory注入内容的话）
     */
    getComponent(): any {
        return this.componentRef.instance;
    }

    /** The underlying host native element */
    getHostElement(): HTMLElement {
        return this.elementRef.nativeElement as HTMLElement;
    }

    /** 获取弹窗的body */
    getBody(): HTMLElement {
        return this.body.nativeElement as HTMLElement;
    }

    /** 设置对话框的出现/隐藏 */
    setVisible(visible: boolean): void {
        if (!this.viewInited) {
            this.initVisible = visible;
            return;
        }

        if (this.visible !== visible) {
            this.visible = visible;

            if (visible) {
                this.wrap.nativeElement.focus();

                // 执行动画
                const dialogNode = this.dialog.nativeElement as HTMLElement;
                if (this.mousePosition) {
                    const p = this.mousePosition;
                    const rect = dialogNode.getBoundingClientRect();
                    const left = this.doc.body.scrollLeft + rect.left;
                    const top = this.doc.body.scrollTop + rect.top;
                    const origin = `${p.x - left}px ${p.y - top}px 0px`;
                    DomUtils.setTransformOrigin(dialogNode.style, origin);
                } else {
                    DomUtils.setTransformOrigin(dialogNode.style, '');
                }

                this.scrollbar.checkScrollbar().setScrollbar();
                const overflow = this.doc.body.style.overflow;
                this.doc.body.style.overflow = 'hidden';
                // tslint:disable-next-line:no-unused-expression
                this.doc.body.offsetWidth; // force reflow
                transitionAppear(dialogNode, this.transitionName, () => {
                    this.doc.body.style.overflow = overflow;
                });
            }
        }
    }

    /**
    * 显示对话框
    */
    show(): Subject<ModalCallback> {
        this.setVisible(true);
        return this.subject;
    }

    /** 关闭对话框 */
    close(event?: Event): void {
        if (event) {
            event.preventDefault();
        }

        this.beforeClose.emit();
        const dialogNode = this.dialog.nativeElement as HTMLElement;
        transitionLeave(dialogNode, this.transitionName, () => {
            this.setVisible(false);
            this.scrollbar.resetScrollbar();
            this.afterClose.emit();
        });
    }

    onKeyDown(event: KeyboardEvent): void {
        const keyCode = event.keyCode;
        if (this.keyboard && keyCode === KeyCode.ESC) {
            this.close(event);
        }

        // keep focus inside dialog
        if (this.visible) {
            if (keyCode === KeyCode.TAB) {
                const activeElement = document.activeElement;
                const dialogRoot = this.wrap.nativeElement as HTMLElement;
                const sentinel = this.sentinel.nativeElement as HTMLElement;
                if (event.shiftKey) {
                    if (activeElement === dialogRoot) {
                        sentinel.focus();
                    }
                } else if (activeElement === sentinel) {
                    dialogRoot.focus();
                }
            }
        }
    }

    onMaskClick(event: Event): void {
        if (!this.maskClosable) {
            return;
        }
        if (event.target === event.currentTarget) {
            this.onCancelClick(event, this.noBtn || {});
        }
    }

    /**
     * 点击【确定】，执行Promise.resolve()方法；不关闭对话框
     * @param event 点击事件
     */
    onOKClick(event: Event, button: any): void {
        this.subject.next({ dialog: this, event, button, action: 'OK' });
    }

    /**
     * 点击【取消】，执行Promise.reject()方法；然后，关闭对话框
     * @param event 点击事件
     */
    onCancelClick(event: Event, button: any): void {
        this.subject.next({ dialog: this, event, button, action: 'NO' });
        this.close(event);
    }

    /** 其它用户自定义按钮的点击 */
    onBtnClick(event: Event, button: any): void {
        this.subject.next({ dialog: this, event, button, action: '' });
    }

    /** 这个方法可以被子类覆写 */
    getContainer(): HTMLElement {
        return this.doc.body;
    }

    getMaskClass(): any {
        return {
            [`${this.prefixCls}-mask`]: 1,
            [`${this.prefixCls}-mask-hidden`]: !this.visible
        };
    }

    getMaskStyle(): any {
        return {
            zIndex: this.zIndex
        };
    }

    getWrapClass(): any {
        return {
            [`${this.prefixCls}-wrap`]: 1,
            [`${this.wrapClassName}`]: this.wrapClassName
        };
    }

    getWrapStyle(): any {
        return {
            zIndex: this.zIndex
        };
    }

    getDialogClass(): any {
        return {
            [`${this.prefixCls}`]: 1,
            [`${this.class}`]: this.class
        };
    }

    getDialogStyle(): any {
        const style = {};
        if (typeof this.width === 'number' && this.width > 0) {
            style['width'] = `${this.width}px`;
        }
        if (typeof this.height === 'number' && this.height > 0) {
            style['height'] = `${this.height}px`;
        }

        if (typeof this.top === 'number') {
            style['top'] = `${this.top}px`;
        }
        if (typeof this.left === 'number') {
            style['left'] = `${this.left}px`;
        }
        if (typeof this.right === 'number') {
            style['right'] = `${this.right}px`;
        }
        if (typeof this.bottom === 'number') {
            style['bottom'] = `${this.bottom}px`;
        }
        return style;
    }

}
