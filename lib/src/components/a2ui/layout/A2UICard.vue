<script setup>
import A2UIRenderer from '../../A2UIRenderer.vue'
import { Card, CardContent } from '@/components/ui/card'

/**
 * @component A2UICard
 * @description 卡片容器组件，带有内边距和阴影，用于组织相关内容
 * @param {string} child - 要在卡片内渲染的子元素组件 ID
 * @emits {Object} action - 子组件触发动作时发出
 */
const props = defineProps({
  child: {
    type: String,
    required: true,
  },
})

const emit = defineEmits(['action'])

const handleAction = (actionData) => {
  emit('action', actionData)
}
</script>

<template>
  <Card>
    <CardContent class="pt-6">
      <A2UIRenderer :component-id="child" @action="handleAction" />
    </CardContent>
  </Card>
</template>
