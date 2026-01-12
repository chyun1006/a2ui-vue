<script setup>
import { ref, computed, watch } from 'vue'
import { useDataBinding } from '../../../composables/useDataBinding.js'
import { useDataModelStore } from '../../../stores/dataModelStore.js'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
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

const { resolveValue, getPath } = useDataBinding(props.surfaceId)
const dataModelStore = useDataModelStore()

const labelText = computed(() => resolveValue(props.label) || '')
const initialValue = computed(() => resolveValue(props.text) || '')

const inputValue = ref(initialValue.value)

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

const handleInput = (event) => {
  inputValue.value = event.target.value

  const path = getPath(props.text)
  if (path) {
    dataModelStore.setValue(props.surfaceId, path, inputValue.value)
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
    />
    <Input
      v-else
      v-model="inputValue"
      :type="inputType"
      :class="{ 'border-destructive': !isValid }"
      @input="handleInput"
    />
    <p v-if="!isValid" class="text-sm text-destructive font-medium">Invalid input</p>
  </div>
</template>
