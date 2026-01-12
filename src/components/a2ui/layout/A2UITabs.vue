<script setup>
import { computed } from 'vue'
import { useDataBinding } from '../../../composables/useDataBinding.js'
import A2UIRenderer from '../../A2UIRenderer.vue'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

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
  tabItems: {
    type: Array,
    required: true,
  },
})

const emit = defineEmits(['action'])

const { resolveValue } = useDataBinding(props.surfaceId)

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
      <A2UIRenderer
        :surface-id="surfaceId"
        :component-id="tab.child"
        :manager="manager"
        @action="handleAction"
      />
    </TabsContent>
  </Tabs>
</template>
