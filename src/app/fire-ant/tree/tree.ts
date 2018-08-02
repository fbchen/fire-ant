/**
 * @license
 * Copyright 厦门乾元盛世科技有限公司 All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file.
 */

import {
    Component, Input, Output, EventEmitter, ElementRef, Renderer2, ViewEncapsulation,
    OnInit, HostBinding, HostListener, TemplateRef
} from '@angular/core';
import { OverlayRef } from '@angular/cdk/overlay';
import { TreeMenuService } from './tree.menu.service';

import { UpdateClassService } from '../core/service/update.class.service';
import { toBoolean } from '../util/lang';
import { getOffset } from '../util/dom.utils';
import { TreeNode, TreeNodeAttr } from './tree.node';

export interface TreeNodeEvent {
    event: 'checked' | 'selected';
    node: TreeNode;
    checked?: boolean;
    checkedNodes?: Array<TreeNode>;
    selected?: boolean;
    selectedNodes?: Array<TreeNode>;
}

export interface TreeNodeMouseEvent {
    node: TreeNode;
    event: Event;
}

export interface TreeNodeDragDropEvent {
    node: TreeNode;
    event: Event;
    dropPosition: number;
    dropToGap: boolean;
}

function calcDropPosition(e: Event, treeNode: HTMLElement): number {
    const offsetTop = getOffset(treeNode).top;
    const offsetHeight = treeNode.offsetHeight;
    const pageY = e['pageY'];
    const gapHeight = 2; // TODO: remove hard code
    if (pageY > offsetTop + offsetHeight - gapHeight) {
        return 1;
    }
    if (pageY < offsetTop + gapHeight) {
        return -1;
    }
    return 0;
}


@Component({
    selector: 'ant-tree',
    templateUrl: './tree.html',
    styleUrls: ['./style/index.scss', './style/patch.scss'],
    preserveWhitespaces: false,
    encapsulation: ViewEncapsulation.None,
    providers: [ UpdateClassService ],
    exportAs: 'tree'
})
export class Tree implements OnInit {

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
    private _prefixCls = 'ant-tree';


    /** 是否展示连接线。默认为`false` */
    @Input()
    get showLine(): boolean {
        return this._showLine;
    }
    set showLine(showLine: boolean) {
        const value = toBoolean(showLine);
        if (this._showLine !== value) {
            this._showLine = value;
            this.updateClassMap();
        }
    }
    private _showLine = false;


    /** 是否展示 TreeNode 标题前的图标，没有默认样式，如设置为 true，需要自行定义图标相关样式。默认为`false` */
    @Input()
    get showIcon(): boolean {
        return this._showIcon;
    }
    set showIcon(showIcon: boolean) {
        const value = toBoolean(showIcon);
        if (this._showIcon !== value) {
            this._showIcon = value;
        }
    }
    private _showIcon = false;


    /** 是否支持选择。默认为`true` */
    @Input() selectable = true;

    /** 是否支持多选。默认为`false` */
    @Input() multiple = false;

    /** 是否自动展开父节点 */
    // if not set autoExpandParent to false, if children expanded, parent can not collapse.
    // or, you can set all expanded children to false.
    @Input() autoExpandParent = true;

    /** 是否支持选中。即：节点前是否添加 Checkbox 复选框 */
    @Input() checkable = false;

    /** checkable状态下节点选择完全受控（父子节点选中状态不再关联），默认为`false` */
    @Input() checkStrictly = false;

    /** 勾选框的自定义模板 */
    @Input() checkboxTemplate: TemplateRef<any>;

    /** 默认展开所有树节点 */
    @Input() defaultExpandAll = false;

    /** 设置节点可拖拽（IE>8），默认为`false` */
    @Input() draggable = false;

    /** 是否可以设置光标热点 */
    @Input() focusable = false;

    /** filter some TreeNodes as you need. it should return true */
    @Input() filterTreeNode: (node: TreeNode) => boolean;

    /** 异步加载数据 */
    @Input() loadData: (node: TreeNode) => PromiseLike<any>;

    /** 根结点 */
    @Input() roots: TreeNodeAttr[];

    /** 显示右键菜单时的横向位置偏移 */
    @Input() menuXOffset = 10;
    /** 显示右键菜单时的纵向位置偏移 */
    @Input() menuYOffset = 4;


    /** 展开节点时触发 */
    @Output() expand = new EventEmitter<TreeNode>();

    /** 收起节点时触发 */
    @Output() collapse = new EventEmitter<TreeNode>();

