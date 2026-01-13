<script setup>
import { computed, inject } from 'vue'
import { useA2UIAction } from '../../../composables/useA2UIAction.js'
import A2UIRenderer from '../../A2UIRenderer.vue'
import { Button } from '@/components/ui/button'

/**
 * @component A2UIButton
 * @description 按钮组件，支持配置样式变体和尺寸，点击时触发动作
 * @param {string} child - 要在按钮内渲染的子组件 ID
 * @param {boolean} [primary=false] - 是否为主要按钮（已弃用，请使用 variant）
 * @param {string} [variant='default'] - 按钮样式变体：default, primary, secondary, outline, ghost, destructive 或 link
 * @param {string} [size='default'] - 按钮尺寸：default, sm, lg 或 icon
 * @param {Object} action - 点击按钮时要执行的动作对象
 * @emits {Object} action - 按钮动作被触发时发出
 */
const props = defineProps({
  child: {
    type: String,
    required: true,
  },
  primary: {
    type: Boolean,
    default: false,
  },
  variant: {
    type: String,
    default: 'default',
    validator: (value) =>
      ['default', 'primary', 'secondary', 'outline', 'ghost', 'destructive', 'link'].includes(
        value,
      ),
  },
  size: {
    type: String,
    default: 'default',
    validator: (value) => ['default', 'sm', 'lg', 'icon'].includes(value),
  },
  action: {
    type: Object,
    required: true,
  },
})

const emit = defineEmits(['action'])

const surfaceId = inject('a2ui-surface-id')
const { handleAction } = useA2UIAction(surfaceId.value, emit)

// 映射 A2UI 的 primary 和 variant 到 shadcn-vue
const buttonVariant = computed(() => {
  if (props.primary) return 'default'
  return props.variant || 'outline'
})

// 映射 size: md -> default
const buttonSize = computed(() => {
  if (props.size === 'md') return 'default'
  return props.size
})

const onClick = () => {
  handleAction(props.action)
}
</script>

<template>
  <Button :variant="buttonVariant" :size="buttonSize" @click="onClick">
    <A2UIRenderer :component-id="child" @action="emit('action', $event)" />
  </Button>
</template>
