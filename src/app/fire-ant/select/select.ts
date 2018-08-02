/**
 * @license
 * Copyright 厦门乾元盛世科技有限公司 All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file.
 */


import {
    Component, Input, Output, EventEmitter, ElementRef, Renderer2, ViewEncapsulation,
    AfterViewInit, AfterContentInit, OnInit, OnDestroy, ContentChildren, ViewChild, ContentChild,
    QueryList, Inject, Optional, forwardRef
} from '@angular/core';
import { NG_VALUE_ACCESSOR, COMPOSITION_BUFFER_MODE } from '@angular/forms';
import { DOCUMENT } from '@angular/platform-browser';

import { Subject } from 'rxjs/Subject';
import { Subscription } from 'rxjs/Subscription';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';

import { UpdateClassService } from '../core/service/update.class.service';
import { isPresent, toBoolean, toArray } from '../util/lang';
import { DomUtils } from '../util/dom.utils';
import { onNextFrame } from '../util/anim.frame';
import { transitionLeave } from '../core/animation/transition';
import { getPopupClassNameFromAlign, getAlignFromPlacement } from '../trigger/utils';

import { KeyCode } from '../util/key.code';
import * as align from 'dom-align';


import { FormControl } from '../input/form.control';
import { Option } from './option';
import { OptionGroup } from './option.group';
import { NotFound } from './not.found';

export type Child = Option | OptionGroup;

export interface Data {
    value: string;
    text?: string;
    disabled?: boolean;
    id?: string;
    children?: Data[];
}

const INPUT_CONTROL_VALUE_ACCESSOR: any = {
    provide: NG_VALUE_ACCESSOR,
    useExisting: forwardRef(() => Select),
    multi: true
};

const BUILT_IN_PLACEMENTS = {
    bottomLeft: {
        points: ['tl', 'bl'],
        offset: [0, 4],
        overflow: {
            adjustX: 0,
            adjustY: 1,
        },
    },
    topLeft: {
        points: ['bl', 'tl'],
        offset: [0, -4],
        overflow: {
            adjustX: 0,
            adjustY: 1,
        },
    },
};

/**
 * Select 选择器
 * 参考: https://github.com/react-component/select
 */
@Component({
    selector: 'ant-select',
    templateUrl: './select.html',
    styleUrls: ['./style/index.scss', './style/patch.scss'],
    preserveWhitespaces: false,
    encapsulation: ViewEncapsulation.None,
    providers: [UpdateClassService, INPUT_CONTROL_VALUE_ACCESSOR],
    exportAs: 'select'
})
export class Select extends FormControl implements OnInit, OnDestroy, AfterViewInit, AfterContentInit {

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
    private _prefixCls = 'ant-select';


    /** 控件大小。注：标准表单内的输入框大小限制为 `large`。可选 `large` `default` `small`。 */
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
    private _size: 'large' | 'small' | 'default' = 'default';


    /** Whether is disabled */
    @Input()
    set disabled(disabled: boolean) {
        const value = toBoolean(disabled);
        if (this._disabled !== value) {
            this._disabled = value;
            this.updateClassMap();
            this.updateChoiceWrapClass();
        }
    }
    get disabled(): boolean {
        return this._disabled;
    }
    private _disabled = false;


    /** 支持清除，默认为false */
    @Input()
    set allowClear(allowClear: boolean) {
        const value = toBoolean(allowClear);
        if (this._allowClear !== value) {
            this._allowClear = value;
            this.updateClassMap();
        }
    }
    get allowClear(): boolean {
        return this._allowClear;
    }
    private _allowClear = false;


    /**
     * 是否必填
     */
    @Input() required = false;

    /** 在选择框中显示搜索框，默认为false */
    @Input() showSearch = false;

    /** 显示下拉三角 */
    @Input() showArrow = true;

    /** 默认的图标 */
    @Input()
    get iconArrow(): string {
        return this._iconArrow;
    }
    set iconArrow(iconArrow: string) {
        if (this._iconArrow !== iconArrow) {
            this._iconArrow = iconArrow;
            this.updateArrowClass();
        }
    }
    private _iconArrow = 'arrow';


