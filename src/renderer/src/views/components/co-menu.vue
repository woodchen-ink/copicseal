<template>
  <div class="co-menu">
    <div v-if="list.length">{{ currentCoPic.name }}({{ currentIndex + 1 }}/{{ list.length }})</div>
    <div>
      <button @click="handleExport">导出</button>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { injectCoPic } from '@/uses';

const { currentCoPic, currentIndex, list } = injectCoPic();
async function handleExport() {
  const { width, height } = document.querySelector('.co-render')!.getBoundingClientRect()!;
  Object.assign(document.querySelector<HTMLDivElement>('.co-render')!.style, {
    position: 'fixed',
    zIndex: 999,
    inset: 0,
    backgroundColor: '#000',
    overflow: 'hidden'
  });
  await new Promise((r) => setTimeout(r, 20));
  window.electron.ipcRenderer.send('capture-div', '.co-render', {
    width: ~~width,
    height: ~~height
  });
  await new Promise((r) => setTimeout(r, 2000));
  Object.assign(document.querySelector<HTMLDivElement>('.co-render')!.style, {
    position: 'static',
    zIndex: '',
    top: 0,
    left: 0,
    backgroundColor: '',
    overflow: ''
  });
  // if (currentCoPic.value)
  //   currentCoPic.value.exportToImage()
}
</script>

<style lang="scss" scoped>
.co-menu {
  display: flex;
  align-items: center;
  padding: 0 12px;
  background-color: #535353;
}
</style>
