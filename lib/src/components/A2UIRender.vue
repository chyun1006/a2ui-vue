<script setup>
import { computed } from 'vue'
import A2UISurface from './A2UISurface.vue'

// Props
const props = defineProps({
  surfaceList: {
    type: Array,
    default: () => [],
  },
})

const emit = defineEmits(['action'])

// 直接使用surfaceList，不再依赖全局manager
const surfaces = computed(() => props.surfaceList || [])

const handleAction = (actionData) => {
  emit('action', actionData)
}
</script>

<template>
  <div class="a2ui-render">
    <A2UISurface
      v-for="surface in surfaces"
      :key="surface.id"
      :surface="surface"
      @action="handleAction"
    />
  </div>
</template>

<style scoped>
.a2ui-render {
  width: 100%;
  height: 100%;
}
</style>
