<template>
  <CoSettingsPanel v-if="settings" title="背景">
    <div>
      <CoRadioGroup v-model="settings.mode" :options="modeOptions" />
    </div>
    <div v-if="settings.mode === 'color' && settings.color">
      <p>颜色选择: <input v-model="settings.color.rgba" type="color" /></p>
      <p>
        调色盘:
        <span
          v-for="it in currentCoPic.colorPalette"
          :key="it.join()"
          class="color-palette"
          :style="`--color: rgb(${it.join()})`"
          @click="
            settings.color.rgba =
              `#${it.map((it) => it.toString(16).padStart(2, '0')).join('')}`.toUpperCase()
          "
        />
      </p>
    </div>
    <div v-if="settings.mode === 'image' && settings.image">
      <p v-for="it in settings.image.filters" :key="it.type">
        {{ it.type }}: <input v-model="it.value" type="text" />
      </p>
      <!-- <p>背景模糊: <input v-model="settings.image.blur" type="text" /></p>
      <p>背景亮度: <input v-model="settings.image.brightness" type="text" /></p> -->
    </div>
    <div v-if="settings.mode !== 'none' && settings.padding">
      <p>垂直内边距: <input v-model="settings.padding[0]" type="text" /></p>
      <p>水平内边距: <input v-model="settings.padding[1]" type="text" /></p>
    </div>
  </CoSettingsPanel>
</template>

<script lang="ts" setup>
import { ref, watch } from 'vue';
import { cloneDeep } from 'lodash';
import CoSettingsPanel from '@/components/co-settings-panel/index.vue';
import CoRadioGroup, { type Option } from '@/components/co-radio-group/index.vue';
import { injectCoPic } from '@/uses';
import { DisabledByDefault, Image, Palette } from '@/components/co-icon';
import { Settings } from '@/types';

const { currentCoPic } = injectCoPic();

const settings = ref<Settings['background']>();

let isPicChange = false;
watch(
  currentCoPic,
  () => {
    if (currentCoPic.value) {
      isPicChange = true;
      settings.value = cloneDeep(currentCoPic.value.getSettings().background);
    }
  },
  { immediate: true }
);

watch(
  () => currentCoPic.value?.getSettings().background.color,
  (val) => {
    if (val && settings.value) settings.value.color = val;
  }
);

watch(
  settings,
  () => {
    if (isPicChange || !settings.value) {
      isPicChange = false;
      return;
    }
    currentCoPic.value.setSettings({
      background: settings.value
    });
  },
  { deep: true }
);

const modeOptions = ref<Option[]>([
  { label: '无背景', icon: DisabledByDefault, value: 'none' },
  { label: '纯色背景', icon: Palette, value: 'color' },
  { label: '图片背景', icon: Image, value: 'image' }
]);
</script>

<style lang="scss" scoped>
.color-palette {
  display: inline-block;
  width: 40px;
  height: 20px;
  background-color: var(--color);
  border: 1px solid #eee;
  cursor: pointer;

  + .color-palette {
    margin-left: 4px;
  }
}
</style>
