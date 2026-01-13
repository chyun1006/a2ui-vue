<script setup>
import { ref, computed, watch, inject } from 'vue'
import { useDataBinding } from '../../../composables/useDataBinding.js'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'

/**
 * @component A2UIMultipleChoice
 * @description 多选输入组件，支持单选（单选按钮）或多选（复选框）模式
 * @param {Object} selections - 数据绑定对象，包含已选值的数组
 * @param {Array} options - 选项对象数组，每个对象包含 label（数据绑定）和 value
 * @param {number} [maxAllowedSelections=null] - 允许的最大选择数；设置为 1 时启用单选模式
 * @emits {Array} change - 选择变化时发出，带有已选值的数组
 */
const props = defineProps({
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

const surfaceId = inject('a2ui-surface-id')
const manager = inject('a2ui-manager')
const { resolveValue, getPath } = useDataBinding(surfaceId.value)

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
    manager?.updateData(surfaceId.value, path, selectedValues.value)
  }
  emit('change', selectedValues.value)
}
</script>

<template>
  <div class="space-y-3">
    <!-- 单选模式 -->
    <RadioGroup v-if="isSingleChoice" v-model="radioValue">
      <div v-for="option in optionsList" :key="option.value" class="flex items-center space-x-2">
        <RadioGroupItem :id="option.value" :value="option.value" />
        <Label :for="`${option.value}`">{{ option.label }}</Label>
      </div>
    </RadioGroup>

    <!-- 多选模式 -->
    <div v-else class="space-y-2">
      <div v-for="option in optionsList" :key="option.value" class="flex items-center space-x-2">
        <Checkbox
          :id="option.value"
          :checked="isSelected(option.value)"
          :disabled="!canSelect && !isSelected(option.value)"
          @update:checked="(checked) => toggleCheckbox(option.value, checked)"
        />
        <Label
          :for="option.value"
          :class="{ 'opacity-50': !canSelect && !isSelected(option.value) }"
        >
          {{ option.label }}
        </Label>
      </div>
    </div>
  </div>
</template>
