<script setup>
import { onMounted } from 'vue'
import { a2uiRender, createSignalA2uiMessageProcessor } from '../index.js'
// import mockMessages from '../mock/messages.json'
import allComponentMessages from '../mock/all-components-demo.json'

const processor = createSignalA2uiMessageProcessor({
  enableLogging: true,
  validateMessages: true,
  onError: (error) => {
    console.error('A2UI Error:', error)
  },
})

onMounted(() => {
  console.log('Loading mock messages with v3 architecture...')
  processor(allComponentMessages)
})

const handleAction = async (payload) => {
  console.log('Action received:', payload)

  alert(`Action: ${payload.name}\nContext: ${JSON.stringify(payload.context, null, 2)}`)

  // 模拟发送消息到服务器
  // const response = await fetch('/api/send', {
  //   method: 'POST',
  //   headers: { 'Content-Type': 'application/json' },
  //   body: JSON.stringify(payload)
  // })
  // const message = await response.json()
  // processor(message)
}
</script>

<template>
  <div class="demo-container">
    <div class="demo-header">
      <h1>🚀 A2UI v3 渲染器演示</h1>
      <p>极简 API - 零配置 - 开箱即用</p>
      <div class="demo-features">
        <span class="feature">✅ 单例模式</span>
        <span class="feature">✅ 零依赖</span>
        <span class="feature">✅ 极简 API</span>
      </div>
    </div>

    <div class="demo-content">
      <a2uiRender @action="handleAction" />
    </div>

    <div class="demo-footer">
      <div class="code-example">
        <h3>📝 使用示例</h3>
        <pre><code>import { a2uiRender, createSignalA2uiMessageProcessor } from '@a2ui/renderer'

const processor = createSignalA2uiMessageProcessor()

// 处理消息
processor(message)

// 渲染组件
&lt;a2uiRender @action="handleAction" /&gt;</code></pre>
      </div>
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
  margin: 0 0 24px 0;
}

.demo-features {
  display: flex;
  gap: 16px;
  justify-content: center;
  flex-wrap: wrap;
}

.feature {
  background: rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(10px);
  padding: 8px 16px;
  border-radius: 20px;
  font-size: 0.875rem;
  font-weight: 500;
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
  max-width: 800px;
  margin: 32px auto 0;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border-radius: 12px;
  padding: 24px;
  color: white;
}

.code-example h3 {
  margin: 0 0 16px 0;
  font-size: 1.25rem;
}

.code-example pre {
  background: rgba(0, 0, 0, 0.3);
  padding: 16px;
  border-radius: 8px;
  overflow-x: auto;
  margin: 0;
}

.code-example code {
  font-family: 'Monaco', 'Menlo', 'Courier New', monospace;
  font-size: 0.875rem;
  line-height: 1.6;
  color: #e0e0e0;
}
</style>
