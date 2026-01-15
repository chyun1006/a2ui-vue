# @a2ui/lit 项目结构与 API 文档

## 概述

`@a2ui/lit` 是 Google A2UI 项目的官方 Lit 渲染器实现,版本 0.8.1。它提供了基于 Signals 的响应式 A2UI 消息处理能力。

- **仓库**: https://github.com/google/A2UI
- **包名**: `@a2ui/lit`
- **版本**: 0.8.1
- **许可证**: Apache-2.0

## 包结构

```
@a2ui/lit/
├── dist/src/
│   ├── index.js          # 主入口,导出 v0_8 命名空间
│   └── 0.8/
│       ├── core.js       # 核心功能模块
│       └── ui/
│           └── ui.js     # UI 组件模块
```

## 主要导出

### 1. 根导出 (`@a2ui/lit`)

```typescript
import { v0_8 } from "@a2ui/lit";
```

导出一个 `v0_8` 命名空间,包含 0.8 版本的所有 API。

### 2. 核心模块 (`@a2ui/lit/0.8`)

```typescript
import {
  Data,
  Events,
  Types,
  Primitives,
  Styles,
  Schemas,
} from "@a2ui/lit/0.8";
```

#### 2.1 Data - 数据处理模块

**核心 API**:

```typescript
// 创建基于 Signals 的消息处理器
Data.createSignalA2uiMessageProcessor(): MessageProcessor

// 传统消息处理器类
Data.A2uiMessageProcessor: Class

// 类型守卫工具
Data.Guards: {
  // 用于验证 A2UI 消息格式的工具函数
}
```

**MessageProcessor 接口**:

```typescript
interface MessageProcessor {
  // 处理 A2UI 消息数组
  processMessages(messages: A2UIMessage[]): void;

  // 获取所有 surfaces
  getSurfaces(): Map<string, Surface>;

  // 清空所有 surfaces
  clearSurfaces(): void;

  // 获取指定 surface 的数据
  getData(node: Component, path: string, surfaceId: string): any;

  // 设置指定 surface 的数据
  setData(node: Component, path: string, value: any, surfaceId: string): void;
}
```

**Surface 对象结构**:

```typescript
interface Surface {
  root: string; // 根组件 ID (可能为 undefined)
  components: Map<string, Component>; // 组件映射
  dataModel: Signal<object>; // 响应式数据模型
}
```

#### 2.2 Events - 事件模块

提供 A2UI 事件相关的类型和工具。

#### 2.3 Types - 类型定义

包含所有 A2UI 组件和消息的 TypeScript 类型定义。

#### 2.4 Primitives - 基础类型

A2UI 协议的基础数据类型定义。

#### 2.5 Styles - 样式模块

A2UI 样式系统相关的类型和工具。

#### 2.6 Schemas - JSON Schema

完整的 A2UI 协议 JSON Schema 定义,包含:

- `A2UIClientEventMessage`: 客户端事件消息 Schema
- 所有组件类型的 Schema 定义
- 数据模型更新的 Schema

### 3. UI 模块 (`@a2ui/lit/ui`)

```typescript
import { ... } from '@a2ui/lit/ui'
```

提供基于 Lit 的 UI 组件实现(具体组件列表需要进一步查看源码)。

## 核心功能

### 1. 消息处理

`@a2ui/lit` 的核心功能是处理 A2UI 协议消息:

```javascript
import { v0_8 } from '@a2ui/lit'

const { Data } = v0_8

// 创建处理器
const processor = Data.createSignalA2uiMessageProcessor()

// 处理消息
processor.processMessages([
  {
    beginRendering: {
      surfaceId: "my-surface",
      root: "root-component"
    }
  },
  {
    surfaceUpdate: {
      surfaceId: "my-surface",
      components: [...]
    }
  },
  {
    dataModelUpdate: {
      surfaceId: "my-surface",
      contents: [...]
    }
  }
])

// 获取 surfaces
const surfaces = processor.getSurfaces()
```

