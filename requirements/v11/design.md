# 项目结构重构设计文档

## 一、需求分析

### 1.1 核心需求

将 A2UI 组件相关的文件全部移动到 `lib` 目录下，包括构建脚本、package.json 等，使项目结构更加清晰，同时保持现有功能不变。

### 1.2 目标

1. **清晰的项目结构** - 组件库代码与示例代码完全分离
2. **独立的构建配置** - 组件库有自己的构建配置和依赖管理
3. **保持功能不变** - 所有现有功能正常工作
4. **更好的可维护性** - 更容易理解和维护的项目结构

---

## 二、当前项目结构分析

### 2.1 现有结构

```
a2ui-vue/
├── src/                          # 组件库源码
│   ├── components/               # A2UI 组件
│   ├── core/                     # 核心逻辑
│   ├── message/                  # 消息处理
│   ├── composables/              # 组合式函数
│   ├── styles/                   # 样式文件
│   ├── types/                    # 类型定义
│   ├── index.js                  # 入口文件
│   └── processor.js              # 处理器
├── examples/                     # 示例应用
│   ├── src/
│   ├── package.json
│   └── vite.config.js
├── scripts/                      # 构建脚本
├── requirements/                 # 需求文档
├── dist/                         # 构建输出
├── package.json                  # 根 package.json
├── vite.config.lib.js           # 组件库构建配置
├── tailwind.config.js           # Tailwind 配置
├── postcss.config.js            # PostCSS 配置
├── eslint.config.js             # ESLint 配置
├── tsconfig.json                # TypeScript 配置
└── README.md
```

### 2.2 存在的问题

1. **组件库文件分散** - 源码、构建配置、依赖管理分散在根目录
2. **职责不清晰** - 根目录混合了组件库和项目管理的文件
3. **难以独立发布** - 组件库没有独立的目录结构
4. **examples 依赖混乱** - 使用 `file:..` 引用父目录

---

## 三、新项目结构设计

### 3.1 目标结构

```
a2ui-vue/
├── lib/                          # 组件库（新增）
│   ├── src/                      # 组件库源码（从根目录移动）
│   │   ├── components/
│   │   ├── core/
│   │   ├── message/
│   │   ├── composables/
│   │   ├── styles/
│   │   ├── types/
│   │   ├── index.js
│   │   └── processor.js
│   ├── dist/                     # 构建输出（从根目录移动）
│   ├── scripts/                  # 构建脚本（从根目录移动）
│   ├── package.json              # 组件库 package.json（从根目录移动）
│   ├── vite.config.js            # 组件库构建配置（重命名）
│   ├── tailwind.config.js        # Tailwind 配置（从根目录移动）
│   ├── postcss.config.js         # PostCSS 配置（从根目录移动）
│   ├── tsconfig.json             # TypeScript 配置（从根目录移动）
│   ├── eslint.config.js          # ESLint 配置（从根目录移动）
│   ├── components.json           # shadcn 配置（从根目录移动）
│   ├── .prettierrc.json          # Prettier 配置（从根目录移动）
│   ├── .oxlintrc.json            # Oxlint 配置（从根目录移动）
│   └── README.md                 # 组件库 README（从根目录移动）
├── examples/                     # 示例应用（保持不变）
│   ├── src/
│   ├── package.json              # 更新依赖路径
│   └── vite.config.js
├── requirements/                 # 需求文档（保持不变）
├── .git/                         # Git 配置（保持不变）
├── .gitignore                    # Git ignore（保持不变）
├── .editorconfig                 # 编辑器配置（保持不变）
├── pnpm-workspace.yaml           # pnpm workspace 配置（新增）
├── package.json                  # 根 package.json（简化，用于 workspace 管理）
└── README.md                     # 项目总览 README（新增）
```

### 3.2 关键变化

1. **新增 `lib/` 目录** - 所有组件库相关文件移入此目录
2. **使用 pnpm workspace** - 管理 lib 和 examples 的依赖关系
3. **独立的构建配置** - lib 目录有自己完整的构建环境
4. **清晰的职责分离** - 根目录只负责 workspace 管理

---

## 四、详细实施方案

### 4.1 文件迁移清单

#### 移动到 `lib/` 目录

```bash
# 源码目录
src/ → lib/src/

# 构建输出
dist/ → lib/dist/

# 构建脚本
scripts/ → lib/scripts/

# 配置文件
package.json → lib/package.json
vite.config.lib.js → lib/vite.config.js
tailwind.config.js → lib/tailwind.config.js
postcss.config.js → lib/postcss.config.js
tsconfig.json → lib/tsconfig.json
tsconfig.node.json → lib/tsconfig.node.json
eslint.config.js → lib/eslint.config.js
components.json → lib/components.json
.prettierrc.json → lib/.prettierrc.json
.oxlintrc.json → lib/.oxlintrc.json

# 文档
README_A2UI.md → lib/README.md
```

