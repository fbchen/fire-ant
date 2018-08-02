/**
 * @license
 * Copyright 厦门乾元盛世科技有限公司 All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file.
 */

import {
    Component, Input, ElementRef, ViewEncapsulation, OnInit, AfterViewInit,
    Optional, Host, ContentChild, TemplateRef
} from '@angular/core';
import { NgControl } from '@angular/forms';
import { onNextFrame } from '../util/anim.frame';

import { UpdateClassService } from '../core/service/update.class.service';
import { isPresent, toBoolean } from '../util/lang';

import { FormDirective } from './form.directive';
import { FormLabel } from './form.label';
import { Row } from '../grid/row';
import { ColSize } from '../grid/col';


/**
 * 表单项
 */
@Component({
    selector: 'form-item',
    templateUrl: './form.item.html',
    styleUrls: ['../grid/style/index.scss', './style/index.scss'],
    preserveWhitespaces: false,
    encapsulation: ViewEncapsulation.None,
    providers: [ UpdateClassService ]
})
export class FormItem extends Row implements OnInit, AfterViewInit {

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
    protected _prefixCls = 'ant-form';


    /** 配合 label 属性使用，表示是否显示 label 后面的冒号 */
    @Input()
    get colon(): boolean {
        return this._colon;
    }
    set colon(colon: boolean) {
        const value = toBoolean(colon);
        if (this._colon !== value) {
            this._colon = value;
            this.updateClassMap();
        }
    }
    private _colon = true;


    /** 提示信息，如不设置，则会根据校验规则自动生成 */
    @Input()
    get help(): string {
        return this._help;
    }
    set help(help: string) {
        if (this._help !== help) {
            this._help = help;
            this.updateClassMap();
        }
    }
    private _help: string;


    /** 配合 validateStatus 属性使用，展示校验状态图标，建议只配合 Input 组件使用 */
    @Input()
    get hasFeedback(): boolean {
        return this._hasFeedback;
    }
    set hasFeedback(hasFeedback: boolean) {
        const value = toBoolean(hasFeedback);
        if (this._hasFeedback !== value) {
            this._hasFeedback = value;
            this.updateControlClasses();
        }
    }
    private _hasFeedback = false;


    /** label 标签的文本 */
    @Input() label: string;

    /** 标签布局，同 `<Col>` 组件，设置 `span` `offset` 值，如 `{span: 3, offset: 12}` 或 `{sm: {span: 3, offset: 12}}` */
    @Input() labelCol: ColSize | { [key: string]: number | ColSize };

    /** 用户CSS样式 */
    @Input()
    get labelClass(): string {
        return this._labelClass;
    }
    set labelClass(labelClass: string) {
        if (this._labelClass !== labelClass) {
            this._labelClass = labelClass;
            this.updateLabelWrapperClasses();
        }
    }
    private _labelClass: string;


    /** 需要为输入控件设置布局样式时，使用该属性，用法同 labelCol */
    @Input() wrapperCol: ColSize | { [key: string]: number | ColSize };

    /** 用户CSS样式 */
    @Input()
    get wrapperClass(): string {
        return this._wrapperClass;
    }
    set wrapperClass(wrapperClass: string) {
        if (this._wrapperClass !== wrapperClass) {
            this._wrapperClass = wrapperClass;
            this.updateControlWrapperClasses();
        }
    }
    private _wrapperClass: string;


    /** 额外的提示信息，和 help 类似，当需要错误信息和提示文案同时出现时，可以使用这个。 */
    @Input() extra: string;

    /** 是否必填项 */
    @Input()
    get required(): boolean {
        return this._required;
    }
    set required(required: boolean) {
        const value = toBoolean(required);
        if (this._required !== value) {
            this._required = value;
            this.updateLabelClasses();
        }
    }
    private _required = false;


    @Input()
    get validateStatus(): '' | 'success' | 'warning' | 'error' | 'validating' {
        return this._validateStatus;
    }
    set validateStatus(validateStatus: '' | 'success' | 'warning' | 'error' | 'validating') {
        if (this._validateStatus !== validateStatus) {
            this._validateStatus = validateStatus;
            this.updateControlClasses();
        }
    }
    private _validateStatus: '' | 'success' | 'warning' | 'error' | 'validating';


    /** 内部输入框 */
    @ContentChild(NgControl) control: NgControl;

