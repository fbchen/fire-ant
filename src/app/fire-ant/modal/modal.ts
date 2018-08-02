/**
 * @license
 * Copyright 厦门乾元盛世科技有限公司 All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file.
 */
import { Injectable, ComponentRef, TemplateRef, ComponentFactoryResolver, ApplicationRef, Injector, Type } from '@angular/core';
import { Subject } from 'rxjs/Subject';

import { ModalDialog } from './modal.dialog';
import { ModalConfirm } from './modal.confirm';

type ModalType = 'info' | 'success' | 'error' | 'warning' | 'confirm';

/**
 * 创建模态对话框的参数
 */
export interface ModalConfig {
    /** 标题 */
    title?: string;

    /** 标题为HTML */
    titleAsHtml?: boolean;

    /** 标题（模板） */
    titleTemplate?: TemplateRef<any>;

    /** 内容 (用于Confirm对话框) */
    content?: string;

    /** 类型 (用于Confirm对话框) */
    type?: ModalType;

    /** 图标 (用于Confirm对话框) */
    icon?: string;

    /** 是否开启键盘监听（例如按【ESC】键退出） */
    keyboard?: boolean;

    /** 是否显示右上角的关闭按钮，默认为true */
    closable?: boolean;

    /** 是否出现蒙层，默认为true */
    mask?: boolean;

    /** 点击蒙层是否允许关闭 */
    maskClosable?: boolean;

    /** 确认按钮文字 */
    okText?: string;

    /** 取消按钮文字 */
    cancelText?: string;

    /** 对话框宽度 */
    width?: number;

    /** 对话框高度 */
    height?: number;

    /** 对话框位置: top */
    top?: number;

    /** 对话框位置: left */
    left?: number;

    /** 对话框位置: right */
    right?: number;

    /** 对话框位置: bottom */
    bottom?: number;

    /** 对话框zIndex */
    zIndex?: number;

    /** 用户CSS样式 */
    class?: string;

    /** 对话框外层容器的类名 */
    wrapClassName?: string;

    /** 弹窗出现的位置，比如点击按钮的地方 */
    mousePosition?: { x: number, y: number };

    /** 不显示弹窗的注脚 */
    hideFooter?: boolean;

    /** 不显示【取消】按钮 */
    hideCancelBtn?: boolean;

    /** 确定、取消按钮居中显示 */
   buttonAtCenter?: boolean;

   /** 关闭时销毁 */
   destroyOnClose?: boolean;

    /** 额外的按钮 */
    buttons?: {
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
    bodyStyle?: any;

    /** 弹窗body部分的内容 */
    templateRef?: TemplateRef<any>;

    /** 模板参数 */
    templateData?: any;

    /** 触发的事件 */
    triggerEvent?: Event;
}

export interface ModalCallback {
    dialog: ModalDialog;
    event: Event;
    button: any;
    action: string;
}

export class DialogAndRef {
    dialog: ModalDialog;
    componentRef: ComponentRef<any>;

    constructor(dialog: ModalDialog, componentRef: ComponentRef<any>) {
        this.dialog = dialog;
        this.componentRef = componentRef;
    }
}

@Injectable()
export class Modal {

    private _dialogCached: DialogAndRef[] = [];

    constructor(
        private componentFactoryResolver: ComponentFactoryResolver,
        private appRef: ApplicationRef,
        private injector: Injector) {

    }

    /** 创建对话框实例 */
    private createDialog(modal: ModalConfig, component: Type<any>): ModalDialog {
        const componentRef = this._createComponent(component);
        const instance: ModalDialog = componentRef.instance;

        // At this point the component has been instantiated, so we move it to the location in the DOM
        // where we want it to be rendered.
        const container = instance.getContainer();
        container.appendChild(instance.getHostElement());
        this.afterCreate(componentRef, instance, modal);
        return instance;
    }

    private _createComponent<T>(component: Type<T>): ComponentRef<T> {
        const componentFactory = this.componentFactoryResolver.resolveComponentFactory(component);
        const componentRef: ComponentRef<T> = componentFactory.create(this.injector);
        this.appRef.attachView(componentRef.hostView);
        return componentRef;
    }

