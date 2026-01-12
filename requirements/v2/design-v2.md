# A2UI v2 重构设计文档

## 1. 设计目标

### 1.1 核心目标

- **解耦状态管理**：移除 Pinia 依赖，使用原生 JavaScript 状态管理
- **独立包设计**：A2UI 渲染器可作为独立 npm 包发布和使用
- **清晰的职责分离**：消息处理层与渲染层解耦
- **灵活的接口设计**：暴露必要的 API 供外部使用

### 1.2 架构原则

- **单一职责**：每个模块只负责一个明确的功能
- **依赖倒置**：高层模块不依赖低层模块，都依赖抽象
- **开放封闭**：对扩展开放，对修改封闭
- **最小依赖**：只依赖 Vue 3，无其他第三方状态管理库

---

## 2. 架构设计

### 2.1 整体架构

```
┌─────────────────────────────────────────────────────────┐
│                    应用层 (App Layer)                     │
│  - 消息接收 (SSE/WebSocket/HTTP)                         │
│  - 业务逻辑处理                                           │
│  - 自定义状态管理 (Pinia/Vuex/Custom)                    │
└────────────────────┬────────────────────────────────────┘
                     │ A2UI Public API
                     ↓
┌─────────────────────────────────────────────────────────┐
│              A2UI 核心包 (Core Package)                   │
│  ┌─────────────────────────────────────────────────┐    │
│  │  A2UIManager (核心管理器)                        │    │
│  │  - Surface 管理                                  │    │
│  │  - 数据模型管理                                   │    │
│  │  - 事件总线                                       │    │
│  └─────────────────────────────────────────────────┘    │
│  ┌─────────────────────────────────────────────────┐    │
│  │  渲染层 (Renderer Layer)                         │    │
│  │  - A2UIRenderer 组件                             │    │
│  │  - A2UISurface 组件                              │    │
│  │  - 18 个标准组件                                  │    │
│  └─────────────────────────────────────────────────┘    │
│  ┌─────────────────────────────────────────────────┐    │
│  │  工具层 (Utils Layer)                            │    │
│  │  - 路径解析                                       │    │
│  │  - 数据绑定                                       │    │
│  │  - 验证器                                         │    │
│  └─────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────┘
```

### 2.2 模块划分

#### 2.2.1 核心管理器 (A2UIManager)

**职责**：

- 管理所有 Surface 实例
- 管理数据模型
- 提供统一的 API 接口
- 事件发布订阅

**特点**：

- 使用原生 JavaScript Map/Set 存储状态
- 使用 Vue 3 的 reactive/ref 实现响应式
- 不依赖任何第三方状态管理库

#### 2.2.2 渲染层

**职责**：

- 接收 Surface 数据并渲染
- 处理组件交互
- 数据绑定和更新

**特点**：

- 纯 Vue 组件
- 通过 props 接收数据
- 通过 events 向上通信

#### 2.2.3 消息处理层（应用层）

**职责**：

- 接收和解析 A2UI 消息
- 调用 A2UIManager API
- 处理业务逻辑

**特点**：

- 与 A2UI 核心包解耦
- 可选择任意状态管理方案
- 可自定义消息来源

---

## 3. 核心 API 设计

### 3.1 A2UIManager 类

```javascript
class A2UIManager {
  constructor(options = {}) {
    // 配置选项
    this.options = {
      enableLogging: true,
      validateMessages: true,
      ...options,
    }

    // 内部状态（使用 Vue reactive）
    this.state = reactive({
      surfaces: new Map(), // Surface 实例
      dataModels: new Map(), // 数据模型
    })

    // 事件总线
    this.eventBus = new EventEmitter()
  }

  // ========== Surface 管理 ==========

  /**
   * 创建 Surface
   * @param {Object} config - { surfaceId, rootComponentId, styles }
   * @returns {Surface} Surface 实例
   */
  createSurface(config) {}

  /**
   * 获取 Surface
   * @param {string} surfaceId
   * @returns {Surface|null}
   */
  getSurface(surfaceId) {}

  /**
   * 删除 Surface
   * @param {string} surfaceId
   * @returns {boolean}
   */
  deleteSurface(surfaceId) {}

  /**
   * 更新 Surface 组件
   * @param {string} surfaceId
   * @param {Array} components
   * @returns {boolean}
   */
  updateComponents(surfaceId, components) {}

  // ========== 数据模型管理 ==========

  /**
   * 初始化数据模型
   * @param {string} surfaceId
   */
  initDataModel(surfaceId) {}

  /**
   * 更新数据模型
   * @param {string} surfaceId
   * @param {string} path - 数据路径
   * @param {any} value - 数据值
   */
  updateData(surfaceId, path, value) {}

  /**
   * 获取数据
   * @param {string} surfaceId
   * @param {string} path
   * @returns {any}
   */
  getData(surfaceId, path) {}

  /**
   * 删除数据
   * @param {string} surfaceId
   * @param {string} path
   */
  deleteData(surfaceId, path) {}

  // ========== 事件管理 ==========

  /**
   * 监听事件
   * @param {string} event - 事件名称
   * @param {Function} handler - 事件处理函数
   */
  on(event, handler) {}

  /**
   * 取消监听
   * @param {string} event
   * @param {Function} handler
   */
  off(event, handler) {}

  /**
   * 触发事件
   * @param {string} event
   * @param {any} data
   */
  emit(event, data) {}

  // ========== 工具方法 ==========

  /**
   * 销毁管理器
   */
  destroy() {}

  /**
   * 重置所有状态
   */
  reset() {}
}
```

