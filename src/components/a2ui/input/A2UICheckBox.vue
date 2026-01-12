<script setup>
import { ref, computed, watch } from 'vue'
import { useDataBinding } from '../../../composables/useDataBinding.js'
import { useDataModelStore } from '../../../stores/dataModelStore.js'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'

const props = defineProps({
  surfaceId: {
    type: String,
    required: true,
  },
  componentId: {
    type: String,
    required: true,
  },
  label: {
    type: Object,
    required: true,
  },
  value: {
    type: Object,
    required: true,
  },
})

const emit = defineEmits(['change'])

const { resolveValue, getPath } = useDataBinding(props.surfaceId)
const dataModelStore = useDataModelStore()

const labelText = computed(() => resolveValue(props.label) || '')
const initialChecked = computed(() => resolveValue(props.value) || false)

const isChecked = ref(initialChecked.value)

watch(initialChecked, (newVal) => {
  isChecked.value = newVal
})

const handleChange = (checked) => {
  isChecked.value = checked

  const path = getPath(props.value)
  if (path) {
    dataModelStore.setValue(props.surfaceId, path, isChecked.value)
  }

  emit('change', isChecked.value)
}
</script>

<template>
  <div class="flex items-center space-x-2">
    <Checkbox :id="componentId" :checked="isChecked" @update:checked="handleChange" />
    <Label
      :for="componentId"
      class="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
    >
      {{ labelText }}
    </Label>
  </div>
</template>
