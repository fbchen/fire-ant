/**
 * @license
 * Copyright 厦门乾元盛世科技有限公司 All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file.
 */


const FILE_SIZE_UINTS = ['KB', 'MB', 'GB', 'TB', 'PB'];

/**
 * 文件处理函数工具
 *
 * @author fbchen
 * @version 1.0 2016-12-02
 */
export class FileUtils {

    /**
     * 下载Blob内容
     */
    static download(fileName: string, type: string, data: any): void {
        const blob = new Blob([data], { type });
        if (window.navigator.msSaveOrOpenBlob) {
            navigator.msSaveBlob(blob, fileName);
        } else {
            const link = document.createElement('a');
            link.href = window.URL.createObjectURL(blob);
            link.download = fileName;
            link.click();
            window.URL.revokeObjectURL(link.href);
        }
    }

    /**
     * 计算文件大小
     */
    static getFileSize(filesize: number): string {
        const max = 5; // KB, MB, GB, TB, PB
        for (let i = max; i >= 0; i--) {
            const base = Math.pow(1024, i);
            const value = filesize / base;
            if (value >= 1) {
                if (i === 0) {
                    return `${Math.round(value)} ${FILE_SIZE_UINTS[i - 1]}`;
                }
                return `${Math.round(value * 100) / 100} ${FILE_SIZE_UINTS[i - 1]}`;
            }
        }
        return `0 KB`;
    }

    /**
     * 计算图片的原始大小
     *
     * @param image 图片对象
     */
    static getImgNaturalDimensions(image: HTMLImageElement): Promise<number[]> {
        if (image.naturalWidth) { // 现代浏览器
            return Promise.resolve([image.naturalWidth, image.naturalHeight]);
        }
        return new Promise((resolve) => { // IE6/7/8
            const img = new Image();
            img.onload = () => {
                resolve([img.width, img.height]);
            };
            img.src = image.src;
        });
    }

}