### 3.2 Surface 类

```javascript
class Surface {
  constructor(config) {
    this.id = config.surfaceId
    this.rootComponentId = config.rootComponentId
    this.styles = reactive(config.styles || {})
    this.components = reactive(new Map())
  }

  /**
   * 添加组件
   */
  addComponent(componentDef) {}

  /**
   * 获取组件
   */
  getComponent(componentId) {}

  /**
   * 删除组件
   */
  removeComponent(componentId) {}

  /**
   * 更新样式
   */
  updateStyles(styles) {}

  /**
   * 销毁 Surface
   */
  destroy() {}
}
```

### 3.3 事件系统

```javascript
// 内置事件
const A2UI_EVENTS = {
  SURFACE_CREATED: 'surface:created',
  SURFACE_UPDATED: 'surface:updated',
  SURFACE_DELETED: 'surface:deleted',
  DATA_UPDATED: 'data:updated',
  COMPONENT_ACTION: 'component:action',
  ERROR: 'error',
}
```

---

## 4. 组件设计

### 4.1 A2UISurface 组件

```vue
<script setup>
import { computed, watch, onUnmounted } from 'vue'
import { useA2UIManager } from './composables/useA2UIManager'

const props = defineProps({
  surfaceId: {
    type: String,
    required: true,
  },
  manager: {
    type: Object, // A2UIManager 实例
    required: true,
  },
})

const emit = defineEmits(['action', 'error'])

// 从 manager 获取 Surface 数据
const surface = computed(() => props.manager.getSurface(props.surfaceId))

// 监听事件
const handleAction = (actionData) => {
  emit('action', actionData)
  props.manager.emit('component:action', {
    surfaceId: props.surfaceId,
    ...actionData,
  })
}

// 清理
onUnmounted(() => {
  // 可选：自动清理 Surface
})
</script>

<template>
  <div v-if="surface" class="a2ui-surface" :style="surface.styles">
    <A2UIRenderer
      :surface-id="surfaceId"
      :component-id="surface.rootComponentId"
      :manager="manager"
      @action="handleAction"
    />
  </div>
</template>
```

### 4.2 A2UIRenderer 组件

```vue
<script setup>
import { computed } from 'vue'

const props = defineProps({
  surfaceId: String,
  componentId: String,
  manager: Object, // A2UIManager 实例
})

// 从 manager 获取组件定义
const componentDef = computed(() => {
  const surface = props.manager.getSurface(props.surfaceId)
  return surface?.getComponent(props.componentId)
})

// 解析组件类型和属性
const componentType = computed(() => {
  // ... 解析逻辑
})

const componentProps = computed(() => {
  // ... 解析逻辑，包含数据绑定
})
</script>

<template>
  <component
    :is="dynamicComponent"
    v-if="componentDef"
    v-bind="componentProps"
    :manager="manager"
    @action="$emit('action', $event)"
  />
</template>
```

---

## 5. 使用示例

### 5.1 基础使用

```vue
<script setup>
import { ref, onMounted } from 'vue'
import { A2UIManager, A2UISurface } from '@a2ui/renderer'

// 创建管理器实例
const manager = new A2UIManager({
  enableLogging: true,
})

// 创建 Surface
onMounted(() => {
  manager.createSurface({
    surfaceId: 'main-surface',
    rootComponentId: 'root',
    styles: { primaryColor: '#1976d2' },
  })

  // 添加组件
  manager.updateComponents('main-surface', [
    {
      id: 'root',
      component: {
        Column: {
          children: { explicitList: ['text-1', 'button-1'] },
        },
      },
    },
    {
      id: 'text-1',
      component: {
        Text: {
          text: { literalString: 'Hello A2UI' },
          usageHint: 'h1',
        },
      },
    },
  ])

  // 初始化数据
  manager.initDataModel('main-surface')
  manager.updateData('main-surface', '/user/name', 'John')
})

// 监听事件
manager.on('component:action', (data) => {
  console.log('Action:', data)
})

const handleAction = (actionData) => {
  console.log('Surface action:', actionData)
}
</script>

<template>
  <A2UISurface surface-id="main-surface" :manager="manager" @action="handleAction" />
</template>
```

