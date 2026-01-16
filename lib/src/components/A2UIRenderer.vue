<script setup>
import { computed, defineAsyncComponent, inject } from 'vue'
import { getComponentType, getComponentProps } from '../core/validator.js'
import { COMPONENT_MAP } from '../types/components.js'

const props = defineProps({
  componentId: {
    type: String,
    required: true,
  },
})

const emit = defineEmits(['action'])

// 从 A2UIProvider 注入 surface 对象
const surface = inject('a2ui-surface')

const componentDef = computed(() => {
  if (!surface?.value) {
    console.error('A2UIRenderer: surface is undefined', {
      componentId: props.componentId,
    })
    return null
  }
  // @a2ui/lit 的 surface 对象中，components 是一个 Map
  return surface.value.components?.get(props.componentId) || null
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

  const type = componentType.value
  const chartComponents = ['PieChart', 'BarChart', 'LineChart', 'StackedChart', 'ScatterChart']

  // 图表组件需要特殊处理，因为它们在 display/charts 子目录中
  if (chartComponents.includes(type)) {
    return defineAsyncComponent(() =>
      import(`./a2ui/display/charts/${name}.vue`).catch((err) => {
        console.error(`Failed to load chart component: ${name}`, err)
        return null
      }),
    )
  }

  // 其他组件使用原有逻辑
  const categoryPath = getCategoryPath(type)
  return defineAsyncComponent(() =>
    import(`./a2ui/${categoryPath}/${name}.vue`).catch((err) => {
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
  const chartComponents = ['PieChart', 'BarChart', 'LineChart', 'StackedChart', 'ScatterChart']

  if (displayComponents.includes(type)) return 'display'
  if (layoutComponents.includes(type)) return 'layout'
  if (inputComponents.includes(type)) return 'input'
  if (chartComponents.includes(type)) return 'display/charts'

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
    :component-id="componentId"
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
