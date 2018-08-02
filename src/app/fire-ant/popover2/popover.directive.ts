/**
 * @license
 * Copyright 厦门乾元盛世科技有限公司 All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file.
 */

import { Directive, ElementRef } from '@angular/core';

/**
 * 用法：
 * 1. 简单用法：
 * <ant-popover2 nzTitle="prompt text" nzContent="popover content">
 *     <span ant-popover2>Popover will show when mouse enter.</span>
 * </ant-popover2>
 * 2. 组件用法：
 * <ant-popover2 nzTitle="prompt text" [nzComponent]="MyContentComponent" [nzComponentData]="myContent">
 *     <ant-button ant-popover2>按钮</ant-button>
 * </ant-popover2>
 * 3. NgTemplate用法：
 * <ant-popover2 nzTitle="prompt text" [nzTemplateData]="myContent">
 *     <ant-button ant-popover2>按钮</ant-button>
 *     <ng-template #nzTemplate>popover content</ng-template>
 * </ant-popover2>
 */
@Directive({
    // tslint:disable-next-line:directive-selector
    selector: '[ant-popover2]'
})
export class PopoverDirective {

    public isOverlayVisible = false;

    constructor(private elementRef: ElementRef) {

    }

    /** The underlying host native element */
    getHostElement(): HTMLElement {
        return this.elementRef.nativeElement as HTMLElement;
    }

}

