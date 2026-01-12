<script setup>
import { computed } from 'vue'
import { useDataBinding } from '../../../composables/useDataBinding.js'

const props = defineProps({
  surfaceId: {
    type: String,
    required: true,
  },
  componentId: {
    type: String,
    required: true,
  },
  name: {
    type: Object,
    required: true,
  },
})

const { resolveValue } = useDataBinding(props.surfaceId)

const iconName = computed(() => resolveValue(props.name) || '')

const materialIconName = computed(() => {
  const name = iconName.value
  return name
    .replace(/([A-Z])/g, '_$1')
    .toLowerCase()
    .replace(/^_/, '')
})
</script>

<template>
  <span v-if="iconName" class="a2ui-icon material-icons" :aria-label="iconName">
    {{ materialIconName }}
  </span>
  <span v-else class="a2ui-icon-placeholder">?</span>
</template>

<style scoped>
.a2ui-icon {
  font-size: 24px;
  width: 24px;
  height: 24px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  vertical-align: middle;
  user-select: none;
}

.a2ui-icon-placeholder {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  background: #f0f0f0;
  color: #999;
  border-radius: 50%;
  font-size: 14px;
}
</style>
