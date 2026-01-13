<script setup>
import { computed, inject } from 'vue'
import { useDataBinding } from '../../../composables/useDataBinding.js'

/**
 * @component A2UIImage
 * @description 图片显示组件，支持配置适配模式和尺寸预设
 * @param {Object} url - 数据绑定对象，包含图片 URL
 * @param {string} [fit='cover'] - 图片适配模式：contain, cover, fill, none 或 scale-down
 * @param {string} [usageHint='mediumFeature'] - 尺寸预设：icon, avatar, smallFeature, mediumFeature, largeFeature 或 header
 */
const props = defineProps({
  url: {
    type: Object,
    required: true,
  },
  fit: {
    type: String,
    default: 'cover',
    validator: (value) => ['contain', 'cover', 'fill', 'none', 'scale-down'].includes(value),
  },
  usageHint: {
    type: String,
    default: 'mediumFeature',
    validator: (value) =>
      ['icon', 'avatar', 'smallFeature', 'mediumFeature', 'largeFeature', 'header'].includes(value),
  },
})

const surfaceId = inject('a2ui-surface-id')
const { resolveValue } = useDataBinding(surfaceId.value)

const imageUrl = computed(() => resolveValue(props.url) || '')

const imageStyle = computed(() => ({
  objectFit: props.fit,
}))
</script>

<template>
  <img
    v-if="imageUrl"
    :src="imageUrl"
    :class="`a2ui-image a2ui-image--${usageHint}`"
    :style="imageStyle"
    :alt="usageHint"
    loading="lazy"
  />
  <div v-else class="a2ui-image-placeholder">No image</div>
</template>

<style scoped>
.a2ui-image {
  display: block;
  max-width: 100%;
  height: auto;
}

.a2ui-image--icon {
  width: 24px;
  height: 24px;
}

.a2ui-image--avatar {
  width: 48px;
  height: 48px;
  border-radius: 50%;
}

.a2ui-image--smallFeature {
  max-width: 200px;
  border-radius: 4px;
}

.a2ui-image--mediumFeature {
  max-width: 400px;
  border-radius: 8px;
}

.a2ui-image--largeFeature {
  max-width: 600px;
  border-radius: 8px;
}

.a2ui-image--header {
  width: 100%;
  max-height: 400px;
  object-fit: cover;
}

.a2ui-image-placeholder {
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f0f0f0;
  color: #999;
  padding: 16px;
  border-radius: 4px;
  min-height: 100px;
}
</style>
