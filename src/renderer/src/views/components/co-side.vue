<template>
  <ElScrollbar class="co-side">
    <CoOutputPanel />
    <!-- <CoSettingsPanel title="基本" /> -->
    <CoPropsPanel />
    <CoBgPanel />
    <!-- <CoSettingsPanel title="边框" /> -->
    <CoSettingsPanel title="Debug">
      <div v-if="currentCoPic?.isLoaded">
        <table style="width: 100%">
          <tr v-for="item in primaryExif" :key="item.key">
            <td>
              <div style="white-space: nowrap; text-align: right; opacity: 0.6; font-size: 0.8em">
                {{ item.name }}:
              </div>
            </td>
            <td>
              <div
                style="
                  white-space: nowrap;
                  word-break: keep-all;
                  overflow: hidden;
                  text-overflow: ellipsis;
                "
              >
                {{ currentCoPic.getExif()[item.key] }}
              </div>
            </td>
          </tr>
        </table>
        <!-- {{ currentCoPic.getSettings() }} -->
      </div>
    </CoSettingsPanel>
  </ElScrollbar>
</template>

<script lang="ts" setup>
import CoSettingsPanel from '@/components/co-settings-panel/index.vue';
import { injectCoPic, primaryExif } from '@/uses';
import { ElScrollbar } from 'element-plus';
import CoBgPanel from './panels/co-bg-panel.vue';
import CoOutputPanel from './panels/co-output-panel.vue';
import CoPropsPanel from './panels/co-props-panel.vue';

const { currentCoPic } = injectCoPic();
</script>

<style lang="scss" scoped>
.co-side {
  overflow: auto;
  background-color: #3e3e3e;
}
</style>
