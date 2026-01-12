<script setup>
import { computed } from 'vue'
import { useDataBinding } from '../../../composables/useDataBinding.js'

const props = defineProps({
  surfaceId: {
    type: String,
    required: true,
  },
  componentId: {
    type: String,
    required: true,
  },
  url: {
    type: Object,
    required: true,
  },
  description: {
    type: Object,
    default: null,
  },
})

const { resolveValue } = useDataBinding(props.surfaceId)

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
