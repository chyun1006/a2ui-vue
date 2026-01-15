<script setup>
import { ref, computed, watch, inject } from 'vue'
import { useDataBinding } from '../../../composables/useDataBinding.js'
import { getGlobalManager } from '../../../core/singleton.js'
import { Label } from '@/components/ui/label'
import { cn } from '../../../core/utils.js'

const formatDate = (date) => {
  if (!date) return ''
  return new Intl.DateTimeFormat('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  }).format(date)
}

/**
 * @component A2UIDateTimeInput
 * @description 日期/时间输入组件
 * @param {Object} label - 数据绑定对象，包含标签文本
 * @param {Object} value - 数据绑定对象，包含当前日期/时间
 * @param {boolean} [includeTime=false] - 是否包含时间选择（暂未完全支持）
 * @emits {string} change - 值变化时发出 ISO 字符串
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
  includeTime: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['change'])

const surface = inject('a2ui-surface')
const { resolveValue, getPath } = useDataBinding()

const labelText = computed(() => resolveValue(props.label) || '')
const initialValue = computed(() => {
  const v = resolveValue(props.value)
  return v ? new Date(v) : undefined
})

const date = ref(initialValue.value)

watch(initialValue, (newVal) => {
  date.value = newVal
})

const updateDataModel = (newDate) => {
  date.value = newDate
  const path = getPath(props.value)
  if (!path) return

  const isoString = newDate ? newDate.toISOString() : null

  if (!surface?.value) {
    console.warn('[DateTimeInput.updateDataModel] surface is missing')
    return
  }

  const surfaceId = surface.value.id
  if (!surfaceId) {
    console.warn('[DateTimeInput.updateDataModel] surfaceId is missing')
    return
  }

  try {
    const processor = getGlobalManager()
    if (processor && typeof processor.updateData === 'function') {
      processor.updateData(surfaceId, path, isoString)
      console.log(
        '[DateTimeInput.updateDataModel] Updated via processor:',
        surfaceId,
        path,
        '=',
        isoString,
      )
    } else {
      console.error('[DateTimeInput.updateDataModel] processor.updateData not available')
    }
  } catch (error) {
    console.error('[DateTimeInput.updateDataModel] Error:', error)
  }

  emit('change', isoString)
}
</script>

<template>
  <div class="space-y-2 flex flex-col">
    <Label v-if="labelText" class="text-xs font-semibold text-slate-500 ml-1">{{
      labelText
    }}</Label>
    <div class="relative w-[280px]">
      <input
        type="date"
        :value="date ? date.toISOString().split('T')[0] : ''"
        @input="(e) => updateDataModel(e.target.value ? new Date(e.target.value) : null)"
        class="flex w-full bg-slate-100 rounded-md border border-transparent focus:border-blue-200 focus:bg-white text-slate-800 placeholder:text-slate-400 text-sm px-4 py-2.5 shadow-none outline-none transition-all h-auto"
      />
    </div>
  </div>
</template>
