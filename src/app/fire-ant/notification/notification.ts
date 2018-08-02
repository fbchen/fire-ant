/**
 * @license
 * Copyright 厦门乾元盛世科技有限公司 All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file.
 */

import { Injectable, Inject, Input, ComponentFactoryResolver, ApplicationRef, Injector } from '@angular/core';
import { ɵgetDOM as getDOM, DOCUMENT } from '@angular/platform-browser';
import { NotificationContainer, withUnit } from './notification.container';
import { Notice, NoticeOpt } from './notice';
import { NotificationBox } from './notification.box';

export type NoticeType = 'info' | 'success' | 'error' | 'warning' | 'default';
export type NotificationPlacement = 'topLeft' | 'topRight' | 'bottomLeft' | 'bottomRight';

export interface ConfigOptions {
    top?: number;
    bottom?: number;
    placement?: NotificationPlacement;
    duration?: number;
    prefixCls?: string;
}


@Injectable()
export class Notification extends NotificationContainer {

    /** 样式前缀 */
    @Input() prefixCls = 'ant-notification';

    /** 类型 */
    @Input() type: NoticeType = 'default';

    @Input() placement: NotificationPlacement = 'topRight';

    /** top */
    @Input() top: number | string = 24;

    /** bottom */
    @Input() bottom: number | string = 24;

    /** 自动关闭之前的等待时间 */
    @Input() duration = 4.5;

    private notificationInstance: { [key: string]: HTMLElement } = {};

    constructor(
        @Inject(DOCUMENT) public doc: Document,
        public componentFactoryResolver: ComponentFactoryResolver,
        public appRef: ApplicationRef,
        public injector: Injector) {
        super(doc, componentFactoryResolver, appRef, injector);
    }

    getPlacementStyle(placement): any {
        let style;
        switch (placement) {
            case 'topLeft':
                style = {
                    left: '0px',
                    top: withUnit(this.top),
                    bottom: 'auto',
                };
                break;
            case 'bottomLeft':
                style = {
                    left: '0px',
                    top: 'auto',
                    bottom: withUnit(this.bottom),
                };
                break;
            case 'bottomRight':
                style = {
                    right: '0px',
                    top: 'auto',
                    bottom: withUnit(this.bottom),
                };
                break;
            default:
                style = {
                    right: '0px',
                    top: withUnit(this.top),
                    bottom: 'auto',
                };
        }
        return style;
    }

    getContainer(): HTMLElement {
        if (this.notificationInstance[this.placement]) {
            return this.notificationInstance[this.placement];
        }

        const div: HTMLElement = getDOM().createElement('div');
        if (this.prefixCls) {
            div.classList.add(this.prefixCls);
        }
        if (this.containerCls) {
            div.classList.add(this.containerCls);
        }
        div.classList.add(`${this.prefixCls}-${this.placement}`);

        const style = this.getPlacementStyle(this.placement);
        for (const name in style) {
            if (style.hasOwnProperty(name)) {
                div.style[name] = style[name];
            }
        }

        getDOM().appendChild(this.doc.body, div);
        this.notificationInstance[this.placement] = div;
        return div;
    }

    open(message: NoticeOpt): Notice {
        message.prefixCls = this.prefixCls;

        if (typeof message.duration !== 'number') {
            message.duration = this.duration;
        }

        // before add notice, set placement
        if (message.placement) {
            this.placement = message.placement;
        }

        return this.add(message, NotificationBox);
    }


    info(message: NoticeOpt): Notice {
        message.type = 'info';
        return this.open(message);
    }

    success(message: NoticeOpt): Notice {
        message.type = 'success';
        return this.open(message);
    }

    error(message: NoticeOpt): Notice {
        message.type = 'error';
        return this.open(message);
    }

    warning(message: NoticeOpt): Notice {
        message.type = 'warning';
        return this.open(message);
    }

    config(config: ConfigOptions): void {
        if (!config) {
            return;
        }

        if (typeof config.duration === 'number') {
            this.duration = config.duration;
        }
        if (typeof config.placement !== 'undefined') {
            this.placement = config.placement;
        }
        if (typeof config.top !== 'undefined') {
            this.top = config.top;
        }
        if (typeof config.bottom !== 'undefined') {
            this.bottom = config.bottom;
        }
        if (config.placement !== undefined || config.bottom !== undefined || config.top !== undefined) {
            const container = this.notificationInstance[this.placement];
            if (container) {
                container.remove();
            }
            delete this.notificationInstance[this.placement];
        }
    }

}

