# A2UI Vue 示例

本目录包含 A2UI Vue 组件库的完整使用示例。

## 📁 示例项目

### advanced - 完整示例应用

包含所有功能演示的完整应用，通过路由在不同页面展示各种示例。

**包含页面：**

- **基础示例** (`/basic`) - 简单文本显示、按钮交互、数据绑定
- **综合演示** (`/comprehensive`) - 完整的 UI 演示
- **UI 组件演示** (`/ui-demo`) - 所有组件的详细演示

**运行方式：**

```bash
cd examples/advanced
npm install
npm run dev
```

访问：http://localhost:5173

---

## 🚀 快速开始

### 1. 构建组件库

在根目录执行：

```bash
npm run build
```

### 2. 运行示例应用

```bash
cd examples/advanced
npm install
npm run dev
```

然后访问 http://localhost:5173，通过顶部导航切换不同的示例页面。

---

## 📝 使用说明

### 基础用法

```vue
<template>
  <a2ui-render :processor="processor" @action="handleAction" />
</template>

<script setup>
import { a2uiRender, createSignalA2uiMessageProcessor } from 'a2ui-vue'
import 'a2ui-vue/dist/a2ui-vue.css'

const processor = createSignalA2uiMessageProcessor()

// 初始化 UI
processor.processMessage({
  beginRendering: {
    surfaceId: 'main',
    root: 'root-component',
  },
})

// 创建组件
processor.processMessage({
  surfaceUpdate: {
    surfaceId: 'main',
    components: [
      {
        id: 'root-component',
        component: {
          Text: {
            text: { literalString: 'Hello World' },
          },
        },
      },
    ],
  },
})

const handleAction = (action) => {
  console.log('Action:', action)
}
</script>
```

---

## 📚 更多文档

- [API 文档](../docs/API.md)
- [组件文档](../docs/COMPONENTS.md)
- [使用指南](../docs/GUIDE.md)
