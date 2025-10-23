<template>
  <el-dropdown
    trigger="click"
    :popper-options="popperOptions"
    popper-class="co-presets__dropdown"
    max-height="50vh"
    @command="handleMenuClick"
  >
    <CoButton outline class="co-presets__button mr-2">
      模板配置
      <span class="i-solar-alt-arrow-down-broken" />
    </CoButton>
    <template #dropdown>
      <el-dropdown-menu>
        <el-dropdown-item v-for="(opt, i) in menuOpts" :key="i" :command="opt.value">
          <div v-if="opt.value === 'saveAs'" class="dropdown-item dropdown-item--save-as">
            <span class="i-solar-add-square-broken" />
            <span class="ml-2">{{ opt.label }}</span>
          </div>
          <div v-else class="dropdown-item">
            <span class="i-solar-bookmark-broken" />
            <span class="ml-2">{{ opt.label }}</span>
          </div>
        </el-dropdown-item>
      </el-dropdown-menu>
    </template>
  </el-dropdown>
</template>

<script lang="ts" setup>
import { injectCoPic } from '@renderer/uses/co-pic';
import { useConfig } from '@renderer/uses/config';
import { coMessage, coPrompt } from '@renderer/utils/element';
import { cloneDeep } from 'lodash-es';

const { config } = useConfig();
const { currentCoPic, list } = injectCoPic();

const popperOptions = {
  modifiers: [
    {
      name: 'offset',
      options: {
        offset: [0, 8],
      },
    },
  ],
};

const menuOpts = computed(() => {
  return [
    { value: 'saveAs', label: '存为新配置' },
  ].concat(config.value.templatePresets.map(preset => ({
    value: preset.id,
    label: preset.name,
  })));
});

function handleMenuClick(command: string) {
  switch (command) {
    case 'saveAs':
      handleSaveAs();
      break;
    default:
      handleApplyPresets(command);
      break;
  }
}

async function handleApplyPresets(presetId: string) {
  const preset = config.value.templatePresets.find(p => p.id === presetId);
  if (!preset) {
    coMessage('模板配置不存在', {
      type: 'error',
    });
    return;
  }

  list.value.forEach((pic) => {
    const { templateId, templateProps, background, fontFamily } = cloneDeep(preset);
    pic.state.templateId = templateId;
    pic.state.templateProps = templateProps!;
    pic.state.settings.background = background!;
    pic.state.fontFamily = fontFamily!;
  });
  coMessage('已应用配置到所有图片', { type: 'success' });
}

async function handleSaveAs() {
  if (config.value.templatePresets.length >= 10) {
    return void coMessage('配置模板数量已达上限（10），请先删除一些配置模板', {
      type: 'warning',
    });
  }
  const presetsName = await coPrompt('请输入新配置模板名称', {
    title: '存为新配置',
    inputPattern: /^.{2,10}$/,
    inputErrorMessage: '请输入 2 - 10 个字符',
  });
  if (!presetsName) {
    return;
  }
  config.value.templatePresets.unshift(cloneDeep({
    id: Date.now().toString(),
    name: presetsName,
    ...getCurrentPresetsSetting(),
  }));
}

function getCurrentPresetsSetting() {
  const template = currentCoPic.value.template.value!;
  const { templateId, templateProps, settings: { background }, fontFamily } = currentCoPic.value.state;

  return {
    templateId,
    templateName: template.title || '',
    templateProps,
    background,
    fontFamily,
    description: `模板参数:
${
  Object.keys(template.props)
    .filter(key => template.props[key].__co)
    .map(key => `- ${template.props[key].__co.label}: ${templateProps[key] ?? template.props[key].default}`)
    .join('\n')
}
背景:
- 模式: ${background.mode === 'image' ? '图片' : background.mode === 'color' ? '颜色' : '无'}${
  background.mode === 'color'
    ? `
- 颜色: ${background.color}`
    : ''
}${
  background.mode === 'image'
    ? `
- 滤镜: ${background.image?.filters?.map(f => `${f.type}: ${f.value}`)}`
    : ''
}${
  background.mode !== 'none'
    ? `
- 内边距: ${background.padding}`
    : ''
}`,
  };
}
</script>

<style lang="scss">
.co-presets__dropdown {
  .el-popper__arrow {
    display: none;
  }

  .dropdown-item {
    display: flex;
    align-items: center;

    &.dropdown-item--save-as {
      color: #95cafe;
    }
  }
}
</style>

<style lang="scss" scoped>
.co-presets__button {
  display: flex;
  align-items: center;
  background-color: #3e3e3e;

  span {
    margin-left: 4px;
  }
}
</style>
