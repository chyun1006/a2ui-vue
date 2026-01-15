<script setup>
import { computed, inject } from 'vue'
import { FLEX_JUSTIFY_CONTENT_MAP, FLEX_ALIGN_ITEMS_MAP } from '../../../types/components.js'
import A2UIRenderer from '../../A2UIRenderer.vue'

/**
 * @component A2UIRow
 * @description 水平弹性容器，用于排列子组件，支持配置分布和对齐方式
 * @param {Object} children - 包含 explicitList（组件 ID 数组）或 template（用于动态子组件）的对象
 * @param {string} [distribution='start'] - 水平分布方式：start, center, end, spaceBetween, spaceAround 或 spaceEvenly
 * @param {string} [alignment='start'] - 垂直对齐方式：start, center, end 或 stretch
 * @emits {Object} action - 子组件触发动作时发出
 */
const props = defineProps({
  children: {
    type: Object,
    required: true,
  },
  distribution: {
    type: String,
    default: 'start',
    validator: (value) =>
      ['start', 'center', 'end', 'spaceBetween', 'spaceAround', 'spaceEvenly'].includes(value),
  },
  alignment: {
    type: String,
    default: 'start',
    validator: (value) => ['start', 'center', 'end', 'stretch'].includes(value),
  },
})

const emit = defineEmits(['action'])

// manager no longer needed
// surfaceId no longer needed

const justifyContent = computed(() => FLEX_JUSTIFY_CONTENT_MAP[props.distribution] || 'flex-start')
const alignItems = computed(() => FLEX_ALIGN_ITEMS_MAP[props.alignment] || 'flex-start')

const childrenList = computed(() => {
  const { children = {} } = props

  if (children.explicitList) {
    return children.explicitList
  }

  if (children.template) {
    const { componentId, dataBinding } = children.template
    const data = manager.getData(surfaceId.value, dataBinding)

    if (data && typeof data === 'object') {
      return Object.keys(data).map((key) => ({
        id: `${componentId}-${key}`,
        componentId,
        dataKey: key,
      }))
    }
  }

  return []
})

const handleAction = (actionData) => {
  emit('action', actionData)
}
</script>

<template>
  <div
    class="a2ui-row"
    :style="{
      justifyContent,
      alignItems,
    }"
  >
    <template v-if="children.explicitList">
      <A2UIRenderer
        v-for="childId in childrenList"
        :key="childId"
        :component-id="childId"
        @action="handleAction"
      />
    </template>
    <template v-else-if="children.template">
      <A2UIRenderer
        v-for="item in childrenList"
        :key="item.id"
        :component-id="item.componentId"
        @action="handleAction"
      />
    </template>
  </div>
</template>

<style scoped>
.a2ui-row {
  display: flex;
  flex-direction: row;
  gap: 8px;
}
</style>
