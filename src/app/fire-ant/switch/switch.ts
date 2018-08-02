/**
 * @license
 * Copyright 厦门乾元盛世科技有限公司 All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file.
 */

import {
    Component, Input, Output, EventEmitter, HostListener, ElementRef, Renderer2, ViewEncapsulation, HostBinding,
    OnInit, Inject, Optional, forwardRef
} from '@angular/core';
import { NG_VALUE_ACCESSOR, COMPOSITION_BUFFER_MODE } from '@angular/forms';

import { UpdateClassService } from '../core/service/update.class.service';
import { toBoolean } from '../util/lang';

import { FormControl } from '../input/form.control';

const INPUT_CONTROL_VALUE_ACCESSOR: any = {
    provide: NG_VALUE_ACCESSOR,
    useExisting: forwardRef(() => Switch),
    multi: true
};

/**
 * Switch 开关
 * 开关选择器。
 */
@Component({
    selector: 'ant-switch',
    template: `
        <span [class]="prefixCls + '-inner'" *ngIf="checked">
            {{checkedText}}<ng-content select="[ant-switch-checked]"></ng-content>
        </span>
        <span [class]="prefixCls + '-inner'" *ngIf="!checked">
            {{uncheckedText}}<ng-content select="[ant-switch-unchecked]"></ng-content>
        </span>
    `,
    styleUrls: ['./style/index.scss'],
    preserveWhitespaces: false,
    encapsulation: ViewEncapsulation.None,
    providers: [ UpdateClassService, INPUT_CONTROL_VALUE_ACCESSOR ],
    exportAs: 'switch'
})
export class Switch extends FormControl implements OnInit {

    /** 样式前缀 */
    @Input()
    get prefixCls(): string {
        return this._prefixCls;
    }
    set prefixCls(prefixCls: string) {
        if (this._prefixCls !== prefixCls) {
            this._prefixCls = prefixCls;
            this.updateClassMap();
        }
    }
    private _prefixCls = 'ant-switch';


    /**
     * 颜色，取值：default、primary、warn等。<br>
     * 自定义的颜色名称与色值，可以定义在 工程根目录/src/theme/variables.scss 文件中的 $colors 对象。
     */
    @Input()
    get color(): string {
        return this._color;
    }
    set color(color: string) {
        if (this._color !== color) {
            this._color = color;
            this.updateClassMap();
        }
    }
    private _color: string;


    /** 开启状态下的文本 */
    @Input() checkedText: string;

    /** 关闭状态下的文本 */
    @Input() uncheckedText: string;

    /** 开启状态下的值，等同于value */
    @Input()
    get checkedValue(): any {
        return this.value;
    }
    set checkedValue(checkedValue: any) {
        this.value = checkedValue;
    }

    /** 关闭状态下的值，默认为空字符串值 */
    @Input() uncheckedValue: any;


    /** 大小 */
    // HACK: https://github.com/ant-design/ant-design/issues/5368
    // size=default and size=large are the same
    @Input()
    get size(): 'large' | 'small' | 'default' {
        return this._size;
    }
    set size(size: 'large' | 'small' | 'default') {
        if (this._size !== size) {
            this._size = size;
            this.updateClassMap();
        }
    }
    private _size: 'small' | 'default' | 'large' = 'default';


    @Input()
    get checked(): boolean {
        return this._checked;
    }
    set checked(checked: boolean) {
        const value = toBoolean(checked);
        if (this._checked !== value) {
            this._checked = value;
            this.updateClassMap();
        }
    }
    private _checked = false;


    /** 是否禁用状态，默认为 false */
    @Input()
    get disabled(): boolean {
        return this._disabled;
    }
    set disabled(disabled: boolean) {
        const value = toBoolean(disabled);
        if (this._disabled !== value) {
            this._disabled = value;
            this.updateClassMap();
        }
    }
    private _disabled = false;


    /** 值变更事件 */
    @Output() change = new EventEmitter<any>();

    /** Check变更事件 */
    @Output() check = new EventEmitter<boolean>();

    constructor(
        public renderer: Renderer2,
        protected el: ElementRef,
        protected updateClassService: UpdateClassService,
        @Optional() @Inject(COMPOSITION_BUFFER_MODE) public compositionMode: boolean) {
        super(renderer, el, compositionMode);
        this.value = 'on';
    }

    ngOnInit(): void {
        this.updateClassMap();
    }

    protected updateClassMap(): void {
        const classes = {
            [`${this.prefixCls}`]: true,
            [`${this.prefixCls}-small`]: this.size === 'small',
            [`${this.prefixCls}-${this.color}`]: this.color,
            [`${this.prefixCls}-checked`]: this.checked,
            [`${this.prefixCls}-disabled`]: this.disabled
        };
        this.updateClassService.update(this.el.nativeElement, classes);
    }

    /** 属性：tabIndex */
    @HostBinding('attr.tabIndex') get tabIndex(): number {
        return this.disabled ? -1 : 0;
    }

    /**
     * 通过ngModel控制的checked状态，当ngModel的值与控件的value一样时为checked
     * @param value ngModel对应的值
     */
    writeValue(value: any): void {
        this.checked = this.value === value;
    }

    /** 设置选中状态 */
    setChecked(checked: boolean): void {
        if (this.checked !== checked) {
            this.checked = checked;

            const value = this.checked ? this.value : (this.uncheckedValue || '');
            this.onChange(value); // Angular need this
            this.check.emit(checked);
            this.change.emit(value);
        }
    }

    @HostListener('click', ['$event'])
    toggle(): void {
        if (this.disabled) {
            return;
        }
        this.setChecked(!this.checked);
    }

    @HostListener('keydown', ['$event'])
    handleKeyDown(event: KeyboardEvent): void {
        if (event.keyCode === 37) {
            this.setChecked(false);
        }
        if (event.keyCode === 39) {
            this.setChecked(true);
        }
    }

    // Handle auto focus when click switch in Chrome
    @HostListener('mouseup', ['$event'])
    handleMouseUp(event: MouseEvent): void {
        this.onTouched();
        this.elementRef.nativeElement.blur();
    }

    /**
     * @Override (From ControlValueAccessor interface)
     */
    setDisabledState(isDisabled: boolean): void {
        this.disabled = isDisabled;
    }
}

