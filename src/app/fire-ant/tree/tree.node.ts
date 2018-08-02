/**
 * @license
 * Copyright 厦门乾元盛世科技有限公司 All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file.
 */

import {
    Component, Input, HostBinding, HostListener, ElementRef, Renderer2, ViewEncapsulation,
    OnInit, Inject, Optional, Host, forwardRef, TemplateRef
} from '@angular/core';
import { replaceClass } from '../util/classnames';

import { Tree } from './tree';

export interface TreeNodeAttr {
    /** 标题 */
    title?: string | TemplateRef<any>;

    /** 标题模板数据 */
    titleData?: any;

    /** 结点样式 */
    nodeCls?: string;

    /** 结点唯一键 */
    key?: string;

    /** 结点唯一键 */
    id?: string;

    /** 设置为叶子节点(设置了`loadData`时有效)。默认为`false` */
    isLeaf?: boolean;

    /** 是否已展开结点 */
    expanded?: boolean;

    /** 设置节点是否可被选中。默认为`true` */
    selectable?: boolean;

    /** 是否已选择 */
    selected?: boolean;

    /** 是否已选中 */
    checked?: boolean;

    /** 是否已半选中 */
    halfChecked?: boolean;

    /** 勾选框的自定义模板 */
    checkboxTemplate?: TemplateRef<any>;

    /** 是否禁掉响应。默认为`false` */
    disabled?: boolean;

    /** 是否禁掉 checkbox 。默认为`false` */
    disableCheckbox?: boolean;

    /** 下级结点 */
    children?: TreeNodeAttr[];

    /** 上级结点 */
    parent?: TreeNodeAttr;

    /** 上级结点 */
    parentNode?: TreeNode;

    /** 其它属性 */
    [key: string]: any;
}


@Component({
    selector: 'ant-tree-node',
    templateUrl: './tree.node.html',
    encapsulation: ViewEncapsulation.None
})
export class TreeNode implements OnInit {

    /** 同步引用数据 */
    @Input() data: TreeNodeAttr = {};

    /** 样式前缀 */
    @Input()
    get prefixCls(): string {
        return this._prefixCls || this.tree.prefixCls;
    }
    set prefixCls(prefixCls: string) {
        if (this._prefixCls !== prefixCls) {
            this._prefixCls = prefixCls;
        }
    }
    private _prefixCls: string;


    /** 标题 */
    get title(): string | TemplateRef<any> {
        return this.data.title || '---';
    }
    set title(title: string | TemplateRef<any>) {
        this.data.title = title;
    }

    /** 标题模板数据 */
    get titleData(): any {
        return this.data.titleData;
    }
    set titleData(titleData: any) {
        this.data.titleData = titleData;
    }

    /** 结点唯一键 */
    get key(): string {
        return this.data.key || this.data.id;
    }

    /** 结点样式 */
    get nodeCls(): string {
        return this.data.nodeCls;
    }
    set nodeCls(nodeCls: string) {
        this.data.nodeCls = nodeCls;
    }

    /** 设置为叶子节点(设置了`loadData`时有效)。默认为`false` */
    get isLeaf(): boolean {
        return this.data.isLeaf || false;
    }
    set isLeaf(isLeaf: boolean) {
        this.data.isLeaf = isLeaf || false;
    }

    /** 是否已展开结点 */
    get expanded(): boolean {
        return this.data.expanded || false;
    }
    set expanded(expanded: boolean) {
        this.data.expanded = expanded || false;
    }

    /** 设置节点是否可被选中。默认为`true` */
    get selectable(): boolean {
        if (typeof this.data.selectable === 'boolean') {
            return this.data.selectable;
        }
        return true;
    }
    set selectable(selectable: boolean | null) {
        this.data.selectable = selectable;
    }

    /** 是否已选择 */
    get selected(): boolean {
        return this.data.selected || false;
    }
    set selected(selected: boolean) {
        this.data.selected = selected || false;
    }

