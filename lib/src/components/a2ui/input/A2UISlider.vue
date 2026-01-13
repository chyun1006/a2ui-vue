<script setup>
import { ref, computed, watch, inject } from 'vue'
import { useDataBinding } from '../../../composables/useDataBinding.js'
import { Slider } from '@/components/ui/slider'
import { Label } from '@/components/ui/label'

/**
 * @component A2UISlider
 * @description 滑块输入组件，用于在范围内选择数值
 * @param {Object} [label=null] - 数据绑定对象，包含滑块标签文本
 * @param {Object} value - 数据绑定对象，包含当前滑块值
 * @param {number} [min=0] - 滑块最小值
 * @param {number} [max=100] - 滑块最大值
 * @param {number} [step=1] - 滑块步长
 * @emits {number} change - 滑块值变化时发出，带有新值
 */
const props = defineProps({
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

const surfaceId = inject('a2ui-surface-id')
const manager = inject('a2ui-manager')
const { resolveValue, getPath } = useDataBinding(surfaceId.value)

const labelText = computed(() => (props.label ? resolveValue(props.label) : null))
const initialValue = computed(() => resolveValue(props.value) || props.min)

const sliderValue = ref([initialValue.value])

watch(initialValue, (newVal) => {
  sliderValue.value = [newVal]
})

const handleChange = (value) => {
  sliderValue.value = value

  const path = getPath(props.value)
  if (path && manager) {
    manager.updateData(surfaceId.value, path, sliderValue.value[0])
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