    /** 点击复选框触发 */
    @Output() checked = new EventEmitter<TreeNodeEvent>();

    /** 点击树节点触发 */
    @Output() selected = new EventEmitter<TreeNodeEvent>();

    /** 响应右键点击 */
    @Output() nodeContextMenu = new EventEmitter<TreeNodeMouseEvent>();

    /** 开始拖拽时调用 */
    @Output() ddDragStart = new EventEmitter<TreeNodeMouseEvent>();
    /** dragenter 触发时调用 */
    @Output() ddDragEnter = new EventEmitter<TreeNodeMouseEvent>();
    /** dragover 触发时调用 */
    @Output() ddDragOver = new EventEmitter<TreeNodeMouseEvent>();
    /** dragleave 触发时调用 */
    @Output() ddDragLeave = new EventEmitter<TreeNodeMouseEvent>();
    /** drop 触发时调用 */
    @Output() ddDrop = new EventEmitter<TreeNodeDragDropEvent>();
    /** dragend 触发时调用 */
    @Output() ddDragEnd = new EventEmitter<TreeNodeMouseEvent>();

    /** mouseenter 触发时调用 */
    @Output() nodeMouseEnter = new EventEmitter<TreeNodeMouseEvent>();
    /** mouseleave 触发时调用 */
    @Output() nodeMouseLeave = new EventEmitter<TreeNodeMouseEvent>();

    /** 树的根结点（可以有多个） */
    // @ViewChildren(forwardRef(() => TreeNode)) children: QueryList<TreeNode>;

    @HostBinding('attr.role') _role = 'tree-node';
    @HostBinding('attr.unselectable') _unselectable = 'on';

    @HostBinding('attr.tabIndex') get _tabIndex(): string {
        return this.focusable ? '0' : null;
    }

    /** 拖拽相关的结点 */
    private dragNode: TreeNode;
    private dropNode: TreeNode;
    private dragOverNode: TreeNode;

    /** 设置拖拽结点的相对位置 */
    private dropPosition: number = null;
    // 悬停于未展开的结点400毫秒后自动展开
    private delayedDragEnterLogic: any;

    private uuid = 0;

    constructor(
        public renderer: Renderer2,
        public el: ElementRef,
        public updateClassService: UpdateClassService,
        public treeMenuService: TreeMenuService) {

    }

    ngOnInit(): void {
        if ((!this.roots || !this.roots.length) && this.loadData) {
            this.loadData(null).then(r => {
                this.roots = r.children;
            }, r => {
                this.roots = r.children;
            });
        }

        if (this.defaultExpandAll && this.roots) {
            this.roots.forEach(root => {
                root.expanded = true;
            });
        }

        // 更新样式
        this.updateClassMap();
    }


    protected updateClassMap(): void {
        const classes = {
            [`${this.prefixCls}`]: true,
            [`${this.prefixCls}-show-line`]: this.showLine
        };
        this.updateClassService.update(this.el.nativeElement, classes);
    }


    register(node: TreeNode): string {
        return `${this.uuid++}`;
    }

    /** The underlying host native element */
    getHostElement(): HTMLElement {
        return this.el.nativeElement as HTMLElement;
    }

    onExpand(node: TreeNode): void {
        this.expand.emit(node);

        // 自动展开父结点
        if (this.autoExpandParent) {
            if (node.parentNode) {
                node.parentNode.expand();
            }
        }
    }

    onCollapse(node: TreeNode): void {
        this.collapse.emit(node);
    }

    onDragStart(e: Event, node: TreeNode): void {
        this.dragNode = node;
        this.onCollapse(node);
        this.ddDragStart.emit({ node, event: e });
    }

    onDragEnter(e: Event, node: TreeNode): void {
        const dropPosition = calcDropPosition(e, node.getHostElement());

        if (this.dragNode.key === node.key && dropPosition === 0) {
            this.dragOverNode = null;
            this.dropPosition = null;
            return;
        }

        this.dragOverNode = node;
        this.dropPosition = dropPosition;
        this.ddDragEnter.emit({ node, event: e });

        // 悬停短时间后，展开结点
        if (!this.delayedDragEnterLogic) {
            this.delayedDragEnterLogic = {};
        }
        Object.keys(this.delayedDragEnterLogic).forEach((key) => {
            clearTimeout(this.delayedDragEnterLogic[key]);
        });
        this.delayedDragEnterLogic[node.key] = setTimeout(() => {
            node.expand();
        }, 400);
    }

