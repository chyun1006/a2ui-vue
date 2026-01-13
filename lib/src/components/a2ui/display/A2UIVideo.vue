<script setup>
import { computed, inject } from 'vue'
import { useDataBinding } from '../../../composables/useDataBinding.js'

/**
 * @component A2UIVideo
 * @description 视频播放器组件，使用原生 HTML5 控制条
 * @param {Object} url - 数据绑定对象，包含视频 URL
 */
const props = defineProps({
  url: {
    type: Object,
    required: true,
  },
})

const surfaceId = inject('a2ui-surface-id')
const { resolveValue } = useDataBinding(surfaceId.value)

const videoUrl = computed(() => resolveValue(props.url) || '')
</script>

<template>
  <video v-if="videoUrl" class="a2ui-video" :src="videoUrl" controls preload="metadata">
    Your browser does not support the video tag.
  </video>
  <div v-else class="a2ui-video-placeholder">No video</div>
</template>

<style scoped>
.a2ui-video {
  display: block;
  width: 100%;
  max-width: 100%;
  border-radius: 8px;
  background: #000;
}

.a2ui-video-placeholder {
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f0f0f0;
  color: #999;
  padding: 32px;
  border-radius: 8px;
  min-height: 200px;
}
</style>
