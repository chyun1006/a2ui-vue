<script setup>
import { computed, inject } from 'vue'
import { FLEX_ALIGN_ITEMS_MAP } from '../../../types/components.js'
import A2UIRenderer from '../../A2UIRenderer.vue'
import A2UIListItem from './A2UIListItem.vue'

/**
 * @component A2UIList
 * @description 列表容器，用于垂直或水平排列子项，支持对齐选项
 * @param {Object} children - 包含 explicitList（组件 ID 数组）或 template（用于动态子组件）的对象
 * @param {string} [direction='vertical'] - 列表方向：vertical 或 horizontal
 * @param {string} [alignment='start'] - 交叉轴对齐方式：start, center, end 或 stretch
 * @emits {Object} action - 子组件触发动作时发出
 */
const props = defineProps({
  children: {
    type: Object,
    required: true,
  },
  direction: {
    type: String,
    default: 'vertical',
    validator: (value) => ['vertical', 'horizontal'].includes(value),
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
      // 支持 Map 对象 (从 Adapter 返回的 vals)
      if (data instanceof Map) {
        return Array.from(data.keys()).map((key) => ({
          id: `${componentId}-${key}`,
          componentId,
          dataKey: key,
        }))
      }

      // 支持普通对象
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
  <ul :class="['a2ui-list', `a2ui-list--${direction}`]" :style="{ alignItems }">
    <li
      v-for="(childId, index) in childrenList"
      :key="typeof childId === 'string' ? childId : childId.id"
      class="a2ui-list-item"
    >
      <A2UIListItem
        v-if="typeof childId === 'object' && childId.dataKey"
        :context-path="`/${children.template.dataBinding}/${childId.dataKey}`"
      >
        <A2UIRenderer :component-id="childId.componentId" @action="handleAction" />
      </A2UIListItem>

      <A2UIRenderer
        v-else
        :component-id="typeof childId === 'string' ? childId : childId.componentId"
        @action="handleAction"
      />
    </li>
  </ul>
</template>

<style scoped>
.a2ui-list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  gap: 8px;
}

.a2ui-list--vertical {
  flex-direction: column;
}

.a2ui-list--horizontal {
  flex-direction: row;
}

.a2ui-list-item {
  display: block;
}
</style>