    /** 用户自定义label */
    @ContentChild(FormLabel) customLabel: FormLabel;

    /** 用户自定义help或error */
    @ContentChild('help') anyHelp: TemplateRef<any>;

    // 内部样式
    public controlWrapperClasses: any;
    public controlClasses: any;
    public labelWrapperClasses: any;
    public labelClasses: any;

    constructor(
        protected el: ElementRef,
        protected updateClassService: UpdateClassService,
        @Optional() @Host() private form: FormDirective) {
        super(el, updateClassService);
    }

    ngOnInit(): void {
        this.updateClassMap();
        this.updateControlWrapperClasses();
        this.updateControlClasses();
        this.updateLabelWrapperClasses();
    }

    ngAfterViewInit(): void {
        this.updateLabelClasses();
    }

    protected updateClassMap(): void {
        const rowPrefixCls = 'ant-row';
        const classes = {
            [`${rowPrefixCls}`]: !this.type,
            [`${rowPrefixCls}-${this.type}`]: this.type,
            [`${rowPrefixCls}-${this.type}-${this.justify}`]: this.type && this.justify,
            [`${rowPrefixCls}-${this.type}-${this.align}`]: this.type && this.align,
            [`${this.prefixCls}-item`]: true,
            [`${this.prefixCls}-item-with-help`]: this.help,
            [`${this.prefixCls}-item-no-colon`]: !this.colon
        };
        this.updateClassService.update(this.el.nativeElement, classes);
    }

    updateControlWrapperClasses(): void {
        this.controlWrapperClasses = {
            [`${this.prefixCls}-item-control-wrapper`]: 1,
            [`${this.wrapperClass}`]: this.wrapperClass
        };
    }

    updateControlClasses(): void {
        const validateStatus = this.getValidateStatus();
        this.controlClasses = {
            [`${this.prefixCls}-item-control`]: 1,
            'has-feedback': this.hasFeedback,
            'has-success': validateStatus === 'success',
            'has-warning': validateStatus === 'warning',
            'has-error': validateStatus === 'error',
            'is-validating': validateStatus === 'validating',
        };
    }

    updateLabelWrapperClasses(): void {
        this.labelWrapperClasses = {
            [`${this.prefixCls}-item-label`]: 1,
            [`${this.labelClass}`]: this.labelClass
        };
    }

    updateLabelClasses(): void {
        onNextFrame(() => {
            this.labelClasses = {
                [`${this.prefixCls}-item-required`]: this.isRequired()
            };
        });
    }

    getLabelText(): string {
        // Keep label is original where there should have no colon
        const haveColon = this.colon && (this.form && !this.form.isVertical);
        // Remove duplicated user input colon
        if (haveColon && this.label && this.label.trim() !== '') {
            return this.label.replace(/[：|:]\s*$/, '');
        }
        return this.label;
    }

    getValidateStatus(): string {
        if (isPresent(this.validateStatus) && this.validateStatus !== '') {
            return this.validateStatus;
        }

        // TODO 样式可能不能生效
        const control: NgControl = this.control;
        if (control) {
            const submitted = this.form && this.form.isSubmitted();
            if (control.invalid && (control.touched || submitted)) {
                return 'error';
            }
            if (control.pending) {
                return 'validating';
            }
            if (control.valid && isPresent(control.value) && control.value !== '') {
                return 'success';
            }
        }
        return '';
    }

    public isRequired(): boolean {
        if (this.required) {
            return true;
        }
        return this.control && this.control.valueAccessor['required'];
    }


    private getOwnProperty(obj: any, key: string): any {
        return (obj && obj.hasOwnProperty(key)) ? obj[key] : null;
    }

    getLabelSpan(): number {
        return this.getOwnProperty(this.labelCol, 'span') as number;
    }

    getLabelOffset(): number {
        return this.getOwnProperty(this.labelCol, 'offset') as number || 0;
    }

    getLabelSize(size: string): any {
        return this.getOwnProperty(this.labelCol, size);
    }

    getWrapperSpan(): number {
        return this.getOwnProperty(this.wrapperCol, 'span') as number;
    }

    getWrapperOffset(): number {
        return this.getOwnProperty(this.wrapperCol, 'offset') as number || 0;
    }

    getWrapperSize(size: string): any {
        return this.getOwnProperty(this.wrapperCol, size);
    }
}
