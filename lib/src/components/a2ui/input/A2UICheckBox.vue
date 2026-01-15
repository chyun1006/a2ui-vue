<script setup>
import { ref, computed, watch, inject } from 'vue'
import { useDataBinding } from '../../../composables/useDataBinding.js'
import { getGlobalManager } from '../../../core/singleton.js'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'

/**
 * @component A2UICheckBox
 * @description 复选框组件
 * @param {Object} label - 数据绑定对象，包含标签文本
 * @param {Object} [selected=null] - 数据绑定对象，绑定布尔值
 * @emits {boolean} change - 状态变化时发出
 */
const props = defineProps({
  label: {
    type: Object,
    required: true,
  },
  selected: {
    type: Object,
    default: null,
  },
})

const emit = defineEmits(['change'])

const surface = inject('a2ui-surface')
const { resolveValue, getPath } = useDataBinding()

const labelText = computed(() => resolveValue(props.label) || '')
const initialChecked = computed(() => resolveValue(props.selected) || false)

const isChecked = ref(initialChecked.value)

watch(initialChecked, (newVal) => {
  isChecked.value = newVal
})

const updateDataModel = () => {
  const path = getPath(props.selected)
  if (!path) return

  if (!surface?.value) {
    console.warn('[CheckBox.updateDataModel] surface is missing')
    return
  }

  const surfaceId = surface.value.id
  if (!surfaceId) {
    console.warn('[CheckBox.updateDataModel] surfaceId is missing')
    return
  }

  try {
    const processor = getGlobalManager()
    if (processor && typeof processor.updateData === 'function') {
      processor.updateData(surfaceId, path, isChecked.value)
      console.log(
        '[CheckBox.updateDataModel] Updated via processor:',
        surfaceId,
        path,
        '=',
        isChecked.value,
      )
    } else {
      console.error('[CheckBox.updateDataModel] processor.updateData not available')
    }
  } catch (error) {
    console.error('[CheckBox.updateDataModel] Error:', error)
  }
  emit('change', isChecked.value)
}

const handleCheckedChange = (checked) => {
  isChecked.value = checked
  updateDataModel()
}
</script>

<template>
  <div class="flex items-center space-x-2">
    <Checkbox
      :id="'checkbox-' + $.uid"
      :checked="isChecked"
      @update:checked="handleCheckedChange"
    />
    <Label :for="'checkbox-' + $.uid">{{ labelText }}</Label>
  </div>
</template>
