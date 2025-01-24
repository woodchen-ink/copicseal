<template>
  <div class="co-main">
    <CoImageView />
    <CoImageList />
  </div>
</template>

<script lang="ts" setup>
import CoImageView from './co-image-view.vue';
import CoImageList from './co-image-list.vue';
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
