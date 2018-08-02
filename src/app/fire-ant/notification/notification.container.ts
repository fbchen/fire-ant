/**
 * @license
 * Copyright 厦门乾元盛世科技有限公司 All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file.
 */

import { Input, ComponentRef, ComponentFactoryResolver, EmbeddedViewRef, ApplicationRef, Injector, Type } from '@angular/core';
import { ɵgetDOM as getDOM } from '@angular/platform-browser';

import { Notice, NoticeOpt } from './notice';

let seed = 0;
const now = Date.now();

function getUuid() {
    return `_notification_${now}_${seed++}`;
}

export function withUnit(pos: number | string): string {
    if (typeof pos === 'number') {
        return `${pos}px`;
    }
    return pos;
}

// @Injectable()
export class NotificationContainer {

    /** 样式前缀 */
    @Input() prefixCls = 'ant-notification';

    @Input() animation = 'fade';

    /** 用户CSS样式 */
    @Input() containerCls: string;

    @Input() transitionName: string;

    /** top */
    @Input() top: number | string;

    /** bottom */
    @Input() bottom: number | string;

    /** left */
    @Input() left: number | string;

    /** right */
    @Input() right: number | string;

    protected notices: Notice[] = [];
    protected container: HTMLElement;

    constructor(
        private _doc: Document,
        private _componentFactoryResolver: ComponentFactoryResolver,
        private _appRef: ApplicationRef,
        private _injector: Injector) {

    }


    getTransitionName(): string {
        let transitionName = this.transitionName;
        if (!transitionName && this.animation) {
            transitionName = `${this.prefixCls}-${this.animation}`;
        }
        return transitionName;
    }

    add(option: NoticeOpt, type: Type<any>): Notice {
        const key = option.key = option.key || getUuid();
        const founds: Notice[] = this.notices.filter(v => v.key === key);
        if (founds.length) {
            return founds[0];
        }

        const notice = this.createNotice(option, type); // 创建对象
        this.notices.push(notice);
        return notice;
    }

    remove(key: string): void {
        this.notices = this.notices.filter(v => v.key !== key);
    }


    getContainer(): HTMLElement {
        if (!this.container) {
            const div: HTMLElement = getDOM().createElement('div');
            if (this.prefixCls) {
                div.classList.add(this.prefixCls);
            }
            if (this.containerCls) {
                div.classList.add(this.containerCls);
            }

            div.style.top = this.top ? withUnit(this.top) : 'auto';
            div.style.left = this.left ? withUnit(this.left) : 'auto';
            div.style.right = this.right ? withUnit(this.right) : 'auto';
            div.style.bottom = this.bottom ? withUnit(this.bottom) : 'auto';

            getDOM().appendChild(this._doc.body, div);
            this.container = div;
        }
        return this.container;
    }


    private _createComponent<T>(component: Type<T>): ComponentRef<T> {
        const componentFactory = this._componentFactoryResolver.resolveComponentFactory(component);
        const componentRef: ComponentRef<T> = componentFactory.create(this._injector);
        this._appRef.attachView(componentRef.hostView);

        // At this point the component has been instantiated, so we move it to the location in the DOM
        // where we want it to be rendered.
        const _hostDomElement = this.getContainer();
        _hostDomElement.appendChild(this._getComponentRootNode(componentRef));
        return componentRef;
    }

    /** Gets the root HTMLElement for an instantiated component. */
    private _getComponentRootNode(componentRef: ComponentRef<any>): HTMLElement {
        return (componentRef.hostView as EmbeddedViewRef<any>).rootNodes[0] as HTMLElement;
    }

    private createNotice(option: NoticeOpt, type: Type<any>): Notice {
        const componentRef = this._createComponent(type);

        const instance: Notice = componentRef.instance;
        for (const name in option) {
            if (option.hasOwnProperty(name)) {
                instance[name] = option[name];
            }
        }
        instance.prefixCls = option.prefixCls || this.prefixCls;
        instance.transitionName = this.getTransitionName();
        this.afterCreate(instance, option);

        instance.closed.subscribe(() => {
            const key = componentRef.instance.key;
            this.remove(key);
            componentRef.destroy();
        });
        return instance;
    }

    /** this method is called before thild component's ngAfterViewInit */
    protected afterCreate(instance: Notice, config: NoticeOpt): void {
        // 有可能需要在子类中做特殊处理，那么继承该方法
    }

    destroy(): void {
        if (this.notices && this.notices.length) {
            this.notices.forEach(notice => {
                notice.close();
            });
        }
        this.container.remove();
        this.container = null;
    }

}
