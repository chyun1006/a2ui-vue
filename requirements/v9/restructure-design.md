# A2UI Vue 组件库重构设计文档

## 📋 设计目标

将当前项目重构为**纯组件库**，将示例应用、路由、视图等内容移至 `examples` 目录，实现组件库与示例应用的完全分离。

---

## 🎯 核心原则

1. **组件库纯净性** - `src/` 只包含组件库核心代码
2. **示例独立性** - `examples/` 包含完整的示例应用
3. **构建分离** - 组件库构建和示例应用构建分离
4. **依赖最小化** - 组件库只依赖必要的包

---

## 📁 新项目结构

```
a2ui-vue/
├── src/                          # 组件库核心代码（仅用于构建库）
│   ├── components/
│   │   ├── A2UIRender.vue       # 主渲染组件
│   │   ├── A2UISurface.vue      # 表面组件
│   │   ├── A2UIProvider.vue     # 依赖注入提供者
│   │   ├── A2UIRenderer.vue     # 组件渲染器
│   │   └── a2ui/                # A2UI 子组件
│   │       ├── display/         # 显示组件
│   │       ├── input/           # 输入组件
│   │       └── layout/          # 布局组件
│   ├── core/                     # 核心逻辑
│   │   ├── A2UIManager.js       # UI 管理器
│   │   ├── Surface.js           # 表面类
│   │   ├── DataModel.js         # 数据模型
│   │   ├── singleton.js         # 单例管理
│   │   └── utils.js             # 工具函数
│   ├── message/                  # 消息处理
│   │   └── MessageHandler.js
│   ├── types/                    # 类型定义
│   │   ├── a2ui.js              # A2UI 类型
│   │   └── constants.js         # 常量
│   ├── composables/              # 组合式函数
│   │   ├── useDataBinding.js
│   │   ├── useA2UIContext.js
│   │   └── useComponentRegistry.js
│   ├── styles/                   # 样式文件
│   │   ├── index.css            # 主样式入口
│   │   └── components.css       # 组件样式
│   ├── processor.js              # 消息处理器
│   └── index.js                  # 库入口文件
│
├── examples/                     # 示例应用（独立项目）
│   ├── basic/                    # 基础示例
│   │   ├── src/
│   │   │   ├── App.vue
│   │   │   ├── main.js
│   │   │   └── views/
│   │   │       ├── SimpleDemo.vue
│   │   │       └── DataBindingDemo.vue
│   │   ├── index.html
│   │   ├── package.json
│   │   └── vite.config.js
│   ├── advanced/                 # 高级示例
│   │   ├── src/
│   │   │   ├── App.vue
│   │   │   ├── main.js
│   │   │   ├── router/
│   │   │   ├── stores/
│   │   │   └── views/
│   │   │       ├── uiDemo.vue
│   │   │       └── ComprehensiveDemo.vue
│   │   ├── index.html
│   │   ├── package.json
│   │   └── vite.config.js
│   └── README.md                 # 示例说明
│
├── docs/                         # 文档
│   ├── README.md                 # 快速开始
│   ├── API.md                    # API 文档
│   ├── GUIDE.md                  # 使用指南
│   └── COMPONENTS.md             # 组件文档
│
├── scripts/                      # 构建脚本
│   └── generate-manifest.js
│
├── dist/                         # 构建输出（库）
│   ├── a2ui-vue.es.js
│   ├── a2ui-vue.cjs.js
│   └── style.css
│
├── vite.config.lib.js           # 库构建配置
├── package.json                  # 库的 package.json
├── tailwind.config.js
├── postcss.config.js
└── README.md                     # 库说明文档
```

---

## 🔄 目录迁移对照表

### 需要保留在 `src/` 的内容（组件库核心）

