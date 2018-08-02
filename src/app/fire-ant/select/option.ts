/**
 * @license
 * Copyright 厦门乾元盛世科技有限公司 All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file.
 */


import {
    Component, Input, Output, EventEmitter, ElementRef, HostBinding, HostListener,
    OnInit, ViewEncapsulation, Inject, Optional, Host, forwardRef
} from '@angular/core';
import { UpdateClassService } from '../core/service/update.class.service';
import { toBoolean } from '../util/lang';
import { Select } from './select';


@Component({
    selector: 'ant-option',
    template: '<ng-content></ng-content>',
    encapsulation: ViewEncapsulation.None,
    providers: [ UpdateClassService ],
    exportAs: 'option'
})
export class Option implements OnInit {
    public isSelectOption = true;

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
    private _prefixCls = 'ant-select-dropdown-menu';


    @Input()
    get selected(): boolean {
        return this._selected;
    }
    set selected(selected: boolean) {
        const value = toBoolean(selected);
        if (this._selected !== value) {
            this._selected = value;
            this.updateClassMap();
        }
    }
    private _selected = false;


    @Input()
    get actived(): boolean {
        return this._actived;
    }
    set actived(actived: boolean) {
        const value = toBoolean(actived);
        if (this._actived !== value) {
            this._actived = value;
            this.updateClassMap();
        }
    }
    private _actived = false;


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


    /** 若被过滤掉，则隐藏该选项 */
    @Input()
    get isFiltered(): boolean {
        return this._isFiltered;
    }
    set isFiltered(isFiltered: boolean) {
        const value = toBoolean(isFiltered);
        if (this._isFiltered !== value) {
            this._isFiltered = value;
            this.updateClassMap();
        }
    }
    private _isFiltered = false;


    /** 值。默认根据此属性值进行筛选 */
    @Input() value: any;

    /** 选中该 Option 后，Select组件 的 title。不设置则默认取选项的内部text。 */
    @Input() title = '';

    /** id，非必须，默认会自动生成唯一的id */
    @Input() id: string;

    /**
     * option click 事件，参数为：({ option, event })
     */
    @Output() optionClick = new EventEmitter<{ event: Event, option: Option }>();


    @HostBinding('attr.role') role = 'menuitem';
    @HostBinding('attr.unselectable') unselectable = 'unselectable';

    constructor(
        protected el: ElementRef,
        protected updateClassService: UpdateClassService,
        @Inject(forwardRef(() => Select)) @Optional() @Host() private select: Select) {
        this.id = select.registerOption(this);
    }


    ngOnInit(): void {
        this.updateClassMap();
    }

    protected updateClassMap(): void {
        const classes = {
            [`${this.prefixCls}-item`]: true,
            [`${this.prefixCls}-item-selected`]: this.selected,
            [`${this.prefixCls}-item-active`]: !this.disabled && this.actived,
            [`${this.prefixCls}-item-disabled`]: this.disabled,
            [`${this.prefixCls}-item-hidden`]: this.isFiltered
        };
        this.updateClassService.update(this.el.nativeElement, classes);
    }

    @HostBinding('attr.aria-selected') get ariaselected(): any {
        return this.selected ? 'true' : null;
    }

    @HostBinding('attr.aria-disabled') get ariadisabled(): any {
        return this.disabled ? 'true' : null;
    }

    @HostBinding('attr.id') get myId(): any {
        return this.id;
    }

    @HostBinding('attr.hidden') get willHide(): any {
        return this.isFiltered ? 'hidden' : null;
    }

    @HostListener('mouseenter', ['$event'])
    onMouseEnter(event: MouseEvent): void {
        if (this.disabled) {
            return;
        }
        this.select.activeOption(this);
    }

    @HostListener('mouseleave', ['$event'])
    onMouseLeave(event: MouseEvent): void {
        if (this.disabled) {
            return;
        }
        this.select.activeOption(null);
    }

    @HostListener('click', ['$event'])
    onClick(event: MouseEvent): void {
        if (this.disabled) {
            return;
        }
        this.optionClick.emit({ event: event, option: this });

        // 直接触发select的响应
        if (this.select) {
            this.select.onOptionClick({ event: event, option: this });
        }
    }

    /**
     * 获取Option的文本
     */
    getText(): string {
        if (this.title) {
            return this.title;
        }
        if (this.el) {
            return this.el.nativeElement.innerText.trim();
        }
        return '***';
    }

    /** text属性，直接取getText()的值 */
    get text(): string {
        return this.getText();
    }
}
