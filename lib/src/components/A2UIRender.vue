<script setup>
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { getGlobalManager } from '../core/singleton.js'
import A2UISurface from './A2UISurface.vue'

const emit = defineEmits(['action'])

const manager = getGlobalManager()

// 记录当前组件创建的 surface IDs（只记录挂载后创建的）
const currentSurfaceIds = ref([])

const surfaces = computed(() => {
  // 只渲染当前组件创建的 surfaces
  return currentSurfaceIds.value.filter((id) => manager.state.surfaces.has(id))
})

const handleAction = (actionData) => {
  emit('action', actionData)
}

// 监听新 surface 的创建
let unsubscribe = null

onMounted(() => {
  console.log('组件挂在了-------[A2UIRender] Mounted')
  console.log(
    '[A2UIRender] Existing surfaces (will be ignored):',
    Array.from(manager.state.surfaces.keys()),
  )

  // 监听新 surface 的创建（只渲染当前组件挂载后创建的 surfaces）
  unsubscribe = manager.on('surface:created', ({ surfaceId }) => {
    if (!currentSurfaceIds.value.includes(surfaceId)) {
      currentSurfaceIds.value.push(surfaceId)
      console.log('[A2UIRender] Surface created and tracked:', surfaceId)
      console.log('[A2UIRender] Current tracked surfaces:', currentSurfaceIds.value)
    }
  })

  console.log('[A2UIRender] Listening for new surfaces...')
})

onUnmounted(() => {
  console.log('[A2UIRender] Unmounting, cleaning up surfaces:', currentSurfaceIds.value)

  // 组件卸载时，清理所有关联的 surfaces
  if (unsubscribe) {
    unsubscribe()
  }

  currentSurfaceIds.value.forEach((surfaceId) => {
    console.log('[A2UIRender] Deleting surface:', surfaceId)
    const deleted = manager.deleteSurface(surfaceId)
    console.log('[A2UIRender] Surface deleted:', surfaceId, 'success:', deleted)
  })

  console.log('[A2UIRender] Surfaces after cleanup:', Array.from(manager.state.surfaces.keys()))
  currentSurfaceIds.value = []

  console.log('[A2UIRender] Unmounted, cleared surfaces')
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
