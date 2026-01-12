<script setup>
import { computed } from 'vue'
import { FLEX_JUSTIFY_CONTENT_MAP, FLEX_ALIGN_ITEMS_MAP } from '../../../types/components.js'
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

const justifyContent = computed(() => FLEX_JUSTIFY_CONTENT_MAP[props.distribution] || 'flex-start')
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
  <div
    class="a2ui-column"
    :style="{
      justifyContent,
      alignItems,
    }"
  >
    <template v-if="children.explicitList">
      <A2UIRenderer
        v-for="childId in childrenList"
        :key="childId"
        :surface-id="surfaceId"
        :component-id="childId"
        :manager="manager"
        @action="handleAction"
      />
    </template>
    <template v-else-if="children.template">
      <A2UIRenderer
        v-for="item in childrenList"
        :key="item.id"
        :surface-id="surfaceId"
        :component-id="item.componentId"
        :manager="manager"
        @action="handleAction"
      />
    </template>
  </div>
</template>

<style scoped>
.a2ui-column {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
</style>
