<script setup>
import { ref, computed, watch } from 'vue'
import { useDataBinding } from '../../../composables/useDataBinding.js'
import { useDataModelStore } from '../../../stores/dataModelStore.js'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
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
  selections: {
    type: Object,
    required: true,
  },
  options: {
    type: Array,
    required: true,
  },
  maxAllowedSelections: {
    type: Number,
    default: null,
  },
})

const emit = defineEmits(['change'])

const { resolveValue, getPath } = useDataBinding(props.surfaceId)
const dataModelStore = useDataModelStore()

const initialSelections = computed(() => resolveValue(props.selections) || [])

const selectedValues = ref([...initialSelections.value])

watch(initialSelections, (newVal) => {
  selectedValues.value = [...newVal]
})

const optionsList = computed(() => {
  return props.options.map((option) => ({
    label: resolveValue(option.label),
    value: option.value,
  }))
})

const isSingleChoice = computed(() => props.maxAllowedSelections === 1)

const isSelected = (value) => {
  return selectedValues.value.includes(value)
}

const canSelect = computed(() => {
  if (!props.maxAllowedSelections) return true
  return selectedValues.value.length < props.maxAllowedSelections
})

// Radio 单选处理
const radioValue = computed({
  get: () => selectedValues.value[0] || '',
  set: (value) => {
    selectedValues.value = [value]
    updateDataModel()
  },
})

// Checkbox 多选处理
const toggleCheckbox = (value, checked) => {
  if (checked) {
    if (canSelect.value) {
      selectedValues.value.push(value)
    }
  } else {
    const index = selectedValues.value.indexOf(value)
    if (index > -1) {
      selectedValues.value.splice(index, 1)
    }
  }
  updateDataModel()
}

const updateDataModel = () => {
  const path = getPath(props.selections)
  if (path) {
    dataModelStore.setValue(props.surfaceId, path, selectedValues.value)
  }
  emit('change', selectedValues.value)
}
</script>

<template>
  <div class="space-y-3">
    <!-- 单选模式 -->
    <RadioGroup v-if="isSingleChoice" v-model="radioValue">
      <div v-for="option in optionsList" :key="option.value" class="flex items-center space-x-2">
        <RadioGroupItem :id="`${componentId}-${option.value}`" :value="option.value" />
        <Label :for="`${componentId}-${option.value}`">{{ option.label }}</Label>
      </div>
    </RadioGroup>

    <!-- 多选模式 -->
    <div v-else class="space-y-2">
      <div v-for="option in optionsList" :key="option.value" class="flex items-center space-x-2">
        <Checkbox
          :id="`${componentId}-${option.value}`"
          :checked="isSelected(option.value)"
          :disabled="!canSelect && !isSelected(option.value)"
          @update:checked="(checked) => toggleCheckbox(option.value, checked)"
        />
        <Label
          :for="`${componentId}-${option.value}`"
          :class="{ 'opacity-50': !canSelect && !isSelected(option.value) }"
        >
          {{ option.label }}
        </Label>
      </div>
    </div>
  </div>
</template>
