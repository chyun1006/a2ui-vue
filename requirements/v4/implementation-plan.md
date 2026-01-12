# A2UI v4 实施计划 - 集成 shadcn-vue

## 目标

将 A2UI 基础组件替换为 shadcn-vue 组件，使用 TailwindCSS 进行样式管理。

---

## Phase 1: 安装和配置 TailwindCSS

### 1.1 安装依赖

```bash
npm install -D tailwindcss@latest postcss@latest autoprefixer@latest
npx tailwindcss init -p
```

### 1.2 配置 tailwind.config.js

```js
/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ['class'],
  content: ['./index.html', './src/**/*.{vue,js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
    },
  },
  plugins: [],
}
```

### 1.3 更新 CSS 入口文件

在 `src/styles/index.css` 顶部添加：

```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

---

## Phase 2: 安装和配置 shadcn-vue

### 2.1 安装 shadcn-vue CLI

```bash
npx shadcn-vue@latest init
```

配置选项：

- TypeScript: No
- Framework: Vite
- Style: Default
- Base color: Slate
- CSS variables: Yes
- Import alias: @

### 2.2 配置文件

会自动创建 `components.json`:

```json
{
  "$schema": "https://ui.shadcn.com/schema.json",
  "style": "default",
  "rsc": false,
  "tsx": false,
  "tailwind": {
    "config": "tailwind.config.js",
    "css": "src/styles/index.css",
    "baseColor": "slate",
    "cssVariables": true
  },
  "aliases": {
    "components": "@/components",
    "utils": "@/lib/utils"
  }
}
```

---

## Phase 3: 安装核心 shadcn-vue 组件

### 3.1 安装 Button 组件

```bash
npx shadcn-vue@latest add button
```

### 3.2 安装 Input 组件

```bash
npx shadcn-vue@latest add input
```

### 3.3 安装 Card 组件

```bash
npx shadcn-vue@latest add card
```

### 3.4 安装其他需要的组件

```bash
npx shadcn-vue@latest add label
npx shadcn-vue@latest add textarea
npx shadcn-vue@latest add checkbox
npx shadcn-vue@latest add tabs
npx shadcn-vue@latest add dialog
npx shadcn-vue@latest add separator
```

---

## Phase 4: 重构 A2UI 组件

### 4.1 A2UIButton

使用 shadcn-vue Button 组件：

```vue
<script setup>
import { Button } from '@/components/ui/button'
import A2UIRenderer from '../../A2UIRenderer.vue'

// ... props 定义

// 映射 A2UI 的 primary 到 shadcn-vue 的 variant
const buttonVariant = computed(() => {
  if (props.primary) return 'default'
  return props.variant || 'outline'
})
</script>

<template>
  <Button :variant="buttonVariant" :size="size" @click="onClick">
    <A2UIRenderer
      :surface-id="surfaceId"
      :component-id="child"
      :manager="manager"
      @action="emit('action', $event)"
    />
  </Button>
</template>
```

### 4.2 A2UITextField

使用 shadcn-vue Input/Textarea：

```vue
<script setup>
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'

// ... 逻辑保持不变
</script>

<template>
  <div class="space-y-2">
    <Label v-if="labelText">{{ labelText }}</Label>
    <Textarea v-if="isTextarea" v-model="inputValue" @input="handleInput" />
    <Input v-else v-model="inputValue" :type="inputType" @input="handleInput" />
    <p v-if="!isValid" class="text-sm text-destructive">Invalid input</p>
  </div>
</template>
```

### 4.3 A2UICard

使用 shadcn-vue Card：

```vue
<script setup>
import { Card, CardContent } from '@/components/ui/card'
import A2UIRenderer from '../../A2UIRenderer.vue'
</script>

<template>
  <Card>
    <CardContent class="pt-6">
      <A2UIRenderer
        :surface-id="surfaceId"
        :component-id="child"
        :manager="manager"
        @action="handleAction"
      />
    </CardContent>
  </Card>
</template>
```

### 4.4 其他组件映射

| A2UI 组件    | shadcn-vue 组件             | 说明            |
| ------------ | --------------------------- | --------------- |
| A2UICheckBox | Checkbox                    | 直接替换        |
| A2UITabs     | Tabs, TabsList, TabsContent | 结构调整        |
| A2UIModal    | Dialog, DialogContent       | 结构调整        |
| A2UIDivider  | Separator                   | 直接替换        |
| A2UIText     | 使用 TailwindCSS 类         | typography 插件 |

---

## Phase 5: 优化和清理

### 5.1 移除旧的样式文件

- 保留 `design-tokens.css`（CSS 变量）
- 移除手写的组件样式
- 使用 TailwindCSS 工具类

### 5.2 更新 Demo 页面

使用 TailwindCSS 类重构 Demo 页面布局。

### 5.3 测试

- 测试所有组件渲染
- 测试交互功能
- 测试响应式布局
- 测试主题切换（如果需要）

---

## 技术要点

### 1. 保持 A2UI 协议兼容

组件接口保持不变，只替换内部实现：

```vue
// 外部接口不变
<A2UIButton
  :surface-id="surfaceId"
  :component-id="componentId"
  :manager="manager"
  :primary="true"
  @action="handleAction"
/>

// 内部使用 shadcn-vue
<Button variant="default">...</Button>
```

### 2. 样式优先级

1. shadcn-vue 组件默认样式
2. TailwindCSS 工具类
3. 必要时使用 CSS 变量微调

### 3. 响应式设计

使用 TailwindCSS 响应式前缀：

```vue
<div class="p-4 md:p-6 lg:p-8">
  <!-- 内容 -->
</div>
```

---

## 预期效果

### 优势

✅ 专业的 UI 组件库，开箱即用  
✅ TailwindCSS 强大的工具类系统  
✅ 完整的可访问性支持  
✅ 统一的设计语言  
✅ 更少的自定义代码  
✅ 更好的维护性

### 工作量估算

- Phase 1: TailwindCSS 配置 - 30分钟
- Phase 2: shadcn-vue 配置 - 30分钟
- Phase 3: 安装组件 - 30分钟
- Phase 4: 重构组件 - 3-4小时
- Phase 5: 测试优化 - 1小时

**总计**: 约 6 小时

---

## 注意事项

1. **渐进式迁移**: 一次迁移一个组件，确保功能正常
2. **保持兼容**: A2UI 协议接口不变，只改内部实现
3. **样式覆盖**: 如需自定义，使用 TailwindCSS 类而非 scoped CSS
4. **测试充分**: 每个组件迁移后都要测试
5. **文档更新**: 更新组件使用文档

---

## 开始实施

准备好后，按以下顺序执行：

1. ✅ 安装 TailwindCSS
2. ✅ 配置 TailwindCSS
3. ✅ 安装 shadcn-vue CLI
4. ✅ 安装核心组件
5. ✅ 重构 A2UIButton
6. ✅ 重构 A2UITextField
7. ✅ 重构 A2UICard
8. ✅ 重构其他组件
9. ✅ 测试和优化
