<script setup>
import { ref, onMounted } from 'vue'
import { useA2UIMessage } from '../composables/useA2UIMessage.js'
import A2UISurface from '../components/A2UISurface.vue'
import completeDemoMessages from '../mock/complete-demo.json'

const { processMessages, processMessage } = useA2UIMessage()

const surfaces = ref(['chat-surface'])
const currentMessageIndex = ref(0)
const isPlaying = ref(false)

onMounted(() => {
  console.log('加载完整演示消息...')
  loadInitialMessages()
})

const loadInitialMessages = () => {
  const initialMessages = completeDemoMessages.slice(0, 3)
  processMessages(initialMessages)
  currentMessageIndex.value = 3
}

const playNextMessage = () => {
  if (currentMessageIndex.value >= completeDemoMessages.length) {
    alert('所有消息已播放完毕！')
    isPlaying.value = false
    return
  }

  const message = completeDemoMessages[currentMessageIndex.value]
  console.log(`播放消息 ${currentMessageIndex.value + 1}/${completeDemoMessages.length}:`, message)

  processMessage(message)

  if (message.beginRendering) {
    const surfaceId = message.beginRendering.surfaceId
    if (!surfaces.value.includes(surfaceId)) {
      surfaces.value.push(surfaceId)
    }
  }

  if (message.deleteSurface) {
    const surfaceId = message.deleteSurface.surfaceId
    surfaces.value = surfaces.value.filter((id) => id !== surfaceId)
  }

  currentMessageIndex.value++
}

const autoPlay = () => {
  isPlaying.value = true
  const interval = setInterval(() => {
    if (currentMessageIndex.value >= completeDemoMessages.length) {
      clearInterval(interval)
      isPlaying.value = false
      return
    }
    playNextMessage()
  }, 2000)
}

const reset = () => {
  location.reload()
}

const handleAction = (actionData) => {
  console.log('收到动作:', actionData)

  if (actionData.name === 'delete_surface') {
    const confirmed = confirm('确定要删除当前 Surface 吗？')
    if (confirmed) {
      processMessage({
        deleteSurface: {
          surfaceId: 'chat-surface',
        },
      })
      surfaces.value = surfaces.value.filter((id) => id !== 'chat-surface')
    }
  } else {
    alert(`动作: ${actionData.name}\n上下文: ${JSON.stringify(actionData.context, null, 2)}`)
  }
}
</script>

<template>
  <div class="complete-demo">
    <div class="demo-header">
      <h1>A2UI 完整演示</h1>
      <p>展示所有四种消息类型：beginRendering、surfaceUpdate、dataModelUpdate、deleteSurface</p>

      <div class="controls">
        <button
          @click="playNextMessage"
          :disabled="isPlaying || currentMessageIndex >= completeDemoMessages.length"
          class="btn btn-primary"
        >
          播放下一条消息 ({{ currentMessageIndex }}/{{ completeDemoMessages.length }})
        </button>
        <button
          @click="autoPlay"
          :disabled="isPlaying || currentMessageIndex >= completeDemoMessages.length"
          class="btn btn-secondary"
        >
          自动播放所有
        </button>
        <button @click="reset" class="btn btn-danger">重置</button>
      </div>
    </div>

    <div class="surfaces-container">
      <div v-for="surfaceId in surfaces" :key="surfaceId" class="surface-wrapper">
        <div class="surface-label">Surface ID: {{ surfaceId }}</div>
        <A2UISurface :surface-id="surfaceId" @action="handleAction" />
      </div>

      <div v-if="surfaces.length === 0" class="no-surfaces">
        <p>没有活动的 Surface</p>
        <button @click="reset" class="btn btn-primary">重新加载</button>
      </div>
    </div>

    <div class="demo-info">
      <h3>消息序列说明</h3>
      <ol>
        <li><strong>beginRendering</strong> - 创建主 Surface (chat-surface)</li>
        <li><strong>surfaceUpdate</strong> - 添加所有组件（Tabs、Card、Form 等）</li>
        <li><strong>dataModelUpdate</strong> - 初始化数据模型（个人信息、设置等）</li>
        <li><strong>dataModelUpdate</strong> - 更新单个字段（姓名）</li>
        <li><strong>dataModelUpdate</strong> - 添加新列表项</li>
        <li><strong>surfaceUpdate</strong> - 更新按钮文本</li>
        <li><strong>beginRendering</strong> - 创建第二个 Surface (secondary-surface)</li>
        <li><strong>surfaceUpdate</strong> - 为第二个 Surface 添加组件</li>
        <li><strong>deleteSurface</strong> - 删除第二个 Surface</li>
      </ol>
    </div>
  </div>
</template>

<style scoped>
.complete-demo {
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
  margin: 0 0 24px 0;
}

.controls {
  display: flex;
  gap: 12px;
  justify-content: center;
  flex-wrap: wrap;
}

.btn {
  padding: 12px 24px;
  border: none;
  border-radius: 6px;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-primary {
  background: #2563eb;
  color: white;
}

.btn-primary:hover:not(:disabled) {
  background: #1d4ed8;
  transform: translateY(-1px);
}

.btn-secondary {
  background: #10b981;
  color: white;
}

.btn-secondary:hover:not(:disabled) {
  background: #059669;
  transform: translateY(-1px);
}

.btn-danger {
  background: #ef4444;
  color: white;
}

.btn-danger:hover {
  background: #dc2626;
  transform: translateY(-1px);
}

.surfaces-container {
  max-width: 1200px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(500px, 1fr));
  gap: 24px;
}

.surface-wrapper {
  background: white;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
}

.surface-label {
  font-size: 0.875rem;
  font-weight: 600;
  color: #666;
  margin-bottom: 16px;
  padding-bottom: 8px;
  border-bottom: 2px solid #e5e7eb;
}

.no-surfaces {
  grid-column: 1 / -1;
  text-align: center;
  padding: 64px 24px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
}

.no-surfaces p {
  font-size: 1.25rem;
  color: #666;
  margin-bottom: 24px;
}

.demo-info {
  max-width: 800px;
  margin: 32px auto 0;
  background: white;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
}

.demo-info h3 {
  margin-top: 0;
  color: #333;
}

.demo-info ol {
  line-height: 1.8;
  color: #666;
}

.demo-info li {
  margin-bottom: 8px;
}

.demo-info strong {
  color: #2563eb;
  font-weight: 600;
}
</style>
