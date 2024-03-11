<template>
  <div
    :class="['fs-node-content', props.isSelect && 'fs-node-content__select']"
    :style="{ paddingLeft: `${props.node.level * (props.node.isLeaf ? 24 : 16)}px` }"
    @click="handleSelectNode(props.node)"
  >
    <!-- new -->
    <img v-if="props.isLoading" :src="loadingIcon" class="fs-node-icon fs-node-icon__loading" />
    <img
      v-else
      :src="expandIcon"
      :class="['fs-node-icon', props.isExpanded && 'fs-node-icon__expanded', props.node.isLeaf && 'fs-node-icon__leaf']"
      @click="handleToggleExpand(props.node)"
    />
    <div class="fs-node-label">
      <!-- new -->
      <input
        v-if="props.showCheckbox"
        type="checkbox"
        :checked="props.node.isChecked"
        :indeterminate="props.node.isHalfChecked"
        @change="handleCheckChange(props.node)"
      />
      <fs-tree-content :node="props.node" />
    </div>
  </div>
</template>

<script setup lang="ts">
import loadingIcon from "@/assets/loading.svg";
import expandIcon from "@/assets/expand.svg";
import FsTreeContent from "./FsTreeContent.vue";
import { IFsTreeNodeProps, IFsTreeNodeEmitter, ITreeNode } from "./types";

const props = defineProps<IFsTreeNodeProps>();

const emit = defineEmits<IFsTreeNodeEmitter>();

const handleToggleExpand = (node: ITreeNode) => {
  emit("toggleExpanded", node);
};

const handleSelectNode = (node: ITreeNode) => {
  emit("selectNode", node);
};

const handleCheckChange = (node: ITreeNode) => {
  emit("onCheck", node);
};
</script>

<style scoped lang="scss">
.fs-node {
  &-content {
    display: flex;
    align-items: center;
    padding: 5px;
    gap: 5px;
    cursor: pointer;
    &:hover {
      background-color: #f5f7fa;
    }
    &__select {
      background-color: #f5f7fa;
    }
  }

  &-icon {
    width: 0.8em;
    height: 0.8em;
  }
  &-icon__expanded {
    transform: rotate(90deg);
  }
  &-icon__leaf {
    display: none;
  }
  &-icon__loading {
    cursor: default;
    animation: loading 1s infinite ease-in-out;
  }
  &-label {
    display: flex;
    align-items: center;
    gap: 5px;
  }
}

// new
@keyframes loading {
  from {
    transform: rotate(0);
  }
  to {
    transform: rotateZ(360deg);
  }
}
</style>
