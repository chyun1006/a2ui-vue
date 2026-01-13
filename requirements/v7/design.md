# A2UI 渲染器架构优化设计文档

## 1. 概述

本文档针对 A2UI 渲染器架构优化需求，提出了一套完整的技术方案，主要解决以下三个核心问题：

1. **解耦 Manager 依赖**：将 manager 从 UI 组件中移除，降低耦合性
2. **TypeScript 迁移**：将所有组件改为 TypeScript，提升类型安全性
3. **组件元数据系统**：通过 TypeScript 类型系统实现组件用途信息的自动生成

## 2. 当前架构分析

### 2.1 现状问题

#### 问题 1：Manager 强耦合

```vue
<!-- 当前实现：每个组件都需要接收 manager prop -->
<A2UIButton
  :manager="manager"  <!-- 强依赖 -->
  :surface-id="surfaceId"
  :component-id="componentId"
/>
```

**问题点**：

- 所有 18 个 UI 组件都需要声明 `manager` prop
- 组件内部直接调用 `manager.getData()` / `manager.getSurface()`
- 违反单一职责原则，UI 组件不应该关心数据管理逻辑
- 测试困难，必须 mock 完整的 manager 对象
- 组件复用性差，无法独立于 A2UI 系统使用

#### 问题 2：缺乏类型安全

```javascript
// 当前实现：JavaScript，无类型检查
const props = defineProps({
  manager: {
    type: Object, // 类型不明确
    required: true,
  },
})
```

**问题点**：

- 无编译时类型检查
- IDE 智能提示不完整
- 重构风险高
- 运行时错误难以提前发现

#### 问题 3：组件用途信息缺失

- 当前组件没有结构化的元数据描述
- Agent 无法理解组件的用途和使用场景
- 缺乏自动化文档生成能力

### 2.2 当前组件清单

**Display 组件 (5个)**

- A2UIText.vue
- A2UIImage.vue
- A2UIIcon.vue
- A2UIVideo.vue
- A2UIAudioPlayer.vue

**Layout 组件 (8个)**

- A2UIRow.vue
- A2UIColumn.vue
- A2UIList.vue
- A2UICard.vue
- A2UITabs.vue
- A2UIModal.vue
- A2UIDivider.vue

**Input 组件 (6个)**

- A2UIButton.vue
- A2UITextField.vue
- A2UICheckBox.vue
- A2UIDateTimeInput.vue
- A2UIMultipleChoice.vue
- A2UISlider.vue

## 3. 架构设计方案

### 3.1 核心设计原则

1. **依赖注入优先**：使用 Vue 的 provide/inject 机制替代 prop drilling
2. **关注点分离**：UI 组件只关注展示和交互，数据管理由独立层处理
3. **类型安全优先**：全面采用 TypeScript，提供完整的类型定义
4. **元数据驱动**：通过 TypeScript 装饰器和注释生成组件元数据

### 3.2 新架构层次

```
┌─────────────────────────────────────────────┐
│           Application Layer                  │
│  (App.vue, Views)                           │
└─────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────┐
│         Context Provider Layer               │
│  (A2UIProvider - provide manager)           │
└─────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────┐
│          Renderer Layer                      │
│  (A2UIRenderer - 组件路由)                  │
└─────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────┐
│        Component Layer (UI)                  │
│  (A2UIButton, A2UIText, etc.)               │
│  - 通过 inject 获取 context                  │
│  - 通过 composables 访问数据                 │
└─────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────┐
│         Composables Layer                    │
│  (useA2UIContext, useA2UIData, etc.)        │
└─────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────┐
│           Core Layer                         │
│  (A2UIManager, Surface, EventBus)           │
└─────────────────────────────────────────────┘
```

## 4. 详细技术方案

### 4.1 Context Provider 模式

#### 4.1.1 创建 A2UIContext

```typescript
// src/core/context.ts
import { InjectionKey, Ref } from 'vue'
import { A2UIManager } from './A2UIManager'

export interface A2UIContext {
  manager: A2UIManager
  surfaceId: Ref<string>
}

export const A2UI_CONTEXT_KEY: InjectionKey<A2UIContext> = Symbol('a2ui-context')
```

#### 4.1.2 创建 Provider 组件

```typescript
// src/components/A2UIProvider.vue
<script setup lang="ts">
import { provide, readonly, ref } from 'vue'
import { A2UI_CONTEXT_KEY, A2UIContext } from '../core/context'
import { A2UIManager } from '../core/A2UIManager'

interface Props {
  manager: A2UIManager
  surfaceId: string
}

const props = defineProps<Props>()

const context: A2UIContext = {
  manager: props.manager,
  surfaceId: readonly(ref(props.surfaceId))
}

provide(A2UI_CONTEXT_KEY, context)
</script>

<template>
  <slot />
</template>
```

#### 4.1.3 使用方式

```vue
<!-- App.vue 或 A2UISurface.vue -->
<A2UIProvider :manager="manager" :surface-id="surfaceId">
  <A2UIRenderer :component-id="rootComponentId" />
</A2UIProvider>
```

### 4.2 Composables 设计

#### 4.2.1 useA2UIContext

```typescript
// src/composables/useA2UIContext.ts
import { inject } from 'vue'
import { A2UI_CONTEXT_KEY, A2UIContext } from '../core/context'

export function useA2UIContext(): A2UIContext {
  const context = inject(A2UI_CONTEXT_KEY)

  if (!context) {
    throw new Error('useA2UIContext must be used within A2UIProvider')
  }

  return context
}
```

#### 4.2.2 useA2UIData