    /** 设置 Select 的模式。可选 `multiple` `tags` `combobox`。 */
    @Input()
    get mode(): 'multiple' | 'tags' | 'combobox' {
        return this._mode;
    }
    set mode(mode: 'multiple' | 'tags' | 'combobox') {
        if (this._mode !== mode) {
            this._mode = mode;
            this.updateClassMap();
            this.updateMenuContainerClass();
        }
    }
    private _mode: 'multiple' | 'tags' | 'combobox';


    /** 是否默认高亮第一个选项 */
    @Input() defaultActiveFirstOption = true;

    /** 当下拉列表为空时显示的内容 */
    @Input() notFoundContent = '无可选项'; // 'Not Found';

    /** 下拉菜单和选择器同宽 */
    @Input() dropdownMatchSelectWidth = true;

    /** 下拉菜单的 class 属性 */
    @Input() dropdownClass: string;

    @Input() dropdownPlacement = 'bottomLeft';
    @Input() builtinPlacements = BUILT_IN_PLACEMENTS;

    /** 自动查询延迟时间（ms），默认300毫秒 */
    @Input() filterDelay = 300;

    /**
     * 是否根据输入项进行筛选。当其为一个函数时，会接收 `inputValue`, `option` 两个参数，当 `option` 符合筛选条件时，应返回 `true`，反之则返回 `false`。
     */
    @Input() filterOption: boolean | ((inputValue: string, option: Option) => boolean) = true;

    /** 搜索时过滤对应的 option 属性，可选项如：value, text */
    @Input() optionFilterProp = 'value';

    /** 展开/关闭菜单时的动画效果 */
    @Input() choiceTransitionName = 'zoom';

    /** 选中后显示的标签最大长度 */
    @Input() maxTagTextLength: number;

    /** 搜索框的样式 */
    @Input() inputClass = '';

    /** 选择框默认文字 */
    @Input() placeholder: string;


    /**
     * option select 事件，参数为：(option: Option)
     */
    @Output() select = new EventEmitter<any>();

    /**
     * option deselect 事件，参数为：(option: Option)
     */
    @Output() deselect = new EventEmitter<any>();

    /**
     * search 事件
     */
    @Output() search = new EventEmitter<any>();

    /**
     * 菜单可视事件变更
     */
    @Output() openChange = new EventEmitter<boolean>();

    /** 值变更事件 */
    @Output() change = new EventEmitter<any>();

    /** 搜索框 */
    @ViewChild('input') input: ElementRef;

    /** 已选内容显示 */
    @ViewChild('selection') selectionEl: ElementRef;

    /** 菜单容器 */
    @ViewChild('menuContainer') menuContainer: ElementRef;



    public inputValue = '';

    // 键盘输入的数据源
    private searchTerms = new Subject<string>();

    // 自定义无选择项时的提醒内容
    @ContentChild(NotFound) notFound: NotFound;

    // 原始选项
    @ContentChildren(Option, { descendants: true }) public options: QueryList<Option>;

    /** 当前已选中的选项 */
    public selectedOptions: Option[] = [];

    /** 当前已激活的选项（鼠标移入或按上下方向键） */
    private activedOption: Option;

    /** 在tags模式下，输入框可以输入任意内容，且该内容没有匹配的选项时，该内容将可以作为下拉菜单的第一个选项 */
    public inputOption: any;
    @ViewChild('inputTagOption') inputTagOption: Option;


    // 是否重建了视图和搜索
    private initValue: any;

    // 子选项的计数器
    private optionUUID = 0;

    // 触发器与下拉菜单
    private _popupVisible = false;

    // 点击Document的事件（一般用于触发点击后隐藏冒泡组件）
    private clickOutsideHandler: Function;
    private touchOutsideHandler: Function;

    private blurTimer: any;

    private _optionsChangesSubscription: Subscription;
    private _searchTermsChangesSubscription: Subscription;


    /** 选项菜单已展开 */
    public get open(): boolean {
        return this._open;
    }
    public set open(open: boolean) {
        if (this._open !== open) {
            this._open = open;
            this.updateClassMap();
            this.updateMenuClass();
            this.updateMenuContainerClass();
        }
    }
    private _open = false;

