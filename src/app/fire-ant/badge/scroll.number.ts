/**
 * @license
 * Copyright 厦门乾元盛世科技有限公司 All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file.
 */

import { Component, Input, ElementRef, OnInit, ViewEncapsulation } from '@angular/core';

import { UpdateClassService } from '../core/service/update.class.service';
import { isPresent, toNumber } from '../util/lang';

export interface Digit {
    n: number;
    position: number;
    styleMap: {[key: string]: any};
}

/**
 * 滑动数字<br>
 * 通过调节数字序列的上下滑动，来达到数字动态变化的效果。<br>
 * 目的是实现：升值时数列往上滑动，降值时数列往下滑动。例如：
 * 从 1 -> 2 时，数列上滑；从 2 -> 1时，数列下滑。
 *
 * <br>
 * 实现说明：
 * 滑动数列（30个数字）：<pre>
 * 顺序  -> 值
 * --------------------------
 *  [0] -> [0]   上 区
 *  [1] -> [1]   当降值时，从“定位区”下滑显示“上区”，
 *  [2] -> [2]   例如：从 10 下降到 9，则动画是 显示定位区的 0，然后下滑显示上区的 9。
 *  [3] -> [3]
 *  [4] -> [4]
 *  [5] -> [5]
 *  [6] -> [6]
 *  [7] -> [7]
 *  [8] -> [8]
 *  [9] -> [9]
 * --------------------------
 * [10] -> [0]    定 位 区
 * [11] -> [1]    当数字在0-9范围内增减时，可以在定位区内滑动，而无需滑出定位区。
 * [12] -> [2]
 * [13] -> [3]
 * [14] -> [4]
 * [15] -> [5]
 * [16] -> [6]
 * [17] -> [7]
 * [18] -> [8]
 * [19] -> [9]
 * ---------------------------
 * [20] -> [0]   下 区
 * [21] -> [1]   当升值时，从“定位区”上滑显示“下区”，
 * [22] -> [2]   例如：从 9 上升到 10，则动画是 显示定位区的 9，然后上滑显示下区的 0。
 * [23] -> [3]
 * [24] -> [4]
 * [25] -> [5]
 * [26] -> [6]
 * [27] -> [7]
 * [28] -> [8]
 * [29] -> [9]
 * </pre>
 *
 */
@Component({
    selector: 'scroll-number',
    templateUrl: './scroll.number.html',
    styleUrls: ['./style/index.scss'],
    preserveWhitespaces: false,
    encapsulation: ViewEncapsulation.None,
    providers: [ UpdateClassService ]
})
export class ScrollNumber implements OnInit {

    /** 与count同级，如果非空时则只显示text，不显示count */
    @Input() text: string;

    /** 样式前缀 */
    @Input()
    get prefixCls(): string {
        return this._prefixCls;
    }
    set prefixCls(prefixCls: string) {
        if (this._prefixCls !== prefixCls) {
            this._prefixCls = prefixCls;
            this.updateClassMap();
            this.updateDigitItemClass();
        }
    }
    private _prefixCls = 'ant-scroll-number';


    /** 展示的数字，大于 overflowCount 时显示为 `${overflowCount}+`，为 0 时隐藏。 Number to show in badge */
    @Input()
    get count(): number {
        return this._count;
    }
    set count(count: number) {
        if (isPresent(count)) {
            const value = toNumber(count, null);
            if (this._count !== value) {
                this.lastCount = this._count;
                this._count = count;
                this.isIncreasing = count > this.lastCount;
                this.updateDigits();
            }
        }
    }
    private _count: number = null; // 当前值
    private lastCount: number;  // 前值


    /** 显示用数字 */
    public digits: Digit[] = [];
    /** 当前count拆分后的数字 */
    private currDigits: Digit[] = [];
    /** 上次count拆分后的数字 */
    private lastDigits: Digit[] = [];

    /** 数字列表（用于显示动态滑动的效果） */
    public numItems: number[];

    // 内部样式
    public digitItemClass: string;

    /** 通过比较当前值 count 与 上一个值 lastCount：升值则为true，降值则为false */
    private isIncreasing = false;
    /** 是否复位。在“复位”时，position必在“定位区”。 */
    private resetPosition = true;
    /** 是否已执行ngOnInit */
    private isInit = false;

    constructor(
        private el: ElementRef,
        private updateClassService: UpdateClassService) {
        this.createNumItems(); // 生成数字序列
    }

    /**
     * 生成数字序列，从0开始，例如：createNumItems(5) => [0,1,2,3,4]
     *
     * @param size 总数，如30，则数组内包含0-29的数字
     * @return 数列
     */
    createNumItems(size: number = 30): void {
        this.numItems = Array.from(new Array<any>(size), (_val: any, index: number) => index);
    }

