# A2UI 组件样式改造计划

## 目标

基于 shadcn-vue 设计系统，对 A2UI 所有基础组件进行样式优化，实现统一、美观、符合用户习惯的 UI 风格。

---

## Phase 1: 建立设计系统基础 (Design Tokens)

### 1.1 创建设计令牌文件

**文件**: `/src/styles/design-tokens.css`

```css
:root {
  /* Colors - 基于 shadcn-vue */
  --background: 0 0% 100%;
  --foreground: 222.2 84% 4.9%;
  --card: 0 0% 100%;
  --card-foreground: 222.2 84% 4.9%;
  --popover: 0 0% 100%;
  --popover-foreground: 222.2 84% 4.9%;
  --primary: 221.2 83.2% 53.3%;
  --primary-foreground: 210 40% 98%;
  --secondary: 210 40% 96.1%;
  --secondary-foreground: 222.2 47.4% 11.2%;
  --muted: 210 40% 96.1%;
  --muted-foreground: 215.4 16.3% 46.9%;
  --accent: 210 40% 96.1%;
  --accent-foreground: 222.2 47.4% 11.2%;
  --destructive: 0 84.2% 60.2%;
  --destructive-foreground: 210 40% 98%;
  --border: 214.3 31.8% 91.4%;
  --input: 214.3 31.8% 91.4%;
  --ring: 221.2 83.2% 53.3%;
  --radius: 0.5rem;

  /* Typography */
  --font-sans: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  --font-mono: 'SF Mono', Monaco, 'Cascadia Code', monospace;

  /* Spacing */
  --spacing-xs: 0.25rem;
  --spacing-sm: 0.5rem;
  --spacing-md: 1rem;
  --spacing-lg: 1.5rem;
  --spacing-xl: 2rem;

  /* Shadows */
  --shadow-sm: 0 1px 2px 0 rgb(0 0 0 / 0.05);
  --shadow-md: 0 4px 6px -1px rgb(0 0 0 / 0.1);
  --shadow-lg: 0 10px 15px -3px rgb(0 0 0 / 0.1);

  /* Transitions */
  --transition-fast: 150ms cubic-bezier(0.4, 0, 0.2, 1);
  --transition-base: 200ms cubic-bezier(0.4, 0, 0.2, 1);
  --transition-slow: 300ms cubic-bezier(0.4, 0, 0.2, 1);
}

.dark {
  --background: 222.2 84% 4.9%;
  --foreground: 210 40% 98%;
  /* ... 其他暗色主题变量 */
}
```

### 1.2 创建工具类文件

**文件**: `/src/styles/utilities.css`

```css
/* 通用工具类 */
.focus-ring {
  outline: 2px solid transparent;
  outline-offset: 2px;
}

.focus-ring:focus-visible {
  outline: 2px solid hsl(var(--ring));
  outline-offset: 2px;
}

/* 动画 */
@keyframes fade-in {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@keyframes slide-in {
  from {
    transform: translateY(-10px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}
```

---

## Phase 2: 展示组件改造

### 2.1 A2UIText

**优化点**:

- 统一字体层级（h1-h6, body, caption）
- 优化行高和字间距
- 支持不同语义颜色（muted, accent, destructive）
- 改进 HTML 内容渲染的安全性

**样式参考**: shadcn-vue Typography

### 2.2 A2UIImage

**优化点**:

- 添加加载态（skeleton）
- 优化圆角和阴影
- 支持不同尺寸变体
- 添加错误态展示

### 2.3 A2UIIcon

**优化点**:

- 统一图标尺寸规范
- 支持颜色主题
- 优化对齐方式

### 2.4 A2UIVideo & A2UIAudioPlayer

**优化点**:

- 现代化播放器控件
- 统一控制栏样式
- 优化加载和错误状态

---

## Phase 3: 布局组件改造

### 3.1 A2UICard

**优化点**:

- 采用 shadcn-vue Card 设计
- 统一边框、圆角、阴影
- 支持 hover 效果
- 优化内边距

**样式参考**: shadcn-vue Card

### 3.2 A2UIRow & A2UIColumn

**优化点**:

- 优化间距系统
- 改进对齐方式视觉效果
- 添加响应式支持

### 3.3 A2UIList

**优化点**:

- 统一列表项样式
- 优化分隔线
- 添加 hover 状态
- 改进间距

### 3.4 A2UITabs

**优化点**:

- 采用 shadcn-vue Tabs 设计
- 现代化标签页样式
- 流畅的切换动画
- 优化激活态指示器

**样式参考**: shadcn-vue Tabs

### 3.5 A2UIModal

**优化点**:

- 采用 shadcn-vue Dialog 设计
- 优化遮罩层
- 改进动画效果
- 统一关闭按钮样式

**样式参考**: shadcn-vue Dialog

### 3.6 A2UIDivider

**优化点**:

- 统一分隔线颜色和粗细
- 支持文字分隔线
- 优化间距

---

## Phase 4: 交互组件改造（重点）

### 4.1 A2UIButton ⭐

**优化点**:

- 采用 shadcn-vue Button 设计
- 支持多种变体（default, primary, secondary, outline, ghost, destructive）
- 统一尺寸规范（sm, md, lg）
- 优化 hover/active/disabled 状态
- 添加 loading 状态
- 改进 focus ring

**样式参考**: shadcn-vue Button

**变体设计**:

