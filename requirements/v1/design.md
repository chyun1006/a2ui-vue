# A2UI 渲染器设计文档

## 1. 项目概述

### 1.1 项目背景

A2UI (Agent to UI) 是 Google 提出的新型 AI 问答交互方式，能够根据用户输入和上下文动态生成交互界面。本项目实现一个 A2UI 渲染器，用于解析和渲染符合 A2UI v0.8 规范的消息。

### 1.2 技术栈

- **框架**: Vue 3 (Composition API)
- **语言**: JavaScript
- **构建工具**: Vite
- **样式**: CSS3 / TailwindCSS (推荐)
- **图标**: Material Icons (A2UI 规范要求)

## 2. 系统架构设计

### 2.1 整体架构

```
┌─────────────────────────────────────────────────────────┐
│                    SSE 消息源 / Mock                      │
└────────────────────┬────────────────────────────────────┘
                     │ A2UI Messages
                     ▼
┌─────────────────────────────────────────────────────────┐
│              消息解析层 (Message Parser)                  │
│  - beginRendering / surfaceUpdate / dataModelUpdate      │
│  - deleteSurface                                         │
└────────────────────┬────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────┐
│              状态管理层 (State Management)                │
│  - Surface Store (surfaces, components, styles)          │
│  - Data Model Store (数据模型)                            │
└────────────────────┬────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────┐
│              组件渲染层 (Component Renderer)              │
│  - 动态组件映射                                           │
│  - 数据绑定解析                                           │
│  - 事件处理                                               │
└─────────────────────────────────────────────────────────┘
```

### 2.2 核心模块

#### 2.2.1 消息处理模块 (`/src/composables/useA2UIMessage.ts`)

负责接收和解析 A2UI 消息流。

**功能**:

- SSE 连接管理
- 消息类型识别和分发
- Mock 数据支持

#### 2.2.2 状态管理模块 (`/src/stores/`)

使用 Pinia 管理应用状态。

**Surface Store** (`surfaceStore.ts`):

- 管理所有 surface 实例
- 存储组件树结构
- 管理样式配置

**Data Model Store** (`dataModelStore.ts`):

- 管理数据模型
- 支持路径访问 (如 `/user/name`)
- 数据更新和订阅

#### 2.2.3 组件系统 (`/src/components/a2ui/`)

实现所有 A2UI 标准组件。

**布局组件**:

- `A2UIRow.vue` - 水平布局
- `A2UIColumn.vue` - 垂直布局
- `A2UIList.vue` - 列表布局
- `A2UICard.vue` - 卡片容器
- `A2UITabs.vue` - 选项卡
- `A2UIModal.vue` - 模态框
- `A2UIDivider.vue` - 分隔线

**展示组件**:

- `A2UIText.vue` - 文本 (支持 Markdown)
- `A2UIImage.vue` - 图片
- `A2UIIcon.vue` - 图标
- `A2UIVideo.vue` - 视频
- `A2UIAudioPlayer.vue` - 音频播放器

**交互组件**:

- `A2UIButton.vue` - 按钮
- `A2UITextField.vue` - 文本输入
- `A2UICheckBox.vue` - 复选框
- `A2UIDateTimeInput.vue` - 日期时间选择
- `A2UIMultipleChoice.vue` - 多选/单选
- `A2UISlider.vue` - 滑块

#### 2.2.4 渲染引擎 (`/src/components/A2UIRenderer.vue`)

核心渲染组件，负责动态组件渲染。

**功能**:

- 组件树遍历
- 动态组件实例化
- 数据绑定解析
- 模板渲染 (template children)

## 3. 数据结构设计

### 3.1 Surface 数据结构

```javascript
/**
 * @typedef {Object} Surface
 * @property {string} id - Surface 唯一标识
 * @property {string} rootComponentId - 根组件 ID
 * @property {Map<string, ComponentDefinition>} components - 组件映射
 * @property {Object} [styles] - 样式配置
 * @property {string} [styles.font] - 字体
 * @property {string} [styles.primaryColor] - 主色调
 * @property {Object} dataModel - 数据模型
 */
```

### 3.2 Component 数据结构

