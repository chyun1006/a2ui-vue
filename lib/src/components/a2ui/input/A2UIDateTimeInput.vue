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
  placeholder: {
    type: String,
    default: '请选择日期',
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

// 始终返回正确的日期/时间类型，不随焦点变化
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

// 简单的焦点处理逻辑
const handleFocus = () => {}
const handleBlur = () => {}
</script>

<template>
  <div class="a2ui-datetime-input">
    <div class="input-wrapper">
      <input
        v-model="inputValue"
        :type="inputType"
        class="a2ui-datetime-input-field"
        @change="handleChange"
        @focus="handleFocus"
        @blur="handleBlur"
      />
      <!-- 使用绝对定位的 overlay 模拟 placeholder -->
      <!-- pointer-events-none 确保点击能穿透到 input 上 -->
      <span v-if="!inputValue" class="placeholder-overlay">
        {{ placeholder }}
      </span>
    </div>
  </div>
</template>

<style scoped>
.a2ui-datetime-input {
  display: inline-block;
  width: 100%; /* 移动端让它占满容器宽度 */
}

/* 包装器用于定位 placeholder */
.input-wrapper {
  position: relative;
  width: 100%;
}

.a2ui-datetime-input-field {
  padding: 8px 12px;
  /* 右侧留出空间给原生下拉箭头,防止太靠边 */
  padding-right: 30px;
  border: 1px solid #ccc;
  border-radius: 4px;
  font-size: 0.875rem;
  font-family: inherit;
  transition: border-color 0.2s;
  min-width: 200px;
  width: 100%;
  box-sizing: border-box;

  /* 确保 input 背景透明或白色,这里为了显示placeholder需要特定处理 */
  /* 如果不需要点击input区域显示 native picker (iOS会自动处理), 我们可以保持白色背景 */
  /* 但是为了显示下面的文字,我们需要背景透明? 不, 文字在上面的话不需要 */
  background-color: #fff;

  /* 移动端优化: 修复 iOS 下灰色背景和默认圆角/阴影 */
  appearance: none;
  -webkit-appearance: none;
  opacity: 1;
}

.a2ui-datetime-input-field:focus {
  outline: none;
  border-color: var(--primary-color, #1976d2);
  box-shadow: 0 0 0 2px rgba(25, 118, 210, 0.1);
}

/* Placeholder 样式 */
.placeholder-overlay {
  position: absolute;
  left: 13px; /* 与 input padding 对齐 */
  top: 50%;
  transform: translateY(-50%);
  color: #9ca3af; /* 灰色 placeholder */
  font-size: 0.875rem;
  pointer-events: none; /* 让点击穿透到 input */
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 80%;
}

/* Webkit 浏览器(Chrome/Safari)的日期选择图标样式调整 */
.a2ui-datetime-input-field::-webkit-calendar-picker-indicator {
  cursor: pointer;
  /* 确保图标在有背景色的情况下也能看清 */
  opacity: 0.6;
}

.a2ui-datetime-input-field::-webkit-calendar-picker-indicator:hover {
  opacity: 1;
}
</style>
