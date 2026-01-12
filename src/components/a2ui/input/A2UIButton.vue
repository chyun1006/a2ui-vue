<script setup>
import { computed } from 'vue'
import { useA2UIAction } from '../../../composables/useA2UIAction.js'
import A2UIRenderer from '../../A2UIRenderer.vue'
import { Button } from '@/components/ui/button'

const props = defineProps({
  surfaceId: {
    type: String,
    required: true,
  },
  componentId: {
    type: String,
    required: true,
  },
  manager: {
    type: Object,
    required: true,
  },
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
const { handleAction } = useA2UIAction(props.surfaceId, emit)

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
    <A2UIRenderer
      :surface-id="surfaceId"
      :component-id="child"
      :manager="manager"
      @action="emit('action', $event)"
    />
  </Button>
</template>
