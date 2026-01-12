# A2UI Renderer

基于 Vue 3 的 A2UI (Agent to UI) 渲染器，实现了 Google A2UI 规范 v0.8，用于 AI 生成动态用户界面。

## 技术栈

- **Vue 3** + **TypeScript** + **Vite**
- **Pinia** (状态管理)
- **shadcn-vue** + **Tailwind CSS** (UI 组件)
- **Vue Router** (路由)

## 核心模块

| 模块            | 说明           | 关键文件                                |
| --------------- | -------------- | --------------------------------------- |
| **Core**        | A2UI 核心逻辑  | `src/core/A2UIManager.js`, `Surface.js` |
| **Components**  | 18个 A2UI 组件 | `src/components/a2ui/`                  |
| **Composables** | Vue 组合式函数 | `src/composables/`                      |
| **Stores**      | Pinia 状态管理 | `src/stores/`                           |
| **Message**     | 消息处理系统   | `src/message/`                          |
| **Types**       | 类型定义       | `src/types/`                            |

## A2UI 组件

### 展示组件 (5个)

Text, Image, Icon, Video, AudioPlayer

### 布局组件 (7个)

Row, Column, List, Card, Tabs, Modal, Divider

### 交互组件 (6个)

Button, TextField, CheckBox, DateTimeInput, MultipleChoice, Slider

## 主要功能

- **动态渲染** - 根据 A2UI 消息递归渲染组件树
- **数据绑定** - 支持字面量和路径引用
- **实时更新** - SSE 支持
- **事件系统** - 完整的动作处理

## 项目结构

```
src/
├── components/
│   ├── a2ui/           # A2UI 组件
│   │   ├── display/    # 展示组件
│   │   ├── input/      # 交互组件
│   │   └── layout/     # 布局组件
│   └── ui/             # shadcn-vue 基础组件
├── composables/        # Vue composables
├── core/              # A2UI 核心逻辑
├── message/           # 消息处理
├── stores/            # Pinia 状态管理
├── types/             # 类型定义
└── views/             # 示例页面
```

## 项目设置

```sh
pnpm install
```

### 开发

```sh
pnpm dev
```

### 构建

```sh
pnpm build
```

### 代码检查

```sh
pnpm lint
```

## 推荐 IDE

[VS Code](https://code.visualstudio.com/) + [Vue (Official)](https://marketplace.visualstudio.com/items?itemName=Vue.volar)

## 推荐 浏览器

- [Vue.js devtools](https://chromewebstore.google.com/detail/vuejs-devtools/nhdogjmejiglipccpnnnanhbledajbpd)
- 开启 DevTools 自定义对象格式化
