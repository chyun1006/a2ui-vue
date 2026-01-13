<script setup>
import { onMounted, onUnmounted } from 'vue'
import { createSignalA2uiMessageProcessor, a2uiRender } from 'a2ui-vue'
import demoMessages from '../mock/comprehensive-demo.json'

// 使用全局 manager，确保与 A2UIRender 组件共享同一个 manager
const processor = createSignalA2uiMessageProcessor({ useGlobalManager: true })

onMounted(() => {
  console.log('Loading comprehensive demo messages...')
  // 使用新 API，处理前清空旧的 surfaces
  processor.processMessages(demoMessages, { clearBefore: true })
})

onUnmounted(() => {
  // 组件卸载时销毁 processor
  processor.destroy()
})

const handleAction = (event) => {
  console.log('Action triggered:', event)
}
</script>

<template>
  <div class="min-h-screen bg-background p-8">
    <div class="max-w-6xl mx-auto">
      <a2uiRender @action="handleAction" />
    </div>
  </div>
</template>