```typescript
// src/composables/useA2UIData.ts
import { computed, ComputedRef } from 'vue'
import { useA2UIContext } from './useA2UIContext'

export function useA2UIData<T = any>(path: string): ComputedRef<T | undefined> {
  const { manager, surfaceId } = useA2UIContext()

  return computed(() => {
    return manager.getData(surfaceId.value, path) as T
  })
}

export function useA2UIDataUpdate() {
  const { manager, surfaceId } = useA2UIContext()

  return {
    updateData: (path: string, value: any) => {
      return manager.updateData(surfaceId.value, path, value)
    },
    mergeData: (path: string, data: any) => {
      return manager.mergeData(surfaceId.value, path, data)
    },
    deleteData: (path: string) => {
      return manager.deleteData(surfaceId.value, path)
    },
  }
}
```

#### 4.2.3 useA2UIComponent

```typescript
// src/composables/useA2UIComponent.ts
import { computed, ComputedRef } from 'vue'
import { useA2UIContext } from './useA2UIContext'
import { ComponentDefinition } from '../types/component'

export function useA2UIComponent(componentId: string): ComputedRef<ComponentDefinition | null> {
  const { manager, surfaceId } = useA2UIContext()

  return computed(() => {
    const surface = manager.getSurface(surfaceId.value)
    return surface?.getComponent(componentId) || null
  })
}
```

### 4.3 组件 TypeScript 迁移

#### 4.3.1 组件 Props 类型定义

````typescript
// src/types/component-props.ts

/**
 * 基础组件 Props
 */
export interface BaseComponentProps {
  /** Surface ID - 由 Provider 自动注入，组件无需声明 */
  // surfaceId?: string

  /** 组件 ID */
  componentId: string

  /** Manager - 由 Provider 自动注入，组件无需声明 */
  // manager?: A2UIManager
}

/**
 * Button 组件 Props
 * @description 按钮组件，用于触发用户操作
 * @category Input
 * @example
 * ```json
 * {
 *   "type": "Button",
 *   "componentId": "btn-1",
 *   "child": "text-1",
 *   "action": { "type": "navigate", "target": "/home" }
 * }
 * ```
 */
export interface ButtonProps extends BaseComponentProps {
  /** 子组件 ID（通常是 Text 组件） */
  child: string

  /** 是否为主要按钮 */
  primary?: boolean

  /** 按钮变体 */
  variant?: 'default' | 'primary' | 'secondary' | 'outline' | 'ghost' | 'destructive' | 'link'

  /** 按钮尺寸 */
  size?: 'default' | 'sm' | 'lg' | 'icon'

  /** 点击动作 */
  action: ActionDefinition
}

/**
 * Text 组件 Props
 * @description 文本显示组件
 * @category Display
 */
export interface TextProps extends BaseComponentProps {
  /** 文本内容或数据绑定路径 */
  text?: string

  /** 数据绑定路径 */
  dataBinding?: string

  /** 文本样式 */
  style?: 'body' | 'heading' | 'title' | 'caption'

  /** 字体大小 */
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl'

  /** 字体粗细 */
  weight?: 'normal' | 'medium' | 'semibold' | 'bold'

  /** 文本颜色 */
  color?: string
}

/**
 * Column 组件 Props
 * @description 垂直布局容器
 * @category Layout
 */
export interface ColumnProps extends BaseComponentProps {
  /** 子组件配置 */
  children: ChildrenDefinition

  /** 主轴分布方式 */
  distribution?: 'start' | 'center' | 'end' | 'spaceBetween' | 'spaceAround' | 'spaceEvenly'

  /** 交叉轴对齐方式 */
  alignment?: 'start' | 'center' | 'end' | 'stretch'
}

// ... 其他组件 Props 定义
````

#### 4.3.2 组件迁移示例 - A2UIButton

```typescript
// src/components/a2ui/input/A2UIButton.vue
<script setup lang="ts">
import { computed } from 'vue'
import { useA2UIContext } from '@/composables/useA2UIContext'
import { useA2UIAction } from '@/composables/useA2UIAction'
import A2UIRenderer from '@/components/A2UIRenderer.vue'
import { Button } from '@/components/ui/button'
import type { ButtonProps } from '@/types/component-props'

/**
 * A2UI Button 组件
 * @component
 * @description 按钮组件，用于触发用户操作和导航
 * @category Input
 * @usage 用于提交表单、触发动作、页面导航等场景
 */

const props = withDefaults(defineProps<ButtonProps>(), {
  primary: false,
  variant: 'default',
  size: 'default'
})

const emit = defineEmits<{
  action: [actionData: any]
}>()

// 通过 composable 获取 context，无需 manager prop
const { surfaceId } = useA2UIContext()
const { handleAction } = useA2UIAction(surfaceId.value, emit)

const buttonVariant = computed(() => {
  if (props.primary) return 'default'
  return props.variant || 'outline'
})

const buttonSize = computed(() => {
  if (props.size === 'md') return 'default'
  return props.size
})

const onClick = () => {
  handleAction(props.action)
}
</script>

<template>
  <Button :variant="buttonVariant" :size="buttonSize" @click="onClick">
    <A2UIRenderer
      :component-id="child"
      @action="emit('action', $event)"
    />
  </Button>
</template>
```

#### 4.3.3 组件迁移示例 - A2UIColumn

