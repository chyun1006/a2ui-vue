<script setup>
import { ref, computed, watch, inject } from 'vue'
import { useDataBinding } from '../../../composables/useDataBinding.js'

/**
 * @component A2UIDateTimeInput
 * @description 日期时间输入组件，支持配置日期/时间模式
 * @param {Object} value - 数据绑定对象，包含当前日期时间值
 * @param {boolean} [enableDate=true] - 是否启用日期选择
 * @param {boolean} [enableTime=false] - 是否启用时间选择
 * @emits {string} change - 日期时间值变化时发出，带有新值
 */
const props = defineProps({
  value: {
    type: Object,
    required: true,
  },
  enableDate: {
    type: Boolean,
    default: true,
  },
  enableTime: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['change'])

const surfaceId = inject('a2ui-surface-id')
const manager = inject('a2ui-manager')
const { resolveValue, getPath } = useDataBinding(surfaceId.value)

const initialValue = computed(() => resolveValue(props.value) || '')

const inputValue = ref(initialValue.value)

watch(initialValue, (newVal) => {
  inputValue.value = newVal
})

const inputType = computed(() => {
  if (props.enableDate && props.enableTime) {
    return 'datetime-local'
  } else if (props.enableDate) {
    return 'date'
  } else if (props.enableTime) {
    return 'time'
  }
  return 'date'
})

const handleChange = (event) => {
  inputValue.value = event.target.value

  const path = getPath(props.value)
  if (path && manager) {
    manager.updateData(surfaceId.value, path, inputValue.value)
  }

  emit('change', inputValue.value)
}
</script>

<template>
  <div class="a2ui-datetime-input">
    <input
      v-model="inputValue"
      :type="inputType"
      class="a2ui-datetime-input-field"
      @change="handleChange"
    />
  </div>
</template>

<style scoped>
.a2ui-datetime-input {
  display: inline-block;
}

.a2ui-datetime-input-field {
  padding: 8px 12px;
  border: 1px solid #ccc;
  border-radius: 4px;
  font-size: 0.875rem;
  font-family: inherit;
  transition: border-color 0.2s;
  min-width: 200px;
}

.a2ui-datetime-input-field:focus {
  outline: none;
  border-color: var(--primary-color, #1976d2);
  box-shadow: 0 0 0 2px rgba(25, 118, 210, 0.1);
}
</style>
