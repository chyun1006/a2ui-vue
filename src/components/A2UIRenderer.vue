<script setup>
import { computed, defineAsyncComponent } from 'vue'
import { getComponentType, getComponentProps } from '../utils/validator.js'
import { COMPONENT_MAP } from '../types/components.js'

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
})

const emit = defineEmits(['action'])

const componentDef = computed(() => {
  if (!props.manager) {
    console.error('A2UIRenderer: manager is undefined', {
      surfaceId: props.surfaceId,
      componentId: props.componentId,
    })
    return null
  }
  const surface = props.manager.getSurface(props.surfaceId)
  return surface?.getComponent(props.componentId)
})

const componentType = computed(() => getComponentType(componentDef.value))

const componentProps = computed(() => getComponentProps(componentDef.value))

const componentName = computed(() => {
  const type = componentType.value
  return type ? COMPONENT_MAP[type] : null
})

const dynamicComponent = computed(() => {
  const name = componentName.value
  if (!name) return null

  return defineAsyncComponent(() =>
    import(`./a2ui/${getCategoryPath(componentType.value)}/${name}.vue`).catch((err) => {
      console.error(`Failed to load component: ${name}`, err)
      return null
    }),
  )
})

function getCategoryPath(type) {
  const displayComponents = ['Text', 'Image', 'Icon', 'Video', 'AudioPlayer']
  const layoutComponents = ['Row', 'Column', 'List', 'Card', 'Tabs', 'Modal', 'Divider']
  const inputComponents = [
    'Button',
    'TextField',
    'CheckBox',
    'DateTimeInput',
    'MultipleChoice',
    'Slider',
  ]

  if (displayComponents.includes(type)) return 'display'
  if (layoutComponents.includes(type)) return 'layout'
  if (inputComponents.includes(type)) return 'input'

  return 'display'
}

const componentStyle = computed(() => {
  const weight = componentDef.value?.weight
  return weight ? { flexGrow: weight } : {}
})

const handleAction = (actionData) => {
  emit('action', actionData)
}
</script>

<template>
  <component
    :is="dynamicComponent"
    v-if="componentDef && dynamicComponent"
    :surface-id="surfaceId"
    :component-id="componentId"
    :manager="manager"
    v-bind="componentProps"
    :style="componentStyle"
    @action="handleAction"
  />
  <div v-else-if="componentDef" class="a2ui-error">Unknown component: {{ componentType }}</div>
</template>

<style scoped>
.a2ui-error {
  padding: 8px;
  background: #fee;
  border: 1px solid #fcc;
  border-radius: 4px;
  color: #c00;
  font-size: 0.875rem;
}
</style>