    /** 是否已选中 */
    get checked(): boolean {
        return this.data.checked || false;
    }
    set checked(checked: boolean) {
        this.data.checked = checked || false;
    }

    /** 是否已半选中 */
    get halfChecked(): boolean {
        return this.data.halfChecked || false;
    }
    set halfChecked(halfChecked: boolean) {
        this.data.halfChecked = halfChecked || false;
    }

    /** 勾选框的自定义模板 */
    get checkboxTemplate(): TemplateRef<any> {
        return this.data.checkboxTemplate || null;
    }

    /** 是否禁掉响应。默认为`false` */
    get disabled(): boolean {
        return this.data.disabled || false;
    }
    set disabled(disabled: boolean) {
        this.data.disabled = disabled || false;
    }

    /** 是否禁掉 checkbox 。默认为`false` */
    get disableCheckbox(): boolean {
        return this.data.disableCheckbox || false;
    }
    set disableCheckbox(disableCheckbox: boolean) {
        this.data.disableCheckbox = disableCheckbox || false;
    }

    /** 上级结点 */
    get parentNode(): TreeNode {
        return this.data.parentNode;
    }
    set parentNode(parentNode: TreeNode) {
        this.data.parentNode = parentNode;
        this.data.parent = parentNode.data;
    }

    /** 上级结点 */
    get parent(): TreeNodeAttr {
        return this.data.parent;
    }
    set parent(parent: TreeNodeAttr) {
        this.data.parent = parent;
    }

    /** 下级结点数据 */
    get children(): TreeNodeAttr[] {
        return this.data.children;
    }
    set children(children: TreeNodeAttr[]) {
        this.data.children = children;
    }


    public dataLoading = false;
    public dragNodeHighlight = false;

    private lastHostClassMap: any;

    constructor(
        public renderer: Renderer2,
        public elementRef: ElementRef,
        @Inject(forwardRef(() => Tree)) @Optional() @Host() private tree: Tree) {
    }


    /** 是否支持选中。即：节点前是否添加 Checkbox 复选框 */
    get checkable(): boolean {
        return this.tree.checkable;
    }

    get draggable(): boolean {
        return this.tree.draggable;
    }

    get titleIsTemplate(): boolean {
        return typeof this.title === 'object';
    }

    get dragOver(): boolean {
        return this.tree.isDragOver(this);
    }

    get dragOverGapTop(): boolean {
        return this.tree.isDragOverGapTop(this);
    }

    get dragOverGapBottom(): boolean {
        return this.tree.isDragOverGapBottom(this);
    }

    get isDropping(): boolean {
        return this.tree.isDropNode(this);
    }

    addChild(child: TreeNodeAttr): TreeNode {
        const children = this.children || (this.children = []);
        child.parentNode = this;
        children.push(child);
        this.isLeaf = false;
        return this;
    }

    addChildBefore(child: TreeNodeAttr, ...newChild: TreeNodeAttr[]): TreeNode {
        const children = this.children || (this.children = []);
        newChild.forEach(c => {
            c.parentNode = this;
        });

        const index = children.indexOf(child);
        if (index >= 0) {
            children.splice(index, 0, ...newChild);
        }

        this.isLeaf = children.length === 0;
        return this;
    }

    addChildAfter(child: TreeNodeAttr, ...newChild: TreeNodeAttr[]): TreeNode {
        const children = this.children || (this.children = []);
        newChild.forEach(c => {
            c.parentNode = this;
        });

        const index = children.indexOf(child);
        if (index >= 0) {
            children.splice(index + 1, 0, ...newChild);
        }

        this.isLeaf = children.length === 0;
        return this;
    }

    removeChild(child: TreeNodeAttr): TreeNode {
        const children = this.children || (this.children = []);
        const index = children.indexOf(child);
        if (index >= 0) {
            children.splice(index, 1);
        }
        this.isLeaf = children.length === 0;
        return this;
    }

