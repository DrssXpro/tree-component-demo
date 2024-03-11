<template>
  <div class="fs-virtuallist-container" ref="containerRef" @scroll="handleScroll">
    <div class="fs-virtuallist-list" :style="scrollStyle">
      <div class="fs-virtuallist-item" v-for="i in renderList" :key="i.key">
        <slot :item="i" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { CSSProperties, computed, onMounted, reactive, ref } from "vue";

const props = defineProps<{
  itemHeight: number;
  dataSource: any[];
}>();

const containerRef = ref<HTMLDivElement | null>(null);

const state = reactive({
  viewHeight: 0,
  maxCount: 0,
  startIndex: 0,
});

const endIndex = computed(() => state.maxCount + state.startIndex);

const renderList = computed(() => props.dataSource.slice(state.startIndex, endIndex.value));

const scrollStyle = computed(
  () =>
    ({
      height: `${props.dataSource.length * props.itemHeight - state.startIndex * props.itemHeight}px`,
      transform: `translate3d(0, ${state.startIndex * props.itemHeight}px, 0)`,
    } as CSSProperties)
);

const handleScroll = () => {
  const scrollTop = containerRef.value!.scrollTop;
  state.startIndex = Math.floor(scrollTop / props.itemHeight);
};

onMounted(() => {
  state.viewHeight = containerRef.value!.clientHeight;
  state.maxCount = Math.ceil(state.viewHeight / props.itemHeight) + 1;
});
</script>

<style scoped lang="scss">
.fs-virtuallist {
  &-container {
    width: 100%;
    height: 100%;
    overflow-y: scroll;
  }
  &-item {
    width: 100%;
    box-sizing: border-box;
    height: v-bind("`${props.itemHeight}px`");
  }
}
</style>
