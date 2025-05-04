<template>
  <ElScrollbar class="co-side">
    <CoOutputPanel />
    <!-- <CoSettingsPanel title="基本" /> -->
    <CoPropsPanel />
    <CoBgPanel />
    <!-- <CoSettingsPanel title="边框" /> -->
    <CoInfoPanel />
  </ElScrollbar>
</template>

<script lang="ts" setup>
import { ElScrollbar } from 'element-plus';
import CoBgPanel from './panels/co-bg-panel.vue';
import CoInfoPanel from './panels/co-info-panel.vue';
import CoOutputPanel from './panels/co-output-panel.vue';
import CoPropsPanel from './panels/co-props-panel.vue';
</script>

<style lang="scss" scoped>
.co-side {
  overflow: auto;
  background-color: #3e3e3e;
}
</style>