    onDragOver(e: Event, node: TreeNode): void {
        this.ddDragOver.emit({ event: e, node });
    }

    onDragLeave(e: Event, node: TreeNode): void {
        this.ddDragLeave.emit({ event: e, node });
    }

    onDrop(e: Event, node: TreeNode): void {
        this.dragOverNode = null;
        this.dropNode = node;

        if (this.dragNode === node || this.dragNode.hasDescendant(node)) {
            console.warn('Can not drop to dragNode(include it\'s children node)');
            return;
        }
        const dropPosition = this.dropPosition;
        const dropToGap = dropPosition !== 0;
        this.ddDrop.emit({ node, event: e, dropPosition, dropToGap });
    }

    onDragEnd(e: Event, node: TreeNode): void {
        this.dragOverNode = null;
        this.ddDragEnd.emit({ event: e, node });
    }

    public isDragOver(node: TreeNode): boolean {
        return this.dragOverNode === node && this.dropPosition === 0;
    }

    public isDragOverGapTop(node: TreeNode): boolean {
        return this.dragOverNode === node && this.dropPosition === -1;
    }

    public isDragOverGapBottom(node: TreeNode): boolean {
        return this.dragOverNode === node && this.dropPosition === 1;
    }

    public isDropNode(node: TreeNode): boolean {
        return this.dropNode === node;
    }

    onMouseEnter(e: MouseEvent, node: TreeNode): void {
        this.nodeMouseEnter.emit({ event: e, node });
    }

    onMouseLeave(e: MouseEvent, node: TreeNode): void {
        this.nodeMouseLeave.emit({ event: e, node });
    }

    onContextMenu(e: MouseEvent, node: TreeNode): void {
        this.nodeContextMenu.emit({ event: e, node });
    }

    /**
     * 打开右键菜单
     *
     * @param template 菜单模板
     * @param e 点击事件
     */
    public openContextMenu(template: TemplateRef<any>, e: MouseEvent): OverlayRef {
        return this.treeMenuService.open(template, {
            x: `${e.x + this.menuXOffset}px`,
            y: `${e.y + this.menuYOffset}px`
        });
    }

    // all keyboard events callbacks run from here at first
    @HostListener('keydown', ['$event'])
    onKeyDown(e: Event): void {
        e.preventDefault();
    }


    /**
     * 选中（或取消选中）结点后，执行级联选择
     * @param node 当前被选中或取消选中的结点
     */
    onCheck(node: TreeNode): void {
        const checked = node.checked || node.halfChecked;
        this.checked.emit({
            event: 'checked', node, checked
        });

        if (!this.checkStrictly) {
            this.traverseNode(node, (child: TreeNode) => {
                const data = child.data || child;
                // Don't change disabled item checked state
                if (!data.disableCheckbox && !data.disabled) {
                    data.halfChecked = false;
                    data.checked = checked;
                }
            });
            node.bubble((parent: TreeNode) => {
                parent.checkIf();
            });
        }
    }

    /**
     * 选择或取消选择结点
     * @param node 当前被选择或取消选择的结点
     */
    onSelect(node: TreeNode): void {
        const selected = node.selected;
        this.selected.emit({
            event: 'selected', node, selected
        });

        // 单选模式下，需取消其它已选择的结点
        if (selected && !this.multiple) {
            const nodeData = node.data;
            const deselect = (n: TreeNodeAttr) => {
                if (n !== nodeData && n.selected) {
                    n.selected = false;
                }
            };
            this.roots.forEach((root: TreeNodeAttr) => {
                deselect(root);
                this.traverseNode(root, deselect);
            });
        }
    }

    /**
     * 遍历子结点，并对每个结点执行`action`方法
     *
     * @param target 开始遍历的目标结点
     * @param action 执行动作
     */
    traverseNode(target: TreeNodeAttr, action: (node: TreeNodeAttr, index?: number, array?: TreeNodeAttr[]) => void ): void {
        if (target.children && target.children.length) {
            target.children.forEach((child, index, array) => {
                action(child, index, array);
                this.traverseNode(child, action);
            });
        }
    }

    /**
     * 遍历子结点，并对每个结点执行`action`方法
     *
     * @param action 执行动作
     */
    traverse( action: (node: TreeNodeAttr, index?: number, array?: TreeNodeAttr[]) => void ): void {
        this.roots.forEach((root, index, array) => {
            action(root, index, array);
            this.traverseNode(root, action);
        });
    }

}
