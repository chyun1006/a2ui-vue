<script setup>
import { ref, computed, watch } from 'vue'
import { useDataBinding } from '../../../composables/useDataBinding.js'
import { useDataModelStore } from '../../../stores/dataModelStore.js'

const props = defineProps({
  surfaceId: {
    type: String,
    required: true,
  },
  componentId: {
    type: String,
    required: true,
  },
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

const { resolveValue, getPath } = useDataBinding(props.surfaceId)
const dataModelStore = useDataModelStore()

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
  if (path) {
    dataModelStore.setValue(props.surfaceId, path, inputValue.value)
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
