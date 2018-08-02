import { ComponentRef, EmbeddedViewRef } from '@angular/core';

/**
 * Dom or Native Element 工具类
 *
 * @author fbchen
 * @version 1.0 2017-05-19
 */
export class DomUtils {

    /**
     * 判断是否<code>root</code>结点是否包含<code>n</code>结点
     *
     * @param root 根结点Element
     * @param n 待判断的结点
     */
    static contains(root: HTMLElement, n: Node): boolean {
        let node: Node = n;
        while (node) {
            if (node === root) {
                return true;
            }
            node = node.parentNode;
        }

        return false;
    }

    /**
     * Gets the root HTMLElement for an instantiated component.
     *
     * @param componentRef 组件引用对象
     */
    static getComponentRootNode(componentRef: ComponentRef<any>): HTMLElement {
        return (componentRef.hostView as EmbeddedViewRef<any>).rootNodes[0] as HTMLElement;
    }

    /**
     * 检测两个结点是否直接的父子关系
     *
     * @param parent 父结点
     * @param child 子结点
     */
    static isParentChild(parent: HTMLElement, child: HTMLElement): boolean {
        return parent && child && child.parentElement === parent;
    }

    /** 是否支持Flex布局 */
    static isFlexSupported(): boolean {
        if (typeof window !== 'undefined' && window.document && window.document.documentElement) {
            const { documentElement } = window.document;
            return 'flex' in documentElement.style ||
                'webkitFlex' in documentElement.style ||
                'Flex' in documentElement.style ||
                'msFlex' in documentElement.style;
        }
        return false;
    }

    /** 是否支持Transform */
    static isTransformSupported(): boolean {
        if (typeof window !== 'undefined' && window.document && window.document.documentElement) {
            const { documentElement } = window.document;
            return 'transform' in documentElement.style ||
                'webkitTransform' in documentElement.style ||
                'mozTransform' in documentElement.style;
        }
        return false;
    }

    /** 设置样式的transform */
    static setTransform(style: CSSStyleDeclaration, transform: string): void {
        style.transform = transform;
        style.webkitTransform = transform;
        // style.mozTransform = transform;
    }

    /** 设置样式的transformOrigin */
    static setTransformOrigin(style: CSSStyleDeclaration, transformOrigin: string) {
        ['Moz', 'Ms', 'ms'].forEach((prefix) => {
            style[`${prefix}TransformOrigin`] = transformOrigin;
        });
        style.webkitTransformOrigin = transformOrigin;
        style.transformOrigin = transformOrigin;
    }

    static getTransform(transform: string): any {
        return {
            transform: transform,
            webkitTransform: transform,
            mozTransform: transform
        };
    }

}


export function getOffset(el: HTMLElement): {left: number, top: number} {
    if (!el.getClientRects().length) {
        return { top: 0, left: 0 };
    }

    const rect = el.getBoundingClientRect();
    if (rect.width || rect.height) {
        const doc = el.ownerDocument;
        const win = doc.defaultView;
        const docElem = doc.documentElement;

        return {
            top: rect.top + win.pageYOffset - docElem.clientTop,
            left: rect.left + win.pageXOffset - docElem.clientLeft,
        };
    }

    return rect;
}
