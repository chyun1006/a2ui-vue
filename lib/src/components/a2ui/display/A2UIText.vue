<script setup>
import { computed, inject } from 'vue'
import { useDataBinding } from '../../../composables/useDataBinding.js'
import { marked } from 'marked'
import { TEXT_TAG_MAP } from '../../../types/components.js'

/**
 * @component A2UIText
 * @description 文本显示组件，支持 Markdown 渲染，可根据 usageHint 应用不同的文本样式
 * @param {Object} text - 数据绑定对象，包含要显示的文本内容
 * @param {string} [usageHint='body'] - 文本样式提示：h1, h2, h3, h4, h5, caption 或 body
 */
const props = defineProps({
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

// surfaceId no longer needed
const { resolveValue } = useDataBinding()

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
    h1: 'scroll-m-20 text-xl font-extrabold tracking-tight lg:text-5xl',
    h2: 'scroll-m-20 text-xl font-semibold tracking-tight',
    h3: 'scroll-m-20 text-xl font-semibold tracking-tight',
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