    /** 是否光标focus */
    public get focused(): boolean {
        return this._focused;
    }
    public set focused(focused: boolean) {
        if (this._focused !== focused) {
            this._focused = focused;
            this.updateClassMap();
        }
    }
    private _focused = false;


    private get alignClassName(): string {
        return this._alignClassName;
    }
    private set alignClassName(alignClassName: string) {
        if (this._alignClassName !== alignClassName) {
            this._alignClassName = alignClassName;
            this.updateMenuContainerClass();
        }
    }
    private _alignClassName: string;


    // 内部样式
    public menuClasses: any;
    public menuContainerClasses: any;
    public choiceWrapClasses: any;
    public arrowClasses: any;


    constructor(
        public renderer: Renderer2,
        public el: ElementRef,
        private updateClassService: UpdateClassService,
        @Optional() @Inject(COMPOSITION_BUFFER_MODE) public compositionMode: boolean,
        @Inject(DOCUMENT) private doc: Document) {

        super(renderer, el, compositionMode);
    }


    /** The underlying host native element */
    getHostElement(): HTMLElement {
        return this.el.nativeElement as HTMLElement;
    }

    /**
     * 选择框主要容器部分
     */
    getSelectionElement(): HTMLElement {
        return this.selectionEl.nativeElement as HTMLElement;
    }

    /**
     * 选择项
     */
    getMenuContainerElement(): HTMLElement {
        return this.menuContainer.nativeElement as HTMLElement;
    }

    ngOnDestroy(): void {
        this.clearBlurTime();
        this.clearOutsideHandler();
        this.clearSeletcedOptions();
        this.activeOption(null);

        if (this._optionsChangesSubscription) {
            this._optionsChangesSubscription.unsubscribe();
        }
        if (this._searchTermsChangesSubscription) {
            this._searchTermsChangesSubscription.unsubscribe();
        }
    }

    ngOnInit(): void {
        this._searchTermsChangesSubscription = this.searchTerms.pipe(
            debounceTime(this.filterDelay),  // wait for 300ms pause in events
            distinctUntilChanged()   // ignore if next search term is same as previous
        ).subscribe((term: string) => {
            this.filterOptions();
            this.search.emit(term);
        });

        // 更新样式
        this.updateClassMap();
        this.updateArrowClass();
        this.updateMenuClass();
        this.updateChoiceWrapClass();
        this.updateMenuContainerClass();
    }

    ngAfterContentInit(): void {
        this._optionsChangesSubscription = this.options.changes.subscribe((value: any) => {
            // 数据回显的初始化
            onNextFrame(() => {
                this.buildSelectedOptions();
            });
        });
    }

    ngAfterViewInit(): void {
        // 数据回显的初始化
        /*
        onNextFrame(() => { // TODO 使用onNextFrame时，this.options有时候并没有完成查询，无法获取匹配值
            this.buildSelectedOptions();
        });
        */
    }

    protected updateClassMap(): void {
        if (this.updateClassService) {
            const classes = {
                [`${this.prefixCls}`]: true,
                [`${this.prefixCls}-lg`]: this.size === 'large',
                [`${this.prefixCls}-sm`]: this.size === 'small',
                [`${this.prefixCls}-open`]: this.open,
                [`${this.prefixCls}-focused`]: this.open || this.focused,
                [`${this.prefixCls}-combobox`]: this.isCombobox(),
                [`${this.prefixCls}-disabled`]: this.disabled,
                [`${this.prefixCls}-enabled`]: !this.disabled,
                [`${this.prefixCls}-allow-clear`]: this.allowClear
            };
            this.updateClassService.update(this.el.nativeElement, classes);
        }
    }

    private getDropdownPrefixCls(): string {
        return `${this.prefixCls}-dropdown`;
    }

    private updateMenuClass(): void {
        this.menuClasses = {
            [`${this.getDropdownPrefixCls()}-menu`]: 1,
            [`${this.getDropdownPrefixCls()}-menu-root`]: 1,
            [`${this.getDropdownPrefixCls()}-menu-vertical`]: 1,
            [`${this.getDropdownPrefixCls()}-menu-hidden`]: !this.open
        };
    }