```css
/* Primary */
background: hsl(var(--primary));
color: hsl(var(--primary-foreground));

/* Secondary */
background: hsl(var(--secondary));
color: hsl(var(--secondary-foreground));

/* Outline */
border: 1px solid hsl(var(--input));
background: transparent;

/* Ghost */
background: transparent;
hover:background: hsl(var(--accent));
```

### 4.2 A2UITextField ⭐

**优化点**:

- 采用 shadcn-vue Input 设计
- 统一边框和圆角
- 优化 focus 状态
- 改进 placeholder 样式
- 添加错误状态
- 支持前缀/后缀图标

**样式参考**: shadcn-vue Input

### 4.3 A2UICheckBox

**优化点**:

- 采用 shadcn-vue Checkbox 设计
- 现代化勾选样式
- 流畅的选中动画
- 优化对齐

**样式参考**: shadcn-vue Checkbox

### 4.4 A2UIDateTimeInput

**优化点**:

- 统一输入框样式（继承 TextField）
- 优化日期选择器样式
- 改进图标和布局

### 4.5 A2UIMultipleChoice

**优化点**:

- 采用 shadcn-vue Radio/Select 设计
- 统一选项样式
- 优化选中状态
- 改进间距和对齐

**样式参考**: shadcn-vue Radio Group / Select

### 4.6 A2UISlider

**优化点**:

- 采用 shadcn-vue Slider 设计
- 现代化滑块样式
- 优化轨道和手柄
- 改进交互反馈

**样式参考**: shadcn-vue Slider

---

## Phase 5: Demo 页面优化

### 5.1 A2UIDemoV3.vue

**优化点**:

- 采用更现代的布局
- 优化渐变背景
- 改进卡片样式
- 添加更多示例展示
- 优化代码示例展示

### 5.2 CompleteDemo.vue

**优化点**:

- 展示所有组件的不同状态
- 添加交互演示
- 优化整体布局

---

## Phase 6: 全局样式优化

### 6.1 创建全局样式入口

**文件**: `/src/styles/index.css`

```css
@import './design-tokens.css';
@import './utilities.css';

* {
  box-sizing: border-box;
}

body {
  margin: 0;
  font-family: var(--font-sans);
  background: hsl(var(--background));
  color: hsl(var(--foreground));
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

/* 滚动条样式 */
::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

::-webkit-scrollbar-track {
  background: hsl(var(--muted));
}

::-webkit-scrollbar-thumb {
  background: hsl(var(--muted-foreground) / 0.3);
  border-radius: 4px;
}

::-webkit-scrollbar-thumb:hover {
  background: hsl(var(--muted-foreground) / 0.5);
}
```

---

## 实施优先级

### P0 - 高优先级（立即实施）

1. ✅ 建立设计系统基础（Design Tokens）
2. ✅ A2UIButton 改造
3. ✅ A2UITextField 改造
4. ✅ A2UICard 改造

### P1 - 中优先级（第二批）

5. A2UITabs 改造
6. A2UIModal 改造
7. A2UICheckBox 改造
8. A2UIText 改造

### P2 - 低优先级（第三批）

9. 其他展示组件
10. 其他交互组件
11. Demo 页面优化

---

## 技术实施细节

### 1. CSS 变量使用

所有组件统一使用 CSS 变量，便于主题切换：

```css
background: hsl(var(--primary));
color: hsl(var(--primary-foreground));
```

### 2. 过渡动画

统一使用设计令牌中的过渡时间：

```css
transition: all var(--transition-base);
```

### 3. Focus 可访问性

所有交互组件必须有清晰的 focus 状态：

```css
&:focus-visible {
  outline: 2px solid hsl(var(--ring));
  outline-offset: 2px;
}
```

### 4. 响应式设计

关键组件支持响应式：

```css
@media (max-width: 768px) {
  /* 移动端适配 */
}
```

---

## 验收标准

### 视觉标准

- ✅ 所有组件使用统一的设计令牌
- ✅ 颜色、间距、圆角、阴影保持一致
- ✅ 动画流畅自然
- ✅ 支持暗色模式（可选）

### 交互标准

- ✅ 所有交互组件有清晰的 hover 状态
- ✅ 所有交互组件有清晰的 focus 状态
- ✅ 所有交互组件有清晰的 disabled 状态
- ✅ 动画过渡流畅

### 可访问性标准

- ✅ 键盘导航支持
- ✅ Focus ring 清晰可见
- ✅ 颜色对比度符合 WCAG 标准

### 代码质量标准

- ✅ 使用 CSS 变量而非硬编码
- ✅ 样式模块化，易于维护
- ✅ 注释清晰
- ✅ 无冗余代码

---

## 时间估算

- Phase 1: 设计系统基础 - **2小时**
- Phase 2: 展示组件改造 - **3小时**
- Phase 3: 布局组件改造 - **4小时**
- Phase 4: 交互组件改造 - **5小时**
- Phase 5: Demo 优化 - **2小时**
- Phase 6: 测试和调整 - **2小时**

**总计**: 约 18 小时

---

## 参考资源

- [shadcn-vue 官网](https://www.shadcn-vue.com/)
- [shadcn-vue Components](https://www.shadcn-vue.com/docs/components)
- [shadcn-vue Themes](https://www.shadcn-vue.com/themes)
- [Radix Colors](https://www.radix-ui.com/colors)
- [Tailwind CSS](https://tailwindcss.com/)
