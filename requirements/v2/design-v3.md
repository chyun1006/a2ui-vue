# A2UI v3 架构设计

## 设计目标

基于用户需求，设计一个极简的 API：

```javascript
import { a2uiRender, createSignalA2uiMessageProcessor } from '@a2ui/renderer'

const processor = createSignalA2uiMessageProcessor()
```

```vue
<template>
  <a2uiRender @action="sendMessage" />
</template>

<script setup>
const sendMessage = async (payload) => {
  const message = await fetch('/api/send', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
  processor(message)
}
</script>
```

## 核心架构

### 1. 单例模式的全局管理器

```
createSignalA2uiMessageProcessor()
  ↓
创建全局单例 A2UIManager
  ↓
返回 processor 函数
```

### 2. 组件层级简化

```
a2uiRender (单一入口组件)
  ↓
自动渲染所有 surfaces
  ↓
A2UIRenderer (递归渲染子组件)
```

### 3. 数据流

```
用户操作 → @action 事件 → sendMessage
  ↓
fetch 请求 → 获取 A2UI 消息
  ↓
processor(message) → 更新内部状态
  ↓
自动触发组件重渲染
```

## API 设计

### createSignalA2uiMessageProcessor(options?)

创建消息处理器，返回 processor 函数。

**参数：**

```javascript
{
  enableLogging?: boolean,      // 是否启用日志
  validateMessages?: boolean,   // 是否验证消息格式
  onError?: (error) => void     // 错误回调
}
```

**返回：**

```javascript
processor(message: A2UIMessage | A2UIMessage[])
```

**特性：**

- 单例模式：多次调用返回同一个 processor
- 自动管理内部 A2UIManager 实例
- 支持单个消息或消息数组

### a2uiRender 组件

渲染所有 A2UI surfaces 的容器组件。

**Props：**

```javascript
{
  // 无必需 props
}
```

**Events：**

```javascript
{
  action: (payload) => void  // 用户交互事件
}
```

**特性：**

- 自动连接到全局 A2UIManager
- 自动渲染所有 surfaces
- 响应式更新

## 实现细节

### 1. 全局单例管理

```javascript
// src/core/singleton.js
let globalManager = null

export function getGlobalManager(options = {}) {
  if (!globalManager) {
    globalManager = new A2UIManager(options)
  }
  return globalManager
}

export function resetGlobalManager() {
  if (globalManager) {
    globalManager.destroy()
    globalManager = null
  }
}
```

### 2. 消息处理器工厂

```javascript
// src/index.js
export function createSignalA2uiMessageProcessor(options = {}) {
  const manager = getGlobalManager(options)
  const messageHandler = new MessageHandler(manager)

  return function processor(message) {
    if (Array.isArray(message)) {
      return messageHandler.processMessages(message)
    }
    return messageHandler.processMessage(message)
  }
}
```

### 3. 渲染组件

```vue
<!-- src/components/A2UIRender.vue -->
<script setup>
import { computed } from 'vue'
import { getGlobalManager } from '../core/singleton.js'
import A2UISurface from './A2UISurface.vue'

const emit = defineEmits(['action'])

const manager = getGlobalManager()

const surfaces = computed(() => {
  const state = manager.getState()
  return Object.keys(state.surfaces)
})

const handleAction = (actionData) => {
  emit('action', actionData)
}
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
```

## 包导出结构

```javascript
// src/index.js
export { createSignalA2uiMessageProcessor } from './processor.js'
export { default as a2uiRender } from './components/A2UIRender.vue'

// 高级 API（可选）
export { A2UIManager } from './core/A2UIManager.js'
export { MessageHandler } from './message/MessageHandler.js'
export { getGlobalManager, resetGlobalManager } from './core/singleton.js'
```

## 使用示例

### 基础使用

```vue
<script setup>
import { a2uiRender, createSignalA2uiMessageProcessor } from '@a2ui/renderer'

const processor = createSignalA2uiMessageProcessor({
  enableLogging: true,
})

const sendMessage = async (payload) => {
  const response = await fetch('/api/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })

  const message = await response.json()
  processor(message)
}

// 初始化加载
onMounted(async () => {
  const initialMessages = await fetch('/api/init').then((r) => r.json())
  processor(initialMessages)
})
</script>

<template>
  <div class="app">
    <a2uiRender @action="sendMessage" />
  </div>
</template>
```

### SSE 流式使用

```vue
<script setup>
import { a2uiRender, createSignalA2uiMessageProcessor } from '@a2ui/renderer'

const processor = createSignalA2uiMessageProcessor()

const connectSSE = () => {
  const eventSource = new EventSource('/api/sse')

  eventSource.onmessage = (event) => {
    const message = JSON.parse(event.data)
    processor(message)
  }

  eventSource.onerror = () => {
    console.error('SSE connection error')
    eventSource.close()
  }
}

onMounted(() => {
  connectSSE()
})
</script>

<template>
  <a2uiRender @action="handleAction" />
</template>
```

## 优势

1. **极简 API** - 只需两个导出：`createSignalA2uiMessageProcessor` 和 `a2uiRender`
2. **零配置** - 开箱即用，无需手动创建 Provider 或 Manager
3. **单例模式** - 自动管理全局状态，避免重复创建
4. **类型安全** - 提供完整的 TypeScript 类型定义
5. **独立包** - 完全移除 Pinia 依赖，可独立发布
6. **灵活扩展** - 仍然暴露高级 API 供需要的用户使用

## 迁移指南

### 从 v2 迁移到 v3

**v2 (旧):**

```vue
<A2UIProvider :options="options">
  <A2UIDemoV2 />
</A2UIProvider>
```

**v3 (新):**

```vue
<script setup>
import { a2uiRender, createSignalA2uiMessageProcessor } from '@a2ui/renderer'

const processor = createSignalA2uiMessageProcessor()
</script>

<template>
  <a2uiRender @action="handleAction" />
</template>
```

## 包配置

### package.json

```json
{
  "name": "@a2ui/renderer",
  "version": "3.0.0",
  "type": "module",
  "main": "./dist/index.js",
  "module": "./dist/index.js",
  "exports": {
    ".": {
      "import": "./dist/index.js"
    }
  },
  "files": ["dist"],
  "peerDependencies": {
    "vue": "^3.3.0"
  }
}
```

## 总结

v3 架构通过单例模式和简化的 API 设计，实现了：

- ✅ 移除 Pinia 依赖
- ✅ 极简的使用方式
- ✅ 完全独立的包
- ✅ 保持所有核心功能
- ✅ 向后兼容（通过高级 API）
