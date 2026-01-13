# createSignalA2uiMessageProcessor 重构设计文档

## 一、需求分析

### 1.1 核心需求

在每次处理消息之前（用户进行页面交互后），需要清空之前的 surfaces，展示新的 surfaces。

### 1.2 API 需求

扩展 `createSignalA2uiMessageProcessor` 返回值，从单一函数改为包含多个方法的对象：

- `processMessages`: 处理消息
- `getSurfaces`: 获取 surfaces
- `clearSurfaces`: 清空 surfaces

---

## 二、当前实现分析

### 2.1 现有架构

```javascript
// 当前实现
export function createSignalA2uiMessageProcessor(options = {}) {
  const manager = getGlobalManager(options)
  const globalMessageHandler = new MessageHandler(manager)

  function processor(message) {
    // 处理消息
    return globalMessageHandler.processMessages(message)
  }

  return processor // ❌ 只返回单一函数
}
```

### 2.2 存在的问题

1. **全局状态污染**
   - 使用全局 `globalMessageHandler`
   - 多个页面共享同一个 manager 和 handler
   - 页面切换时 Surface 累积，需要手动清理

2. **API 局限性**
   - 只返回处理函数，无法访问其他功能
   - 无法主动清理 surfaces
   - 无法查询当前 surfaces 状态

3. **生命周期管理不清晰**
   - 依赖 A2UIRender 组件的 onUnmounted 清理
   - 无法在消息处理前主动清理

---

## 三、设计方案

### 3.1 整体架构

```
┌─────────────────────────────────────────────────────┐
│  createSignalA2uiMessageProcessor(options)          │
│                                                     │
│  返回 Processor 对象                                 │
│  ├── processMessages(messages)  处理消息            │
│  ├── getSurfaces()              获取 surfaces       │
│  ├── clearSurfaces()            清空 surfaces       │
│  └── destroy()                  销毁 processor      │
└─────────────────────────────────────────────────────┘
         │
         ├── 创建独立的 A2UIManager 实例
         │
         └── 创建 MessageHandler 实例
```

### 3.2 核心设计原则

1. **隔离性**: 每个 processor 拥有独立的 manager 实例
2. **可控性**: 提供完整的生命周期管理 API
3. **向后兼容**: 保持原有调用方式的兼容性
4. **清晰性**: 明确的职责划分和 API 设计

---

## 四、详细设计

### 4.1 API 设计

#### 4.1.1 创建 Processor

```javascript
/**
 * 创建 A2UI 消息处理器
 * @param {Object} options - 配置选项
 * @param {boolean} options.enableLogging - 是否启用日志
 * @param {boolean} options.validateMessages - 是否验证消息
 * @param {Function} options.onError - 错误回调
 * @param {boolean} options.useGlobalManager - 是否使用全局 manager（默认 false）
 * @returns {Object} Processor 对象
 */
export function createSignalA2uiMessageProcessor(options = {})
```

#### 4.1.2 Processor 对象接口

```javascript
{
  /**
   * 处理消息（单个或数组）
   * @param {Object|Array} messages - 消息或消息数组
   * @param {Object} options - 处理选项
   * @param {boolean} options.clearBefore - 处理前是否清空 surfaces（默认 false）
   * @returns {Object} 处理结果 { total, success, failed, surfaces }
   */
  ;(processMessages(messages, (options = {})),
    /**
     * 获取当前所有 surfaces
     * @returns {Array<Object>} Surface 对象数组
     */
    getSurfaces(),
    /**
     * 清空所有 surfaces
     * @returns {number} 清空的 surface 数量
     */
    clearSurfaces(),
    /**
     * 获取 manager 实例（高级用法）
     * @returns {A2UIManager}
     */
    getManager(),
    /**
     * 销毁 processor，释放资源
     */
    destroy())
}
```

### 4.2 使用场景

#### 场景 1: 基础使用（向后兼容）

```javascript
const processor = createSignalA2uiMessageProcessor()

// 方式 1: 直接调用（向后兼容）
processor(messages)

// 方式 2: 使用新 API
processor.processMessages(messages)
```

#### 场景 2: 每次处理前清空

```javascript
const processor = createSignalA2uiMessageProcessor()

// 用户交互后，清空旧的 surfaces，展示新的
processor.processMessages(messages, { clearBefore: true })

// 或者手动控制
processor.clearSurfaces()
processor.processMessages(messages)
```

#### 场景 3: 查询状态

```javascript
const processor = createSignalA2uiMessageProcessor()

processor.processMessages(messages)

// 获取当前 surfaces
const surfaces = processor.getSurfaces()
console.log('当前 surfaces:', surfaces)
```

#### 场景 4: 生命周期管理

```javascript
const processor = createSignalA2uiMessageProcessor()

// 使用 processor
processor.processMessages(messages)

// 组件卸载时销毁
onUnmounted(() => {
  processor.destroy()
})
```

---

## 五、实现细节

### 5.1 Manager 实例管理

