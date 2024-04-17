<template>
  <div class="container">
    <fs-tree ref="treeRef" :data="data" key-field="id" show-checkbox></fs-tree>
  </div>
</template>

<script setup lang="ts">
import data from "./components/FsTree/data";
import FsTree from "./components/FsTree/FsTree.vue";
import { ref } from "vue";

const treeRef = ref<InstanceType<typeof FsTree>>();

interface Tree {
  id: string;
  label: string;
  children?: Tree[];
}

const getKey = (prefix: string, id: number) => {
  return `${prefix}-${id}`;
};

const createData = (maxDeep: number, maxChildren: number, minNodesNumber: number, deep = 1, key = "node"): Tree[] => {
  let id = 0;
  return Array.from({ length: minNodesNumber })
    .fill(deep)
    .map(() => {
      const childrenNumber = deep === maxDeep ? 0 : Math.round(Math.random() * maxChildren);
      const nodeKey = getKey(key, ++id);
      return {
        id: nodeKey,
        label: nodeKey,
        children: childrenNumber ? createData(maxDeep, maxChildren, childrenNumber, deep + 1, nodeKey) : undefined,
      };
    });
};

console.log(createData(2, 10, 10));
</script>

<style scoped lang="scss">
.container {
  margin-left: 50px;
  padding: 20px;
}
</style>
