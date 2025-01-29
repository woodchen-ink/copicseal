<template>
  <button class="co-button">
    <slot></slot>
  </button>
</template>
<script lang="ts" setup></script>

<style lang="scss" scoped>
.co-button {
  height: 28px;
  padding: 0 16px;
  color: #fff;
  border: 1px solid #fff;
  border-radius: 14px;
  background-color: transparent;
  cursor: pointer;

  &:hover {
    background-color: rgba(255, 255, 255, 0.1);
  }

  + .co-button {
    margin-left: 8px;
  }
}
</style>