    ngOnInit(): void {
        // 提取并设置属性
        const data = this.data || (this.data = {});

        // 设置 tree
        if (!this.tree && this.parentNode) {
            this.tree = this.parentNode.tree;
        }

        // 设置直属子结点的 parent=this
        const children = this.children;
        if (children && children.length) {
            children.forEach(child => {
                child.parentNode = this;
            });
        }
        if (typeof this.data.isLeaf === 'undefined') {
            this.isLeaf = !children || !children.length;
        }

        // 设置 key
        if (!this.key) {
            this.data.key = this.tree.register(this);
        }

        // 初始化 checked 的状态，因为 checked 可能继承父结点的状态
        if (!this.disableCheckbox) {
            data.checked = this._getInitChecked();
        }
        if (this.parentNode && this.parentNode.children) {
            const index = this.parentNode.children.indexOf(data);
            if (index === this.parentNode.children.length - 1) {
                setTimeout(() => {
                    this.parentNode.checkIf();
                }, 0);
            }
        }
    }

    _getInitChecked(): boolean {
        if (typeof this.data.checked === 'boolean') {
            return this.data.checked;
        }
        if (!this.tree.checkStrictly) {
            return (this.parentNode && this.parentNode.checked) || false;
        }
        return false;
    }

    /** The underlying host native element */
    getHostElement(): HTMLElement {
        return this.elementRef.nativeElement as HTMLElement;
    }

    getTitle(): string {
        return typeof this.title === 'string' ? this.title : null;
    }

    isShowIcon(): boolean {
        return this.tree.showIcon || this.dataLoading;
    }

    getCheckboxTemplate(): TemplateRef<any> {
        return this.checkboxTemplate || this.tree.checkboxTemplate;
    }

    getSwitcherClass(): any {
        const canRenderSwitcher = !this.isLeaf;
        const expandedState = this.expanded ? 'open' : 'close';
        return {
            [`${this.prefixCls}-switcher`]: true,
            [`${this.prefixCls}-switcher_${expandedState}`]: canRenderSwitcher,
            [`${this.prefixCls}-switcher-noop`]: !canRenderSwitcher,
            [`${this.prefixCls}-switcher-disabled`]: this.disabled
        };
    }

    getCheckboxClass(): any {
        return {
            [`${this.prefixCls}-checkbox`]: true,
            [`${this.prefixCls}-checkbox-checked`]: this.checked,
            [`${this.prefixCls}-checkbox-indeterminate`]: this.halfChecked,
            [`${this.prefixCls}-checkbox-disabled`]: this.disableCheckbox || this.disabled
        };
    }

    getCheckboxInnerClass(): any {
        return {
            [`${this.prefixCls}-checkbox-inner`]: true
        };
    }

    getIconClass(): any {
        let iconState = this.expanded ? 'open' : 'close';
        if (this.isLeaf) {
            iconState = 'docu';
        }

        return {
            [`${this.prefixCls}-iconEle`]: true,
            [`${this.prefixCls}-icon_loading`]: this.dataLoading,
            [`${this.prefixCls}-icon__${iconState}`]: true,
        };
    }

    getContentClass(): any {
        return {
            [`${this.prefixCls}-title`]: true
        };
    }

    getContentWrapClass(): any {
        const iconState = this.expanded ? 'open' : 'close';
        return {
            [`${this.prefixCls}-node-content-wrapper`]: true,
            [`${this.prefixCls}-node-content-wrapper-normal`]: this.isLeaf,
            [`${this.prefixCls}-node-content-wrapper-${iconState}`]: !this.isLeaf,
            [`${this.prefixCls}-node-selected`]: !this.disabled && (this.selected || this.dragNodeHighlight),
            [`draggable`]: this.draggable
        };
    }

    getChildTreeClass(): any {
        return {
            [`${this.prefixCls}-child-tree`]: true,
            [`${this.prefixCls}-child-tree-open`]: this.expanded,
        };
    }