```javascript
/**
 * @typedef {Object} ComponentDefinition
 * @property {string} id - 组件 ID
 * @property {number} [weight] - 权重（用于 flex-grow）
 * @property {Object} component - 组件配置对象
 */

// 示例: Text 组件
const textComponent = {
  Text: {
    text: { literalString: 'Hello' }, // 或 { path: '/user/name' }
    usageHint: 'h1', // 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'caption' | 'body'
  },
}
```

### 3.3 Data Model 数据结构

```javascript
/**
 * @typedef {Object} DataModel
 * 数据模型，支持嵌套路径访问
 * 值类型: string | number | boolean | Object | Array
 */
const dataModel = {
  user: {
    name: 'John',
    age: 30,
  },
  items: ['item1', 'item2'],
}
```

### 3.4 消息类型

```javascript
/**
 * A2UI 消息类型
 * 必须包含以下四种之一：beginRendering, surfaceUpdate, dataModelUpdate, deleteSurface
 */

// BeginRendering 消息
const beginRenderingMessage = {
  beginRendering: {
    surfaceId: 'surface-1',
    root: 'root-component-id',
    styles: {
      font: 'Roboto',
      primaryColor: '#1976d2',
    },
  },
}

// SurfaceUpdate 消息
const surfaceUpdateMessage = {
  surfaceUpdate: {
    surfaceId: 'surface-1',
    components: [
      /* ComponentDefinition[] */
    ],
  },
}

// DataModelUpdate 消息
const dataModelUpdateMessage = {
  dataModelUpdate: {
    surfaceId: 'surface-1',
    path: '/user/name',
    contents: [{ key: 'name', valueString: 'John' }],
  },
}

// DeleteSurface 消息
const deleteSurfaceMessage = {
  deleteSurface: {
    surfaceId: 'surface-1',
  },
}
```

## 4. 核心功能设计

### 4.1 消息处理流程

```javascript
// useA2UIMessage.js
import { useSurfaceStore } from '@/stores/surfaceStore'
import { useDataModelStore } from '@/stores/dataModelStore'

export function useA2UIMessage() {
  const surfaceStore = useSurfaceStore()
  const dataModelStore = useDataModelStore()

  const processMessage = (message) => {
    if (message.beginRendering) {
      handleBeginRendering(message.beginRendering)
    } else if (message.surfaceUpdate) {
      handleSurfaceUpdate(message.surfaceUpdate)
    } else if (message.dataModelUpdate) {
      handleDataModelUpdate(message.dataModelUpdate)
    } else if (message.deleteSurface) {
      handleDeleteSurface(message.deleteSurface)
    }
  }

  const handleBeginRendering = (data) => {
    surfaceStore.createSurface({
      id: data.surfaceId,
      rootComponentId: data.root,
      styles: data.styles,
    })
  }

  const handleSurfaceUpdate = (data) => {
    surfaceStore.updateComponents(data.surfaceId, data.components)
  }

  const handleDataModelUpdate = (data) => {
    dataModelStore.updateData(data.surfaceId, data.path, data.contents)
  }

  const handleDeleteSurface = (data) => {
    surfaceStore.deleteSurface(data.surfaceId)
  }

  return { processMessage }
}
```

### 4.2 数据绑定解析

