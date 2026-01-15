<script setup>
import { ref, computed, watch, inject } from 'vue'
import { useDataBinding } from '../../../composables/useDataBinding.js'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'

/**
 * @component A2UITextField
 * @description 文本输入组件，支持多种输入类型和验证
 * @param {Object} label - 数据绑定对象，包含输入框标签文本
 * @param {Object} [text=null] - 数据绑定对象，包含初始值和当前输入值
 * @param {string} [textFieldType='shortText'] - 输入类型：date, longText, number, shortText 或 obscured
 * @param {string} [validationRegexp=null] - 输入验证的正则表达式模式
 * @emits {string} change - 输入值变化时发出，带有新值
 */
const props = defineProps({
  label: {
    type: Object,
    required: true,
  },
  text: {
    type: Object,
    default: null,
  },
  textFieldType: {
    type: String,
    default: 'shortText',
    validator: (value) => ['date', 'longText', 'number', 'shortText', 'obscured'].includes(value),
  },
  validationRegexp: {
    type: String,
    default: null,
  },
})

const emit = defineEmits(['change'])

const surfaceId = inject('a2ui-surface-id')
const manager = inject('a2ui-manager')

console.log('[TextField] Component created')
console.log('[TextField] surfaceId:', surfaceId?.value)
console.log('[TextField] manager:', manager)
console.log('[TextField] props.text:', props.text)
console.log('[TextField] props.textFieldType:', props.textFieldType)

const { resolveValue, getPath } = useDataBinding(surfaceId.value)

const labelText = computed(() => resolveValue(props.label) || '')
const initialValue = computed(() => resolveValue(props.text) || '')

const inputValue = ref(initialValue.value)
const isComposing = ref(false)

watch(initialValue, (newVal) => {
  inputValue.value = newVal
})

const inputType = computed(() => {
  const typeMap = {
    date: 'date',
    number: 'number',
    shortText: 'text',
    obscured: 'password',
    longText: 'text',
  }
  return typeMap[props.textFieldType] || 'text'
})

const isTextarea = computed(() => props.textFieldType === 'longText')

const validationPattern = computed(() => {
  if (props.validationRegexp) {
    try {
      return new RegExp(props.validationRegexp)
    } catch (error) {
      console.error('Invalid validation regexp:', error)
      return null
    }
  }
  return null
})

const isValid = computed(() => {
  if (!validationPattern.value) return true
  return validationPattern.value.test(inputValue.value)
})

const handleCompositionStart = () => {
  isComposing.value = true
}

const handleCompositionEnd = () => {
  isComposing.value = false
  updateDataModel()
}

const handleInput = (event) => {
  console.log('[TextField.handleInput] Event triggered', event)
  console.log('[TextField.handleInput] isComposing:', isComposing.value)
  console.log('[TextField.handleInput] inputValue:', inputValue.value)

  if (!isComposing.value) {
    updateDataModel()
  } else {
    console.log('[TextField.handleInput] Skipped due to composition')
  }
}

const updateDataModel = () => {
  const path = getPath(props.text)

  if (path && manager) {
    manager.updateData(surfaceId.value, path, inputValue.value)
  } else {
    console.warn('[TextField.updateDataModel] Skipped: path or manager is missing')
  }
  emit('change', inputValue.value)
}
</script>

<template>
  <div class="space-y-2">
    <Label v-if="labelText">
      {{ labelText }}
    </Label>
    <Textarea
      v-if="isTextarea"
      v-model="inputValue"
      :class="{ 'border-destructive': !isValid }"
      rows="4"
      @input="handleInput"
      @compositionstart="handleCompositionStart"
      @compositionend="handleCompositionEnd"
    />
    <Input
      v-else
      v-model="inputValue"
      :type="inputType"
      :class="{ 'border-destructive': !isValid }"
      v-bind="$attrs"
      @input="handleInput"
      @compositionstart="handleCompositionStart"
      @compositionend="handleCompositionEnd"
    />
    <p v-if="!isValid" class="text-sm text-destructive font-medium">Invalid input</p>
  </div>
</template>