```typescript
// src/components/a2ui/layout/A2UIColumn.vue
<script setup lang="ts">
import { computed } from 'vue'
import { useA2UIContext } from '@/composables/useA2UIContext'
import { useA2UIData } from '@/composables/useA2UIData'
import A2UIRenderer from '@/components/A2UIRenderer.vue'
import { FLEX_JUSTIFY_CONTENT_MAP, FLEX_ALIGN_ITEMS_MAP } from '@/types/components'
import type { ColumnProps } from '@/types/component-props'

/**
 * A2UI Column 组件
 * @component
 * @description 垂直布局容器，用于垂直排列子组件
 * @category Layout
 * @usage 用于创建垂直布局、表单布局、列表等场景
 */

const props = withDefaults(defineProps<ColumnProps>(), {
  distribution: 'start',
  alignment: 'start'
})

const emit = defineEmits<{
  action: [actionData: any]
}>()

const { manager, surfaceId } = useA2UIContext()

const justifyContent = computed(() =>
  FLEX_JUSTIFY_CONTENT_MAP[props.distribution] || 'flex-start'
)

const alignItems = computed(() =>
  FLEX_ALIGN_ITEMS_MAP[props.alignment] || 'flex-start'
)

const childrenList = computed(() => {
  const { children = {} } = props

  if (children.explicitList) {
    return children.explicitList
  }

  if (children.template) {
    const { componentId, dataBinding } = children.template
    const data = manager.getData(surfaceId.value, dataBinding)

    if (data && typeof data === 'object') {
      return Object.keys(data).map((key) => ({
        id: `${componentId}-${key}`,
        componentId,
        dataKey: key,
      }))
    }
  }

  return []
})

const handleAction = (actionData: any) => {
  emit('action', actionData)
}
</script>

<template>
  <div
    class="a2ui-column"
    :style="{
      justifyContent,
      alignItems,
    }"
  >
    <template v-if="children.explicitList">
      <A2UIRenderer
        v-for="childId in childrenList"
        :key="childId"
        :component-id="childId"
        @action="handleAction"
      />
    </template>
    <template v-else-if="children.template">
      <A2UIRenderer
        v-for="item in childrenList"
        :key="item.id"
        :component-id="item.componentId"
        @action="handleAction"
      />
    </template>
  </div>
</template>

<style scoped>
.a2ui-column {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
</style>
```

#### 4.3.4 A2UIRenderer 迁移

```typescript
// src/components/A2UIRenderer.vue
<script setup lang="ts">
import { computed, defineAsyncComponent } from 'vue'
import { useA2UIContext } from '@/composables/useA2UIContext'
import { useA2UIComponent } from '@/composables/useA2UIComponent'
import { getComponentType, getComponentProps } from '@/utils/validator'
import { COMPONENT_MAP } from '@/types/components'

interface Props {
  componentId: string
}

const props = defineProps<Props>()

const emit = defineEmits<{
  action: [actionData: any]
}>()

// 不再需要 manager 和 surfaceId props，通过 context 获取
const { surfaceId } = useA2UIContext()
const componentDef = useA2UIComponent(props.componentId)

const componentType = computed(() => getComponentType(componentDef.value))
const componentProps = computed(() => getComponentProps(componentDef.value))

const componentName = computed(() => {
  const type = componentType.value
  return type ? COMPONENT_MAP[type] : null
})

const dynamicComponent = computed(() => {
  const name = componentName.value
  if (!name) return null

  return defineAsyncComponent(() =>
    import(`./a2ui/${getCategoryPath(componentType.value)}/${name}.vue`).catch((err) => {
      console.error(`Failed to load component: ${name}`, err)
      return null
    }),
  )
})

function getCategoryPath(type: string): string {
  const displayComponents = ['Text', 'Image', 'Icon', 'Video', 'AudioPlayer']
  const layoutComponents = ['Row', 'Column', 'List', 'Card', 'Tabs', 'Modal', 'Divider']
  const inputComponents = [
    'Button',
    'TextField',
    'CheckBox',
    'DateTimeInput',
    'MultipleChoice',
    'Slider',
  ]

  if (displayComponents.includes(type)) return 'display'
  if (layoutComponents.includes(type)) return 'layout'
  if (inputComponents.includes(type)) return 'input'

  return 'display'
}

const componentStyle = computed(() => {
  const weight = componentDef.value?.weight
  return weight ? { flexGrow: weight } : {}
})

const handleAction = (actionData: any) => {
  emit('action', actionData)
}
</script>

<template>
  <component
    :is="dynamicComponent"
    v-if="componentDef && dynamicComponent"
    :component-id="componentId"
    v-bind="componentProps"
    :style="componentStyle"
    @action="handleAction"
  />
  <div v-else-if="componentDef" class="a2ui-error">
    Unknown component: {{ componentType }}
  </div>
</template>

<style scoped>
.a2ui-error {
  padding: 8px;
  background: #fee;
  border: 1px solid #fcc;
  border-radius: 4px;
  color: #c00;
  font-size: 0.875rem;
}
</style>
```

### 4.4 组件元数据系统

#### 4.4.1 元数据结构定义

```typescript
// src/types/component-metadata.ts

/**
 * 组件元数据
 */
export interface ComponentMetadata {
  /** 组件名称 */
  name: string

  /** 组件类型 */
  type: string

  /** 组件分类 */
  category: 'Display' | 'Layout' | 'Input'

  /** 组件描述 */
  description: string

  /** 使用场景 */
  usage: string

  /** Props 定义 */
  props: PropMetadata[]

  /** 事件定义 */
  events: EventMetadata[]

  /** 示例代码 */
  examples: ExampleMetadata[]

  /** 相关组件 */
  relatedComponents?: string[]
}

/**
 * Prop 元数据
 */
export interface PropMetadata {
  /** Prop 名称 */
  name: string

  /** Prop 类型 */
  type: string

  /** 是否必需 */
  required: boolean

  /** 默认值 */
  default?: any

  /** 描述 */
  description: string

  /** 可选值 */
  options?: string[]
}

/**
 * 事件元数据
 */
export interface EventMetadata {
  /** 事件名称 */
  name: string

  /** 事件参数类型 */
  payloadType: string

  /** 描述 */
  description: string
}

/**
 * 示例元数据
 */
export interface ExampleMetadata {
  /** 示例标题 */
  title: string

  /** 示例描述 */
  description: string

  /** 示例代码 */
  code: string
}
```

