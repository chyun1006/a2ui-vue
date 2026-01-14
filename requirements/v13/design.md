# 聊天功能设计文档

## 需求概述

实现一个聊天页面，支持用户发送消息和接收服务端返回的 A2UI 渲染内容。

## 功能设计

### 1. 页面布局

```
┌─────────────────────────────────────┐
│                                     │
│         聊天消息区域                 │
│         (可滚动)                     │
│                                     │
│  ┌──────────────┐                  │
│  │ 服务端消息    │ ← A2UI 渲染      │
│  └──────────────┘                  │
│                  ┌──────────────┐  │
│                  │  用户消息     │  │
│                  └──────────────┘  │
│                                     │
├─────────────────────────────────────┤
│  ┌────────────────┐  ┌────┐       │
│  │  输入框         │  │发送│       │
│  └────────────────┘  └────┘       │
└─────────────────────────────────────┘
```

### 2. 核心功能

#### 2.1 消息发送

- 用户在底部输入框输入消息
- 点击发送按钮或按 Enter 键发送
- 发送后清空输入框
- 消息立即显示在聊天区域（用户消息在右侧）

#### 2.2 消息接收

- 调用 `/api/chat` 接口发送消息
- 解析返回的 A2UI JSON 数据
- 使用 `a2uiRender` 组件渲染服务端消息
- 服务端消息显示在左侧

#### 2.3 消息存储

```javascript
const messages = ref([
  {
    id: timestamp,
    type: "user" | "assistant",
    content: string, // 用户消息文本
    a2uiMessages: array, // A2UI 消息数组
    timestamp: Date,
  },
]);
```

### 3. 技术实现

#### 3.1 组件结构

**使用的 shadcn-vue 组件**：

- `Button` - 发送按钮
- `Textarea` - 消息输入框
- `Card` - 消息气泡容器

**使用的 A2UI 组件**：

- `a2uiRender` - 渲染服务端返回的 A2UI 内容
- `createSignalA2uiMessageProcessor` - 处理 A2UI 消息

#### 3.2 状态管理

```javascript
const userInput = ref(""); // 用户输入
const messages = ref([]); // 消息列表
const isLoading = ref(false); // 加载状态
const chatContainer = ref(null); // 聊天容器引用
```

#### 3.3 消息流程

```
用户输入 → 点击发送 → 添加用户消息到列表 → 调用 API
                                              ↓
显示助手消息 ← 处理 A2UI 数据 ← 解析响应 ← 接收响应
```

#### 3.4 API 集成

```javascript
const sendMessage = async () => {
  // 1. 添加用户消息
  messages.value.unshift(userMessage);

  // 2. 调用 API
  const res = await fetch("/api/chat", {
    body: JSON.stringify(payload),
    method: "POST",
  });

  // 3. 解析 A2UI JSON
  const [, a2uiJson] = messageStr.split("---a2ui_JSON---");
  const a2uiMessages = JSON.parse(a2uiJson.trim());

  // 4. 处理 A2UI 消息
  processor.processMessages(a2uiMessages, { clearBefore: false });

  // 5. 添加助手消息
  messages.value.unshift(assistantMessage);
};
```

### 4. 样式设计

#### 4.1 布局

- 使用 Flexbox 垂直布局
- 聊天区域占满剩余空间 (`flex-1`)
- 输入区域固定在底部

#### 4.2 消息样式

- 用户消息：右对齐，蓝色背景
- 助手消息：左对齐，白色背景
- 最大宽度 70%，自适应内容

#### 4.3 交互效果

- 加载动画：三个跳动的圆点
- 滚动行为：新消息自动滚动到底部
- 按钮状态：输入为空或加载中时禁用

### 5. 用户体验优化

#### 5.1 键盘操作

- Enter 键发送消息
- Shift + Enter 换行

#### 5.2 防重复提交

- 发送中禁用发送按钮
- 使用 `isLoading` 状态控制

#### 5.3 错误处理

- API 调用失败时显示错误消息
- 使用 try-catch 捕获异常

#### 5.4 自动滚动

- 发送消息后自动滚动到底部
- 使用 `nextTick` 确保 DOM 更新后滚动

## 文件结构

```
examples/src/
├── views/
│   └── Demo2.vue          # 聊天页面主组件
└── router/
    └── index.js           # 路由配置（添加 /chat/demo2）
```

## 路由配置

```javascript
{
  path: "/chat",
  component: EmptyLayout,
  children: [
    {
      path: "demo2",
      name: "demo2",
      component: () => import("../views/Demo2.vue"),
      meta: { title: "聊天Demo" },
    },
  ],
}
```

## 访问方式

启动开发服务器后访问：

```
http://localhost:5173/chat/demo2
```

## 与 Demo1 的区别

| 特性     | Demo1          | Demo2           |
| -------- | -------------- | --------------- |
| 布局     | 简单表单       | 聊天界面        |
| 消息展示 | 单次渲染       | 消息列表        |
| 用户输入 | A2UI TextField | shadcn Textarea |
| 消息历史 | 无             | 有（数组存储）  |
| 样式     | 基础样式       | 现代聊天 UI     |
| 组件库   | 混合           | shadcn-vue      |

## 技术栈

- **Vue 3** - 组合式 API
- **shadcn-vue** - UI 组件库
- **Tailwind CSS** - 样式框架
- **A2UI** - 服务端 UI 渲染
- **lucide-vue-next** - 图标库

## 实现完成

✅ 聊天页面组件 (`Demo2.vue`)
✅ 路由配置
✅ 消息发送功能
✅ 消息接收和 A2UI 渲染
✅ 用户体验优化
✅ 响应式布局