| 当前位置                          | 新位置                            | 说明                  |
| --------------------------------- | --------------------------------- | --------------------- |
| `src/components/A2UIRender.vue`   | `src/components/A2UIRender.vue`   | ✅ 保留               |
| `src/components/A2UISurface.vue`  | `src/components/A2UISurface.vue`  | ✅ 保留               |
| `src/components/A2UIProvider.vue` | `src/components/A2UIProvider.vue` | ✅ 保留               |
| `src/components/A2UIRenderer.vue` | `src/components/A2UIRenderer.vue` | ✅ 保留               |
| `src/components/a2ui/`            | `src/components/a2ui/`            | ✅ 保留（所有子组件） |
| `src/core/`                       | `src/core/`                       | ✅ 保留               |
| `src/message/`                    | `src/message/`                    | ✅ 保留               |
| `src/types/`                      | `src/types/`                      | ✅ 保留               |
| `src/composables/`                | `src/composables/`                | ✅ 保留               |
| `src/styles/`                     | `src/styles/`                     | ✅ 保留               |
| `src/processor.js`                | `src/processor.js`                | ✅ 保留               |
| `src/index.js`                    | `src/index.js`                    | ✅ 保留               |

### 需要移动到 `examples/` 的内容（示例应用）

| 当前位置      | 新位置                          | 说明    |
| ------------- | ------------------------------- | ------- |
| `src/App.vue` | `examples/advanced/src/App.vue` | ❌ 移动 |
| `src/main.js` | `examples/advanced/src/main.js` | ❌ 移动 |
| `src/views/`  | `examples/advanced/src/views/`  | ❌ 移动 |
| `src/router/` | `examples/advanced/src/router/` | ❌ 移动 |
| `src/stores/` | `examples/advanced/src/stores/` | ❌ 移动 |
| `src/mock/`   | `examples/advanced/src/mock/`   | ❌ 移动 |
| `index.html`  | `examples/advanced/index.html`  | ❌ 移动 |
| `public/`     | `examples/advanced/public/`     | ❌ 移动 |

### 需要删除或重构的内容

| 当前位置         | 处理方式                           | 说明             |
| ---------------- | ---------------------------------- | ---------------- |
| `src/a2ui-spec/` | ❌ 移至 `docs/` 或删除             | 规范文档         |
| `src/lib/`       | ⚠️ 检查后决定                      | 需要确认用途     |
| `src/utils/`     | ⚠️ 合并到 `core/utils.js`          | 工具函数统一管理 |
| `vite.config.js` | ✅ 保留，新增 `vite.config.lib.js` | 开发配置保留     |

---

## 📦 package.json 重构

### 组件库的 package.json（根目录）

```json
{
  "name": "a2ui-vue",
  "version": "1.0.0",
  "description": "A2UI Vue 3 渲染器组件库",
  "type": "module",
  "private": false,
  "main": "./dist/a2ui-vue.cjs.js",
  "module": "./dist/a2ui-vue.es.js",
  "exports": {
    ".": {
      "import": "./dist/a2ui-vue.es.js",
      "require": "./dist/a2ui-vue.cjs.js"
    },
    "./dist/style.css": "./dist/style.css"
  },
  "files": ["dist", "README.md", "LICENSE"],
  "scripts": {
    "dev": "cd examples/advanced && npm run dev",
    "build": "vite build --config vite.config.lib.js",
    "preview": "cd examples/advanced && npm run preview",
    "docs:dev": "vitepress dev docs",
    "docs:build": "vitepress build docs"
  },
  "peerDependencies": {
    "vue": "^3.5.0"
  },
  "dependencies": {
    "@vueuse/core": "^14.1.0",
    "class-variance-authority": "^0.7.1",
    "clsx": "^2.1.1",
    "lucide-vue-next": "^0.562.0",
    "marked": "^12.0.0",
    "pinia": "^2.1.7",
    "radix-vue": "^1.9.11",
    "reka-ui": "^2.7.0",
    "tailwind-merge": "^3.4.0"
  },
  "devDependencies": {
    "@vitejs/plugin-vue": "^5.2.1",
    "autoprefixer": "^10.4.20",
    "postcss": "^8.4.49",
    "tailwindcss": "^3.4.17",
    "vite": "^6.0.5",
    "vue": "^3.5.13"
  },
  "keywords": ["vue", "vue3", "a2ui", "ai-ui", "components", "renderer"],
  "author": "Your Name",
  "license": "MIT"
}
```

### 示例应用的 package.json（examples/advanced/）