```javascript
// useDataBinding.js
import { useDataModelStore } from '@/stores/dataModelStore'

/**
 * 数据绑定 composable
 * @param {string} surfaceId - Surface ID
 */
export function useDataBinding(surfaceId) {
  const dataModelStore = useDataModelStore()

  /**
   * 解析值或路径
   * @param {Object} valueOrPath - 值对象，可能包含 literalString/literalNumber/literalBoolean/literalArray/path
   * @returns {*} 解析后的值
   */
  const resolveValue = (valueOrPath) => {
    if (!valueOrPath) return null

    if ('literalString' in valueOrPath) {
      return valueOrPath.literalString
    }
    if ('literalNumber' in valueOrPath) {
      return valueOrPath.literalNumber
    }
    if ('literalBoolean' in valueOrPath) {
      return valueOrPath.literalBoolean
    }
    if ('literalArray' in valueOrPath) {
      return valueOrPath.literalArray
    }
    if ('path' in valueOrPath) {
      return dataModelStore.getValueByPath(surfaceId, valueOrPath.path)
    }
    return null
  }

  return { resolveValue }
import { computed } from 'vue';
import { useSurfaceStore } from '@/stores/surfaceStore';

const props = defineProps({
  surfaceId: {
    type: String,
    required: true
  },
  componentId: {
    type: String,
    required: true
  }
});

const surfaceStore = useSurfaceStore();

const componentDef = computed(() =>
  surfaceStore.getComponent(props.surfaceId, props.componentId)
);

const componentType = computed(() => {
  const { component = {} } = componentDef.value || {};
  return Object.keys(component)[0];
});

const componentProps = computed(() => {
  const type = componentType.value;
  return componentDef.value?.component?.[type];
});

const componentMap = {
  Text: 'A2UIText',
  Image: 'A2UIImage',
  Icon: 'A2UIIcon',
  Video: 'A2UIVideo',
  AudioPlayer: 'A2UIAudioPlayer',
  Row: 'A2UIRow',
  Column: 'A2UIColumn',
  List: 'A2UIList',
  Card: 'A2UICard',
  Tabs: 'A2UITabs',
  Modal: 'A2UIModal',
  Divider: 'A2UIDivider',
  Button: 'A2UIButton',
  TextField: 'A2UITextField',
  CheckBox: 'A2UICheckBox',
  DateTimeInput: 'A2UIDateTimeInput',
  MultipleChoice: 'A2UIMultipleChoice',
  Slider: 'A2UISlider'
};
</script>

<template>
  <component
    :is="componentMap[componentType]"
    v-if="componentDef"
    :surface-id="surfaceId"
    :component-id="componentId"
    v-bind="componentProps"
    :style="{ flexGrow: componentDef.weight }"
  />
</template>
```

### 4.4 Children 渲染策略

**显式列表 (explicitList)**:

```vue
<template>
  <div class="a2ui-row">
    <A2UIRenderer
      v-for="childId in children.explicitList"
      :key="childId"
      :surface-id="surfaceId"
      :component-id="childId"
    />
  </div>
</template>
```

**模板渲染 (template)**:

```vue
<script setup lang="ts">
const dataList = computed(() => {
  const data = dataModelStore.getValueByPath(surfaceId, children.template.dataBinding)
  return Object.entries(data || {})
})
</script>

<template>
  <div class="a2ui-list">
    <A2UIRenderer
      v-for="[key, value] in dataList"
      :key="key"
      :surface-id="surfaceId"
      :component-id="children.template.componentId"
      :data-context="{ key, value }"
    />
  </div>
</template>
```

### 4.5 事件处理

```javascript
// useA2UIAction.js
import { useDataBinding } from './useDataBinding'

/**
 * 事件处理 composable
 * @param {string} surfaceId - Surface ID
 * @param {Function} emit - Vue emit 函数
 */
export function useA2UIAction(surfaceId, emit) {
  const { resolveValue } = useDataBinding(surfaceId)

  /**
   * 处理动作
   * @param {Object} action - 动作对象
   * @param {string} action.name - 动作名称
   * @param {Array} [action.context] - 上下文数组
   */
  const handleAction = (action) => {
    const context = {}

    if (action.context) {
      action.context.forEach((item) => {
        const value = resolveValue(item.value)
        context[item.key] = value
      })
    }

    emit('action', {
      name: action.name,
      context,
    })
  }

  return { handleAction }
}
```

## 5. 组件实现规范

### 5.1 组件通用 Props

```typescript
interface BaseComponentProps {
  surfaceId: string
  componentId: string
}
```

### 5.2 组件实现示例

#### Text 组件

```vue
<script setup>
import { computed } from 'vue'
import { useDataBinding } from '@/composables/useDataBinding'
import MarkdownIt from 'markdown-it'

const props = defineProps({
  surfaceId: {
    type: String,
    required: true,
  },
  componentId: {
    type: String,
    required: true,
  },
  text: {
    type: Object,
    required: true,
  },
  usageHint: {
    type: String,
    default: 'body',
    validator: (value) => ['h1', 'h2', 'h3', 'h4', 'h5', 'caption', 'body'].includes(value),
  },
})

const { resolveValue } = useDataBinding(props.surfaceId)

const textContent = computed(() => resolveValue(props.text))
const md = new MarkdownIt()
const htmlContent = computed(() => md.render(textContent.value || ''))

const tagMap = {
  h1: 'h1',
  h2: 'h2',
  h3: 'h3',
  h4: 'h4',
  h5: 'h5',
  caption: 'span',
  body: 'p',
}

const tag = computed(() => tagMap[props.usageHint])
</script>

<template>
  <component :is="tag" :class="`a2ui-text a2ui-text--${usageHint}`" v-html="htmlContent" />
</template>

<style scoped>
.a2ui-text--h1 {
  font-size: 2rem;
  font-weight: bold;
}
.a2ui-text--h2 {
  font-size: 1.5rem;
  font-weight: bold;
}
.a2ui-text--h3 {
  font-size: 1.25rem;
  font-weight: bold;
}
.a2ui-text--h4 {
  font-size: 1.125rem;
  font-weight: bold;
}
.a2ui-text--h5 {
  font-size: 1rem;
  font-weight: bold;
}
.a2ui-text--caption {
  font-size: 0.875rem;
  color: #666;
}
.a2ui-text--body {
  font-size: 1rem;
}
</style>
```

