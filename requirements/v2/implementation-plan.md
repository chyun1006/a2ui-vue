# A2UI v2 重构实现计划

## 总览

本计划将分为 **4 个主要阶段**，每个阶段包含多个具体任务。预计总工作量：**2-3 周**

---

## Phase 1: 核心管理器实现（3-4 天）

### 目标

创建独立的状态管理核心，替代 Pinia 依赖

### 任务清单

#### 1.1 创建事件系统

**文件**: `src/core/EventEmitter.js`

**功能**:

- 实现 `on(event, handler)` - 注册事件监听
- 实现 `off(event, handler)` - 取消事件监听
- 实现 `emit(event, data)` - 触发事件
- 实现 `once(event, handler)` - 一次性监听
- 支持通配符事件

**验收标准**:

- ✅ 单元测试覆盖率 > 90%
- ✅ 支持多个监听器
- ✅ 正确的内存清理

#### 1.2 创建 Surface 类

**文件**: `src/core/Surface.js`

**功能**:

- 构造函数接收 `{ surfaceId, rootComponentId, styles }`
- 使用 Vue 3 `reactive` 包装 components Map
- 实现 `addComponent(componentDef)` 方法
- 实现 `getComponent(componentId)` 方法
- 实现 `removeComponent(componentId)` 方法
- 实现 `updateStyles(styles)` 方法
- 实现 `destroy()` 方法

**验收标准**:

- ✅ 组件增删改查正常
- ✅ 响应式更新正常
- ✅ 内存正确释放

#### 1.3 创建 A2UIManager 类

**文件**: `src/core/A2UIManager.js`

**功能**:

- 构造函数初始化配置和状态
- 使用 `reactive` 包装 surfaces 和 dataModels Map
- 实现 Surface 管理方法:
  - `createSurface(config)`
  - `getSurface(surfaceId)`
  - `deleteSurface(surfaceId)`
  - `updateComponents(surfaceId, components)`
- 实现数据模型管理方法:
  - `initDataModel(surfaceId)`
  - `updateData(surfaceId, path, value)`
  - `getData(surfaceId, path)`
  - `deleteData(surfaceId, path)`
- 集成 EventEmitter
- 实现 `destroy()` 和 `reset()` 方法

**验收标准**:

- ✅ 所有 API 正常工作
- ✅ 事件正确触发
- ✅ 数据响应式更新
- ✅ 单元测试覆盖率 > 85%

#### 1.4 创建工具函数

**文件**: `src/core/utils.js`

**功能**:

- `parseDataContents(contents)` - 解析 A2UI 数据格式
- `normalizeComponentDef(componentDef)` - 规范化组件定义
- `validateConfig(config)` - 验证配置

**验收标准**:

- ✅ 正确解析各种数据类型
- ✅ 边界情况处理

---

## Phase 2: 组件层重构（4-5 天）

### 目标

重构所有组件，移除 Pinia 依赖，使用 manager prop

### 任务清单

#### 2.1 重构 A2UISurface 组件

**文件**: `src/components/A2UISurface.vue`

**改动**:

- 移除 `useSurfaceStore` 导入
- 添加 `manager` prop (A2UIManager 实例)
- 使用 `computed(() => manager.getSurface(surfaceId))` 获取数据
- 监听 manager 事件
- 清理时取消事件监听

**验收标准**:

- ✅ 不再依赖 Pinia
- ✅ 响应式更新正常
- ✅ 事件传递正常

#### 2.2 重构 A2UIRenderer 组件

**文件**: `src/components/A2UIRenderer.vue`

**改动**:

- 添加 `manager` prop
- 使用 `manager.getSurface()` 和 `surface.getComponent()` 获取数据
- 将 `manager` 传递给子组件
- 移除 store 相关代码

**验收标准**:

- ✅ 组件正确渲染
- ✅ 动态组件加载正常
- ✅ Props 正确传递

#### 2.3 更新 useDataBinding composable

**文件**: `src/composables/useDataBinding.js`

**改动**:

- 接收 `manager` 和 `surfaceId` 参数
- 使用 `manager.getData()` 替代 `dataModelStore.getValueByPath()`
- 使用 `manager.updateData()` 替代 `dataModelStore.setValue()`
- 返回 computed 值以保持响应式

**验收标准**:

- ✅ 数据绑定正常
- ✅ 响应式更新正常
- ✅ 支持 literal 和 path 两种模式

