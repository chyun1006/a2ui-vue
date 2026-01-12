# 如何使用 shadcn-vue 官方主题

## 📚 官方资源

- **主题浏览器**: https://www.shadcn-vue.com/themes
- **主题文档**: https://www.shadcn-vue.com/docs/theming
- **颜色工具**: https://www.shadcn-vue.com/colors

## 🎨 使用官方主题的步骤

### 1. 访问主题页面

打开 https://www.shadcn-vue.com/themes，你会看到多个预设主题，例如：

- **Zinc** (默认)
- **Slate**
- **Stone**
- **Gray**
- **Neutral**
- **Red**
- **Rose**
- **Orange**
- **Green**
- **Blue**
- **Yellow**
- **Violet**

### 2. 选择主题

点击任意主题，页面会展示该主题的预览效果。

### 3. 复制主题代码

在主题预览下方，点击 **"Copy code"** 按钮，会复制类似这样的代码：

```css
@layer base {
  :root {
    --background: 0 0% 100%;
    --foreground: 240 10% 3.9%;
    --card: 0 0% 100%;
    --card-foreground: 240 10% 3.9%;
    --popover: 0 0% 100%;
    --popover-foreground: 240 10% 3.9%;
    --primary: 142.1 76.2% 36.3%;
    --primary-foreground: 355.7 100% 97.3%;
    --secondary: 240 4.8% 95.9%;
    --secondary-foreground: 240 5.9% 10%;
    --muted: 240 4.8% 95.9%;
    --muted-foreground: 240 3.8% 46.1%;
    --accent: 240 4.8% 95.9%;
    --accent-foreground: 240 5.9% 10%;
    --destructive: 0 84.2% 60.2%;
    --destructive-foreground: 0 0% 98%;
    --border: 240 5.9% 90%;
    --input: 240 5.9% 90%;
    --ring: 142.1 76.2% 36.3%;
    --radius: 0.5rem;
  }

  .dark {
    --background: 20 14.3% 4.1%;
    --foreground: 0 0% 95%;
    --card: 24 9.8% 10%;
    --card-foreground: 0 0% 95%;
    --popover: 0 0% 9%;
    --popover-foreground: 0 0% 95%;
    --primary: 142.1 70.6% 45.3%;
    --primary-foreground: 144.9 80.4% 10%;
    --secondary: 240 3.7% 15.9%;
    --secondary-foreground: 0 0% 98%;
    --muted: 0 0% 15%;
    --muted-foreground: 240 5% 64.9%;
    --accent: 12 6.5% 15.1%;
    --accent-foreground: 0 0% 98%;
    --destructive: 0 62.8% 30.6%;
    --destructive-foreground: 0 85.7% 97.3%;
    --border: 240 3.7% 15.9%;
    --input: 240 3.7% 15.9%;
    --ring: 142.4 71.8% 29.2%;
  }
}
```

### 4. 粘贴到你的项目

**方法 A: 直接粘贴到 `src/styles/theme.css`**

```css
/* src/styles/theme.css */
:root {
  --background: 0 0% 100%;
  --foreground: 240 10% 3.9%;
  /* ... 其他变量 */
}

.dark {
  --background: 20 14.3% 4.1%;
  /* ... 其他变量 */
}
```

**方法 B: 粘贴到 `src/styles/index.css` 的 @layer base 中**

```css
/* src/styles/index.css */
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    --background: 0 0% 100%;
    --foreground: 240 10% 3.9%;
    /* ... 复制的主题变量 */
  }

  .dark {
    --background: 20 14.3% 4.1%;
    /* ... 复制的主题变量 */
  }

  * {
    @apply border-border;
  }
  body {
    @apply bg-background text-foreground;
  }
}
```

## ⚠️ 重要注意事项

### 1. CSS 变量格式

shadcn-vue 使用 **HSL 颜色空间**，CSS 变量只存储数值，不包含 `hsl()` 函数：

```css
/* ✅ 正确 */
--primary: 142.1 76.2% 36.3%;

/* ❌ 错误 */
--primary: hsl(142.1 76.2% 36.3%);
```

`hsl()` 函数在 `tailwind.config.js` 中添加：