    private updateChoiceWrapClass(): void {
        this.choiceWrapClasses = {
            [`${this.prefixCls}-selection__choice`]: 1,
            [`${this.prefixCls}-selection__choice__disabled`]: this.disabled
        };
    }

    private updateArrowClass(): void {
        this.arrowClasses = {
            [`${this.prefixCls}-arrow`]: this.iconArrow === 'arrow',
            [`${this.prefixCls}-trigger-icon`]: this.iconArrow !== 'arrow',
            [`anticon`]: this.iconArrow !== 'arrow',
            [`anticon-${this.iconArrow}`]: this.iconArrow !== 'arrow'
        };
    }

    private updateMenuContainerClass(): void {
        const dropdownPrefixCls = this.getDropdownPrefixCls();
        const multiple = this.isMultipleOrTags();
        this.menuContainerClasses = {
            [`${dropdownPrefixCls}`]: 1,
            [`${dropdownPrefixCls}--multiple`]: multiple,
            [`${dropdownPrefixCls}--single`]: !multiple,
            [`${dropdownPrefixCls}-hidden`]: !this.open,
            [`${this.alignClassName}`]: this.alignClassName
        };
    }


    /** 生成Option的ID，并返回 */
    registerOption(option: Option): string {
        return `${this.id}-opt-${this.optionUUID++}`;
    }

    // combobox ignore
    onKeyDown(event: KeyboardEvent) {
        if (this.disabled) {
            return;
        }
        if (this.isMultipleOrTagsOrCombobox()) { // only single will go
            return;
        }

        const keyCode = event.keyCode;
        if (this.open && !this.input) {
            this.onInputKeyDown(event);
        } else if (keyCode === KeyCode.ENTER || keyCode === KeyCode.DOWN) {
            this.setOpen(true);
            event.preventDefault();
        }
    }

    onInputKeyDown(event: KeyboardEvent): void {
        if (this.disabled) {
            return;
        }

        const keyCode = event.keyCode;
        const inputValue = this.inputValue;

        // 按下BACKSPACE键，若已没有搜索字符，则删除最后一个标签
        if (this.isMultipleOrTags() && !inputValue && keyCode === KeyCode.BACKSPACE) {
            event.preventDefault();
            this.deselectOption(this.selectedOptions.pop()); // 删除最后一个标签
            this.onValueChange();
            return;
        }

        // 按ESC键关闭下拉菜单
        if (keyCode === KeyCode.ESC) {
            if (this.open) {
                this.setOpen(false);
                event.preventDefault();
                event.stopPropagation();
            }
            return;
        }

        // 按DOWN键打开下拉菜单
        if (keyCode === KeyCode.DOWN) {
            if (!this.open) {
                this.openIfHasChildren();
                event.preventDefault();
                event.stopPropagation();
                return;
            }
        }

        // 如果菜单已经打开，则按下向上、向下按键，则移动至相邻的选项
        if (this.open) {
            if (keyCode === KeyCode.DOWN || keyCode === KeyCode.UP) {
                event.preventDefault();
                event.stopPropagation();

                const forward = keyCode === KeyCode.DOWN;
                const nextOption = this.getNextOption(forward);
                if (nextOption) {
                    this.activeOption(nextOption);
                }
                if (keyCode === KeyCode.UP && !nextOption) {
                    this.setOpen(false);
                }
            }
            if (keyCode === KeyCode.ENTER) {
                event.preventDefault();
                event.stopPropagation();
                if (this.activedOption) {
                    this.onOptionClick({ event: event, option: this.activedOption });
                }
            }
        }
    }

    onInputKeyUp(event: KeyboardEvent): void {
        if (this.disabled) {
            return;
        }
        const keyCode = event.keyCode;
        if (KeyCode.isCharacterKey(keyCode) || KeyCode.isTextModifyingKeyEvent(event)) {
            // 发射输入源的数据
            this.searchTerms.next(this.inputValue);
        }

        // 设置输入框的宽度
        if (this.isMultipleOrTags()) {
            const inputElement: HTMLElement = this.input.nativeElement;
            const mirriElement: HTMLElement = inputElement.nextElementSibling as HTMLElement;
            const width = this.inputValue ? mirriElement.clientWidth + 'px' : '';
            this.renderer.setStyle(inputElement, 'width', width);
        }
    }