#### 保持在根目录

```bash
# 示例应用
examples/

# 需求文档
requirements/

# Git 配置
.git/
.gitignore
.gitattributes
.editorconfig

# IDE 配置
.vscode/
.claude/

# 临时文档（可选择性删除或移动）
PROGRESS.md
INPUT_COMPONENTS_TEST.md
SURFACE_CLEANUP_TEST.md
```

#### 新增文件

```bash
# Workspace 配置
pnpm-workspace.yaml

# 根 package.json（简化版）
package.json

# 项目总览 README
README.md
```

### 4.2 配置文件更新

#### 1. 新建 `pnpm-workspace.yaml`

```yaml
packages:
  - 'lib'
  - 'examples'
```

#### 2. 更新根 `package.json`

```json
{
  "name": "a2ui-vue-workspace",
  "version": "1.0.0",
  "private": true,
  "description": "A2UI Vue 3 组件库工作空间",
  "type": "module",
  "scripts": {
    "dev": "pnpm --filter examples dev",
    "build:lib": "pnpm --filter a2ui-vue build",
    "build:examples": "pnpm --filter examples build",
    "build": "pnpm build:lib && pnpm build:examples",
    "lint": "pnpm --filter a2ui-vue lint",
    "format": "pnpm --filter a2ui-vue format"
  },
  "engines": {
    "node": "^20.19.0 || >=22.12.0",
    "pnpm": ">=9.0.0"
  },
  "devDependencies": {
    "pnpm": "^10.0.0"
  }
}
```

#### 3. 更新 `lib/package.json`

```json
{
  "name": "a2ui-vue",
  "version": "1.0.0",
  "description": "A2UI Vue 3 渲染器组件库",
  "private": false,
  "type": "module",
  "main": "./dist/a2ui-vue.cjs.js",
  "module": "./dist/a2ui-vue.es.js",
  "exports": {
    ".": {
      "import": "./dist/a2ui-vue.es.js",
      "require": "./dist/a2ui-vue.cjs.js"
    },
    "./dist/a2ui-vue.css": "./dist/a2ui-vue.css",
    "./dist/style.css": "./dist/a2ui-vue.css"
  },
  "files": ["dist", "README.md"],
  "scripts": {
    "build": "vite build",
    "lint": "run-s lint:*",
    "lint:oxlint": "oxlint . --fix",
    "lint:eslint": "eslint . --fix --cache",
    "format": "prettier --write --experimental-cli src/",
    "generate:manifest": "node scripts/generate-manifest.js && node scripts/generate-server-schema.js",
    "generate:server-schema": "node scripts/generate-server-schema.js"
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
    "@eslint/js": "^9.39.2",
    "@vitejs/plugin-vue": "^6.0.3",
    "@vitejs/plugin-vue-jsx": "^5.1.3",
    "@vue/compiler-sfc": "^3.5.26",
    "@vue/eslint-config-prettier": "^10.2.0",
    "autoprefixer": "^10.4.20",
    "comment-parser": "^1.4.1",
    "eslint": "^9.39.2",
    "eslint-plugin-oxlint": "~1.38.0",
    "eslint-plugin-vue": "~10.6.2",
    "globals": "^17.0.0",
    "npm-run-all2": "^8.0.4",
    "oxlint": "~1.38.0",
    "postcss": "^8.4.49",
    "prettier": "3.7.4",
    "tailwindcss": "^3.4.17",
    "typescript": "^5.7.2",
    "vite": "^7.3.0",
    "vite-plugin-vue-devtools": "^8.0.5",
    "vue": "^3.5.26",
    "vue-router": "^4.6.4"
  },
  "peerDependencies": {
    "vue": "^3.5.0"
  }
}
```

#### 4. 更新 `lib/vite.config.js`

```javascript
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'
import { fileURLToPath } from 'url'
import tailwindcss from 'tailwindcss'
import autoprefixer from 'autoprefixer'

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
      external: ['vue'],
      output: {
        globals: {
          vue: 'Vue',
        },
        exports: 'named',
      },
    },
    sourcemap: true,
    emptyOutDir: true,
    outDir: 'dist',
  },
  css: {
    postcss: {
      plugins: [tailwindcss, autoprefixer],
    },
  },
})
```

#### 5. 更新 `examples/package.json`

