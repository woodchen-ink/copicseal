<template>
  <ElScrollbar class="co-image-view">
    <component :is="currentCoPic.update()" v-if="currentCoPic" />
  </ElScrollbar>
</template>

<script lang="ts" setup>
import { injectCoPic } from '@/uses';
import { ElScrollbar } from 'element-plus';

const { currentCoPic } = injectCoPic();
</script>

<style lang="scss" scoped>
.co-image-view {
  color: #000;
  background-color: #282828;

  :deep(.el-scrollbar__view) {
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 100%;
  }
}
</style>
