<script setup>
import { ref, computed, watch, inject } from 'vue'
import { useDataBinding } from '../../../composables/useDataBinding.js'
import { getGlobalManager } from '../../../core/singleton.js'
import { Slider } from '@/components/ui/slider'
import { Label } from '@/components/ui/label'

/**
 * @component A2UISlider
 * @description 滑块输入组件
 * @param {Object} label - 数据绑定对象，包含标签文本
 * @param {Object} value - 数据绑定对象，包含当前值
 * @param {number} [min=0] - 最小值
 * @param {number} [max=100] - 最大值
 * @param {number} [step=1] - 步长
 * @emits {number} change - 值变化时发出
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

const surface = inject('a2ui-surface')
const { resolveValue, getPath } = useDataBinding()

const labelText = computed(() => resolveValue(props.label) || '')
const initialValue = computed(() => {
  const v = resolveValue(props.value)
  return typeof v === 'number' ? v : props.min
})

const sliderValue = ref([initialValue.value])

watch(initialValue, (newVal) => {
  sliderValue.value = [newVal]
})

const updateDataModel = (newValue) => {
  const val = newValue[0]
  const path = getPath(props.value)
  if (!path) return

  if (!surface?.value) {
    console.warn('[Slider.updateDataModel] surface is missing')
    return
  }

  const surfaceId = surface.value.id
  if (!surfaceId) {
    console.warn('[Slider.updateDataModel] surfaceId is missing')
    return
  }

  try {
    const processor = getGlobalManager()
    if (processor && typeof processor.updateData === 'function') {
      processor.updateData(surfaceId, path, val)
      console.log('[Slider.updateDataModel] Updated via processor:', surfaceId, path, '=', val)
    } else {
      console.error('[Slider.updateDataModel] processor.updateData not available')
    }
  } catch (error) {
    console.error('[Slider.updateDataModel] Error:', error)
  }

  emit('change', val)
}
</script>

<template>
  <div class="space-y-4">
    <div class="flex justify-between">
      <Label>{{ labelText }}</Label>
      <span class="text-sm text-muted-foreground">{{ sliderValue[0] }}</span>
    </div>
    <Slider
      v-model="sliderValue"
      :min="min"
      :max="max"
      :step="step"
      @update:model-value="updateDataModel"
    />
  </div>
</template>