    /** 搜索框禁止change事件传播 */
    onInputChange(event: Event): void {
        event.stopPropagation();
    }

    /** 搜索框的blur事件 */
    onInputBlur(): void {
        this.onOuterBlur();
    }

    onOuterFocus(e: Event): void {
        if (this.disabled) {
            return;
        }

        this.onTouched(); // set your control to 'touched'
        this.clearBlurTime();

        if (!this.isMultipleOrTagsOrCombobox() && this.isInputElement(e.target as HTMLElement)) {
            return;
        }
        this.focused = true;
    }

    isInputElement(target: HTMLElement): boolean {
        return this.input && this.input.nativeElement === target;
    }

    onOuterBlur(): void {
        this.blurTimer = setTimeout(() => {
            this.focused = false;
            const inputValue = this.inputValue;

            if (this.isSingleMode() && this.showSearch &&
                inputValue && this.defaultActiveFirstOption) {
                const firstOption = this.findFirstOption();
                if (firstOption) {
                    this.selectOption(firstOption);
                    this.onValueChange();
                }
            } else if (this.isMultipleOrTags() && inputValue) {
                this.setInputValue('');
            }
        }, 10);
    }

    maybeFocus(): void {
        if (this.disabled) {
            return;
        }

        const input = this.input;
        const activeElement = this.doc.activeElement;
        if (input && (this.open || this.isMultipleOrTagsOrCombobox())) {
            if (input && input.nativeElement !== activeElement) {
                input.nativeElement.focus();
                this.focused = true;
            }
        } else {
            const selectionEl = this.getSelectionElement();
            if (selectionEl && selectionEl !== activeElement) {
                selectionEl.focus();
                this.focused = true;
            }
        }
    }

    /** 根据ngModel传入的初始值选中对应的选项 */
    buildSelectedOptions(): void {
        // 根据ngModel传入的值选中对应的选项
        const options = isPresent(this.initValue) ? this.processValue(this.initValue) : [];
        // 先取消选择旧的
        this.clearSeletcedOptions();
        if (options.length) {
            // 然后选择新的列表
            this.selectOption(...options);
            // 设置显示值
            if (this.isCombobox()) {
                this.setInputValue(options[0].text);
            }
        }
        // 清空初始化内容
        this.initValue = null; // 已找到匹配的值，则清空初始值
    }


    /** 清空选择项 */
    clearSeletcedOptions(): void {
        if (this.selectedOptions && this.selectedOptions.length) {
            this.deselectOption(...this.selectedOptions);
        }
    }

    /** 选中选项 */
    selectOption(...options: Option[]): void {
        if (!this.selectedOptions) {
            this.selectedOptions = [];
        }
        options.filter(option => option !== null).forEach(option => {
            option.selected = true;
            this.selectedOptions.push(option);
        });
    }

    /** 取消选中选项 */
    deselectOption(...options: Option[]): void {
        if (!this.selectedOptions) {
            this.selectedOptions = [];
        }
        options.filter(option => option !== null).forEach(option => {
            option.selected = false;
            const index = this.selectedOptions.indexOf(option);
            if (index >= 0) {
                this.selectedOptions.splice(index, 1);
            }
        });
    }

    /** 激活选项 */
    activeOption(option: Option): void {
        // 取消原来的
        if (this.activedOption) {
            this.activedOption.actived = false;
        }

        // 激活当前的
        if (option && !option.disabled/* && !option.isFiltered*/) {
            option.actived = true;
            this.activedOption = option;
        }
    }


    processValue(value: any): any {
        const result = [];
        const values = toArray(value);
        if (values.length) {
            for (let i = 0; i < values.length; i++) {
                const option = this.getOptionByValue(values[i]);
                if (option) {
                    result.push(option);
                }
            }
        }
        return result;
    }

    /**
     * Write a new value to the element.
     *
     * @Override (From ControlValueAccessor interface)
     */
    writeValue(value: any): void {
        this.initValue = value;
        this.buildSelectedOptions();
    }