### 5.2 与消息处理集成

```javascript
// messageHandler.js
import { A2UIManager } from '@a2ui/renderer'

export class MessageHandler {
  constructor() {
    this.manager = new A2UIManager()
  }

  /**
   * 处理 A2UI 消息
   */
  processMessage(message) {
    if (message.beginRendering) {
      const { surfaceId, root, styles } = message.beginRendering
      this.manager.createSurface({
        surfaceId,
        rootComponentId: root,
        styles,
      })
    }

    if (message.surfaceUpdate) {
      const { surfaceId, components } = message.surfaceUpdate
      this.manager.updateComponents(surfaceId, components)
    }

    if (message.dataModelUpdate) {
      const { surfaceId, path, contents } = message.dataModelUpdate
      this.parseAndUpdateData(surfaceId, path, contents)
    }

    if (message.deleteSurface) {
      const { surfaceId } = message.deleteSurface
      this.manager.deleteSurface(surfaceId)
    }
  }

  /**
   * 解析数据内容
   */
  parseAndUpdateData(surfaceId, path, contents) {
    const data = this.parseDataContents(contents)
    this.manager.updateData(surfaceId, path || '/', data)
  }

  parseDataContents(contents) {
    const result = {}
    for (const item of contents) {
      if (item.valueString !== undefined) {
        result[item.key] = item.valueString
      } else if (item.valueNumber !== undefined) {
        result[item.key] = item.valueNumber
      } else if (item.valueBoolean !== undefined) {
        result[item.key] = item.valueBoolean
      } else if (item.valueMap) {
        result[item.key] = this.parseDataContents(item.valueMap)
      }
    }
    return result
  }
}
```

### 5.3 在 Vue 应用中使用

```vue
<!-- App.vue -->
<script setup>
import { provide } from 'vue'
import { A2UIManager } from '@a2ui/renderer'
import { MessageHandler } from './messageHandler'

// 创建管理器
const manager = new A2UIManager()
const messageHandler = new MessageHandler(manager)

// 提供给子组件
provide('a2uiManager', manager)
provide('messageHandler', messageHandler)

// 加载 Mock 数据
import mockMessages from './mock/messages.json'
mockMessages.forEach((msg) => messageHandler.processMessage(msg))
</script>

<template>
  <RouterView />
</template>
```

```vue
<!-- DemoView.vue -->
<script setup>
import { inject } from 'vue'
import { A2UISurface } from '@a2ui/renderer'

const manager = inject('a2uiManager')

const handleAction = (actionData) => {
  console.log('Action:', actionData)
}
</script>

<template>
  <A2UISurface surface-id="demo-surface" :manager="manager" @action="handleAction" />
</template>
```

---

## 6. 数据绑定设计

### 6.1 数据绑定 Composable

```javascript
// composables/useDataBinding.js
import { computed } from 'vue'

export function useDataBinding(manager, surfaceId) {
  /**
   * 解析值或路径
   */
  const resolveValue = (valueOrPath) => {
    if (!valueOrPath) return null

    if ('literalString' in valueOrPath) return valueOrPath.literalString
    if ('literalNumber' in valueOrPath) return valueOrPath.literalNumber
    if ('literalBoolean' in valueOrPath) return valueOrPath.literalBoolean
    if ('literalArray' in valueOrPath) return valueOrPath.literalArray

    if ('path' in valueOrPath) {
      return computed(() => manager.getData(surfaceId, valueOrPath.path))
    }

    return null
  }

  /**
   * 更新数据
   */
  const updateValue = (valueOrPath, newValue) => {
    if (valueOrPath && 'path' in valueOrPath) {
      manager.updateData(surfaceId, valueOrPath.path, newValue)
    }
  }

  return {
    resolveValue,
    updateValue,
  }
}
```

---

## 7. 包结构设计

### 7.1 npm 包结构

```
@a2ui/renderer/
├── src/
│   ├── core/
│   │   ├── A2UIManager.js          # 核心管理器
│   │   ├── Surface.js              # Surface 类
│   │   └── EventEmitter.js         # 事件总线
│   ├── components/
│   │   ├── A2UISurface.vue         # Surface 组件
│   │   ├── A2UIRenderer.vue        # 渲染器组件
│   │   └── a2ui/                   # 18 个标准组件
│   ├── composables/
│   │   ├── useA2UIManager.js       # Manager composable
│   │   ├── useDataBinding.js       # 数据绑定
│   │   └── useA2UIAction.js        # 事件处理
│   ├── utils/
│   │   ├── pathResolver.js         # 路径解析
│   │   ├── validator.js            # 验证器
│   │   └── dataParser.js           # 数据解析
│   ├── types/
│   │   ├── a2ui.js                 # 类型定义
│   │   └── components.js           # 组件定义
│   └── index.js                    # 导出入口
├── package.json
└── README.md
```

