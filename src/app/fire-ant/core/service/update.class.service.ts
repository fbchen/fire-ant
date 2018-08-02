import { Injectable } from '@angular/core';
import { replaceClass } from '../../util/classnames';

/**
 * 用于更新Host组件的样式
 */
@Injectable()
export class UpdateClassService {

    private classMap: any;

    /**
     * 更新Host组件的样式
     * @param el HOST组件的Element
     * @param newClass 新的样式，可以是string, object等
     */
    update(el: HTMLElement, newClass: any): void {
        replaceClass(el, newClass, this.classMap);
        this.classMap = newClass;
    }

}