    getFormValue(): any {
        if (this.isSingleMode() || this.isCombobox()) {
            const option = this.selectedOptions[0];
            return option && option.value;
        }

        return this.selectedOptions.map(option => option.value);
    }

    onValueChange(): void {
        const value = this.getFormValue();
        this.onChange(value); // Angular need this
        this.change.emit(value);
    }



    onArrowClick(e: MouseEvent): void {
        e.stopPropagation();
        if (!this.disabled) {
            this.setOpen(!this.open, !this.open);
        }
    }

    onPlaceholderClick(): void {
        if (this.input) {
            this.input.nativeElement.focus();
        }
    }

    onTriggerClick(event: MouseEvent): void {
        if (this.disabled) {
            return;
        }
        event.preventDefault();
        this.setOpen(!this.open, true);
        this.maybeFocus();
    }

    onPopupFocus(): void {
        // fix ie scrollbar, focus element again
        this.maybeFocus();
    }


    onClearSelection(event: Event): void {
        if (this.disabled) {
            return;
        }
        event.stopPropagation();

        this.setOpen(false, true);
        if (this.inputValue) {
            this.setInputValue('');
        }

        this.clearSeletcedOptions();
        this.onValueChange();
    }

    /**
     * 点击选项
     *
     * @param event 点击事件
     */
    onOptionClick(event: { event: Event, option: Option }): void {
        const option: Option = event.option;
        const multiple = this.isMultipleOrTags();

        if (option.selected) { // 已选择的，则移除
            if (multiple) {
                this.deselectOption(option);
                this.deselect.emit(option);
            }
        } else { // 未选择的，则添加选中
            if (multiple) {
                this.selectOption(option);
            } else {
                this.clearSeletcedOptions();
                this.selectOption(option);
                this.setOpen(false, true);
            }
            this.select.emit(option); // tag新增如何判断?
        }
        this.onValueChange();

        // 设置搜索框的文本值
        let inputValue;
        if (this.isCombobox()) {
            inputValue = this.selectedOptions[0].text;
        } else {
            inputValue = '';
        }
        this.setInputValue(inputValue, false);
    }

    /**
     * 点击已选择的选项的右边，取消该选择项
     *
     * @param option 选项
     * @param event  点击事件
     */
    removeSelectedOption(option: Option, event: MouseEvent): void {
        if (event) {
            event.preventDefault();
            event.stopPropagation();
        }
        if (this.disabled) {
            return;
        }

        // 执行动画
        const el: HTMLElement = event.target as HTMLElement;
        const optionEl: HTMLElement = el.closest('LI') as HTMLElement;
        transitionLeave(optionEl, this.choiceTransitionName, () => {
            // 移除已选列表中的选项
            this.deselectOption(option);

            // 发射deselect事件，若是多选框或Tags时
            const multiple = this.isMultipleOrTags();
            if (multiple) {
                this.deselect.emit(option);
            }
            this.onValueChange();
        });
    }

    setInputValue(inputValue: any, fireSearch = true): void {
        this.inputValue = inputValue;
        if (fireSearch) {
            this.searchTerms.next(inputValue);
        }
        this.setupInputTagOption();
    }

    hasChildrenAfterFiltered(): boolean {
        return this.options.some(option => !option.isFiltered);
    }

    /**
     * 搜索过滤选项
     */
    filterOptions(): void {
        if (!this.filterOption) {
            return;
        }

        // 执行过滤
        this.options.forEach(option => {
            // 当搜索内容为空时，或者当filterOption为false时，直接返回所有的选项
            if (!this.inputValue || !this.filterOption) {
                option.isFiltered = false;
                return;
            }

            if (this.filterOption && typeof this.filterOption === 'function') {
                const isVisible = this.filterOption(this.inputValue, option);
                option.isFiltered = isVisible === false;
                return;
            }

            const filterValue = option[this.optionFilterProp];
            option.isFiltered = String(filterValue).indexOf(this.inputValue) === -1;
        });

        // 默认激活第一个选项
        this.activeFirstOption();
    }