### 7.2 导出接口

```javascript
// index.js
export { A2UIManager } from './core/A2UIManager'
export { Surface } from './core/Surface'

export { default as A2UISurface } from './components/A2UISurface.vue'
export { default as A2UIRenderer } from './components/A2UIRenderer.vue'

export { useA2UIManager } from './composables/useA2UIManager'
export { useDataBinding } from './composables/useDataBinding'
export { useA2UIAction } from './composables/useA2UIAction'

export * from './types/a2ui'
export * from './utils/validator'
```

### 7.3 package.json

```json
{
  "name": "@a2ui/renderer",
  "version": "2.0.0",
  "description": "A2UI Renderer - Dynamic UI rendering based on Google's A2UI specification",
  "main": "dist/index.js",
  "module": "dist/index.esm.js",
  "types": "dist/index.d.ts",
  "files": ["dist"],
  "peerDependencies": {
    "vue": "^3.3.0"
  },
  "dependencies": {},
  "keywords": ["a2ui", "vue3", "renderer", "dynamic-ui", "ai-ui"]
}
```

---

## 8. 迁移方案

### 8.1 迁移步骤

**Phase 1: 创建核心管理器**

1. 实现 A2UIManager 类
2. 实现 Surface 类
3. 实现事件系统
4. 单元测试

**Phase 2: 重构组件**

1. 修改 A2UISurface 接收 manager prop
2. 修改 A2UIRenderer 接收 manager prop
3. 更新所有子组件的数据绑定逻辑
4. 移除 Pinia 依赖

**Phase 3: 创建适配层**

1. 实现 MessageHandler 类
2. 提供向后兼容的 composables
3. 更新文档和示例

**Phase 4: 测试和优化**

1. 完整的集成测试
2. 性能优化
3. 文档完善

### 8.2 向后兼容

提供兼容层，让现有代码可以平滑迁移：

```javascript
// composables/useA2UIMessage.js (兼容层)
import { inject } from 'vue'

export function useA2UIMessage() {
  const manager = inject('a2uiManager')
  const messageHandler = inject('messageHandler')

  return {
    processMessage: (msg) => messageHandler.processMessage(msg),
    processMessages: (msgs) => msgs.forEach((msg) => messageHandler.processMessage(msg)),
  }
}
```

---

## 9. 优势分析

### 9.1 解耦优势

- ✅ **无状态管理依赖**：不再强制使用 Pinia
- ✅ **独立发布**：可作为独立 npm 包使用
- ✅ **灵活集成**：可与任何 Vue 3 项目集成
- ✅ **清晰职责**：消息处理与渲染分离

### 9.2 可维护性

- ✅ **单一职责**：每个类/模块职责明确
- ✅ **易于测试**：核心逻辑可独立测试
- ✅ **易于扩展**：通过事件系统扩展功能
- ✅ **类型安全**：可添加 TypeScript 支持

### 9.3 性能优势

- ✅ **按需响应式**：只有必要的数据是响应式的
- ✅ **减少依赖**：包体积更小
- ✅ **更好的控制**：开发者可控制状态更新时机

---

## 10. 注意事项

### 10.1 响应式处理

- 使用 Vue 3 的 `reactive` 和 `ref` 实现响应式
- 确保 Surface 和数据模型的响应式更新
- 避免不必要的响应式包装

### 10.2 内存管理

- 提供 `destroy()` 方法清理资源
- 组件卸载时自动清理事件监听
- 大数据量时考虑虚拟滚动

### 10.3 错误处理

- 完善的错误捕获和上报
- 提供错误恢复机制
- 详细的错误日志

### 10.4 兼容性

- 保持与 A2UI v0.8 规范兼容
- 提供向后兼容的 API
- 清晰的迁移文档

---

## 11. 总结

A2UI v2 重构通过以下方式实现了设计目标：

1. **移除 Pinia 依赖**：使用原生 JavaScript + Vue 3 响应式系统
2. **清晰的架构分层**：核心管理器、渲染层、应用层分离
3. **独立包设计**：可作为 npm 包独立发布和使用
4. **灵活的 API**：提供完整的编程接口
5. **向后兼容**：提供兼容层支持平滑迁移

这个设计使 A2UI 渲染器更加模块化、易于维护和扩展，同时保持了高性能和灵活性。
