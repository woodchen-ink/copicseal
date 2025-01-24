<template>
  <div
    :style="{
      padding: '0.01rem 0.01rem 0',
      backgroundColor: '#fffc',
      backdropFilter: 'blur(0.2rem)',
      boxShadow: `0 0 0.2rem rgba(0, 0, 0, .8)`
    }"
  >
    <mainImage />
  </div>
</template>
<script lang="ts" setup>
defineProps({
  mainImage: Object,
  borderPadding: {
    type: [Number, String],
    default: 0
  }
});
</script>
