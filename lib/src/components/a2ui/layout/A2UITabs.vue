<script setup>
import { computed, inject } from 'vue'
import { useDataBinding } from '../../../composables/useDataBinding.js'
import A2UIRenderer from '../../A2UIRenderer.vue'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

/**
 * @component A2UITabs
 * @description 标签页界面组件，用于在多个内容面板之间切换
 * @param {Array} tabItems - 标签对象数组，每个对象包含 title（数据绑定）和 child（组件 ID）
 * @emits {Object} action - 子组件触发动作时发出
 */
const props = defineProps({
  tabItems: {
    type: Array,
    required: true,
  },
})

const emit = defineEmits(['action'])

const surfaceId = inject('a2ui-surface-id')
const { resolveValue } = useDataBinding(surfaceId.value)

const tabs = computed(() => {
  return props.tabItems.map((item, index) => ({
    id: `tab-${index}`,
    title: resolveValue(item.title),
    child: item.child,
  }))
})

const handleAction = (actionData) => {
  emit('action', actionData)
}
</script>

<template>
  <Tabs :default-value="tabs[0]?.id" class="w-full">
    <TabsList>
      <TabsTrigger v-for="tab in tabs" :key="tab.id" :value="tab.id">
        {{ tab.title }}
      </TabsTrigger>
    </TabsList>
    <TabsContent v-for="tab in tabs" :key="tab.id" :value="tab.id">
      <A2UIRenderer :component-id="tab.child" @action="handleAction" />
    </TabsContent>
  </Tabs>
</template>
