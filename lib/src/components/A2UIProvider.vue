<script setup>
import { provide, readonly, toRef } from 'vue'

/**
 * A2UI Provider 组件
 * 通过 provide/inject 机制向子组件提供 surface 对象
 */

const props = defineProps({
  surface: {
    type: Object,
    required: true,
  },
})

const surfaceRef = toRef(props, 'surface')

// 提供 surface 对象给所有子组件
provide('a2ui-surface', readonly(surfaceRef))
</script>

<template>
  <slot />
</template>