    /** this method is called before child component's ngAfterViewInit */
    protected afterCreate(componentRef: ComponentRef<any>, instance: ModalDialog, modal: ModalConfig): void {
        for (const name in modal) {
            if (modal.hasOwnProperty(name)) {
                instance[name] = modal[name];
            }
        }
        if (instance.destroyOnClose) {
            instance.afterClose.subscribe(() => {
                componentRef.destroy();
            });
        }

        // 指定弹出位置
        if (modal.triggerEvent && modal.triggerEvent instanceof MouseEvent) {
            const event = modal.triggerEvent;
            const mousePosition = {
                x: event.pageX,
                y: event.pageY,
            };
            instance.mousePosition = mousePosition;
        }
    }


    /**
     * 打开模态对话框
     *
     * @param modal 对话框设置
     * @return Promise
     */
    open(modal: ModalConfig): Subject<ModalCallback> {
        return this.createDialog(modal, ModalDialog).show();
    }

    /**
     * 创建模态对话框，且内容为指定的组件类型
     *
     * @param component 内容组件类型
     * @param componentCfg 内容组件参数
     * @param modal 对话框设置
     * @return Subject
     */
    create<T>(component: Type<T>, componentCfg: any, modal: ModalConfig): Subject<ModalCallback> {
        const data = this.ready(component, componentCfg, modal);
        return data[0].show();
    }

    /**
     * 创建模态对话框，且内容为指定的组件类型
     *
     * @param component 内容组件类型
     * @param componentCfg 内容组件参数
     * @param modal 对话框设置
     * @return [ModalDialog, T]
     */
    ready<T>(component: Type<T>, componentCfg: any, modal: ModalConfig): [ModalDialog, T] {
        const dialog = this.createDialog(modal, ModalDialog);

        const componentFactory = this.componentFactoryResolver.resolveComponentFactory(component);
        const componentRef = dialog.createComponent(componentFactory);
        const instance = componentRef.instance;
        Object.assign(instance, componentCfg);
        instance['_dialog'] = dialog; // hack `dialog` into component

        // cache the dialog and inner component intance ref
        const cache = new DialogAndRef(dialog, componentRef);
        this._dialogCached.push(cache);

        return [dialog, instance];
    }

    /** 关闭窗口，并销毁窗口内部的控件 */
    destory(dialog: ModalDialog): void {
        const length = this._dialogCached.length;
        if (length > 0) {
            for (let i = length - 1; i >= 0; i--) {
                const d = this._dialogCached[i];
                if (d.dialog === dialog) {
                    dialog.close();
                    d.componentRef.destroy();
                    this._dialogCached.splice(i, 1);
                }
            }
        }
    }

    private simple(modal: ModalConfig): Promise<ModalCallback> {
        return new Promise<ModalCallback>((resolve, reject) => {
            this.createDialog(modal, ModalConfirm).show().subscribe((result: ModalCallback) => {
                if (result.action === 'OK') {
                    resolve(result);
                    result.dialog.close();
                } else {
                    reject(result);
                }
            });
        });
    }

    /**
     * 显示Success
     *
     * @param message  消息
     * @param title    标题(可选)
     */
    public success(message: string, title?: string): Promise<ModalCallback> {
        return this.simple({
            title: title,
            content: message,
            type: 'success',
            icon: 'check-circle',
            hideCancelBtn: true
        });
    }

    /**
     * 显示Info
     *
     * @param message  消息
     * @param title    标题(可选)
     */
    public info(message: string, title?: string): Promise<ModalCallback> {
        return this.simple({
            title: title,
            content: message,
            type: 'info',
            icon: 'info-circle',
            hideCancelBtn: true
        });
    }

    /**
     * 显示Error
     *
     * @param message  消息
     * @param title    标题(可选)
     */
    public error(message: string, title?: string): Promise<ModalCallback> {
        return this.simple({
            title: title,
            content: message,
            type: 'error',
            icon: 'cross-circle',
            hideCancelBtn: true
        });
    }

    /**
     * 显示Warning
     *
     * @param message  消息
     * @param title    标题(可选)
     */
    public warning(message: string, title?: string): Promise<ModalCallback> {
        return this.simple({
            title: title,
            content: message,
            type: 'warning',
            icon: 'exclamation-circle',
            hideCancelBtn: true
        });
    }

    /**
     * 显示Confirm
     *
     * @param message  消息
     * @param title    标题(可选)
     */
    public confirm(message: string | { [key: string]: any }, title?: string): Promise<ModalCallback> {
        const data = { type: 'confirm' as ModalType };
        if (typeof message === 'string') {
            Object.assign(data, {
                title: title, content: message
            });
        }
        if (typeof message === 'object') {
            Object.assign(data, message);
        }
        return this.simple(data);
    }



}

