/**
 * @license
 * Copyright 厦门乾元盛世科技有限公司 All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file.
 */

import { Injectable, Inject, ComponentFactoryResolver, ComponentRef, EmbeddedViewRef, ApplicationRef, Injector, Type } from '@angular/core';
import { ɵgetDOM as getDOM, DOCUMENT } from '@angular/platform-browser';

import { Dialog } from './dialog';

let seed = 0;
const now = Date.now();

function getUuid() {
    return `_dialog_${now}_${seed++}`;
}


/**
 * 浮层通用接口
 */
@Injectable()
export class Layer {

    constructor(
        private _componentFactoryResolver: ComponentFactoryResolver,
        private _appRef: ApplicationRef,
        private _injector: Injector,
        @Inject(DOCUMENT) private doc: Document) {

    }

    /**
     * 显示Success
     *
     * @param message  消息
     * @param title    标题(可选)
     */
    public success(message: string, title?: string): Promise<any> {
        return this.showAlert(message, title, 'success');
    }

    /**
     * 显示Info
     *
     * @param message  消息
     * @param title    标题(可选)
     */
    public info(message: string, title?: string): Promise<any> {
        return this.showAlert(message, title, 'info');
    }

    /**
     * 显示Error
     *
     * @param message  消息
     * @param title    标题(可选)
     */
    public error(message: string, title?: string): Promise<any> {
        return this.showAlert(message, title, 'error');
    }

    /**
     * 显示Warning
     *
     * @param message  消息
     * @param title    标题(可选)
     */
    public warning(message: string, title?: string): Promise<any> {
        return this.showAlert(message, title, 'warning');
    }


    /**
     * 显示Alert
     *
     * @param message  消息
     * @param title    标题(可选)
     */
    public showAlert(message: string | { [key: string]: any }, title?: string, type?: string): Promise<any> {
        const dialog: Dialog = this.createDialog();
        dialog.showNOButton = false;
        if (typeof message === 'object') {
            for (const key in message) {
                if (message.hasOwnProperty(key)) {
                    dialog[key] = message[key];
                }
            }
        } else {
            dialog.content = message;
            dialog.title = title;
            dialog.type = type;
        }
        return dialog.show();
    }

    /**
     * 显示Confirm，默认带两个按钮（取消、确定）
     *
     * @param message  消息，或者自定义对话框属性对象
     * @param title    标题
     */
    public showConfirm(message: string | { [key: string]: any }, title?: string): Promise<any> {
        const dialog: Dialog = this.createDialog();
        dialog.type = 'confirm';
        if (typeof message === 'object') {
            for (const key in message) {
                if (message.hasOwnProperty(key)) {
                    dialog[key] = message[key];
                }
            }
        } else {
            dialog.content = message;
            dialog.title = title;
        }

        return dialog.show();
    }

    private createDialog(): Dialog {
        const componentRef = this._createComponent(Dialog);
        const instance: Dialog = componentRef.instance;
        instance.closed.subscribe(() => {
            componentRef.destroy();
            componentRef['_container'].remove();
        });
        this.afterCreate(instance);
        return instance;
    }

    /** this method is called before child component's ngAfterViewInit */
    protected afterCreate(dialog: Dialog): void {

    }


    getContainer(): HTMLElement {
        const div: HTMLElement = getDOM().createElement('div');
        div.id = getUuid();
        div.classList.add('ant-overlay');
        getDOM().appendChild(this.doc.body, div);
        return div;
    }


    private _createComponent<T>(component: Type<T>): ComponentRef<T> {
        const componentFactory = this._componentFactoryResolver.resolveComponentFactory(component);
        const componentRef: ComponentRef<T> = componentFactory.create(this._injector);
        this._appRef.attachView(componentRef.hostView);

        // At this point the component has been instantiated, so we move it to the location in the DOM
        // where we want it to be rendered.
        const _hostDomElement = this.getContainer();
        _hostDomElement.appendChild(this._getComponentRootNode(componentRef));
        componentRef['_container'] = _hostDomElement;
        return componentRef;
    }

    /** Gets the root HTMLElement for an instantiated component. */
    private _getComponentRootNode(componentRef: ComponentRef<any>): HTMLElement {
        return (componentRef.hostView as EmbeddedViewRef<any>).rootNodes[0] as HTMLElement;
    }

}
