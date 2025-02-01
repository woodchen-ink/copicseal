<template>
  <div class="co-menu">
    <div v-if="list.length">{{ currentCoPic.name }}({{ currentIndex + 1 }}/{{ list.length }})</div>
    <div v-if="list.length">
      <CoButton outline @click="handleExport()">导出</CoButton>
      <CoButton outline @click="handleExportAll()">导出全部</CoButton>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { injectCoPic, injectProgress } from '@/uses';
import CoButton from '@/components/co-button/index.vue';
import { nextTick } from 'vue';

const { currentCoPic, currentIndex, list } = injectCoPic();

const progress = injectProgress();

async function exportToImage() {
  const { width, height } = document.querySelector('.co-render')!.getBoundingClientRect()!;
  const fontSize = document.querySelector('html')!.style.fontSize;
  await new Promise((r) => setTimeout(r, 20));
  console.time('capture');
  const html = `
    <style>html{font-size: ${fontSize} }</style>
    <style>body{margin: 0; padding: 0; } * { box-sizing: border-box;}</style>
    ${document.querySelector('.co-render')!.outerHTML}
  `;
  const res = await window.api.captureDOM({
    html,
    output: [
      {
        path: '/Users/kohai/projects/git/comark-desktop/out/screenshot1.jpg',
        scale: 2,
        width: ~~width,
        height: ~~height
      }
      // {
      //   path: '/Users/kohai/projects/git/comark-desktop/out/screenshot11.jpg',
      //   type: 'jpeg',
      //   quality: 50,
      //   width: ~~width,
      //   height: ~~height
      // },
      // {
      //   path: '/Users/kohai/projects/git/comark-desktop/out/screenshot2.jpg',
      //   type: 'jpeg',
      //   quality: 10,
      //   width: ~~width,
      //   height: ~~height
      // },
      // {
      //   path: '/Users/kohai/projects/git/comark-desktop/out/screenshot3.jpg',
      //   type: 'jpeg',
      //   quality: 100,
      //   width: ~~width,
      //   height: ~~height
      // },
      // {
      //   path: '/Users/kohai/projects/git/comark-desktop/out/screenshot.png',
      //   type: 'png',
      //   width: ~~width,
      //   height: ~~height
      // }
    ]
  });
  console.timeEnd('capture');
  console.log(res);
}
async function handleExport() {
  progress.value.visible = true;
  progress.value.current = 0;
  progress.value.total = 1;
  progress.value.filename = currentCoPic.value.name;
  console.log(progress.value);
  await exportToImage();
  progress.value.current = 1;
}

async function handleExportAll() {
  console.time('exportAll');
  progress.value.visible = true;
  await list.value.reduce(async (p, _pic, index) => {
    await p;
    if (!progress.value.visible) return;
    currentIndex.value = index;
    progress.value.current = index;
    progress.value.total = list.value.length;
    progress.value.filename = currentCoPic.value.name;
    await new Promise((r) => setTimeout(r, 300));
    await nextTick();
    await exportToImage();
    progress.value.current += 1;
  }, Promise.resolve());
  console.timeEnd('exportAll');
}
</script>

<style lang="scss" scoped>
.co-menu {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 12px;
  background-color: #535353;
}
</style>