#### Button 组件

```vue
<script setup lang="ts">
import { useA2UIAction } from '@/composables/useA2UIAction'

interface Props extends BaseComponentProps {
  child: string
  primary?: boolean
  action: Action
}

const props = defineProps<Props>()
const { handleAction } = useA2UIAction()

const onClick = () => {
  handleAction(props.action)
}
</script>

<template>
  <button :class="['a2ui-button', { 'a2ui-button--primary': primary }]" @click="onClick">
    <A2UIRenderer :surface-id="surfaceId" :component-id="child" />
  </button>
</template>

<style scoped>
.a2ui-button {
  padding: 8px 16px;
  border: 1px solid #ccc;
  border-radius: 4px;
  background: white;
  cursor: pointer;
}

.a2ui-button--primary {
  background: var(--primary-color, #1976d2);
  color: white;
  border-color: var(--primary-color, #1976d2);
import { computed } from 'vue'

interface Props extends BaseComponentProps {
  children: {
    explicitList?: string[]
    template?: {
      componentId: string
      dataBinding: string
    }
  }
  distribution?: 'start' | 'center' | 'end' | 'spaceBetween' | 'spaceAround' | 'spaceEvenly'
  alignment?: 'start' | 'center' | 'end' | 'stretch'
}

const props = defineProps<Props>()

const justifyContent = computed(() => {
  const map = {
    start: 'flex-start',
    center: 'center',
    end: 'flex-end',
    spaceBetween: 'space-between',
    spaceAround: 'space-around',
    spaceEvenly: 'space-evenly',
  }
  return map[props.distribution || 'start']
})

const alignItems = computed(() => {
  const map = {
    start: 'flex-start',
    center: 'center',
    end: 'flex-end',
    stretch: 'stretch',
  }
  return map[props.alignment || 'start']
})
</script>

<template>
  <div
    class="a2ui-row"
    :style="{
      justifyContent,
      alignItems,
    }"
  >
    <template v-if="children.explicitList">
      <A2UIRenderer
        v-for="childId in children.explicitList"
        :key="childId"
        :surface-id="surfaceId"
        :component-id="childId"
      />
    </template>
    <template v-else-if="children.template">
      <!-- 模板渲染逻辑 -->
    </template>
  </div>
</template>

<style scoped>
.a2ui-row {
  display: flex;
  flex-direction: row;
  gap: 8px;
}
</style>
```

## 6. 项目目录结构

```
src/
├── components/
│   ├── a2ui/                    # A2UI 组件库
│   │   ├── layout/
│   │   │   ├── A2UIRow.vue
│   │   │   ├── A2UIColumn.vue
│   │   │   ├── A2UIList.vue
│   │   │   ├── A2UICard.vue
│   │   │   ├── A2UITabs.vue
│   │   │   ├── A2UIModal.vue
│   │   │   └── A2UIDivider.vue
│   │   ├── display/
│   │   │   ├── A2UIText.vue
│   │   │   ├── A2UIImage.vue
│   │   │   ├── A2UIIcon.vue
│   │   │   ├── A2UIVideo.vue
│   │   │   └── A2UIAudioPlayer.vue
│   │   ├── input/
│   │   │   ├── A2UIButton.vue
│   │   │   ├── A2UITextField.vue
│   │   │   ├── A2UICheckBox.vue
│   │   │   ├── A2UIDateTimeInput.vue
│   │   │   ├── A2UIMultipleChoice.vue
│   │   │   └── A2UISlider.vue
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
├── views/
│   └── A2UIDemo.vue             # 演示页面
├── App.vue
└── main.js
```

