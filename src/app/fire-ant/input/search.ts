/**
 * @license
 * Copyright 厦门乾元盛世科技有限公司 All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file.
 */

import {
    Component, Input, Output, EventEmitter, ElementRef, Renderer2, ViewEncapsulation,
    OnInit, OnDestroy, Inject, Optional, forwardRef
} from '@angular/core';
import { NG_VALUE_ACCESSOR, COMPOSITION_BUFFER_MODE } from '@angular/forms';

import { Subject } from 'rxjs/Subject';
import { Subscription } from 'rxjs/Subscription';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';

import { UpdateClassService } from '../core/service/update.class.service';
import { isPresent, toNumber } from '../util/lang';
import { InputBox } from './input';


const INPUT_CONTROL_VALUE_ACCESSOR: any = {
    provide: NG_VALUE_ACCESSOR,
    useExisting: forwardRef(() => Search),
    multi: true
};

@Component({
    selector: 'ant-search',
    templateUrl: './search.html',
    styleUrls: ['./style/index.scss', './style/search-input.scss'],
    preserveWhitespaces: false,
    encapsulation: ViewEncapsulation.None,
    providers: [ UpdateClassService, INPUT_CONTROL_VALUE_ACCESSOR ]
})
export class Search extends InputBox implements OnInit, OnDestroy {

    /** 样式前缀 */
    @Input()
    get prefixCls(): string {
        return this._prefixCls;
    }
    set prefixCls(prefixCls: string) {
        if (this._prefixCls !== prefixCls) {
            this._prefixCls = prefixCls;
            this.updateInputClass();
            this.updateAffixWrapperClass();
            this.updateAffixPrefixClass();
            this.updateAffixSuffixClass();
            this.updateSearchIconClass();
        }
    }
    protected _prefixCls = 'ant-input';


    /** 自动查询延迟时间（ms），默认300毫秒 */
    @Input()
    get triggerDelay(): number {
        return this._triggerDelay;
    }
    set triggerDelay(triggerDelay: number) {
        if (isPresent(triggerDelay)) {
            const value = toNumber(triggerDelay, null);
            if (this._triggerDelay !== value) {
                this._triggerDelay = value;
                this.subscribeTerms();
            }
        }
    }
    protected _triggerDelay = 300;


    /**
     * @output {event} 回车执行查询
     */
    @Output() search = new EventEmitter<string>();

    private searchTerms = new Subject<string>();

    private searchTermsSubscription: Subscription;

    // 内部样式
    public searchIconClass: string;

    constructor(
        @Inject(Renderer2) public renderer: Renderer2,
        @Inject(ElementRef) public el: ElementRef,
        @Optional() @Inject(COMPOSITION_BUFFER_MODE) public compositionMode: boolean,
        protected updateClassService: UpdateClassService) {
        super(renderer, el, compositionMode);

    }

    ngOnInit(): void {
        super.ngOnInit();
        this.updateSearchIconClass();
        this.subscribeTerms();
    }

    ngOnDestroy(): void {
        this.unsubscribeTerms();
    }

    private subscribeTerms(): void {
        this.unsubscribeTerms();
        if (this.triggerDelay > 0) {
            this.searchTermsSubscription = this.searchTerms.pipe(
                debounceTime(this.triggerDelay),  // wait for 300ms pause in events
                distinctUntilChanged()   // ignore if next search term is same as previous
            ).subscribe((term: string) => {
                this.search.emit(term);
            });
        }
    }

    private unsubscribeTerms(): void {
        if (this.searchTermsSubscription) {
            this.searchTermsSubscription.unsubscribe();
        }
    }

    updateInputClass(): void {
        this.inputClass = Object.assign(super.getInputClass(), {
            [`${this.prefixCls}-search`]: true,
            'has-suffix': true
        });
    }

    updateSearchIconClass(): void {
        this.searchIconClass = `${this.prefixCls}-search-icon`;
    }

    updateAffixWrapperClass(): void {
        super.updateAffixWrapperClass();
        this.updateClassService.update(this.el.nativeElement, this.affixWrapperClass);
    }

    // Push a search term into the observable stream.
    push(term: string): void {
        this.searchTerms.next(term);
    }

    onSearch(): void {
        this.search.emit(this.innerValue);
        this.doFocus();
    }

}
