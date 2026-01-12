# A2UI 渲染器

基于 Vue 3 和 JavaScript 的 A2UI (Agent to UI) 渲染器实现。

## 项目简介

A2UI 是 Google 提出的新型 AI 问答交互方式，能够根据用户输入和上下文动态生成交互界面。本项目实现了一个完整的 A2UI v0.8 规范渲染器。

## 技术栈

- **Vue 3** - 使用 Composition API
- **JavaScript** - 原生 JavaScript 开发
- **Pinia** - 状态管理
- **Vite** - 构建工具
- **Marked** - Markdown 解析

## 项目结构

```
src/
├── components/
│   ├── a2ui/                    # A2UI 组件库
│   │   ├── display/             # 展示组件 (5个)
│   │   ├── layout/              # 布局组件 (7个)
│   │   ├── input/               # 交互组件 (6个)
│   │   └── index.js             # 组件导出
│   ├── A2UIRenderer.vue         # 核心渲染器
│   └── A2UISurface.vue          # Surface 容器
├── composables/
│   ├── useA2UIMessage.js        # 消息处理
│   ├── useDataBinding.js        # 数据绑定
│   ├── useA2UIAction.js         # 事件处理
│   └── useSSE.js                # SSE 连接
├── stores/
│   ├── surfaceStore.js          # Surface 状态
│   └── dataModelStore.js        # 数据模型状态
├── types/
│   ├── a2ui.js                  # A2UI 常量定义
│   ├── components.js            # 组件常量定义
│   └── messages.js              # 消息常量定义
├── utils/
│   ├── pathResolver.js          # 路径解析工具
│   └── validator.js             # 消息验证
├── mock/
│   └── messages.json            # Mock 数据
└── views/
    └── A2UIDemo.vue             # 演示页面
```

## 已实现的组件

### 展示组件 (5个)

- ✅ **Text** - 文本显示（支持 Markdown）
- ✅ **Image** - 图片显示
- ✅ **Icon** - Material Icons 图标
- ✅ **Video** - 视频播放器
- ✅ **AudioPlayer** - 音频播放器

### 布局组件 (7个)

- ✅ **Row** - 水平布局
- ✅ **Column** - 垂直布局
- ✅ **List** - 列表布局
- ✅ **Card** - 卡片容器
- ✅ **Tabs** - 选项卡
- ✅ **Modal** - 模态框
- ✅ **Divider** - 分隔线

### 交互组件 (6个)

- ✅ **Button** - 按钮
- ✅ **TextField** - 文本输入框
- ✅ **CheckBox** - 复选框
- ✅ **DateTimeInput** - 日期时间选择器
- ✅ **MultipleChoice** - 多选/单选
- ✅ **Slider** - 滑块

## 快速开始

### 安装依赖

```bash
npm install
# 或
pnpm install
```

### 运行开发服务器

```bash
npm run dev
```

访问 http://localhost:5173 查看演示页面。

### 构建生产版本

```bash
npm run build
```

## 使用方法

### 1. 基本使用

```vue
<script setup>
import { useA2UIMessage } from '@/composables/useA2UIMessage'
import A2UISurface from '@/components/A2UISurface.vue'

const { processMessage } = useA2UIMessage()

// 处理 A2UI 消息
const message = {
  beginRendering: {
    surfaceId: 'my-surface',
    root: 'root-component',
    styles: {
      primaryColor: '#1976d2',
    },
  },
}

processMessage(message)
</script>

<template>
  <A2UISurface surface-id="my-surface" @action="handleAction" />
</template>
```

### 2. 消息类型

A2UI 支持四种消息类型：

#### BeginRendering - 开始渲染

```javascript
{
  beginRendering: {
    surfaceId: 'surface-1',
    root: 'root-component-id',
    styles: {
      font: 'Roboto',
      primaryColor: '#1976d2'
    }
  }
}
```

#### SurfaceUpdate - 更新组件

```javascript
{
  surfaceUpdate: {
    surfaceId: 'surface-1',
    components: [
      {
        id: 'component-1',
        component: {
          Text: {
            text: { literalString: 'Hello World' },
            usageHint: 'h1'
          }
        }
      }
    ]
  }
}
```

#### DataModelUpdate - 更新数据

```javascript
{
  dataModelUpdate: {
    surfaceId: 'surface-1',
    path: '/user',
    contents: [
      { key: 'name', valueString: 'John' },
      { key: 'age', valueNumber: 30 }
    ]
  }
}
```

#### DeleteSurface - 删除 Surface

```javascript
{
  deleteSurface: {
    surfaceId: 'surface-1'
  }
}
```

### 3. 数据绑定

组件支持两种数据源：

**字面值 (Literal)**:

```javascript
{
  text: {
    literalString: 'Hello'
  }
}
```

**路径引用 (Path)**:

```javascript
{
  text: {
    path: '/user/name'
  }
}
```

### 4. 事件处理

```vue
<template>
  <A2UISurface surface-id="my-surface" @action="handleAction" />
</template>

<script setup>
const handleAction = (actionData) => {
  console.log('Action:', actionData.name)
  console.log('Context:', actionData.context)
}
</script>
```

## 核心功能

### 消息处理

- 支持 SSE (Server-Sent Events) 实时消息
- 支持 Mock 数据模拟
- 消息验证和错误处理

### 状态管理

- Surface 状态管理（组件树、样式）
- Data Model 状态管理（数据模型、路径访问）

### 数据绑定

- 支持 literal 和 path 两种数据源
- 自动解析和更新数据
- 双向绑定支持

### 动态渲染

- 递归组件渲染
- 动态组件加载
- 模板渲染（template children）

## 开发规范

### 代码风格

- 使用 Vue 3 Composition API
- 使用 JSDoc 注释提供类型提示
- 遵循 ESLint 和 Prettier 规范

### 组件开发

- 所有组件接收 `surfaceId` 和 `componentId` props
- 使用 `useDataBinding` 解析数据
- 使用 `useA2UIAction` 处理事件

### 解构规范

遵循用户规则，解构时兼容 null 的情况：

```javascript
const { data = {} } = response || {}
const { list = [], total = 0 } = data || {}
```

## 参考资料

- [A2UI 规范 v0.8](https://a2ui.org/specification/v0.8-a2ui/)
- [Vue 3 文档](https://vuejs.org/)
- [Pinia 文档](https://pinia.vuejs.org/)

## License

MIT