```json
{
  "name": "a2ui-vue-example-advanced",
  "version": "1.0.0",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "a2ui-vue": "file:../..",
    "vue": "^3.5.13",
    "vue-router": "^4.5.0",
    "pinia": "^2.1.7"
  },
  "devDependencies": {
    "@vitejs/plugin-vue": "^5.2.1",
    "vite": "^6.0.5"
  }
}
```

---

## ⚙️ 构建配置

### vite.config.lib.js（库构建配置）

```javascript
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'
import { fileURLToPath } from 'url'

const __dirname = fileURLToPath(new URL('.', import.meta.url))

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
  },
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.js'),
      name: 'A2UIVue',
      formats: ['es', 'cjs'],
      fileName: (format) => `a2ui-vue.${format}.js`,
    },
    rollupOptions: {
      // 外部化 Vue，不打包到库中
      external: ['vue'],
      output: {
        globals: {
          vue: 'Vue',
        },
        // 保持导出为命名导出
        exports: 'named',
      },
    },
    sourcemap: true,
    emptyOutDir: true,
    outDir: 'dist',
  },
  css: {
    postcss: {
      plugins: [require('tailwindcss'), require('autoprefixer')],
    },
  },
})
```

### examples/advanced/vite.config.js（示例应用配置）

```javascript
import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://10.22.15.165:8856/',
        changeOrigin: true,
      },
    },
  },
})
```

---

## 📝 src/index.js（库入口）

```javascript
/**
 * A2UI Vue - AI-driven UI component library for Vue 3
 * @module a2ui-vue
 */

// ============ 主要组件 ============
export { default as A2UIRender } from './components/A2UIRender.vue'
export { default as A2UISurface } from './components/A2UISurface.vue'
export { default as A2UIProvider } from './components/A2UIProvider.vue'
export { default as A2UIRenderer } from './components/A2UIRenderer.vue'

// ============ 核心 API ============
export { createSignalA2uiMessageProcessor } from './processor.js'
export { A2UIManager } from './core/A2UIManager.js'
export { MessageHandler } from './message/MessageHandler.js'

// ============ 单例管理 ============
export { getGlobalManager, resetGlobalManager, hasGlobalManager } from './core/singleton.js'

// ============ 组合式函数 ============
export { useDataBinding } from './composables/useDataBinding.js'
export { useA2UIContext } from './composables/useA2UIContext.js'
export { useComponentRegistry } from './composables/useComponentRegistry.js'

// ============ 类型和常量 ============
export { A2UI_EVENTS, MESSAGE_TYPES, COMPONENT_TYPES } from './types/a2ui.js'

// ============ 工具函数 ============
export { parseDataContents, deepClone, mergeObjects } from './core/utils.js'

// ============ 样式（自动注入） ============
import './styles/index.css'
```

---

## 🚀 实施步骤

### 阶段 1：准备工作（1 天）

**任务清单：**

- [ ] 创建 `examples/` 目录结构
- [ ] 创建 `examples/basic/` 基础示例
- [ ] 创建 `examples/advanced/` 高级示例
- [ ] 创建 `docs/` 文档目录

### 阶段 2：迁移示例应用（1-2 天）

**任务清单：**

- [ ] 移动 `src/App.vue` → `examples/advanced/src/App.vue`
- [ ] 移动 `src/main.js` → `examples/advanced/src/main.js`
- [ ] 移动 `src/views/` → `examples/advanced/src/views/`
- [ ] 移动 `src/router/` → `examples/advanced/src/router/`
- [ ] 移动 `src/stores/` → `examples/advanced/src/stores/`
- [ ] 移动 `src/mock/` → `examples/advanced/src/mock/`
- [ ] 移动 `index.html` → `examples/advanced/index.html`
- [ ] 移动 `public/` → `examples/advanced/public/`

### 阶段 3：清理 src/ 目录（0.5 天）

**任务清单：**

- [ ] 删除 `src/` 中的应用相关文件
- [ ] 检查 `src/lib/` 和 `src/utils/` 内容
- [ ] 合并或删除不必要的文件
- [ ] 确保 `src/` 只包含组件库核心代码

### 阶段 4：配置构建（0.5 天）

**任务清单：**