## 7. 开发计划

### Phase 1: 基础架构 (Week 1)

- [ ] 项目初始化和依赖安装
- [ ] 类型定义 (`types/`)
- [ ] 状态管理 (`stores/`)
- [ ] 核心渲染器 (`A2UIRenderer.vue`)

### Phase 2: 展示组件 (Week 2)

- [ ] Text 组件 (支持 Markdown)
- [ ] Image 组件
- [ ] Icon 组件 (Material Icons)
- [ ] Video 组件
- [ ] AudioPlayer 组件

### Phase 3: 布局组件 (Week 2-3)

- [ ] Row 组件
- [ ] Column 组件
- [ ] List 组件
- [ ] Card 组件
- [ ] Tabs 组件
- [ ] Modal 组件
- [ ] Divider 组件

### Phase 4: 交互组件 (Week 3-4)

- [ ] Button 组件
- [ ] TextField 组件
- [ ] CheckBox 组件
- [ ] DateTimeInput 组件
- [ ] MultipleChoice 组件
- [ ] Slider 组件

### Phase 5: 消息处理 (Week 4)

- [ ] SSE 连接实现
- [ ] 消息解析和分发
- [ ] Mock 数据支持
- [ ] 错误处理

### Phase 6: 测试和优化 (Week 5)

- [ ] 单元测试
- [ ] 集成测试
- [ ] 性能优化
- [ ] 文档完善

## 8. 技术难点和解决方案

### 8.1 动态组件渲染

**难点**: 根据消息动态创建组件树
**方案**: 使用 Vue 的 `component :is` 和递归组件实现

### 8.2 数据绑定

**难点**: 支持 `literalString` 和 `path` 两种数据源
**方案**: 实现统一的 `resolveValue` 函数处理两种情况

### 8.3 模板渲染

**难点**: 根据数据模型动态生成子组件列表
**方案**: 使用 `v-for` 遍历数据模型，为每个数据项渲染模板组件

### 8.4 路径访问

**难点**: 支持 `/user/name` 格式的路径访问
**方案**: 实现路径解析工具，递归访问嵌套对象

### 8.5 样式隔离

**难点**: 每个 Surface 可能有不同的样式配置
**方案**: 使用 CSS 变量和 scoped 样式

### 8.6 事件处理

**难点**: 组件事件需要携带上下文数据
**方案**: 实现事件系统，支持从数据模型提取上下文

## 9. 性能优化策略

### 9.1 组件缓存

- 使用 `KeepAlive` 缓存已渲染的 Surface
- 避免不必要的组件重新创建

### 9.2 数据更新优化

- 使用 `dataModelUpdate.path` 实现增量更新
- 避免整个数据模型替换

### 9.3 虚拟滚动

- 对于大列表使用虚拟滚动技术
- 只渲染可见区域的组件

### 9.4 懒加载

- 组件按需加载
- 图片、视频等资源懒加载

## 10. 测试策略

### 10.1 单元测试

- 每个组件的独立测试
- 数据绑定逻辑测试
- 路径解析测试

### 10.2 集成测试

- 完整消息流程测试
- 多 Surface 场景测试
- 数据模型更新测试

### 10.3 E2E 测试

- 用户交互流程测试
- SSE 连接测试
- 错误处理测试

## 11. 部署和维护

### 11.1 构建配置

```javascript
// vite.config.js
export default {
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'a2ui-core': ['./src/components/A2UIRenderer.vue'],
          'a2ui-components': ['./src/components/a2ui/'],
        },
      },
    },
  },
}
```

### 11.2 监控和日志

- 消息解析错误日志
- 组件渲染性能监控
- 用户交互事件追踪

## 12. 扩展性设计

### 12.1 自定义组件

支持注册自定义组件扩展标准组件库

### 12.2 主题定制

支持通过 CSS 变量自定义主题

### 12.3 插件系统

支持插件扩展渲染器功能

## 13. 参考资料

- [A2UI 规范 v0.8](https://a2ui.org/specification/v0.8-a2ui/)
- [Vue 3 文档](https://vuejs.org/)
- [TypeScript 文档](https://www.typescriptlang.org/)
- [Material Icons](https://fonts.google.com/icons)
