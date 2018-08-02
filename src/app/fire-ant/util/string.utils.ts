/**
 * @license
 * Copyright 厦门乾元盛世科技有限公司 All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file.
 */

/**
 * 字符串处理函数工具
 *
 * @author fbchen
 * @version 1.0 2016-12-02
 */
export class StringUtils {

    /**
     * 是否空白字符串
     */
    static isBlank(str: string): boolean {
        if (str == null || str.length === 0) {
            return true;
        }
        return /^\s+$/.test(str);
    }

    /**
     * 计算字符串的字节长度（一个汉字算2个字节）
     */
    static getByteLength(str: string): number {
        if (str == null) { return 0; }
        const m = str.match(/[^\x00-\xff]/ig);
        return str.length + (m == null ? 0 : m.length);
    }

    /**
     * 是否手机号
     */
    static isPhoneNo(str: string): boolean {
        const mobileRe: RegExp = /^1[34578][0-9]{9}$/;
        return mobileRe.test(str);
    }

    /**
     * 从字符串中提取年、月、日、时、分、秒，并转换为日期对象
     *
     * @param date 字符串格式数字，目前只支持带“分隔符”的数字日期时间，例如：2016-09-12 23:15:00
     * @param pattern 日期格式，请参考@angular/DatePipe的说明
     * @return Date
     */
    static parseDate(date: string, pattern: string): Date {
        const dateRe = pattern.replace(/d+/g, '(\\d{1,2})')
            .replace(/y+/g, '(\\d{2,4})').replace(/M+/g, '(\\d{1,2})')
            .replace(/H+/g, '(\\d{1,2})').replace(/m+/g, '(\\d{1,2})')
            .replace(/s+/g, '(\\d{1,2})');
        const values = new RegExp(dateRe).exec(date);

        if (values) {
            let formatRe = pattern.replace(/(y)\1*/g, '$1|')
                .replace(/(M)\1*/g, '$1|').replace(/(d)\1*/g, '$1|')
                .replace(/(H)\1*/g, '$1|').replace(/(m)\1*/g, '$1|')
                .replace(/(s)\1*/g, '$1|').replace(/[^yMdHms]+/g, '|');
            formatRe = (formatRe.charAt(0) === '|') ? formatRe.slice(1) : formatRe;
            const indexs: Array<string> = formatRe.split('|');

            const now = new Date();
            const time = {
                y: parseInt(values[indexs.indexOf('y') + 1] || String(now.getFullYear()), 10),
                M: parseInt(values[indexs.indexOf('M') + 1] || String(now.getMonth() + 1), 10),
                d: parseInt(values[indexs.indexOf('d') + 1] || String(now.getDay()), 10),
                H: parseInt(values[indexs.indexOf('H') + 1] || String(now.getHours()), 10),
                m: parseInt(values[indexs.indexOf('m') + 1] || String(now.getMinutes()), 10),
                s: parseInt(values[indexs.indexOf('s') + 1] || String(now.getSeconds()), 10)
            };
            return new Date(time.y, time.M - 1, time.d, time.H, time.m, time.s, 0);
        }

        return null;
    }

    /**
     * 字符串转换成Boolean
     */
    static toBoolean(str: string): boolean {
        if (str === undefined || str == null || str === '') {
            return false;
        }
        switch (str.toLowerCase()) {
            case 'false': case 'no': case '0': case '':
                return false;
        }
        return true;
    }

    /**
     *  格式化字符串<br>
     *  两种调用方式:
     *  <code>
     *  var template1 = "我是{0}，今年{1}了";
     *  var template2 = "我是{name}，今年{age}了";
     *  var result1 = template1.format("小明", 22);
     *  var result2 = template2.format({name: "小明", age: 22});
     *  // 两个结果都是"我是小明，今年22了"
     *  </code>
     * @param {String/Object/Array} args 参数
     * @return {String}
     */
    static format(str: string, ...args: any[]): string {
        if (args.length > 0) {
            const obj = args[0];
            // 1、调用参数为: format({key: value, ...})
            if (typeof obj === 'object') {
                for (const key in obj) {
                    if (obj.hasOwnProperty(key)) {
                        const regex = new RegExp('({' + key + '})', 'g');
                        str = str.replace(regex, obj[key]);
                    }
                }
            } else { // 2、调用参数为: format('123', 'abc', ...)
                for (let i = 0; i < args.length; i++) {
                    if (args[i] !== undefined) {
                        const regex = new RegExp('(\\{' + i + '\\})', 'g');
                        str = str.replace(regex, args[i]);
                    }
                }
            }
        }

        return str;
    }
}
