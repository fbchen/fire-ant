/**
 * @license
 * Copyright 厦门乾元盛世科技有限公司 All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file.
 */

import { Component, Input, OnInit, ElementRef, ViewEncapsulation } from '@angular/core';
import { UpdateClassService } from '../core/service/update.class.service';

/**
 * Layout 布局
 */
export class Basic implements OnInit {

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


    constructor(
        protected el: ElementRef,
        protected updateClassService: UpdateClassService) {

    }

    ngOnInit(): void {
        this.updateClassMap();
    }

    protected updateClassMap(): void {
        const classes = {
            [`${this.prefixCls}`]: true
        };
        this.updateClassService.update(this.el.nativeElement, classes);
    }

}


@Component({
    selector: 'ant-layout',
    template: '<ng-content></ng-content>',
    styleUrls: ['./style/index.scss'],
    preserveWhitespaces: false,
    encapsulation: ViewEncapsulation.None,
    providers: [ UpdateClassService ]
})
export class Layout extends Basic {

    public get hasSilder(): boolean {
        return this._hasSilder;
    }
    public set hasSilder(hasSilder: boolean) {
        this._hasSilder = hasSilder;
        this.updateClassMap();
    }
    private _hasSilder = false;

    constructor(
        protected el: ElementRef,
        protected updateClassService: UpdateClassService) {
        super(el, updateClassService);
        this.prefixCls = 'ant-layout';
    }

    protected updateClassMap(): void {
        const classes = {
            [`${this.prefixCls}`]: true,
            [`${this.prefixCls}-has-sider`]: this.hasSilder
        };
        this.updateClassService.update(this.el.nativeElement, classes);
    }

}

@Component({
    selector: 'ant-layout-header',
    template: '<ng-content></ng-content>',
    encapsulation: ViewEncapsulation.None,
    providers: [ UpdateClassService ]
})
export class Header extends Basic {

    constructor(
        protected el: ElementRef,
        protected updateClassService: UpdateClassService) {
        super(el, updateClassService);
        this.prefixCls = 'ant-layout-header';
    }
}

@Component({
    selector: 'ant-layout-footer',
    template: '<ng-content></ng-content>',
    encapsulation: ViewEncapsulation.None,
    providers: [ UpdateClassService ]
})
export class Footer extends Basic {

    constructor(
        protected el: ElementRef,
        protected updateClassService: UpdateClassService) {
        super(el, updateClassService);
        this.prefixCls = 'ant-layout-footer';
    }
}

@Component({
    selector: 'ant-layout-content',
    template: '<ng-content></ng-content>',
    encapsulation: ViewEncapsulation.None,
    providers: [ UpdateClassService ]
})
export class Content extends Basic {

    constructor(
        protected el: ElementRef,
        protected updateClassService: UpdateClassService) {
        super(el, updateClassService);
        this.prefixCls = 'ant-layout-content';
    }
}