#### 4.4.2 元数据提取工具

```typescript
// scripts/extract-metadata.ts
import * as ts from 'typescript'
import * as fs from 'fs'
import * as path from 'path'
import { ComponentMetadata } from '../src/types/component-metadata'

/**
 * 从 TypeScript 类型定义中提取组件元数据
 */
export class MetadataExtractor {
  private program: ts.Program
  private checker: ts.TypeChecker

  constructor(configPath: string) {
    const config = ts.readConfigFile(configPath, ts.sys.readFile)
    const parsedConfig = ts.parseJsonConfigFileContent(
      config.config,
      ts.sys,
      path.dirname(configPath),
    )

    this.program = ts.createProgram(parsedConfig.fileNames, parsedConfig.options)
    this.checker = this.program.getTypeChecker()
  }

  /**
   * 提取组件元数据
   */
  extractComponentMetadata(filePath: string): ComponentMetadata | null {
    const sourceFile = this.program.getSourceFile(filePath)
    if (!sourceFile) return null

    let metadata: ComponentMetadata | null = null

    ts.forEachChild(sourceFile, (node) => {
      if (ts.isInterfaceDeclaration(node) && node.name.text.endsWith('Props')) {
        metadata = this.extractFromInterface(node)
      }
    })

    return metadata
  }

  /**
   * 从接口定义提取元数据
   */
  private extractFromInterface(node: ts.InterfaceDeclaration): ComponentMetadata {
    const jsDocTags = ts.getJSDocTags(node)

    const name = node.name.text.replace('Props', '')
    const description = this.getJSDocTag(jsDocTags, 'description') || ''
    const category = (this.getJSDocTag(jsDocTags, 'category') as any) || 'Display'
    const usage = this.getJSDocTag(jsDocTags, 'usage') || ''

    const props = this.extractProps(node)
    const examples = this.extractExamples(jsDocTags)

    return {
      name,
      type: name,
      category,
      description,
      usage,
      props,
      events: [
        {
          name: 'action',
          payloadType: 'any',
          description: '组件触发的动作事件',
        },
      ],
      examples,
    }
  }

  /**
   * 提取 Props
   */
  private extractProps(node: ts.InterfaceDeclaration): PropMetadata[] {
    const props: PropMetadata[] = []

    node.members.forEach((member) => {
      if (ts.isPropertySignature(member) && member.name) {
        const name = member.name.getText()
        const type = member.type ? member.type.getText() : 'any'
        const required = !member.questionToken
        const jsDoc = ts.getJSDocTags(member)
        const description = this.getJSDocComment(member) || ''

        props.push({
          name,
          type,
          required,
          description,
        })
      }
    })

    return props
  }

  /**
   * 提取示例
   */
  private extractExamples(tags: readonly ts.JSDocTag[]): ExampleMetadata[] {
    const examples: ExampleMetadata[] = []

    tags.forEach((tag) => {
      if (tag.tagName.text === 'example' && tag.comment) {
        examples.push({
          title: 'Example',
          description: '',
          code: typeof tag.comment === 'string' ? tag.comment : '',
        })
      }
    })

    return examples
  }

  /**
   * 获取 JSDoc 标签值
   */
  private getJSDocTag(tags: readonly ts.JSDocTag[], tagName: string): string | undefined {
    const tag = tags.find((t) => t.tagName.text === tagName)
    if (tag && tag.comment) {
      return typeof tag.comment === 'string' ? tag.comment : tag.comment[0]?.text
    }
    return undefined
  }

  /**
   * 获取 JSDoc 注释
   */
  private getJSDocComment(node: ts.Node): string | undefined {
    const jsDoc = (node as any).jsDoc
    if (jsDoc && jsDoc[0]) {
      return jsDoc[0].comment
    }
    return undefined
  }

  /**
   * 生成所有组件的元数据
   */
  generateAllMetadata(outputPath: string): void {
    const componentsDir = path.join(__dirname, '../src/types/component-props.ts')
    const metadata = this.extractComponentMetadata(componentsDir)

    // 生成 JSON 文件
    fs.writeFileSync(outputPath, JSON.stringify(metadata, null, 2), 'utf-8')
  }
}

// 使用示例
const extractor = new MetadataExtractor('./tsconfig.json')
extractor.generateAllMetadata('./src/metadata/components.json')
```

#### 4.4.3 元数据使用

```typescript
// src/core/ComponentRegistry.ts
import { ComponentMetadata } from '../types/component-metadata'
import componentsMetadata from '../metadata/components.json'

/**
 * 组件注册表
 * 提供组件元数据查询功能
 */
export class ComponentRegistry {
  private metadata: Map<string, ComponentMetadata> = new Map()

  constructor() {
    this.loadMetadata()
  }

  /**
   * 加载元数据
   */
  private loadMetadata(): void {
    Object.values(componentsMetadata).forEach((meta: ComponentMetadata) => {
      this.metadata.set(meta.type, meta)
    })
  }

  /**
   * 获取组件元数据
   */
  getMetadata(componentType: string): ComponentMetadata | undefined {
    return this.metadata.get(componentType)
  }

  /**
   * 获取所有组件元数据
   */
  getAllMetadata(): ComponentMetadata[] {
    return Array.from(this.metadata.values())
  }

  /**
   * 根据分类获取组件
   */
  getComponentsByCategory(category: string): ComponentMetadata[] {
    return Array.from(this.metadata.values()).filter((meta) => meta.category === category)
  }

  /**
   * 搜索组件
   */
  searchComponents(query: string): ComponentMetadata[] {
    const lowerQuery = query.toLowerCase()
    return Array.from(this.metadata.values()).filter(
      (meta) =>
        meta.name.toLowerCase().includes(lowerQuery) ||
        meta.description.toLowerCase().includes(lowerQuery) ||
        meta.usage.toLowerCase().includes(lowerQuery),
    )
  }
}

// 导出单例
export const componentRegistry = new ComponentRegistry()
```

