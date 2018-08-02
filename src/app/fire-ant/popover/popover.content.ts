/**
 * @license
 * Copyright 厦门乾元盛世科技有限公司 All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file.
 */


import { Component, ElementRef, ViewEncapsulation } from '@angular/core';

@Component({
    selector: 'popover-content',
    template: `<ng-content></ng-content>`,
    preserveWhitespaces: false,
    encapsulation: ViewEncapsulation.None
})
export class PopoverContent {

    constructor(private elementRef: ElementRef) {

    }

    /** The underlying host native element */
    getHostElement(): HTMLElement {
        return this.elementRef.nativeElement as HTMLElement;
    }

}