#### 2.4 更新 useA2UIAction composable

**文件**: `src/composables/useA2UIAction.js`

**改动**:

- 接收 `manager` 和 `surfaceId` 参数
- 使用 `manager.getData()` 解析 context
- 触发 manager 事件

**验收标准**:

- ✅ 事件处理正常
- ✅ Context 数据正确解析

#### 2.5 更新所有 A2UI 子组件

**文件**: `src/components/a2ui/**/*.vue` (18 个组件)

**改动**:

- 添加 `manager` prop
- 更新 `useDataBinding` 调用方式
- 更新 `useA2UIAction` 调用方式
- 将 `manager` 传递给子组件（布局组件）

**组件列表**:

- 展示组件: Text, Image, Icon, Video, AudioPlayer
- 布局组件: Row, Column, List, Card, Tabs, Modal, Divider
- 交互组件: Button, TextField, CheckBox, DateTimeInput, MultipleChoice, Slider

**验收标准**:

- ✅ 所有组件正常工作
- ✅ 数据绑定正常
- ✅ 事件处理正常

---

## Phase 3: 消息处理层重构（2-3 天）

### 目标

创建独立的消息处理层，与渲染器解耦

### 任务清单

#### 3.1 创建 MessageHandler 类

**文件**: `src/message/MessageHandler.js`

**功能**:

- 构造函数接收 A2UIManager 实例
- 实现 `processMessage(message)` 方法
- 处理四种消息类型:
  - `beginRendering`
  - `surfaceUpdate`
  - `dataModelUpdate`
  - `deleteSurface`
- 实现 `processMessages(messages)` 批量处理
- 实现 `parseDataContents(contents)` 数据解析

**验收标准**:

- ✅ 正确处理所有消息类型
- ✅ 数据正确解析和更新
- ✅ 错误处理完善

#### 3.2 更新 useA2UIMessage composable（兼容层）

**文件**: `src/composables/useA2UIMessage.js`

**改动**:

- 使用 `inject` 获取 manager 和 messageHandler
- 提供向后兼容的 API
- 内部调用 MessageHandler 方法

**验收标准**:

- ✅ 向后兼容
- ✅ 现有代码无需修改

#### 3.3 更新 useSSE composable

**文件**: `src/composables/useSSE.js`

**改动**:

- 接收 messageHandler 参数
- 消息接收后调用 `messageHandler.processMessage()`

**验收标准**:

- ✅ SSE 连接正常
- ✅ 消息自动处理

#### 3.4 创建 Provider 组件

**文件**: `src/components/A2UIProvider.vue`

**功能**:

- 创建 A2UIManager 实例
- 创建 MessageHandler 实例
- 通过 `provide` 提供给子组件
- 支持配置选项

**验收标准**:

- ✅ 正确提供实例
- ✅ 支持配置

---

## Phase 4: 测试、文档和优化（3-4 天）

### 目标

完善测试、文档，优化性能，准备发布

### 任务清单

#### 4.1 单元测试

**文件**: `tests/unit/**/*.spec.js`

**测试范围**:

- EventEmitter 完整测试
- Surface 类测试
- A2UIManager 核心方法测试
- MessageHandler 测试
- 工具函数测试

**验收标准**:

- ✅ 核心代码覆盖率 > 85%
- ✅ 所有测试通过

#### 4.2 集成测试

**文件**: `tests/integration/**/*.spec.js`

**测试场景**:

- 完整的消息处理流程
- 多 Surface 管理
- 数据绑定和更新
- 组件交互
- 事件传递

**验收标准**:

- ✅ 所有场景测试通过
- ✅ 无内存泄漏

#### 4.3 性能优化

**优化项**:

- 减少不必要的响应式包装
- 优化大数据量渲染
- 优化事件监听器管理
- 组件懒加载优化

**验收标准**:

- ✅ 渲染性能提升 > 20%
- ✅ 内存占用减少 > 30%

#### 4.4 更新示例和文档

**文档**:

- API 文档 (`docs/api.md`)
- 使用指南 (`docs/guide.md`)
- 迁移指南 (`docs/migration.md`)
- 最佳实践 (`docs/best-practices.md`)

**示例**:

- 更新 A2UIDemo.vue
- 更新 CompleteDemo.vue
- 创建新的示例展示新 API

**验收标准**:

- ✅ 文档完整清晰
- ✅ 示例可运行

#### 4.5 包配置和发布准备

