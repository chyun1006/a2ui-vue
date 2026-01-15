<script setup>
import { provide, toRefs } from 'vue'

const props = defineProps({
  contextPath: {
    type: String,
    required: true,
  },
})

const { contextPath } = toRefs(props)

// Provide the context path to all descendants
provide('a2ui-data-context', contextPath)
</script>

<template>
  <slot></slot>
</template>
