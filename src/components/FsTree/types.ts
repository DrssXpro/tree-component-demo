export type NodeKey = string | number;

export interface IFsTreeProps {
  // 数据源
  data: ITreeItem[];
  // key、label、children 字段映射
  keyField?: string;
  labelField?: string;
  childrenField?: string;
  // 默认展开节点
  defaultExpandedKeys?: NodeKey[];
  // 默认勾选节点
  defaultCheckedKeys?: NodeKey[];
  // 是否展示勾选框
  showCheckbox?: boolean;
  // 是否可以选择节点
  selectable?: boolean;
  // 是否支持多选
  multipleSelect?: boolean;
  // 开启虚拟滚动
  virtualScroll?: boolean;
  // 虚拟滚动定高容器
  containerHeight?: number;
  // 虚拟滚动定高 item 高度
  itemSize?: number;
  // 异步加载数据方法
  load?: LoadFuncitonType;
}

export interface IFsTreeEmitter {
  // 点击选择节点事件
  (e: "onSelectNodes", nodes: ITreeNode[]): void;
  // 勾选节点事件
  (e: "onCheckChange", node: ITreeItem, checked: boolean): void;
}

export type LoadFuncitonType = (node: ITreeNode, loadedCallback: (data: ITreeItem[]) => void) => void;

// 数据源 item
export interface ITreeItem {
  key?: NodeKey;
  label?: NodeKey;
  children?: ITreeItem[];
  // 是否为叶子节点
  isLeaf?: boolean;
  // 是否勾选
  isChecked?: boolean;
  // 是否半选
  isHalfChecked?: boolean;
  [key: string]: any;
}

export interface ITreeNode extends Required<ITreeItem> {
  level: number;
  parentKey: NodeKey | null;
  children: ITreeNode[];
  rawNode: ITreeItem;
}

export interface IFsTreeNodeProps {
  node: ITreeNode;
  // 是否展示勾选
  showCheckbox: boolean;
  // 是否展开
  isExpanded: boolean;
  // 是否选中
  isSelect: boolean;
  // 是否处于加载状态
  isLoading: boolean;
}

export interface IFsTreeNodeEmitter {
  // 展开自定义事件
  (e: "toggleExpanded", node: ITreeNode): void;
  // 选中自定义事件
  (e: "selectNode", node: ITreeNode): void;
  // 勾选自定义事件
  (e: "onCheck", node: ITreeNode): void;
}