### 4.5 Core 层 TypeScript 迁移

#### 4.5.1 A2UIManager 迁移

```typescript
// src/core/A2UIManager.ts
import { reactive, Reactive } from 'vue'
import { EventEmitter } from './EventEmitter'
import { Surface } from './Surface'
import { validateSurfaceConfig, mergeObjects } from './utils'
import { A2UI_EVENTS } from '../types/a2ui'
import {
  getValueByPath,
  setValueByPath,
  deleteValueByPath,
  normalizePath,
} from '../utils/pathResolver'

export interface A2UIManagerOptions {
  enableLogging?: boolean
  validateMessages?: boolean
  strictMode?: boolean
}

export interface SurfaceConfig {
  surfaceId: string
  rootComponentId: string
  styles?: Record<string, any>
}

export interface ManagerState {
  surfaces: Map<string, Surface>
  dataModels: Map<string, Reactive<Record<string, any>>>
}

/**
 * A2UI 核心管理器
 * 管理所有 Surface 实例和数据模型
 */
export class A2UIManager {
  private options: Required<A2UIManagerOptions>
  private state: ManagerState
  private eventBus: EventEmitter
  private _destroyed: boolean = false

  constructor(options: A2UIManagerOptions = {}) {
    this.options = {
      enableLogging: true,
      validateMessages: true,
      strictMode: false,
      ...options,
    }

    this.state = {
      surfaces: new Map(),
      dataModels: new Map(),
    }

    this.eventBus = new EventEmitter()

    this._log('A2UIManager initialized')
  }

  // ========== Surface 管理 ==========

  createSurface(config: SurfaceConfig): Surface | null {
    if (this._destroyed) {
      this._error('Cannot create surface: manager is destroyed')
      return null
    }

    if (!validateSurfaceConfig(config)) {
      this._error('Invalid surface config', config)
      return null
    }

    const { surfaceId } = config

    if (this.state.surfaces.has(surfaceId)) {
      this._warn(`Surface already exists: ${surfaceId}`)
      return this.state.surfaces.get(surfaceId)!
    }

    try {
      const surface = new Surface(config)
      this.state.surfaces.set(surfaceId, surface)

      this.initDataModel(surfaceId)

      this.eventBus.emit(A2UI_EVENTS.SURFACE_CREATED, {
        surfaceId,
        surface,
      })

      this._log(`Surface created: ${surfaceId}`)
      return surface
    } catch (error) {
      this._error('Failed to create surface', error)
      this.eventBus.emit(A2UI_EVENTS.ERROR, {
        type: 'surface_creation_failed',
        surfaceId,
        error,
      })
      return null
    }
  }

  getSurface(surfaceId: string): Surface | null {
    return this.state.surfaces.get(surfaceId) || null
  }

  hasSurface(surfaceId: string): boolean {
    return this.state.surfaces.has(surfaceId)
  }

  getAllSurfaces(): Surface[] {
    return Array.from(this.state.surfaces.values())
  }

  getSurfaceCount(): number {
    return this.state.surfaces.size
  }

  deleteSurface(surfaceId: string): boolean {
    if (this._destroyed) {
      this._error('Cannot delete surface: manager is destroyed')
      return false
    }

    const surface = this.state.surfaces.get(surfaceId)

    if (!surface) {
      this._warn(`Surface not found: ${surfaceId}`)
      return false
    }

    surface.destroy()
    this.state.surfaces.delete(surfaceId)
    this.deleteDataModel(surfaceId)

    this.eventBus.emit(A2UI_EVENTS.SURFACE_DELETED, { surfaceId })

    this._log(`Surface deleted: ${surfaceId}`)
    return true
  }

  updateComponents(surfaceId: string, components: any[]): boolean {
    if (this._destroyed) {
      this._error('Cannot update components: manager is destroyed')
      return false
    }

    const surface = this.state.surfaces.get(surfaceId)

    if (!surface) {
      this._error(`Surface not found: ${surfaceId}`)
      return false
    }

    if (!Array.isArray(components)) {
      this._error('Components must be an array')
      return false
    }

    const successCount = surface.addComponents(components)

    this.eventBus.emit(A2UI_EVENTS.SURFACE_UPDATED, {
      surfaceId,
      componentCount: successCount,
    })

    this._log(`Surface updated: ${surfaceId}, ${successCount} components`)
    return successCount > 0
  }

  // ========== 数据模型管理 ==========

  initDataModel(surfaceId: string): boolean {
    if (!surfaceId) {
      this._error('surfaceId is required')
      return false
    }

    if (!this.state.dataModels.has(surfaceId)) {
      this.state.dataModels.set(surfaceId, reactive({}))
      this._log(`Data model initialized: ${surfaceId}`)
    }

    return true
  }

  getDataModel(surfaceId: string): Record<string, any> {
    return this.state.dataModels.get(surfaceId) || {}
  }

  hasDataModel(surfaceId: string): boolean {
    return this.state.dataModels.has(surfaceId)
  }

  updateData(surfaceId: string, path: string, value: any): boolean {
    if (this._destroyed) {
      this._error('Cannot update data: manager is destroyed')
      return false
    }

    this.initDataModel(surfaceId)

    const normalizedPath = normalizePath(path || '/')
    const dataModel = this.state.dataModels.get(surfaceId)!

    if (!normalizedPath || normalizedPath === '/') {
      if (typeof value === 'object' && value !== null) {
        Object.assign(dataModel, value)
      }
    } else {
      const updatedData = setValueByPath(dataModel, normalizedPath, value)
      this.state.dataModels.set(surfaceId, updatedData)
    }

    this.eventBus.emit(A2UI_EVENTS.DATA_UPDATED, {
      surfaceId,
      path: normalizedPath,
      value,
    })

    this._log(`Data updated: ${surfaceId}, path: ${normalizedPath}`)
    return true
  }

  getData(surfaceId: string, path?: string): any {
    const dataModel = this.state.dataModels.get(surfaceId)

    if (!dataModel) {
      this._warn(`Data model not found: ${surfaceId}`)
      return undefined
    }

    if (!path || path === '/') {
      return dataModel
    }

    return getValueByPath(dataModel, path)
  }

  deleteData(surfaceId: string, path: string): boolean {
    if (this._destroyed) {
      this._error('Cannot delete data: manager is destroyed')
      return false
    }

    const dataModel = this.state.dataModels.get(surfaceId)

    if (!dataModel) {
      this._warn(`Data model not found: ${surfaceId}`)
      return false
    }

    const updatedData = deleteValueByPath(dataModel, path)
    this.state.dataModels.set(surfaceId, updatedData)

    this.eventBus.emit(A2UI_EVENTS.DATA_DELETED, {
      surfaceId,
      path,
    })

    this._log(`Data deleted: ${surfaceId}, path: ${path}`)
    return true
  }

  deleteDataModel(surfaceId: string): boolean {
    if (!this.state.dataModels.has(surfaceId)) {
      return false
    }

    this.state.dataModels.delete(surfaceId)
    this._log(`Data model deleted: ${surfaceId}`)
    return true
  }

  mergeData(surfaceId: string, path: string, data: any): boolean {
    const currentValue = this.getData(surfaceId, path)

    if (
      typeof currentValue === 'object' &&
      currentValue !== null &&
      typeof data === 'object' &&
      data !== null
    ) {
      const mergedValue = mergeObjects(currentValue, data)
      return this.updateData(surfaceId, path, mergedValue)
    }

    return this.updateData(surfaceId, path, data)
  }

  // ========== 事件管理 ==========

  on(event: string, handler: Function): Function {
    return this.eventBus.on(event, handler)
  }

  once(event: string, handler: Function): Function {
    return this.eventBus.once(event, handler)
  }

  off(event: string, handler: Function): boolean {
    return this.eventBus.off(event, handler)
  }

  emit(event: string, data?: any): boolean {
    return this.eventBus.emit(event, data)
  }

  // ========== 工具方法 ==========

  reset(): void {
    if (this._destroyed) {
      this._error('Cannot reset: manager is destroyed')
      return
    }

    this.state.surfaces.forEach((surface) => surface.destroy())
    this.state.surfaces.clear()
    this.state.dataModels.clear()
    this.eventBus.removeAllListeners()

    this._log('Manager reset')
  }

  destroy(): void {
    if (this._destroyed) {
      return
    }

    this.reset()
    this._destroyed = true
    this._log('Manager destroyed')
  }

  isDestroyed(): boolean {
    return this._destroyed
  }

  getState(): {
    surfaceCount: number
    dataModelCount: number
    destroyed: boolean
    options: A2UIManagerOptions
  } {
    return {
      surfaceCount: this.state.surfaces.size,
      dataModelCount: this.state.dataModels.size,
      destroyed: this._destroyed,
      options: { ...this.options },
    }
  }

  // ========== 私有方法 ==========

  private _log(...args: any[]): void {
    if (this.options.enableLogging) {
      console.log('[A2UIManager]', ...args)
    }
  }

  private _warn(...args: any[]): void {
    if (this.options.enableLogging) {
      console.warn('[A2UIManager]', ...args)
    }
  }

  private _error(...args: any[]): void {
    console.error('[A2UIManager]', ...args)
  }
}
```

