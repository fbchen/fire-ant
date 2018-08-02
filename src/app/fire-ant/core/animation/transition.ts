/**
 * @license
 * Copyright 厦门乾元盛世科技有限公司 All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file.
 */

import * as cssAnimate from 'css-animation';


/**
 * 传入动画名称（通过在css中定义好）执行该动画，并调用回调函数 (by fbchen)
 * @param domEl 目标结点
 * @param transitionName 动画名称
 * @param done 回调函数
 */
export function transition(domEl: HTMLElement, transitionName: string, done: Function): void {
    if (cssAnimate.isCssAnimationSupported) {
        cssAnimate(domEl, {
            name: transitionName,
            active: transitionName + '-active'
        }, done);
        return;
    }
    if (done) { done(); }
}

export function transitionEnter(domEl: HTMLElement, transitionName: string, done: Function): void {
    transition(domEl, transitionName + '-enter', done);
}

export function transitionLeave(domEl: HTMLElement, transitionName: string, done: Function): void {
    transition(domEl, transitionName + '-leave', done);
}

export function transitionAppear(domEl: HTMLElement, transitionName: string, done: Function): void {
    transition(domEl, transitionName + '-appear', done);
}
