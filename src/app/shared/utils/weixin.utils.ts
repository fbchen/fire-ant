/**
 * @license
 * Copyright 厦门乾元盛世科技有限公司 All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file.
 */

/**
 * 微信相关
 *
 * @author fbchen
 * @version 1.0 2016-12-02
 */
export class WeixinUtils {

    /**
     * 获取粉丝的头像
     *
     * @param avatar 粉丝默认的头像URL
     * @param size 代表正方形头像大小，有0、46、64、96、132数值可选，0代表640*640正方形头像。
     * @param defaultAvatar 当粉丝的头像为空时，使用该默认的头像
     */
    static getAvatar(avatar: string, size: number = 96, defaultAvatar?: string): string {
        // 粉丝有头像
        if (avatar) {
            const index = avatar.endsWith('/0') ? avatar.lastIndexOf('/') : -1;
            return index > 0 ? avatar.substring(0, index + 1) + size : avatar;
        }
        // 粉丝没有头像，则使用默认图片
        return defaultAvatar || '/assets/images/empty.png';
    }

}