    /** 查找activedOption在已过滤选项中的前/后一个非disabled的选项 */
    getNextOption(forward: boolean): Option {
        const optionArray: Option[] = this.options.toArray();

        const len = this.options.length;
        const index = this.activedOption ? optionArray.indexOf(this.activedOption) : -1;
        const start = forward ? Math.max(index, 0) + 1 : Math.max(Math.min(len, index) - 1, 0);
        for (let i = start; i >= 0 && i < len;) {
            const option = optionArray[i];
            if (!option.disabled && !option.isFiltered) {
                return option;
            }
            i = forward ? i + 1 : i - 1;
        }
        return null;
    }

    /** 查找已过滤选项中的第一个非disabled的选项 */
    findFirstOption(): Option {
        return this.options.find(option => !option.disabled && !option.isFiltered);
    }

    getOptionByValue(value: any): Option {
        return this.options.find(option => !option.isFiltered && option.value === value);
    }

    getOptionIdentify(index: number, option: Option): any {
        return option.id;
    }

    setupInputTagOption(): void {
        if (this.isTagsMode()) {
            let matchOption = null;
            if (this.inputValue.length > 0) {
                matchOption = this.getOptionByValue(this.inputValue);
                if (!matchOption) {
                    this.inputOption = { value: this.inputValue, title: this.inputValue };
                }
            } else {
                this.inputOption = null;
            }
        }
    }

    activeFirstOption(): void {
        if (this.open && this.defaultActiveFirstOption) {
            if (this.inputTagOption) { // Tag模式直接激活第一个自定义的选项
                this.activeOption(this.inputTagOption);
                return;
            }

            if (!this.activedOption || this.activedOption.isFiltered) {
                const option = this.findFirstOption();
                if (option) {
                    this.activeOption(option);
                }
            }
        }
    }


    isCombobox(): boolean {
        return this.mode === 'combobox';
    }

    /** 不是Multiple、Tags和Combobox */
    isSingleMode(): boolean {
        return !this.isMultipleOrTagsOrCombobox();
    }

    /** 在tags模式下，输入框可以输入任意内容，且该内容没有匹配的选项时，该内容将可以作为下拉菜单的第一个选项 */
    isTagsMode(): boolean {
        return this.mode === 'tags';
    }

    isMultipleOrTags(): boolean {
        return this.mode === 'multiple' || this.mode === 'tags';
    }

    isMultipleOrTagsOrCombobox(): boolean {
        return this.isMultipleOrTags() || this.isCombobox();
    }


    preventDefaultEvent(event: Event): void {
        event.preventDefault();
    }

    getTagText(option: Option): string {
        let content = option.text;
        const maxTagTextLength = this.maxTagTextLength;
        if (maxTagTextLength &&
            typeof content === 'string' &&
            content.length > maxTagTextLength) {
            content = content.slice(0, maxTagTextLength) + '...';
        }
        return content;
    }


    /** 过滤时是否可以显示“没有匹配项”提示 */
    isNotFoundVisible(): boolean {
        if ((this.notFoundContent || this.notFound) && this.filterOption) {
            return !this.hasChildrenAfterFiltered();
        }

        return false;
    }

    /**
     * Placeholder是否可视
     */
    isPlaceholderVisible(): boolean {
        let hidden = false;
        // 当搜索框内有内容时，隐藏Placeholder标签
        if (this.inputValue) {
            hidden = true;
        }
        // 当已经选择了标签时，隐藏Placeholder标签
        if (this.selectedOptions.length) {
            hidden = true;
        }

        return !hidden;
    }

    /**
     * 清除内容按钮标记是否可视
     */
    isClearVisible(): boolean {
        return this.allowClear &&
            (this.inputValue.length > 0 || this.selectedOptions.length > 0);
    }

    /**
     * 下拉框已选内容是否可视（不可见时显示Placeholder）
     */
    isSelectedValueVisible(): boolean {
        let showSelectedValue = false;
        if (!this.showSearch) {
            showSelectedValue = true;
        } else {
            showSelectedValue = (this.open && !this.inputValue) || !this.open;
        }
        return showSelectedValue;
    }

    getAlign(): {} {
        return getAlignFromPlacement(this.builtinPlacements, this.dropdownPlacement, {});
    }