    ngOnInit(): void {
        this.updateClassMap();
        this.updateDigitItemClass();
        this.isInit = true;
    }

    private updateClassMap(): void {
        const classes = {
            [`${this.prefixCls}`]: true
        };
        this.updateClassService.update(this.el.nativeElement, classes);
    }

    private updateDigitItemClass(): void {
        this.digitItemClass = `${this.prefixCls}-only`;
    }

    /**
     * 更新数字与动画
     */
    updateDigits(): void {
        if (!this.isInit) {
            this.currDigits = this.getDigits(this.count, true);
            this.digits = this.currDigits.reverse();
        } else {
            // 先复位
            this.resetPosition = true;
            this.lastDigits = this.getDigits(this.lastCount, true);
            this.currDigits = this.getDigits(this.count, false);
            this.setPosition(this.lastDigits, this.currDigits);
            this.digits = this.currDigits.slice(0).reverse();

            // 执行动画
            setTimeout(() => {
                this.resetPosition = false;
                const currDigits = this.getDigits(this.count, true);
                this.setPosition(currDigits, this.currDigits);
                this.digits = this.currDigits.slice(0).reverse();
            }, 5);
        }
    }

    /**
     * 调整当前数字的position。<br>
     * 目的是实现动画效果：升值时数列往上滑动，降值时数列往下滑动。<br>
     * 当数值发生变化时，显示的依然是变化前的[数字]（使用旧数字的position），然后更新position为新数字的position，促使样式translateY(n%)发生变化，动画效果形成。<br>
     * 因此，在不同时期调用本方法的目的不一样：
     * ① 将新数字的position设置为旧数字的position，以显示旧数字（不带动画）；
     * ② 或者，更新新数字的position，改变样式translateY(n%)，形成动画效果。
     *
     * @param lastDigits 变化前的数字
     * @param currDigits 变化后的数字（当前数字）
     */
    private setPosition(lastDigits: Digit[], currDigits: Digit[]): void {
        currDigits.forEach((digit: Digit, index: number) => {
            const lastDigit = lastDigits[index];
            if (lastDigit) {
                digit.position = lastDigit.position;
                digit.styleMap = lastDigit.styleMap;
            }
        });
    }

    /**
     * 获取数字在`30`个NumItems中的位置，用于生成translateY(n%)的值
     *
     * @param num   从数字串中拆分出来的数字，取值：0-9。例如，数字123拆分后是[1,2,3]，`num`的取值为1-3。
     * @param index `num`在拆分后的数字序列中的索引。例如，数字123拆分后是[1,2,3]，`index`的取值为0-2。
     * @return 位置(position)，取值：10-20，对应：[上区的9，定位区(0-9)，下区的0] 共 12 个position
     */
    private getPosition(num: number, index: number): number {
        // 用于复位数据，位置只会在十几的范围。用于“上一个值(lastCount)”。
        if (this.resetPosition) {
            return 10 + num;
        }

        // 与前一个值进行比较，才能确定是上滑，还是下滑
        // 从右侧取数，如数字123拆分后为[1,2,3]，则当index=0时，返回3(实际的个位数数字)
        const currDigit = num;
        const last = this.lastDigits[index];
        if (last === undefined) {
            return num;
        }
        const lastDigit = last.n;

        // 若 isIncreasing（升值）则数字应上滑，否则（降值）数字应下滑
        if (this.isIncreasing) {
            return currDigit >= lastDigit ? 10 + num : 20 + num;
        } else {
            return currDigit <= lastDigit ? 10 + num : num;
        }
    }

    /**
     * 将数值拆分为数字组合并倒序，例如: 123 => [3,2,1]
     *
     * @param value 原始数值
     * @param getPos 是否获取数字的position
     * @return 数列
     */
    private getDigits(value: number, getPos: boolean): Digit[] {
        if (!isPresent(value) || isNaN(value)) {
            return [];
        }

        return value.toString().split('').reverse().map((num: string, i: number) => {
            const n: number = Number(num);
            const position = getPos ? this.getPosition(n, i) : undefined;
            const styleMap = getPos ? this.getNumStyle(i, position) : undefined;
            return { n, position, styleMap };
        });
    }

    /**
     * 获取拆分后的数字所在span的样式
     *
     * @param index 数字在拆分后的数字数组中的index
     * @param position 该`num`的position
     */
    private getNumStyle(index: number, position: number): any {
        const noTransition = this.lastDigits[index] === undefined;

        return {
            'transition': noTransition ? 'none' : null,
            '-ms-transform': `translateY(${-position * 100}%)`,
            '-webkit-transform': `translateY(${-position * 100}%)`,
            'transform': `translateY(${-position * 100}%)`
        };
    }

}
