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
})

const { resolveValue } = useDataBinding(props.surfaceId)

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
