<template>
  <div
    :style="{
      width: '100%',
      height: props.containerHeight && props.virtualScroll ? `${props.containerHeight}px` : '100%',
    }"
  >
    <fs-virtuallst
      :item-height="props.itemSize"
      :data-source="flattenTree"
      v-if="props.virtualScroll && props.containerHeight"
    >
      <template #default="{ item }">
        <fs-tree-node
          :node="item"
          :show-checkbox="props.showCheckbox"
          :is-expanded="computedIsExpanded(item)"
          :is-select="computedIsSelect(item)"
          :is-loading="computedIsLoading(item)"
          @toggle-expanded="handleToggleExpanded"
          @select-node="handleSelectNode"
          @on-check="handleCheckNode"
        />
      </template>
    </fs-virtuallst>
    <template v-else>
      <fs-tree-node
        v-for="i in flattenTree"
        :key="i.key"
        :node="i"
        :show-checkbox="props.showCheckbox"
        :is-expanded="computedIsExpanded(i)"
        :is-select="computedIsSelect(i)"
        :is-loading="computedIsLoading(i)"
        @toggle-expanded="handleToggleExpanded"
        @select-node="handleSelectNode"
        @on-check="handleCheckNode"
      />
    </template>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, toRaw, watch, useSlots, provide } from "vue";
import FsTreeNode from "./FsTreeNode.vue";
import { IFsTreeEmitter, IFsTreeProps, ITreeItem, ITreeNode, NodeKey } from "./types";
import FsVirtuallst from "./FsVirtuallst.vue";
const props = withDefaults(defineProps<IFsTreeProps>(), {
  keyField: "key",
  labelField: "label",
  childrenField: "children",
  selectable: true,
  multipleSelect: false,
  virtualScroll: false,
  itemSize: 32,
  defaultExpandedKeys: () => [],
  defaultCheckedKeys: () => [],
});

const emit = defineEmits<IFsTreeEmitter>();

defineExpose({ getCheckedKeys, getCheckedNodes });

provide("RootTreeSlots", { slots: useSlots() });

const treeData = ref<ITreeNode[]>([]);
const expandedSet = ref(new Set(props.defaultExpandedKeys));
const checkedSet = ref(new Set(props.defaultCheckedKeys));
const loadingSet = ref(new Set<NodeKey>([]));
const selectNodesMap = ref<Map<NodeKey, ITreeNode>>(new Map());

const computedIsExpanded = (node: ITreeNode) => expandedSet.value.has(node.key);
const computedIsSelect = (node: ITreeNode) => selectNodesMap.value.has(node.key);
const computedIsLoading = (node: ITreeNode) => loadingSet.value.has(node.key);

const flattenTree = computed(() => {
  const res: ITreeNode[] = [];
  function dfs(tree: ITreeNode[]) {
    tree.forEach((node) => {
      res.push(node);
      if (expandedSet.value.has(node.key)) dfs(node.children);
    });
  }
  dfs(treeData.value);
  return res;
});

const treeMap = computed<Map<NodeKey, ITreeNode>>(() => {
  const map = new Map<NodeKey, ITreeNode>();
  dfs(treeData.value);
  function dfs(data: ITreeNode[]) {
    data.forEach((item) => {
      map.set(item.key, item);
      dfs(item.children);
    });
  }
  return map;
});

watch(
  () => props.data,
  (newValue) => {
    treeData.value = formatTreeData(newValue, null);
  },
  {
    immediate: true,
  }
);

function getCheckedKeys() {
  return [...checkedSet.value];
}

function getCheckedNodes() {
  const res: ITreeNode[] = [];
  checkedSet.value.forEach((key) => {
    res.push(toRaw(treeMap.value.get(key)!));
  });
  return res;
}

function formatTreeData(data: ITreeItem[], parent: ITreeNode | null): ITreeNode[] {
  return data.map((item) => {
    // 数据源 children 可能不存在
    const children = item[props.childrenField] || [];
    const treeNode: ITreeNode = {
      key: item[props.keyField],
      label: item[props.labelField],
      children: [],
      // 初始化层数为 0，之后根据父节点 level + 1 即可
      level: parent ? parent.level + 1 : 0,
      parentKey: parent ? parent.key : null,
      isChecked:
        item.isChecked !== undefined ? item.isChecked : checkedSet.value.has(item[props.keyField]) ? true : false,
      isHalfChecked: item.isHalfChecked !== undefined ? item.isHalfChecked : false,
      isLeaf: item.isLeaf !== undefined ? item.isLeaf : children.length === 0,
      rawNode: item,
    };
    if (children.length) treeNode.children = formatTreeData(children, treeNode);
    return treeNode;
  });
}

function handleLoadTreeData(node: ITreeNode) {
  if (!node.children.length && !node.isLeaf && props.load) {
    loadingSet.value.add(node.key);
    props.load(node, (res) => {
      if (res.length) {
        node.rawNode.children = res;
        node.children = formatTreeData(res, node);
        expandedSet.value.add(node.key);
      } else {
        node.isLeaf = true;
        expandedSet.value.delete(node.key);
      }
      loadingSet.value.delete(node.key);
    });

    return true;
  }
  return false;
}

function handleToggleExpanded(node: ITreeNode) {
  if (!handleLoadTreeData(node))
    expandedSet.value.has(node.key) ? expandedSet.value.delete(node.key) : expandedSet.value.add(node.key);
}

function handleSelectNode(node: ITreeNode) {
  if (!props.selectable) return;
  if (selectNodesMap.value.has(node.key)) {
    selectNodesMap.value.delete(node.key);
  } else {
    if (!props.multipleSelect) selectNodesMap.value.clear();
    selectNodesMap.value.set(node.key, node);
  }
  const nodes = [...selectNodesMap.value].map(([_, node]) => toRaw(node));
  emit("onSelectNodes", nodes);
}

function handleCheckNode(node: ITreeNode) {
  node.isChecked = !node.isChecked;
  checkedSet.value[node.isChecked ? "add" : "delete"](node.key);
  handleCheckChildren(node, node.isChecked);
  handleCheckParent(node, node.isChecked);
  emit("onCheckChange", toRaw(node.rawNode), node.isChecked);
}

function handleCheckChildren(node: ITreeNode, isCheck: boolean) {
  const children = node.children;
  if (children) {
    children.forEach((node) => {
      node.isChecked = isCheck;
      checkedSet.value[node.isChecked ? "add" : "delete"](node.key);
      handleCheckChildren(node, isCheck);
    });
  }
}

function handleCheckParent(node: ITreeNode, isCheck: boolean) {
  let parentKey = node.parentKey;
  while (parentKey) {
    const parent = treeMap.value.get(parentKey)!;
    const children = parent.children;
    let isAll = true;
    let isHalf = false;

    if (children) {
      children.forEach((node) => {
        if (!node.isChecked) isAll = false;
        if (node.isChecked || node.isHalfChecked) isHalf = true;
      });
    }
    if (isAll) {
      parent.isHalfChecked = false;
      parent.isChecked = isCheck;
      checkedSet.value[isCheck ? "add" : "delete"](parent.key);
    } else {
      parent.isChecked = false;
      checkedSet.value.delete(parent.key);
      parent.isHalfChecked = isHalf;
    }
    parentKey = parent.parentKey;
  }
}
</script>

<style scoped lang="scss"></style>