    forceAlign(): void {
        if (!this.disabled) {
            const baseTarget = this.getSelectionElement(); // 基准组件，位置不会变
            const alignTarget = this.getMenuContainerElement();

            // https://www.npmjs.com/package/dom-align
            const alignConfig = this.getAlign();
            this.onAlign(align(alignTarget, baseTarget, alignConfig));
        }
    }

    onAlign(_align: any): void {
        this.alignClassName = getPopupClassNameFromAlign(
            this.builtinPlacements, this.getDropdownPrefixCls(), _align);
    }

    isPopupVisible(): boolean {
        return this._popupVisible;
    }

    setPopupVisible(popupVisible: boolean): void {
        if (this.disabled) {
            return;
        }

        if (this._popupVisible !== popupVisible) {
            this._popupVisible = popupVisible;

            // We must listen to `mousedown` or `touchstart`, edge case:
            // https://github.com/ant-design/ant-design/issues/5804
            // https://github.com/react-component/calendar/issues/250
            // https://github.com/react-component/trigger/issues/50
            if (popupVisible) {
                if (!this.clickOutsideHandler) {
                    this.clickOutsideHandler = this.renderer.listen('document', 'mousedown', this.onDocumentClick.bind(this));
                }
                // always hide on mobile
                if (!this.touchOutsideHandler) {
                    this.touchOutsideHandler = this.renderer.listen('document', 'touchstart', this.onDocumentClick.bind(this));
                }
            }
            if (!popupVisible) {
                this.clearOutsideHandler();
            }

            this.setOpen(popupVisible);
            this.onDropdownVisibleChange(popupVisible);
            this.afterPopupVisibleChange(popupVisible);
        }
    }

    setOpen(open: boolean, needFocus: boolean = false): void {
        if (this.open === open) {
            // this.maybeFocus(open, needFocus);
            return;
        }

        // clear search input value when open is false in singleMode.
        if (!open && this.isSingleMode() && this.showSearch) {
            this.setInputValue('');
        }
        // clear search input value if tag mode
        if (!open && this.isTagsMode()) {
            this.setInputValue('', true);
            this.inputOption = null;
        }

        this.open = open;
        this.setPopupVisible(open);
        this.openChange.emit(this.open);

        // 默认选中第一个
        this.activeFirstOption();
    }

    openIfHasChildren(): void {
        if (this.isSingleMode() || this.hasChildrenAfterFiltered()) {
            this.setOpen(true);
        }
    }

    onDropdownVisibleChange(popupVisible: boolean): void {
        if (popupVisible && !this.focused) {
            this.clearBlurTime();
            this.focused = true;
        }
    }

    afterPopupVisibleChange(popupVisible: boolean): void {
        if (popupVisible) {
            onNextFrame(() => {
                this.forceAlign();

                // calc dropdownMatchSelectWidth
                if (this.dropdownMatchSelectWidth) {
                    const hostEl: HTMLElement = this.getHostElement();
                    const popuEl: HTMLElement = this.getMenuContainerElement();
                    this.renderer.setStyle(popuEl, 'minWidth', `${hostEl.offsetWidth}px`);
                }
            });
        }
    }

    onDocumentClick(event: MouseEvent): void {
        const target = event.target as Node;
        const root = this.getHostElement();
        const popupEl = this.getMenuContainerElement();
        if (!DomUtils.contains(root, target) && !DomUtils.contains(popupEl, target)) {
            this.open = false;
        }
    }

    clearOutsideHandler(): void {
        if (this.clickOutsideHandler) {
            this.clickOutsideHandler(); // Removes "listen" listener
            this.clickOutsideHandler = null;
        }

        if (this.touchOutsideHandler) {
            this.touchOutsideHandler(); // Removes "listen" listener
            this.touchOutsideHandler = null;
        }
    }

    clearBlurTime(): void {
        if (this.blurTimer) {
            clearTimeout(this.blurTimer);
            this.blurTimer = null;
        }
    }

    /**
     * @Override (From ControlValueAccessor interface)
     */
    setDisabledState(isDisabled: boolean): void {
        this.disabled = isDisabled;
    }
}