```javascript
export function createSignalA2uiMessageProcessor(options = {}) {
  const { useGlobalManager = false, ...managerOptions } = options

  // 根据配置决定使用全局或独立 manager
  const manager = useGlobalManager
    ? getGlobalManager(managerOptions)
    : new A2UIManager(managerOptions)

  const messageHandler = new MessageHandler(manager)

  // ... 返回 processor 对象
}
```

### 5.2 向后兼容性

```javascript
// 使 processor 对象可调用（函数式调用）
const processor = Object.assign(
  function (messages) {
    return processor.processMessages(messages)
  },
  {
    processMessages(messages, options = {}) {
      /* ... */
    },
    getSurfaces() {
      /* ... */
    },
    clearSurfaces() {
      /* ... */
    },
    getManager() {
      /* ... */
    },
    destroy() {
      /* ... */
    },
  },
)

return processor
```

### 5.3 clearSurfaces 实现

```javascript
clearSurfaces() {
  const surfaces = manager.getAllSurfaces()
  const count = surfaces.length

  surfaces.forEach(surface => {
    manager.deleteSurface(surface.id)
  })

  console.log(`[A2UI] Cleared ${count} surfaces`)
  return count
}
```

### 5.4 getSurfaces 实现

```javascript
getSurfaces() {
  return manager.getAllSurfaces().map(surface => ({
    id: surface.id,
    componentCount: surface.components.length,
    dataModel: manager.getDataModel(surface.id)
  }))
}
```

---

## 六、迁移指南

### 6.1 现有代码兼容性

**无需修改的代码：**

```javascript
// ✅ 继续工作
const processor = createSignalA2uiMessageProcessor()
processor(messages)
```

**推荐的新写法：**

```javascript
// ✅ 更清晰
const processor = createSignalA2uiMessageProcessor()
processor.processMessages(messages, { clearBefore: true })
```

### 6.2 示例页面迁移

**修改前：**

```javascript
// ComprehensiveDemo.vue
const processor = createSignalA2uiMessageProcessor()

onMounted(() => {
  processor(demoMessages)
})
```

**修改后：**

```javascript
// ComprehensiveDemo.vue
const processor = createSignalA2uiMessageProcessor()

onMounted(() => {
  // 每次挂载时清空旧的 surfaces
  processor.processMessages(demoMessages, { clearBefore: true })
})

onUnmounted(() => {
  processor.destroy()
})
```

---

## 七、测试计划

### 7.1 单元测试

- [ ] `processMessages` 基础功能
- [ ] `processMessages` 带 `clearBefore` 选项
- [ ] `getSurfaces` 返回正确数据
- [ ] `clearSurfaces` 清空所有 surfaces
- [ ] `destroy` 释放资源
- [ ] 向后兼容性（函数式调用）

### 7.2 集成测试

- [ ] 页面切换时 surfaces 正确清理
- [ ] 多个 processor 实例互不干扰
- [ ] 全局 manager 模式正常工作
- [ ] 独立 manager 模式正常工作

### 7.3 性能测试

- [ ] 大量 surfaces 清理性能
- [ ] 内存泄漏检测
- [ ] 多次创建/销毁 processor 的性能

---

## 八、风险评估

### 8.1 潜在风险

| 风险             | 影响 | 缓解措施                |
| ---------------- | ---- | ----------------------- |
| 向后兼容性破坏   | 高   | 保持函数式调用方式      |
| 全局状态管理混乱 | 中   | 默认使用独立 manager    |
| 性能下降         | 低   | 优化 clearSurfaces 实现 |
| API 学习成本     | 低   | 提供详细文档和示例      |

### 8.2 回滚方案

如果新实现出现问题，可以：

1. 保留旧的 `createSignalA2uiMessageProcessor` 为 `createLegacyProcessor`
2. 提供配置选项切换新旧实现
3. 逐步迁移，而非一次性替换

---

## 九、实施计划

### 9.1 开发阶段

1. **Phase 1: 核心实现**（1-2 小时）
   - 重构 `processor.js`
   - 实现新的 API 接口
   - 确保向后兼容

2. **Phase 2: 测试**（1 小时）
   - 编写单元测试
   - 示例页面验证
   - 性能测试

3. **Phase 3: 文档**（30 分钟）
   - 更新 API 文档
   - 编写迁移指南
   - 添加使用示例

### 9.2 验收标准

- [ ] 所有现有示例正常工作
- [ ] 页面切换时 surfaces 正确清理
- [ ] 新 API 功能完整
- [ ] 单元测试覆盖率 > 80%
- [ ] 文档完整清晰

---

## 十、总结

### 10.1 核心改进

1. **更好的生命周期管理**: 提供 `clearSurfaces` 和 `destroy` 方法
2. **更灵活的 API**: 从单一函数扩展为完整对象
3. **更清晰的职责**: 明确 processor 的管理范围
4. **向后兼容**: 不破坏现有代码

### 10.2 预期收益

1. **开发体验提升**: 更直观的 API，更容易理解和使用
2. **问题解决**: 彻底解决页面切换时 Surface 累积问题
3. **可维护性**: 更清晰的代码结构，更容易扩展
4. **性能优化**: 及时清理资源，避免内存泄漏
