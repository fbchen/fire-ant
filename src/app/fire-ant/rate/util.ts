/**
 * @license
 * Copyright 厦门乾元盛世科技有限公司 All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file.
 */


function getScroll(win: Window, top: number = 0) {
    let ret = top ? win.pageYOffset : win.pageXOffset;
    const method = top ? 'scrollTop' : 'scrollLeft';
    if (typeof ret !== 'number') {
        const d = win.document;
        // ie6,7,8 standard mode
        ret = d.documentElement[method];
        if (typeof ret !== 'number') {
            // quirks mode
            ret = d.body[method];
        }
    }
    return ret;
}

function getClientPosition(elem: HTMLElement): {left: number, top: number} {
    let box;
    let x;
    let y;
    const doc = elem.ownerDocument;
    const body = doc.body;
    const docElem = doc && doc.documentElement;
    box = elem.getBoundingClientRect();
    x = box.left;
    y = box.top;
    x -= docElem.clientLeft || body.clientLeft || 0;
    y -= docElem.clientTop || body.clientTop || 0;
    return {
        left: x,
        top: y,
    };
}

export function getOffsetLeft(el: HTMLElement): number {
    const pos = getClientPosition(el);
    const doc = el.ownerDocument;
    const win = doc.defaultView || doc['parentWindow'];
    pos.left += getScroll(win);
    return pos.left;
}