- [ ] 创建 `vite.config.lib.js`
- [ ] 更新根目录 `package.json`
- [ ] 创建 `examples/advanced/package.json`
- [ ] 创建 `examples/basic/package.json`
- [ ] 配置 `.npmignore`

### 阶段 5：测试验证（1 天）

**任务清单：**

- [ ] 构建组件库：`npm run build`
- [ ] 在 `examples/advanced` 中安装并测试
- [ ] 在 `examples/basic` 中测试基础功能
- [ ] 验证所有导出的 API
- [ ] 检查样式是否正确加载

### 阶段 6：文档编写（1-2 天）

**任务清单：**

- [ ] 编写 `README.md`（库说明）
- [ ] 编写 `docs/API.md`
- [ ] 编写 `docs/GUIDE.md`
- [ ] 编写 `examples/README.md`
- [ ] 更新所有示例代码

**总计：5-7 天**

---

## 📋 迁移检查清单

### 组件库核心（src/）

- [ ] 只包含组件、核心逻辑、类型定义
- [ ] 无路由、视图、应用入口文件
- [ ] 无 mock 数据
- [ ] 无业务逻辑
- [ ] `index.js` 正确导出所有 API

### 示例应用（examples/）

- [ ] 包含完整的应用代码
- [ ] 有独立的 `package.json`
- [ ] 有独立的构建配置
- [ ] 正确引用组件库（`a2ui-vue`）
- [ ] 可以独立运行

### 构建配置

- [ ] `vite.config.lib.js` 配置正确
- [ ] `package.json` 导出配置正确
- [ ] 外部依赖配置正确（只有 Vue）
- [ ] CSS 处理配置正确

### 文档

- [ ] README 完整清晰
- [ ] API 文档详细
- [ ] 示例代码可运行
- [ ] 安装说明准确

---

## ✅ 验收标准

1. **组件库构建成功**

   ```bash
   npm run build
   # 生成 dist/a2ui-vue.es.js, dist/a2ui-vue.cjs.js, dist/style.css
   ```

2. **示例应用运行成功**

   ```bash
   cd examples/advanced
   npm install
   npm run dev
   # 应用正常启动，所有功能正常
   ```

3. **组件库可独立使用**

   ```bash
   cd examples/basic
   npm install
   npm run dev
   # 可以导入并使用组件库
   ```

4. **目录结构清晰**
   - `src/` 只包含组件库核心代码
   - `examples/` 包含示例应用
   - `docs/` 包含文档

5. **文档完整**
   - README 说明清晰
   - API 文档详细
   - 示例代码可运行

---

## 🎯 最终目标

**组件库使用方式：**

```javascript
// 在任何 Vue 3 项目中
import { A2UIRender, createSignalA2uiMessageProcessor } from 'a2ui-vue'
import 'a2ui-vue/dist/style.css'

const processor = createSignalA2uiMessageProcessor()
// 使用组件库
```

**本地开发方式：**

```bash
# 开发组件库
npm run build

# 运行示例应用
npm run dev  # 实际运行 examples/advanced

# 构建文档
npm run docs:build
```

---

## 📌 注意事项

1. **依赖管理**
   - 组件库的 `dependencies` 会被打包
   - Vue 必须是 `peerDependencies`
   - 示例应用可以有自己的依赖

2. **样式处理**
   - Tailwind CSS 在构建时编译到 CSS
   - 使用者不需要配置 Tailwind

3. **路径引用**
   - 示例应用中使用 `a2ui-vue` 导入
   - 本地开发使用 `file:../..` 引用

4. **版本管理**
   - 组件库遵循语义化版本
   - 示例应用版本独立管理

---

## 🔄 后续优化

1. **Monorepo 管理**（可选）
   - 使用 pnpm workspace 或 lerna
   - 统一管理依赖版本

2. **自动化测试**
   - 单元测试
   - E2E 测试

3. **CI/CD**
   - 自动构建
   - 自动发布

4. **文档站点**
   - VitePress 文档站点
   - 在线示例

---

**设计完成时间**: 2026-01-13  
**预计实施周期**: 5-7 天  
**状态**: ✅ 设计完成，等待确认后实施
