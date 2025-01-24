<template>
  <ElScrollbar class="co-side">
    <CoSettingsPanel title="输出" />
    <CoSettingsPanel title="基本" />
    <CoBgPanel />
    <CoSettingsPanel title="边框" />
    <CoSettingsPanel title="debug">
      {{ currentCoPic?.getSettings() }}
    </CoSettingsPanel>
  </ElScrollbar>
</template>

<script lang="ts" setup>
import { ElScrollbar } from 'element-plus';
import CoBgPanel from './panels/co-bg-panel.vue';
import { injectCoPic } from '@/uses';
import CoSettingsPanel from '@/components/co-settings-panel/index.vue';

const { currentCoPic } = injectCoPic();
</script>

<style lang="scss" scoped>
.co-side {
  overflow: auto;
  background-color: #3e3e3e;
}
</style>