## 5. 实施计划

### 5.1 阶段一：基础设施搭建（第 1-2 天）

#### 任务清单

- [ ] 创建 TypeScript 类型定义文件
  - `src/types/component-props.ts` - 所有组件 Props 类型
  - `src/types/component-metadata.ts` - 元数据类型定义
  - `src/core/context.ts` - Context 类型定义
- [ ] 创建 Context Provider 系统
  - `src/components/A2UIProvider.vue`
  - `src/composables/useA2UIContext.ts`
  - `src/composables/useA2UIData.ts`
  - `src/composables/useA2UIComponent.ts`

- [ ] 配置 TypeScript
  - 更新 `tsconfig.json`
  - 配置路径别名
  - 配置严格模式

### 5.2 阶段二：Core 层迁移（第 3-4 天）

#### 任务清单

- [ ] 迁移 Core 文件到 TypeScript
  - `A2UIManager.js` → `A2UIManager.ts`
  - `Surface.js` → `Surface.ts`
  - `EventEmitter.js` → `EventEmitter.ts`
  - `singleton.js` → `singleton.ts`
  - `utils.js` → `utils.ts`

- [ ] 添加完整的类型注解
- [ ] 编写单元测试

### 5.3 阶段三：组件迁移（第 5-10 天）

#### 迁移顺序（按依赖关系）

