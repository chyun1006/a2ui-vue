<script setup>
import { ref, computed, watch, inject } from 'vue'
import { useDataBinding } from '../../../composables/useDataBinding.js'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'

/**
 * @component A2UICheckBox
 * @description 复选框输入组件，支持标签
 * @param {Object} label - 数据绑定对象，包含复选框标签文本
 * @param {Object} value - 数据绑定对象，包含选中状态（布尔值）
 * @emits {boolean} change - 复选框状态变化时发出，带有新的选中值
 */
const props = defineProps({
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

const surfaceId = inject('a2ui-surface-id')
const manager = inject('a2ui-manager')
const { resolveValue, getPath } = useDataBinding(surfaceId.value)

const labelText = computed(() => resolveValue(props.label) || '')
const initialChecked = computed(() => resolveValue(props.value) || false)

const isChecked = ref(initialChecked.value)

watch(initialChecked, (newVal) => {
  isChecked.value = newVal
})

const handleChange = () => {
  const path = getPath(props.value)
  if (path && manager) {
    manager.updateData(surfaceId.value, path, isChecked.value)
  }

  emit('change', isChecked.value)
}
</script>

<template>
  <div class="flex items-center space-x-2">
    <Checkbox :id="labelText" :checked="isChecked" @update:checked="handleChange" />
    <Label
      :for="labelText"
      class="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
    >
      {{ labelText }}
    </Label>
  </div>
</template>
