<script setup>
import { provide, readonly, toRef } from 'vue'

/**
 * A2UI Provider 组件
 * 通过 provide/inject 机制向子组件提供 manager 和 surfaceId
 * 解决 manager 需要层层传递的问题
 */

const props = defineProps({
  manager: {
    type: Object,
    required: true,
  },
  surfaceId: {
    type: String,
    required: true,
  },
})

const surfaceIdRef = toRef(props, 'surfaceId')

// 提供 manager 和 surfaceId 给所有子组件
provide('a2ui-manager', props.manager)
provide('a2ui-surface-id', readonly(surfaceIdRef))
</script>

<template>
  <slot />
</template>
