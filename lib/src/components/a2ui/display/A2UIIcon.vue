<script setup>
import { computed, inject } from 'vue'
import { useDataBinding } from '../../../composables/useDataBinding.js'

/**
 * @component A2UIIcon
 * @description 图标显示组件，渲染 Material Design 图标
 * @param {Object} name - 数据绑定对象，包含图标名称（驼峰格式）
 * @param {Object} icon - 数据绑定对象，包含图标名称（向后兼容）
 */
const props = defineProps({
  name: {
    type: Object,
    default: null,
  },
  icon: {
    type: Object,
    default: null,
  },
})

const surfaceId = inject('a2ui-surface-id')
const { resolveValue } = useDataBinding(surfaceId.value)

// 优先使用 icon 属性，如果不存在则使用 name 属性（向后兼容）
const iconBinding = computed(() => props.icon || props.name)
const iconName = computed(() => resolveValue(iconBinding.value) || '')

const materialIconName = computed(() => {
  const name = iconName.value
  return name
    .replace(/([A-Z])/g, '_$1')
    .toLowerCase()
    .replace(/^_/, '')
})
</script>

<template>
  <span v-if="iconName" class="a2ui-icon material-icons" :aria-label="iconName">
    {{ materialIconName }}
  </span>
  <span v-else class="a2ui-icon-placeholder">?</span>
</template>

<style scoped>
.a2ui-icon {
  font-size: 24px;
  width: 24px;
  height: 24px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  vertical-align: middle;
  user-select: none;
}

.a2ui-icon-placeholder {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  background: #f0f0f0;
  color: #999;
  border-radius: 50%;
  font-size: 14px;
}
</style>
