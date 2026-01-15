<script setup>
import { ref, computed, watch, inject } from 'vue'
import { useDataBinding } from '../../../composables/useDataBinding.js'
import { getGlobalManager } from '../../../core/singleton.js'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import { Label } from '@/components/ui/label'
import { cn } from '../../../core/utils.js'
import { Calendar as CalendarIcon } from 'lucide-vue-next'

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
    <Label v-if="labelText">{{ labelText }}</Label>
    <Popover>
      <PopoverTrigger as-child>
        <Button
          variant="outline"
          :class="
            cn('w-[280px] justify-start text-left font-normal', !date && 'text-muted-foreground')
          "
        >
          <CalendarIcon class="mr-2 h-4 w-4" />
          <span>{{ date ? formatDate(date) : 'Pick a date' }}</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent class="w-auto p-0">
        <Calendar
          v-model="date"
          mode="single"
          initial-focus
          @update:model-value="updateDataModel"
        />
      </PopoverContent>
    </Popover>
  </div>
</template>
