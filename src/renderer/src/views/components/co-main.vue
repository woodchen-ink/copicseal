<template>
  <div class="co-main">
    <!-- <video ref="video" style="max-width: 50vw; max-height: 50vh" controls></video>
    <button @click="a">A</button> -->
    <CoImageView />
    <CoImageList />
  </div>
</template>

<script lang="ts" setup>
import CoImageList from './co-image-list.vue';
// import { ref } from 'vue';
import CoImageView from './co-image-view.vue';
// const video = ref<HTMLVideoElement>();

// function a() {
//   navigator.mediaDevices
//     .getDisplayMedia({
//       audio: true,
//       video: {
//         width: window.screen.width,
//         height: window.screen.height,
//         frameRate: 30
//       }
//     })
//     .then((stream) => {
//       // 创建 MediaRecorder 实例
//       const recorder = new MediaRecorder(stream);
//       const chunks: Blob[] = []; // 用于存储录制的二进制数据块

//       // 当有数据可用时，保存数据块
//       recorder.ondataavailable = (event) => {
//         if (event.data.size > 0) {
//           chunks.push(event.data);
//         }
//       };

//       // 停止录制后，生成 Blob
//       recorder.onstop = () => {
//         const blob = new Blob(chunks, { type: 'video/webm' }); // 将数据块拼接成 Blob
//         console.log('录制完成，Blob 文件:', blob);
//         video.value!.src = URL.createObjectURL(blob); // 将 Blob 赋值给 video 元素的 src 属性

//         // 提供下载功能
//         // const downloadLink = document.createElement('a');
//         // downloadLink.href = URL.createObjectURL(blob);
//         // downloadLink.download = 'recorded_video.webm';
//         // downloadLink.textContent = '点击下载录制的视频';
//         // document.body.appendChild(downloadLink);

//         // 停止所有轨道
//         stream.getTracks().forEach((track) => track.stop());
//       };

//       // 开始录制
//       recorder.start();
//       console.log('开始录制...');

//       // 5 秒后停止录制
//       setTimeout(() => {
//         recorder.stop();
//         console.log('停止录制...');
//       }, 5000);
//     })
//     .catch((e) => console.error('获取屏幕流失败:', e));
// }
</script>

<style lang="scss" scoped>
.co-main {
  overflow: hidden;

  .co-image-view {
    height: calc(100% - 200px);
    overflow: auto;
  }

  .co-image-list {
    height: 200px;
  }
}
</style>
