<script setup>
import { ref, computed, watch } from 'vue'
import { useDataBinding } from '../../../composables/useDataBinding.js'
import { useDataModelStore } from '../../../stores/dataModelStore.js'
import { Slider } from '@/components/ui/slider'
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
    default: null,
  },
  value: {
    type: Object,
    required: true,
  },
  min: {
    type: Number,
    default: 0,
  },
  max: {
    type: Number,
    default: 100,
  },
  step: {
    type: Number,
    default: 1,
  },
})

const emit = defineEmits(['change'])

const { resolveValue, getPath } = useDataBinding(props.surfaceId)
const dataModelStore = useDataModelStore()

const labelText = computed(() => (props.label ? resolveValue(props.label) : null))
const initialValue = computed(() => resolveValue(props.value) || props.min)

const sliderValue = ref([initialValue.value])

watch(initialValue, (newVal) => {
  sliderValue.value = [newVal]
})

const handleChange = (value) => {
  sliderValue.value = value

  const path = getPath(props.value)
  if (path) {
    dataModelStore.setValue(props.surfaceId, path, value[0])
  }

  emit('change', value[0])
}
</script>

<template>
  <div class="space-y-2">
    <div v-if="labelText" class="flex items-center justify-between">
      <Label>{{ labelText }}</Label>
      <span class="text-sm text-muted-foreground">{{ sliderValue[0] }}</span>
    </div>
    <Slider
      :model-value="sliderValue"
      :min="min"
      :max="max"
      :step="step"
      @update:model-value="handleChange"
    />
  </div>
</template>
