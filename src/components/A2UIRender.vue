<script setup>
import { computed, onMounted } from 'vue'
import { getGlobalManager } from '../core/singleton.js'
import A2UISurface from './A2UISurface.vue'

const emit = defineEmits(['action'])

const manager = getGlobalManager()

const surfaces = computed(() => {
  // 直接访问 state.surfaces (Map 对象)
  const surfaceMap = manager.state.surfaces
  const surfaceIds = Array.from(surfaceMap.keys())
  console.log('[A2UIRender] Surface Map:', surfaceMap)
  console.log('[A2UIRender] Surface IDs:', surfaceIds)
  return surfaceIds
})

const handleAction = (actionData) => {
  emit('action', actionData)
}

onMounted(() => {
  console.log('[A2UIRender] Mounted, manager:', manager)
  console.log('[A2UIRender] Initial surfaces:', surfaces.value)
})
</script>

<template>
  <div class="a2ui-render">
    <A2UISurface
      v-for="surfaceId in surfaces"
      :key="surfaceId"
      :surface-id="surfaceId"
      :manager="manager"
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