**第一批：Display 组件（无子组件依赖）**

- [ ] A2UIText.vue → A2UIText.vue (TS)
- [ ] A2UIImage.vue → A2UIImage.vue (TS)
- [ ] A2UIIcon.vue → A2UIIcon.vue (TS)
- [ ] A2UIVideo.vue → A2UIVideo.vue (TS)
- [ ] A2UIAudioPlayer.vue → A2UIAudioPlayer.vue (TS)

**第二批：Input 组件（依赖 Display 组件）**

- [ ] A2UIButton.vue → A2UIButton.vue (TS)
- [ ] A2UITextField.vue → A2UITextField.vue (TS)
- [ ] A2UICheckBox.vue → A2UICheckBox.vue (TS)
- [ ] A2UIDateTimeInput.vue → A2UIDateTimeInput.vue (TS)
- [ ] A2UIMultipleChoice.vue → A2UIMultipleChoice.vue (TS)
- [ ] A2UISlider.vue → A2UISlider.vue (TS)

**第三批：Layout 组件（依赖所有组件）**

- [ ] A2UIDivider.vue → A2UIDivider.vue (TS)
- [ ] A2UIRow.vue → A2UIRow.vue (TS)
- [ ] A2UIColumn.vue → A2UIColumn.vue (TS)
- [ ] A2UICard.vue → A2UICard.vue (TS)
- [ ] A2UIList.vue → A2UIList.vue (TS)
- [ ] A2UITabs.vue → A2UITabs.vue (TS)
- [ ] A2UIModal.vue → A2UIModal.vue (TS)

**第四批：Renderer 组件**

- [ ] A2UIRenderer.vue → A2UIRenderer.vue (TS)
- [ ] A2UISurface.vue → A2UISurface.vue (TS)

### 5.4 阶段四：元数据系统（第 11-12 天）

#### 任务清单

- [ ] 开发元数据提取工具
  - `scripts/extract-metadata.ts`
  - 配置 TypeScript Compiler API
- [ ] 生成组件元数据
  - 运行提取工具
  - 生成 `src/metadata/components.json`
- [ ] 创建组件注册表
  - `src/core/ComponentRegistry.ts`
  - 提供查询 API

- [ ] 集成到文档系统
  - 自动生成组件文档
  - 提供给 Agent 使用

### 5.5 阶段五：测试与优化（第 13-14 天）

#### 任务清单

- [ ] 单元测试
  - Core 层测试覆盖率 > 80%
  - Composables 测试覆盖率 > 80%
- [ ] 集成测试
  - 端到端测试主要场景
  - 测试 Context 注入
- [ ] 性能优化
  - 检查不必要的重渲染
  - 优化 computed 计算
- [ ] 文档完善
  - 更新 README
  - 编写迁移指南
  - 编写最佳实践

## 6. 技术细节

### 6.1 向后兼容性

为了保证平滑迁移，提供兼容层：

```typescript
// src/components/A2UIRenderer.vue (兼容版本)
<script setup lang="ts">
import { computed, provide } from 'vue'
import { A2UI_CONTEXT_KEY } from '@/core/context'

interface Props {
  componentId: string
  surfaceId?: string  // 兼容旧版本
  manager?: any       // 兼容旧版本
}

const props = defineProps<Props>()

// 如果传入了 manager 和 surfaceId，创建临时 context
if (props.manager && props.surfaceId) {
  provide(A2UI_CONTEXT_KEY, {
    manager: props.manager,
    surfaceId: ref(props.surfaceId)
  })
}

// ... 其余逻辑
</script>
```

### 6.2 性能优化策略

#### 6.2.1 Context 优化

```typescript
// 使用 readonly 防止意外修改
const context: A2UIContext = {
  manager: props.manager,
  surfaceId: readonly(ref(props.surfaceId)),
}
```

#### 6.2.2 Computed 缓存

```typescript
// 使用 computed 缓存数据访问
const data = computed(() => manager.getData(surfaceId.value, path))
```

#### 6.2.3 组件懒加载

```typescript
// 保持动态导入，按需加载组件
const dynamicComponent = computed(() =>
  defineAsyncComponent(() => import(`./a2ui/${category}/${name}.vue`)),
)
```

### 6.3 错误处理

#### 6.3.1 Context 缺失处理

```typescript
export function useA2UIContext(): A2UIContext {
  const context = inject(A2UI_CONTEXT_KEY)

  if (!context) {
    throw new Error(
      'useA2UIContext must be used within A2UIProvider. ' +
        'Make sure your component is wrapped with <A2UIProvider>.',
    )
  }

  return context
}
```

#### 6.3.2 数据访问错误处理

```typescript
export function useA2UIData<T = any>(path: string): ComputedRef<T | undefined> {
  const { manager, surfaceId } = useA2UIContext()

  return computed(() => {
    try {
      return manager.getData(surfaceId.value, path) as T
    } catch (error) {
      console.error(`Failed to get data at path: ${path}`, error)
      return undefined
    }
  })
}
```

### 6.4 开发体验优化

#### 6.4.1 类型提示

```typescript
// 提供泛型支持，增强类型推断
const userData = useA2UIData<User>('/user')
// userData 的类型为 ComputedRef<User | undefined>
```

#### 6.4.2 开发工具

```typescript
// 开发模式下提供调试信息
if (import.meta.env.DEV) {
  const context = inject(A2UI_CONTEXT_KEY)
  if (!context) {
    console.warn('[A2UI DevTools] Component rendered outside A2UIProvider', {
      component: getCurrentInstance()?.type.name,
    })
  }
}
```

