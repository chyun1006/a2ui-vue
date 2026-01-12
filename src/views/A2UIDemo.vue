<script setup>
import { onMounted } from 'vue'
import { useA2UIMessage } from '../composables/useA2UIMessage.js'
import A2UISurface from '../components/A2UISurface.vue'
import mockMessages from '../mock/messages.json'

const { processMessages } = useA2UIMessage()

onMounted(() => {
  console.log('Loading mock messages...')
  processMessages(mockMessages)
})

const handleAction = (actionData) => {
  console.log('Action received:', actionData)
  alert(`Action: ${actionData.name}\nContext: ${JSON.stringify(actionData.context, null, 2)}`)
}
</script>

<template>
  <div class="demo-container">
    <div class="demo-header">
      <h1>A2UI 渲染器演示</h1>
      <p>这是一个基于 Vue 3 和 JavaScript 的 A2UI 渲染器实现</p>
    </div>

    <div class="demo-content">
      <A2UISurface surface-id="demo-surface" @action="handleAction" />
    </div>

    <div class="demo-footer">
      <p>查看控制台以了解更多信息</p>
    </div>
  </div>
</template>

<style scoped>
.demo-container {
  min-height: 100vh;
  padding: 24px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.demo-header {
  text-align: center;
  color: white;
  margin-bottom: 32px;
}

.demo-header h1 {
  font-size: 2.5rem;
  font-weight: 700;
  margin: 0 0 16px 0;
}

.demo-header p {
  font-size: 1.125rem;
  opacity: 0.9;
  margin: 0;
}

.demo-content {
  max-width: 800px;
  margin: 0 auto;
  background: white;
  border-radius: 12px;
  padding: 32px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
}

.demo-footer {
  text-align: center;
  color: white;
  margin-top: 32px;
  opacity: 0.8;
}
</style>