### 2. 响应式数据模型

使用 `@lit-labs/signals` 实现响应式:

- Surface 的 `dataModel` 是一个 Signal 对象
- 支持 `.peek()` 方法获取当前值
- 支持 `.value` 属性进行响应式访问

### 3. 数据访问

```javascript
// 获取数据
const value = processor.getData(component, "/path/to/data", surfaceId);

// 设置数据
processor.setData(component, "/path/to/data", newValue, surfaceId);
```

## 支持的 A2UI 组件

根据 Schema 定义,支持以下组件类型:

### 显示组件

- **Text**: 文本显示
- **Image**: 图片显示
- **Icon**: 图标显示
- **Video**: 视频播放
- **AudioPlayer**: 音频播放

### 布局组件

- **Row**: 水平布局
- **Column**: 垂直布局
- **List**: 列表布局
- **Card**: 卡片容器
- **Tabs**: 标签页
- **Divider**: 分隔线
- **Modal**: 模态框

### 输入组件

- **Button**: 按钮
- **CheckBox**: 复选框
- **TextField**: 文本输入框
- **DateTimeInput**: 日期时间选择器
- **MultipleChoice**: 多选组件
- **Slider**: 滑块

## 消息类型

支持以下 A2UI 协议消息:

1. **beginRendering**: 开始渲染,创建 surface
2. **surfaceUpdate**: 更新 surface 的组件
3. **dataModelUpdate**: 更新数据模型
4. **deleteSurface**: 删除 surface

## 依赖关系

```json
{
  "@lit-labs/signals": "^0.1.3", // Signals 响应式系统
  "@lit/context": "^1.1.4", // Lit Context API
  "lit": "^3.3.1", // Lit 核心库
  "markdown-it": "^14.1.0", // Markdown 渲染
  "signal-utils": "^0.21.1" // Signal 工具库
}
```

## 在 a2ui-vue 中的使用

### 当前使用方式

```javascript
// lib/src/core/A2UIVueAdapter.js
import { v0_8 } from "@a2ui/lit";

const { Data } = v0_8;

export class A2UIVueAdapter {
  constructor() {
    // 创建 @a2ui/lit 的消息处理器
    this.litProcessor = Data.createSignalA2uiMessageProcessor();

    // Vue 响应式状态
    this.state = reactive({
      surfaces: new Map(),
      dataModels: new Map(),
    });
  }

  processMessages(messages, options) {
    // 使用 @a2ui/lit 处理消息
    this.litProcessor.processMessages(messages);

    // 同步状态到 Vue
    this._syncAllSurfaces();
  }

  getData(surfaceId, path) {
    const surface = this.litProcessor.getSurfaces().get(surfaceId);
    const dataModel = surface.dataModel.peek
      ? surface.dataModel.peek()
      : surface.dataModel;
    return getValueByPath(dataModel, path);
  }
}
```

### 架构层次

```
a2ui-vue 应用层
    ↓
processor.js (简化的 wrapper)
    ↓
A2UIVueAdapter (Vue 适配器)
    ↓
@a2ui/lit (核心消息处理)
    ↓
Lit Components (UI 渲染)
```

## 注意事项

1. **Signal 对象访问**: `surface.dataModel` 是 Signal 对象,需要使用 `.peek()` 或 `.value` 访问
2. **组件引用**: `getData/setData` 需要传入组件节点引用,但当 `surface.root` 为 `undefined` 时需要直接访问 `dataModel`
3. **响应式同步**: 需要手动同步 @a2ui/lit 的状态到 Vue 的响应式系统
4. **事件系统**: @a2ui/lit 本身不提供事件系统,需要在适配器层实现

## 相关资源

- [A2UI GitHub 仓库](https://github.com/google/A2UI)
- [A2UI 规范文档](https://github.com/google/A2UI/tree/main/specification)
- [a2ui-vue 项目](file:///Users/chenyun/MyOwnSpace/a2ui-vue)
