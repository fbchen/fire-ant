/**
 * @license
 * Copyright 厦门乾元盛世科技有限公司 All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file.
 */

import * as moment from 'moment';

/** 不用可时间列表 */
export interface DisabledTime {
    /** 获取不可用的小时列表 */
    disabledHours: () => number[];

    /** 获取不可用的分钟列表 */
    disabledMinutes: (hour: number) => number[];

    /** 获取不可用的秒钟列表 */
    disabledSeconds: (hour: number, minute: number) => number[];
}

const defaultDisabledTime: DisabledTime = {
    disabledHours(): number[] {
        return [];
    },
    disabledMinutes(hour: number): number[] {
        return [];
    },
    disabledSeconds(hour: number, minute: number): number[] {
        return [];
    },
};

/** 没有禁用的小时 */
export function allAllowHours(): number[] {
    return [];
}

/** 没有禁用的分钟 */
export function allAllowMinutes(hour: number): number[] {
    return [];
}

/** 没有禁用的秒钟 */
export function allAllowSeconds(hour: number, minute: number): number[] {
    return [];
}

/** 获取对应日期的时间禁用配置 */
export function getDisabledTime(value: moment.Moment,
    disabledTime: (value: moment.Moment) => DisabledTime): DisabledTime {
    let disabledTimeConfig = disabledTime ? disabledTime(value) : {} as DisabledTime;
    disabledTimeConfig = {
        ...defaultDisabledTime,
        ...disabledTimeConfig,
    };
    return disabledTimeConfig;
}

/** 时间是否有效 */
export function isTimeValidByConfig(value: moment.Moment, disabledTimeConfig: DisabledTime): boolean {
    if (!value) {
        return true;
    }

    const hour = value.hour();
    const minutes = value.minute();
    const seconds = value.second();
    const disabledHours = disabledTimeConfig.disabledHours();
    if (disabledHours.indexOf(hour) >= 0) {
        return false;
    }
    const disabledMinutes = disabledTimeConfig.disabledMinutes(hour);
    if (disabledMinutes.indexOf(minutes) >= 0) {
        return false;
    }
    const disabledSeconds = disabledTimeConfig.disabledSeconds(hour, minutes);
    if (disabledSeconds.indexOf(seconds) >= 0) {
        return false;
    }

    return true;
}

/** 时间是否有效 */
export function isTimeValid(value: moment.Moment,
    disabledTime: (value: moment.Moment) => DisabledTime): boolean {
    const disabledTimeConfig = getDisabledTime(value, disabledTime);
    return isTimeValidByConfig(value, disabledTimeConfig);
}

/** 时间是否非法 */
export function isTimeInvalid(value: moment.Moment,
    disabledTime: (value: moment.Moment) => DisabledTime): boolean {
    return !isTimeValid(value, disabledTime);
}

/** 是否有效的日期时间 */
export function isAllowedDate(value: moment.Moment,
    disabledDate: (date: moment.Moment) => boolean,
    disabledTime: (value: moment.Moment) => DisabledTime): boolean {

    if (disabledDate && disabledDate(value)) {
        return false;
    }
    if (disabledTime && !isTimeValid(value, disabledTime)) {
        return false;
    }
    return true;
}