    @HostBinding('class.host-class')
    get _nodeClass(): string {
        const classname = {
            [`${this.prefixCls}-treenode`]: 1,
            [`${this.prefixCls}-treenode-disabled`]: this.disabled,
            [`drag-over`]: this.dragOver,
            [`drag-over-gap-top`]: this.dragOverGapTop,
            [`drag-over-gap-bottom`]: this.dragOverGapBottom,
            [`drop-node`]: this.isDropping,
            [`filter-node`]: this.tree.filterTreeNode && this.tree.filterTreeNode(this),
        };

        // 替换样式
        replaceClass(this.getHostElement(), classname, this.lastHostClassMap);
        this.lastHostClassMap = classname;

        return null;
    }

    // @HostListener('dragstart', ['$event'])
    onDragStart(event: DragEvent): void {
        if (!this.draggable) {
            return;
        }

        event.stopPropagation();
        this.dragNodeHighlight = true;
        this.tree.onDragStart(event, this);
        try {
            // ie throw error
            // firefox-need-it
            event.dataTransfer.setData('text/plain', '');
        } catch (error) {
            // empty
        }
    }

    @HostListener('dragenter', ['$event'])
    onDragEnter(event: Event): void {
        if (!this.draggable) {
            return;
        }

        event.preventDefault();
        event.stopPropagation();
        this.tree.onDragEnter(event, this);
    }

    @HostListener('dragover', ['$event'])
    onDragOver(event: Event): void {
        if (!this.draggable) {
            return;
        }

        event.preventDefault();
        event.stopPropagation();
        this.tree.onDragOver(event, this);
    }

    @HostListener('dragleave', ['$event'])
    onDragLeave(event: Event): void {
        if (!this.draggable) {
            return;
        }

        event.stopPropagation();
        this.tree.onDragLeave(event, this);
    }

    @HostListener('drop', ['$event'])
    onDrop(event: Event): void {
        if (!this.draggable) {
            return;
        }

        event.preventDefault();
        event.stopPropagation();
        this.dragNodeHighlight = false;
        this.tree.onDrop(event, this);
    }

    @HostListener('dragend', ['$event'])
    onDragEnd(event: Event): void {
        if (!this.draggable) {
            return;
        }

        event.stopPropagation();
        this.dragNodeHighlight = false;
        this.tree.onDragEnd(event, this);
    }

    // @HostListener('mouseenter', ['$event'])
    onMouseEnter(event: MouseEvent): void {
        this.tree.onMouseEnter(event, this);
    }

    // @HostListener('mouseleave', ['$event'])
    onMouseLeave(event: MouseEvent): void {
        this.tree.onMouseLeave(event, this);
    }

    // @HostListener('contextmenu', ['$event'])
    onContextMenu(event: MouseEvent): void {
        this.tree.onContextMenu(event, this);
    }

    // keyboard event support
    onKeyDown(event: KeyboardEvent): void {
        event.preventDefault();
    }

    onClick(event: MouseEvent): void {
        if (this.disabled) {
            return;
        }
        if (this.selectable) {
            event.preventDefault();
            this.onSelect();
        }
        /*
        if (this.checkable) {
            event.preventDefault();
            this.onCheck(event);
        }
        */
    }

    onCheck(event: MouseEvent): void {
        if (this.disableCheckbox || this.disabled) {
            return;
        }

        this.checked = !!!this.checked;
        this.halfChecked = false;
        this.tree.onCheck(this);
    }

    onSelect(): void {
        this.selected = !!!this.selected;
        this.tree.onSelect(this);
    }

    isSelectable(): boolean {
        if (typeof this.selectable === 'boolean') {
            return this.selectable;
        }
        return this.tree.selectable;
    }

