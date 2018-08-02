/**
 * @license
 * Copyright 厦门乾元盛世科技有限公司 All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file.
 */

import { Http, Response } from '@angular/http';
import { Observable } from 'rxjs/Observable';

import { Result } from '../core/result';
import { ResultError } from '../core/result.error';
import { environment } from '../../environments/environment';

/**
 * 抽象服务
 * @author fbchen
 * @version 1.0 2017-07-01
 */
export class AbstractService {

    /** 数据服务器地址 */
    protected BaseUrl = environment.BaseUrl;

    constructor(protected http: Http) {

    }

    /**
     * 从Response抽取数据
     *
     * @param response Response对象
     */
    public extractData(response: Response): Observable<Result> {
        if (response['error']) {
            throw new ResultError(response['error'] as Result);
            // return Observable.throw(response['error'] as Result);
        }
        return response['result'];
    }

    /**
     * 捕获异常，并转换为Result
     *
     * @param err 可能是Response、Result，或Error等
     * @param caught Observable对象
     */
    public catchError(err: any, caught?: Observable<any>): Observable<Result> {
        let result: Result;
        if (err instanceof ResultError) {
            result = err.result;
        } else if (err.error instanceof Result) {
            result = err.error;
        } else if (err instanceof Response) {
            result = Result.fail('900', err.statusText || '服务器异常，请稍后重试');
        } else {
            const errMsg = err.message ? err.message : err.toString();
            result = Result.fail('900', errMsg);
        }
        return Observable.throw(result);
    }

}
