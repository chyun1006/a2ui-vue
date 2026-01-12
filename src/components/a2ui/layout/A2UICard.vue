<script setup>
import A2UIRenderer from '../../A2UIRenderer.vue'
import { Card, CardContent } from '@/components/ui/card'

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
      <A2UIRenderer
        :surface-id="surfaceId"
        :component-id="child"
        :manager="manager"
        @action="handleAction"
      />
    </CardContent>
  </Card>
</template>
