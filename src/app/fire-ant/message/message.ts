/**
 * @license
 * Copyright 厦门乾元盛世科技有限公司 All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file.
 */

import { Injectable, Inject, Input, ComponentFactoryResolver, ApplicationRef, Injector } from '@angular/core';
import { DOCUMENT } from '@angular/platform-browser';
import { NotificationContainer, withUnit } from '../notification/notification.container';
import { Notice, NoticeOpt } from '../notification/notice';
import { MessageBox } from './message.box';

export type NoticeType = 'info' | 'success' | 'error' | 'warning' | 'loading';

export interface ConfigOptions {
    top?: number;
    duration?: number;
    prefixCls?: string;
}

@Injectable()
export class Message extends NotificationContainer {

    /** 样式前缀 */
    @Input() prefixCls = 'ant-message';

    @Input() transitionName = 'move-up';

    /** 自动关闭之前的等待时间 */
    @Input() duration = 1.5;

    /** top */
    @Input() top: number | string = 15;

    constructor(
        @Inject(DOCUMENT) public doc: Document,
        public componentFactoryResolver: ComponentFactoryResolver,
        public appRef: ApplicationRef,
        public injector: Injector) {
        super(doc, componentFactoryResolver, appRef, injector);
    }

    notice(msg: string, duration: number, type: NoticeType): Notice {
        const option = {} as NoticeOpt;

        option.prefixCls = this.prefixCls;
        option.type = type;
        option.duration = typeof duration === 'number' ? duration : this.duration;
        option.message = msg;

        return this.add(option, MessageBox);
    }

    protected afterCreate(instance: Notice, config: NoticeOpt): void {
        if (instance instanceof MessageBox) {
            instance.content = config.message;
        }
    }


    info(content: string, duration?: number): Notice {
        return this.notice(content, duration, 'info');
    }

    success(content: string, duration?: number): Notice {
        return this.notice(content, duration, 'success');
    }

    error(content: string, duration?: number): Notice {
        return this.notice(content, duration, 'error');
    }

    warning(content: string, duration?: number): Notice {
        return this.notice(content, duration, 'warning');
    }

    loading(content: string, duration: number = 0): Notice {
        return this.notice(content, duration, 'loading');
    }

    config(config: ConfigOptions): void {
        if (!config) {
            return;
        }

        const container: HTMLElement = this.container;
        if (config.prefixCls) {
            if (container && this.prefixCls) {
                container.classList.remove(this.prefixCls);
            }
            this.prefixCls = config.prefixCls;
            if (container && this.prefixCls) {
                container.classList.add(this.prefixCls);
            }
        }
        if (typeof config.duration === 'number') {
            this.duration = config.duration;
        }
        if (typeof config.top !== 'undefined') {
            this.top = config.top;
            if (container && this.top) {
                container.style.top = withUnit(this.top);
            }
        }
    }

}

