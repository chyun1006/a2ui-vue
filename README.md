# A2UI Vue

> AI-driven UI component library for Vue 3

基于 Vue 3 的 A2UI (Agent to UI) 渲染器组件库，实现了 Google A2UI 规范 v0.8，用于 AI 生成动态用户界面。

[![npm version](https://img.shields.io/npm/v/a2ui-vue.svg)](https://www.npmjs.com/package/a2ui-vue)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## ✨ 特性

| --------------- | -------------- | --------------------------------------- |
| **Core** | A2UI 核心逻辑 | `src/core/A2UIManager.js`, `Surface.js` |
| **Components** | 18个 A2UI 组件 | `src/components/a2ui/` |
| **Composables** | Vue 组合式函数 | `src/composables/` |
| **Stores** | Pinia 状态管理 | `src/stores/` |
| **Message** | 消息处理系统 | `src/message/` |
| **Types** | 类型定义 | `src/types/` |

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

## 📁 项目结构

```
a2ui-vue/
├── src/                    # 组件库源代码
│   ├── components/         # A2UI 组件
│   │   ├── a2ui/          # 子组件
│   │   │   ├── display/   # 展示组件
│   │   │   ├── input/     # 交互组件
│   │   │   └── layout/    # 布局组件
│   │   └── ui/            # shadcn-vue 基础组件
│   ├── composables/       # Vue composables
│   ├── core/             # A2UI 核心逻辑
│   ├── message/          # 消息处理
│   ├── types/            # 类型定义
│   └── index.js          # 库入口
├── examples/             # 示例应用
│   ├── basic/           # 基础示例
│   └── advanced/        # 高级示例
├── dist/                # 构建输出
└── docs/                # 文档
```

## 🔧 开发

### 本地开发

```bash
# 安装依赖
npm install

# 构建组件库
npm run build

# 运行示例应用
npm run dev  # 运行 examples/advanced
```

### 运行示例

```bash
# 基础示例
cd examples/basic
npm install
npm run dev

# 高级示例
cd examples/advanced
npm install
npm run dev
```

## 📚 文档

- [设计文档](./requirements/v9/restructure-design.md)
- [示例说明](./examples/README.md)

## 🤝 贡献

欢迎贡献代码！

## 📄 License

MIT © [Your Name]

## 🔗 相关链接

- [Google A2UI 规范](https://github.com/google/a2ui)
- [Vue 3](https://vuejs.org/)
- [shadcn-vue](https://www.shadcn-vue.com/)