## 7. 风险评估与应对

### 7.1 风险清单

| 风险                | 影响 | 概率 | 应对策略                     |
| ------------------- | ---- | ---- | ---------------------------- |
| TypeScript 学习曲线 | 中   | 中   | 提供培训和文档               |
| 迁移工作量大        | 高   | 高   | 分阶段迁移，保持向后兼容     |
| 性能回归            | 中   | 低   | 性能测试，持续监控           |
| 破坏性变更          | 高   | 低   | 提供兼容层，充分测试         |
| 元数据提取失败      | 中   | 中   | 手动补充，建立 fallback 机制 |

### 7.2 回滚策略

如果迁移过程中出现严重问题：

1. **保留旧代码**：在迁移期间保留 `.js` 文件
2. **Git 分支管理**：使用 feature 分支开发，主分支保持稳定
3. **渐进式发布**：先在测试环境验证，再逐步推广
4. **监控告警**：设置错误监控，及时发现问题

## 8. 成功标准

### 8.1 功能标准

- [ ] 所有组件成功迁移到 TypeScript
- [ ] 移除所有组件的 `manager` prop
- [ ] Context 系统正常工作
- [ ] 所有现有功能正常运行

### 8.2 质量标准

- [ ] 类型覆盖率 > 90%
- [ ] 单元测试覆盖率 > 80%
- [ ] 无 TypeScript 编译错误
- [ ] 无 ESLint 错误

### 8.3 性能标准

- [ ] 首次渲染时间无明显增加（< 5%）
- [ ] 内存占用无明显增加（< 10%）
- [ ] 组件更新性能无回归

### 8.4 文档标准

- [ ] 所有公共 API 有 JSDoc 注释
- [ ] 提供完整的迁移指南
- [ ] 提供组件使用示例
- [ ] 生成的元数据完整准确

## 9. 后续优化方向

### 9.1 短期优化（1-2 个月）

- 优化组件渲染性能
- 完善错误处理机制
- 增强开发者工具
- 补充单元测试

### 9.2 中期优化（3-6 个月）

- 实现组件热重载
- 支持组件主题定制
- 提供可视化调试工具
- 建立组件库文档站点

### 9.3 长期优化（6-12 个月）

- 支持服务端渲染（SSR）
- 实现组件虚拟滚动
- 提供组件性能分析工具
- 建立组件生态系统

## 10. 参考资料

### 10.1 技术文档

- [Vue 3 TypeScript 支持](https://vuejs.org/guide/typescript/overview.html)
- [Vue 3 Provide/Inject](https://vuejs.org/guide/components/provide-inject.html)
- [TypeScript Compiler API](https://github.com/microsoft/TypeScript/wiki/Using-the-Compiler-API)

### 10.2 最佳实践

- [Vue 3 组件设计模式](https://vuejs.org/guide/reusability/composables.html)
- [TypeScript 类型体操](https://github.com/type-challenges/type-challenges)
- [前端架构设计](https://martinfowler.com/architecture/)

## 11. 附录

### 11.1 术语表

- **Context**: Vue 的依赖注入机制，用于跨组件传递数据
- **Composable**: Vue 3 的组合式函数，用于封装可复用逻辑
- **Props Drilling**: 通过多层组件传递 props 的反模式
- **Metadata**: 组件的描述信息，包括用途、参数、示例等

### 11.2 文件结构

```
src/
├── components/
│   ├── A2UIProvider.vue          # Context Provider
│   ├── A2UIRenderer.vue          # 组件渲染器 (TS)
│   ├── A2UISurface.vue           # Surface 容器 (TS)
│   └── a2ui/
│       ├── display/              # Display 组件 (TS)
│       ├── input/                # Input 组件 (TS)
│       └── layout/               # Layout 组件 (TS)
├── composables/
│   ├── useA2UIContext.ts         # Context Hook
│   ├── useA2UIData.ts            # 数据访问 Hook
│   ├── useA2UIComponent.ts       # 组件访问 Hook
│   └── useA2UIAction.ts          # 动作处理 Hook
├── core/
│   ├── A2UIManager.ts            # 核心管理器 (TS)
│   ├── Surface.ts                # Surface 类 (TS)
│   ├── EventEmitter.ts           # 事件总线 (TS)
│   ├── context.ts                # Context 定义
│   ├── ComponentRegistry.ts      # 组件注册表
│   └── singleton.ts              # 单例管理 (TS)
├── types/
│   ├── component-props.ts        # 组件 Props 类型
│   ├── component-metadata.ts     # 元数据类型
│   ├── a2ui.ts                   # A2UI 核心类型
│   └── components.ts             # 组件映射类型
├── metadata/
│   └── components.json           # 生成的组件元数据
└── scripts/
    └── extract-metadata.ts       # 元数据提取工具
```

### 11.3 示例代码

#### 使用新架构的完整示例

```vue
<!-- App.vue -->
<template>
  <A2UIProvider :manager="manager" :surface-id="surfaceId">
    <A2UIRenderer :component-id="rootComponentId" />
  </A2UIProvider>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { getGlobalManager } from '@/core/singleton'
import A2UIProvider from '@/components/A2UIProvider.vue'
import A2UIRenderer from '@/components/A2UIRenderer.vue'

const manager = getGlobalManager()
const surfaceId = ref('main-surface')
const rootComponentId = ref('root')

// 创建 Surface
manager.createSurface({
  surfaceId: surfaceId.value,
  rootComponentId: rootComponentId.value,
})
</script>
```

---

**文档版本**: v1.0  
**创建日期**: 2026-01-12  
**最后更新**: 2026-01-12  
**作者**: A2UI Team
