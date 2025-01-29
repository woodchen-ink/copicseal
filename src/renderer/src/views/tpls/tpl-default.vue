<template>
  <div
    :style="{
      padding: '0.01rem 0.01rem 0',
      backgroundColor: '#fffc',
      backdropFilter: 'blur(0.2rem)',
      boxShadow: `0 0 0.2rem rgba(0, 0, 0, .8)`
    }"
  >
    <img
      class="main-image"
      :style="{
        display: 'block',
        margin: '0 auto'
      }"
      :src="imgUrl"
    />
    <div
      :style="{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        height: '0.1rem',
        paddingLeft: '0.02rem',
        paddingRight: '0.02rem',
        fontSize: '0.05rem'
      }"
    >
      <div
        :style="{
          display: 'flex',
          alignItems: 'baseline'
        }"
      >
        <div
          :style="{
            display: 'flex',
            alignItems: 'flex-end'
          }"
        >
          {{ info.Make }}
        </div>
        <div
          :style="{
            display: 'flex',
            alignItems: 'flex-end',
            marginLeft: '0.02rem',
            fontSize: '0.04rem'
          }"
        >
          {{ utils.getModelName(info.Model) }}
        </div>
      </div>
      <div>
        <div
          :style="{
            display: 'flex',
            alignItems: 'flex-end',
            marginLeft: '0.03rem',
            fontSize: '0.03rem'
          }"
        >
          {{ info.FocalLength?.replace(' ', '') }} {{ info.FNumber }} {{ info.ExposureTime }}s ISO{{
            info.ISOSpeedRatings
          }}
        </div>
      </div>
    </div>
  </div>
</template>
<script lang="ts" setup>
defineProps({
  utils: {
    type: Object,
    default: () => ({})
  },
  imgUrl: String,
  info: {
    type: Object,
    default: () => ({})
  },
  borderPadding: {
    type: [Number, String],
    default: 0
  }
});
</script>

<style lang="scss" scoped>
.main-image {
  width: 100%;
  height: auto;
}
</style>
