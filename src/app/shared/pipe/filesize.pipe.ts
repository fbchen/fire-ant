/**
 * @license
 * Copyright 厦门乾元盛世科技有限公司 All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file.
 */

import { Pipe, PipeTransform } from '@angular/core';
import { FileUtils } from '../utils/file.utils';

/**
 * 根据文件大小(B)，输出可阅读的文件大小（如：2.14 GB、2.5 MB、87 KB等）
 *
 * @author fbchen
 * @version 1.0 2016-12-06
 */
@Pipe({ name: 'filesize' })
export class FileSizePipe implements PipeTransform {

    transform(filesize: number): string {
        return FileUtils.getFileSize(filesize);
    }

}