```json
{
  "name": "a2ui-vue-examples",
  "version": "1.0.0",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "a2ui-vue": "workspace:*",
    "vue": "^3.5.13",
    "vue-router": "^4.5.0",
    "pinia": "^2.1.7"
  },
  "devDependencies": {
    "@vitejs/plugin-vue": "^5.2.1",
    "@vitejs/plugin-vue-jsx": "^4.1.1",
    "vite": "^6.0.5",
    "vite-plugin-vue-devtools": "^7.6.11"
  }
}
```

#### 6. 新建根 `README.md`

````markdown
# A2UI Vue

A2UI Vue 3 渲染器组件库工作空间

## 项目结构

- `lib/` - A2UI Vue 组件库
- `examples/` - 示例应用
- `requirements/` - 需求文档

## 快速开始

### 安装依赖

```bash
pnpm install
```
````

### 开发

```bash
# 启动示例应用
pnpm dev

# 构建组件库
pnpm build:lib

# 构建示例应用
pnpm build:examples
```

### 组件库开发

详见 [lib/README.md](./lib/README.md)

## License

MIT

````

---

## 五、实施步骤

### 5.1 准备阶段

1. ✅ 创建设计文档
2. ⏳ 备份当前代码（创建 git 分支）
3. ⏳ 确认所有测试通过

### 5.2 执行阶段

#### 步骤 1: 创建新结构

```bash
# 创建 lib 目录
mkdir lib

# 移动源码
mv src lib/
mv dist lib/

# 移动构建脚本
mv scripts lib/

# 移动配置文件
mv vite.config.lib.js lib/vite.config.js
mv tailwind.config.js lib/
mv postcss.config.js lib/
mv tsconfig.json lib/
mv tsconfig.node.json lib/
mv eslint.config.js lib/
mv components.json lib/
mv .prettierrc.json lib/
mv .oxlintrc.json lib/

# 移动 package.json 和 lock 文件
mv package.json lib/
mv pnpm-lock.yaml lib/

# 移动文档
mv README_A2UI.md lib/README.md
````

#### 步骤 2: 创建 workspace 配置

```bash
# 创建 pnpm-workspace.yaml
# 创建新的根 package.json
# 创建新的根 README.md
```

#### 步骤 3: 更新配置文件

```bash
# 更新 lib/package.json
# 更新 examples/package.json
# 更新其他配置文件中的路径引用
```

#### 步骤 4: 安装依赖

```bash
# 在根目录安装
pnpm install
```

#### 步骤 5: 测试验证

```bash
# 构建组件库
pnpm build:lib

# 启动示例应用
pnpm dev

# 测试所有功能
```

### 5.3 验证阶段

1. ⏳ 组件库构建成功
2. ⏳ 示例应用正常运行
3. ⏳ 所有组件正常渲染
4. ⏳ 页面切换正常
5. ⏳ 输入组件正常工作
6. ⏳ Surface 清理正常

---

## 六、风险评估与缓解

### 6.1 潜在风险

1. **路径引用错误**
   - 风险：移动文件后路径引用失效
   - 缓解：仔细检查所有配置文件中的路径引用

2. **依赖安装问题**
   - 风险：workspace 依赖关系配置错误
   - 缓解：使用 pnpm workspace 的标准配置

3. **构建失败**
   - 风险：构建配置路径错误
   - 缓解：逐步测试，确保每个步骤成功

4. **Git 历史丢失**
   - 风险：移动文件可能影响 Git 历史
   - 缓解：使用 `git mv` 命令保留历史

### 6.2 回滚方案

如果重构失败，可以通过以下方式回滚：

```bash
# 切换回重构前的分支
git checkout main

# 或者重置到重构前的提交
git reset --hard <commit-hash>
```

---

## 七、预期收益

### 7.1 结构清晰

- 组件库代码完全独立
- 示例应用与组件库分离
- 职责明确，易于理解

### 7.2 更好的可维护性

- 独立的构建配置
- 独立的依赖管理
- 更容易进行版本控制

### 7.3 更好的开发体验

- 使用 pnpm workspace 统一管理
- 更快的依赖安装
- 更清晰的开发流程

### 7.4 更容易发布

- 组件库有独立的目录结构
- 更容易发布到 npm
- 更容易被其他项目引用

---

## 八、后续工作

1. ⏳ 更新 CI/CD 配置
2. ⏳ 更新文档
3. ⏳ 添加更多测试
4. ⏳ 优化构建流程

---

## 九、总结

本次重构将 A2UI Vue 项目从单一结构改造为 monorepo 结构，通过 pnpm workspace 管理组件库和示例应用。重构后的项目结构更加清晰，职责分明，易于维护和扩展。

**核心改进**：

1. ✅ 组件库代码独立到 `lib/` 目录
2. ✅ 使用 pnpm workspace 管理依赖
3. ✅ 清晰的项目结构
4. ✅ 保持所有功能不变