```js
// tailwind.config.js
export default {
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: 'hsl(var(--primary))', // 这里添加 hsl()
          foreground: 'hsl(var(--primary-foreground))',
        },
      },
    },
  },
}
```

### 2. 为什么这样设计？

这样设计可以支持透明度：

```html
<!-- 50% 透明度的主色 -->
<div class="bg-primary/50">半透明背景</div>
```

Tailwind 会自动转换为：`hsl(142.1 76.2% 36.3% / 0.5)`

### 3. --radius 变量

`--radius` 是圆角半径，不是颜色，直接使用长度单位：

```css
--radius: 0.5rem; /* ✅ 正确 */
```

## 🎯 快速切换主题

### 预设主题示例

#### Green (绿色主题 - 当前使用)

```css
--primary: 142.1 76.2% 36.3%;
--ring: 142.1 76.2% 36.3%;
```

#### Blue (蓝色主题)

```css
--primary: 221.2 83.2% 53.3%;
--ring: 221.2 83.2% 53.3%;
```

#### Red (红色主题)

```css
--primary: 0 72.2% 50.6%;
--ring: 0 72.2% 50.6%;
```

#### Orange (橙色主题)

```css
--primary: 24.6 95% 53.1%;
--ring: 24.6 95% 53.1%;
```

#### Violet (紫色主题)

```css
--primary: 262.1 83.3% 57.8%;
--ring: 262.1 83.3% 57.8%;
```

## 🌓 暗色模式

shadcn-vue 使用 `.dark` 类来切换暗色模式。

### 启用暗色模式

在 `tailwind.config.js` 中已配置：

```js
export default {
  darkMode: ['class'], // 使用 class 策略
}
```

### 切换暗色模式

在根元素添加 `dark` 类：

```html
<!-- 亮色模式 -->
<html>
  <!-- 暗色模式 -->
  <html class="dark"></html>
</html>
```

### 使用 VueUse 自动切换

```bash
pnpm add @vueuse/core
```

```vue
<script setup>
import { useDark, useToggle } from '@vueuse/core'

const isDark = useDark()
const toggleDark = useToggle(isDark)
</script>

<template>
  <button @click="toggleDark()">
    {{ isDark ? '🌙' : '☀️' }}
  </button>
</template>
```

## 🎨 自定义主题

### 1. 使用在线工具

访问 https://www.shadcn-vue.com/colors 使用颜色选择器生成自定义主题。

### 2. 手动调整

只需修改 `--primary` 和 `--ring` 即可改变主题色：

```css
:root {
  /* 主色：HSL 格式 (色相 饱和度 亮度) */
  --primary: 280 65% 60%; /* 紫色 */
  --ring: 280 65% 60%; /* 聚焦环颜色 */
}
```

**色相值参考：**

- 0° = 红色 🔴
- 30° = 橙色 🟠
- 60° = 黄色 🟡
- 120° = 绿色 🟢
- 180° = 青色 🔵
- 240° = 蓝色 🔵
- 280° = 紫色 🟣
- 330° = 粉色 🩷

## 📝 完整示例

当前项目使用的绿色主题配置：

```css
/* src/styles/theme.css */
:root {
  --radius: 0.5rem;
  --background: 0 0% 100%;
  --foreground: 240 10% 3.9%;
  --primary: 142.1 76.2% 36.3%; /* 绿色 */
  --primary-foreground: 355.7 100% 97.3%;
  --ring: 142.1 76.2% 36.3%;
  /* ... 其他变量 */
}

.dark {
  --background: 20 14.3% 4.1%;
  --foreground: 0 0% 95%;
  --primary: 142.1 70.6% 45.3%; /* 暗色模式的绿色 */
  --ring: 142.4 71.8% 29.2%;
  /* ... 其他变量 */
}
```

## 🚀 总结

1. ✅ 访问 https://www.shadcn-vue.com/themes 选择主题
2. ✅ 复制主题代码
3. ✅ 粘贴到 `src/styles/theme.css`
4. ✅ **确保 CSS 变量不包含 `hsl()` 函数**
5. ✅ 刷新页面查看效果

现在你的项目已经使用了 shadcn-vue 官方的绿色主题！🎉