    /** 展开或折叠 */
    toggle(): void {
        if (this.disabled || this.isLeaf) {
            return;
        }
        if (this.expanded) {
            this.collapse();
        } else {
            this.expand();
        }
    }

    /** 展开当前结点 */
    expand(): void {
        if (this.disabled || this.isLeaf) {
            return;
        }

        const loadData = this.tree.loadData;
        if (this.hasNoChild() && loadData) {
            this.dataLoading = true;
            loadData(this).then(() => {
                this.dataLoading = false;
                this.expanded = true;
                this.tree.onExpand(this);
            }, () => {
                this.dataLoading = false;
            });
        } else {
            this.expanded = true;
        }
    }

    /** 折叠当前结点 */
    collapse(): void {
        if (this.disabled || this.isLeaf) {
            return;
        }

        this.expanded = false;
        this.tree.onCollapse(this);
    }

    public getCheckableChildrenCount(): number {
        if (this.children && this.children.length) {
            let count = 0;
            this.children.forEach(child => {
                count += child.disableCheckbox ? 0 : 1;
            });
            return count;
        }
        return 0;
    }

    public getCheckedChildrenCount(): number {
        if (this.children && this.children.length) {
            let count = 0;
            this.children.forEach(child => {
                if (!child.disableCheckbox) {
                    if (child.checked) {
                        count++;
                    } else if (child.halfChecked) {
                        count += 0.5;
                    }
                }
            });
            return count;
        }
        return 0;
    }

    public checkIf(): void {
        const childrenCount = this.getCheckableChildrenCount();
        const checkedChildrenCount = this.getCheckedChildrenCount();
        // console.log(this.title, 'childrenCount=', childrenCount, 'checkedChildrenCount=', checkedChildrenCount);
        if (!childrenCount) {
            return;
        }

        if (checkedChildrenCount === childrenCount) {
            this.checked = true;
            this.halfChecked = false;
        } else if (checkedChildrenCount > 0) {
            this.halfChecked = true;
            this.checked = false;
        } else {
            this.checked = false;
            this.halfChecked = false;
        }
    }


    /** 当前结点是否有子结点 */
    hasNoChild(): boolean {
        return !this.children || !this.children.length;
    }

    /**
     * 检查`node`是否当前结点的子结点
     *
     * @param node 树结点
     */
    public hasChild(node: TreeNode): boolean {
        if (this.children && this.children.length) {
            return this.children.findIndex(child => child.key === node.key) >= 0;
        }
        return false;
    }

    /**
     * 检查`node`是否当前结点的子孙结点
     *
     * @param node 树结点
     */
    public hasDescendant(node: TreeNode): boolean {
        if (this.hasChild(node)) {
            return true;
        }

        if (this.children && this.children.length) {
            return this.children.some(child => {
                if (child instanceof TreeNode) {
                    return child.hasDescendant(node);
                } else { // not expanded simple Object node
                    return false;
                }
            });
        }
        return false;
    }

    /**
     * 遍历父级结点，并对每个结点执行`action`方法
     *
     * @param action 执行动作
     */
    bubble(action: (node: TreeNode) => void): void {
        const parent = this.parentNode;
        if (parent) {
            action(parent);
            parent.bubble(action);
        }
    }

    /**
     * 遍历所有的直属子结点，并对子结点执行`action`方法
     *
     * @param action 执行动作
     */
    every(action: (node: TreeNodeAttr, index?: number, array?: TreeNodeAttr[]) => boolean): boolean {
        if (this.children && this.children.length) {
            return this.children.every((child, index, array) => action(child, index, array));
        }
        return false;
    }

    /**
     * 遍历所有的直属子结点，并对子结点执行`action`方法
     *
     * @param action 执行动作
     */
    some(action: (node: TreeNodeAttr, index?: number, array?: TreeNodeAttr[]) => boolean): boolean {
        if (this.children && this.children.length) {
            return this.children.some((child, index, array) => action(child, index, array));
        }
        return false;
    }

}
