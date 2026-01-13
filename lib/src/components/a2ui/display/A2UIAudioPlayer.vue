<script setup>
import { computed, inject } from 'vue'
import { useDataBinding } from '../../../composables/useDataBinding.js'

/**
 * @component A2UIAudioPlayer
 * @description 音频播放器组件，使用原生 HTML5 控制条，支持可选描述
 * @param {Object} url - 数据绑定对象，包含音频 URL
 * @param {Object} [description=null] - 数据绑定对象，包含音频描述文本
 */
const props = defineProps({
  url: {
    type: Object,
    required: true,
  },
  description: {
    type: Object,
    default: null,
  },
})

const surfaceId = inject('a2ui-surface-id')
const { resolveValue } = useDataBinding(surfaceId.value)

const audioUrl = computed(() => resolveValue(props.url) || '')
const audioDescription = computed(() => {
  if (!props.description) return ''
  return resolveValue(props.description) || ''
})
</script>

<template>
  <div class="a2ui-audio-player">
    <div v-if="audioDescription" class="a2ui-audio-description">
      {{ audioDescription }}
    </div>
    <audio v-if="audioUrl" class="a2ui-audio" :src="audioUrl" controls preload="metadata">
      Your browser does not support the audio tag.
    </audio>
    <div v-else class="a2ui-audio-placeholder">No audio</div>
  </div>
</template>

<style scoped>
.a2ui-audio-player {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.a2ui-audio-description {
  font-size: 0.875rem;
  color: #666;
}

.a2ui-audio {
  width: 100%;
  max-width: 100%;
}

.a2ui-audio-placeholder {
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f0f0f0;
  color: #999;
  padding: 16px;
  border-radius: 4px;
}
</style>
