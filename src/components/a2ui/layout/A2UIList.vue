<script setup>
import { computed } from 'vue'
import { FLEX_ALIGN_ITEMS_MAP } from '../../../types/components.js'
import A2UIRenderer from '../../A2UIRenderer.vue'

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

const alignItems = computed(() => FLEX_ALIGN_ITEMS_MAP[props.alignment] || 'flex-start')

const childrenList = computed(() => {
  const { children = {} } = props

  if (children.explicitList) {
    return children.explicitList
  }

  if (children.template) {
    const { componentId, dataBinding } = children.template
    const data = props.manager.getData(props.surfaceId, dataBinding)

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
  <ul :class="['a2ui-list', `a2ui-list--${direction}`]" :style="{ alignItems }">
    <li
      v-for="(childId, index) in childrenList"
      :key="typeof childId === 'string' ? childId : childId.id"
      class="a2ui-list-item"
    >
      <A2UIRenderer
        :surface-id="surfaceId"
        :component-id="typeof childId === 'string' ? childId : childId.componentId"
        :manager="manager"
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
