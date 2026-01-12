<script setup>
import { computed } from 'vue'
import { useDataBinding } from '../../../composables/useDataBinding.js'
import { marked } from 'marked'
import { TEXT_TAG_MAP } from '../../../types/components.js'

const props = defineProps({
  surfaceId: {
    type: String,
    required: true,
  },
  componentId: {
    type: String,
    required: true,
  },
  text: {
    type: Object,
    required: true,
  },
  usageHint: {
    type: String,
    default: 'body',
    validator: (value) => ['h1', 'h2', 'h3', 'h4', 'h5', 'caption', 'body'].includes(value),
  },
})

const { resolveValue } = useDataBinding(props.surfaceId)

const textContent = computed(() => {
  const value = resolveValue(props.text)
  return value || ''
})

const htmlContent = computed(() => {
  try {
    return marked(textContent.value, { breaks: true })
  } catch (error) {
    console.error('Markdown parsing error:', error)
    return textContent.value
  }
})

const tag = computed(() => TEXT_TAG_MAP[props.usageHint] || 'p')

const textClasses = computed(() => {
  const styleMap = {
    h1: 'scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-5xl',
    h2: 'scroll-m-20 text-3xl font-semibold tracking-tight',
    h3: 'scroll-m-20 text-2xl font-semibold tracking-tight',
    h4: 'scroll-m-20 text-xl font-semibold tracking-tight',
    h5: 'scroll-m-20 text-lg font-semibold tracking-tight',
    caption: 'text-sm text-muted-foreground',
    body: 'leading-7',
  }
  return styleMap[props.usageHint] || styleMap.body
})
</script>

<template>
  <!-- eslint-disable-next-line vue/no-v-html -->
  <component :is="tag" :class="textClasses" v-html="htmlContent" />
</template>
