/**
 * @license
 * Copyright 厦门乾元盛世科技有限公司 All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file.
 */


/**
 * Scrollbar 工具类
 * 参考 http://getbootstrap.com/javascript/#modals
 *
 * @author fbchen
 * @version 1.0 2017-05-19
 */
export class Scrollbar {

    public bodyIsOverflowing: boolean;
    public scrollbarWidth: number;
    public originalBodyPad: string;

    constructor(private doc: Document) {
    }

    checkScrollbar(): Scrollbar {
        let fullWindowWidth = window.innerWidth;
        if (!fullWindowWidth) { // workaround for missing window.innerWidth in IE8
            const documentElementRect = this.doc.documentElement.getBoundingClientRect();
            fullWindowWidth = documentElementRect.right - Math.abs(documentElementRect.left);
        }
        this.bodyIsOverflowing = this.doc.body.clientWidth < fullWindowWidth;
        this.scrollbarWidth = this.measureScrollbar();
        return this;
    }

    setScrollbar(): Scrollbar {
        const bodyPad = parseInt(this.doc.body.style.paddingRight || '0', 10);
        this.originalBodyPad = this.doc.body.style.paddingRight || '';
        if (this.bodyIsOverflowing) {
            this.doc.body.style.paddingRight = (bodyPad + this.scrollbarWidth) + 'px';
        }
        return this;
    }

    resetScrollbar(): Scrollbar {
        this.doc.body.style.paddingRight = this.originalBodyPad;
        return this;
    }

    measureScrollbar(): number { // thx walsh
        const scrollDiv = this.doc.createElement('div');
        scrollDiv.className = 'modal-scrollbar-measure';
        this.doc.body.appendChild(scrollDiv);
        const scrollbarWidth = scrollDiv.offsetWidth - scrollDiv.clientWidth;
        this.doc.body.removeChild(scrollDiv);
        return scrollbarWidth;
    }

}