**任务**:

- 配置 package.json
- 配置构建脚本
- 配置 TypeScript 类型定义
- 准备 README.md
- 准备 CHANGELOG.md

**验收标准**:

- ✅ 可正确构建
- ✅ 类型定义完整
- ✅ 文档齐全

---

## 详细时间表

### Week 1: Phase 1 + Phase 2 开始

**Day 1-2**:

- ✅ EventEmitter 实现和测试
- ✅ Surface 类实现和测试

**Day 3-4**:

- ✅ A2UIManager 实现
- ✅ 核心工具函数
- ✅ 单元测试

**Day 5**:

- ✅ 重构 A2UISurface
- ✅ 重构 A2UIRenderer
- ✅ 更新 composables

### Week 2: Phase 2 完成 + Phase 3

**Day 1-3**:

- ✅ 更新所有 18 个子组件
- ✅ 测试每个组件

**Day 4-5**:

- ✅ MessageHandler 实现
- ✅ 兼容层实现
- ✅ Provider 组件

### Week 3: Phase 4

**Day 1-2**:

- ✅ 单元测试和集成测试
- ✅ 性能优化

**Day 3-4**:

- ✅ 文档编写
- ✅ 示例更新

**Day 5**:

- ✅ 包配置
- ✅ 最终测试
- ✅ 发布准备

---

## 验收标准总览

### 功能性

- ✅ 所有 A2UI v0.8 规范功能正常
- ✅ 18 个标准组件全部工作
- ✅ 四种消息类型正确处理
- ✅ 数据绑定和响应式更新正常
- ✅ 事件系统正常工作

### 性能

- ✅ 渲染性能不低于 v1
- ✅ 内存占用减少 > 30%
- ✅ 包体积减少 > 40%（移除 Pinia）

### 质量

- ✅ 核心代码测试覆盖率 > 85%
- ✅ 无已知 bug
- ✅ 无内存泄漏
- ✅ 代码符合 ESLint 规范

### 可用性

- ✅ API 文档完整
- ✅ 使用示例齐全
- ✅ 迁移指南清晰
- ✅ 可独立发布为 npm 包

---

## 风险和应对

### 风险 1: 响应式系统复杂度

**风险**: 手动管理响应式可能出现遗漏
**应对**:

- 完善的单元测试
- 使用 Vue Devtools 检查响应式
- 参考 Vue 3 源码最佳实践

### 风险 2: 向后兼容性

**风险**: 现有代码可能无法平滑迁移
**应对**:

- 提供完整的兼容层
- 详细的迁移文档
- 渐进式迁移方案

### 风险 3: 性能回退

**风险**: 新架构可能影响性能
**应对**:

- 性能基准测试
- 持续性能监控
- 针对性优化

### 风险 4: 时间超期

**风险**: 实际开发时间可能超出预期
**应对**:

- 分阶段交付
- 优先核心功能
- 灵活调整计划

---

## 下一步行动

1. **立即开始**: Phase 1.1 - 创建 EventEmitter
2. **准备工作**:
   - 创建 `src/core/` 目录
   - 创建 `tests/unit/` 目录
   - 配置测试框架
3. **沟通确认**: 与团队确认时间表和资源

---

## 附录：文件清单

### 新增文件

```
src/
├── core/
│   ├── EventEmitter.js          # 新增
│   ├── Surface.js               # 新增
│   ├── A2UIManager.js           # 新增
│   └── utils.js                 # 新增
├── message/
│   └── MessageHandler.js        # 新增
└── components/
    └── A2UIProvider.vue         # 新增
```

### 修改文件

```
src/
├── components/
│   ├── A2UISurface.vue          # 重构
│   ├── A2UIRenderer.vue         # 重构
│   └── a2ui/                    # 所有组件重构
├── composables/
│   ├── useDataBinding.js        # 重构
│   ├── useA2UIAction.js         # 重构
│   ├── useA2UIMessage.js        # 兼容层
│   └── useSSE.js                # 更新
└── views/
    ├── A2UIDemo.vue             # 更新
    └── CompleteDemo.vue         # 更新
```

### 删除文件

```
src/
└── stores/
    ├── surfaceStore.js          # 删除
    └── dataModelStore.js        # 删除
```

---

**总计**:

- 新增文件: 6 个
- 修改文件: 25+ 个
- 删除文件: 2 个
- 预计代码行数: ~3000 行
