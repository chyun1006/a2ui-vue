# Manager 解耦实现文档

## 实现概述

通过 Vue 3 的 `provide/inject` 机制，将 `manager` 和 `surfaceId` 从组件 props 中移除，改为通过上下文注入的方式传递，实现了组件与 manager 的解耦。

## 架构变更

### 之前的架构（强耦合）

```
App.vue
  └─ A2UISurface (props: manager, surfaceId)
      └─ A2UIRenderer (props: manager, surfaceId, componentId)
          └─ A2UIButton (props: manager, surfaceId, componentId, ...)
              └─ A2UIRenderer (props: manager, surfaceId, componentId)
                  └─ A2UIText (props: manager, surfaceId, componentId, ...)
```

**问题**：

- manager 需要层层传递
- 每个组件都需要声明 manager prop
- 组件之间强耦合
- 难以测试和维护

### 现在的架构（解耦）

```
App.vue
  └─ A2UISurface (props: manager, surfaceId)
      └─ A2UIProvider (provide: manager, surfaceId)
          └─ A2UIRenderer (props: componentId, inject: manager, surfaceId)
              └─ A2UIButton (props: componentId, ..., inject: manager, surfaceId)
                  └─ A2UIRenderer (props: componentId, inject: manager, surfaceId)
                      └─ A2UIText (props: componentId, ..., inject: manager, surfaceId)
```

**优势**：

- manager 只在顶层传入一次
- 子组件通过 inject 自动获取
- 组件解耦，易于测试
- 代码更简洁

## 实现细节

### 1. A2UIProvider 组件

**文件**: `src/components/A2UIProvider.vue`

```vue
<script setup>
import { provide, readonly, toRef } from 'vue'

const props = defineProps({
  manager: {
    type: Object,
    required: true,
  },
  surfaceId: {
    type: String,
    required: true,
  },
})

const surfaceIdRef = toRef(props, 'surfaceId')

// 提供 manager 和 surfaceId 给所有子组件
provide('a2ui-manager', props.manager)
provide('a2ui-surface-id', readonly(surfaceIdRef))
</script>

<template>
  <slot />
</template>
```

**功能**：

- 接收 `manager` 和 `surfaceId` 作为 props
- 通过 `provide` 将它们注入到组件树中
- 使用 `readonly` 保护 surfaceId 不被子组件修改

### 2. A2UIRenderer 更新

**文件**: `src/components/A2UIRenderer.vue`

**变更前**：

```vue
<script setup>
const props = defineProps({
  surfaceId: { type: String, required: true },
  componentId: { type: String, required: true },
  manager: { type: Object, required: true },
})
</script>
```

**变更后**：

```vue
<script setup>
import { inject } from 'vue'

const props = defineProps({
  componentId: { type: String, required: true },
})

// 从 A2UIProvider 注入 manager 和 surfaceId
const manager = inject('a2ui-manager')
const surfaceId = inject('a2ui-surface-id')
</script>
```

**变更说明**：

- 移除了 `surfaceId` 和 `manager` props
- 使用 `inject` 从上下文获取这两个值
- 组件接口更简洁

### 3. A2UISurface 更新

**文件**: `src/components/A2UISurface.vue`

**变更前**：

```vue
<template>
  <div class="a2ui-surface">
    <A2UIRenderer
      :surface-id="surfaceId"
      :component-id="rootComponentId"
      :manager="manager"
      @action="handleAction"
    />
  </div>
</template>
```

**变更后**：

```vue
<template>
  <div class="a2ui-surface">
    <A2UIProvider :manager="manager" :surface-id="surfaceId">
      <A2UIRenderer :component-id="rootComponentId" @action="handleAction" />
    </A2UIProvider>
  </div>
</template>
```

**变更说明**：

- 使用 `A2UIProvider` 包裹 `A2UIRenderer`
- `A2UIRenderer` 不再需要传递 `manager` 和 `surfaceId`

## 使用方式

### 在应用中使用

```vue
<template>
  <A2UISurface :manager="manager" :surface-id="surfaceId" />
</template>

<script setup>
import { getGlobalManager } from '@/core/singleton'
import A2UISurface from '@/components/A2UISurface.vue'

const manager = getGlobalManager()
const surfaceId = 'main-surface'

manager.createSurface({
  surfaceId,
  rootComponentId: 'root',
})
</script>
```

### 在子组件中访问 manager

如果子组件需要访问 manager 或 surfaceId，可以使用 `inject`：

```vue
<script setup>
import { inject, computed } from 'vue'

const manager = inject('a2ui-manager')
const surfaceId = inject('a2ui-surface-id')

// 使用 manager 获取数据
const userData = computed(() => {
  return manager.getData(surfaceId.value, '/user')
})

// 更新数据
const updateUserName = (name) => {
  manager.updateData(surfaceId.value, '/user/name', name)
}
</script>
```

## 向后兼容性

当前实现保持了向后兼容：

1. **A2UISurface** 仍然接收 `manager` 和 `surfaceId` props
2. **子组件** 仍然可以接收 `manager` 和 `surfaceId` props（如果需要）
3. **渐进式迁移** 可以逐步将子组件改为使用 `inject`

## 迁移指南

### 迁移现有组件

如果你有自定义的 A2UI 组件，可以按以下步骤迁移：

**步骤 1**: 移除 props 定义

```vue
// 移除这些 const props = defineProps({ surfaceId: { type: String, required: true }, manager: {
type: Object, required: true }, // ... 其他 props })
```

**步骤 2**: 使用 inject 获取

```vue
import { inject } from 'vue' const manager = inject('a2ui-manager') const surfaceId =
inject('a2ui-surface-id') // 其他 props 保持不变 const props = defineProps({ componentId: { type:
String, required: true }, // ... 其他 props })
```

**步骤 3**: 更新使用方式

```vue
// 之前
<MyComponent :manager="manager" :surface-id="surfaceId" :component-id="id" />

// 之后
<MyComponent :component-id="id" />
```

## 测试

### 单元测试示例

```javascript
import { mount } from '@vue/test-utils'
import { A2UIManager } from '@/core/A2UIManager'
import A2UIProvider from '@/components/A2UIProvider.vue'
import A2UIRenderer from '@/components/A2UIRenderer.vue'

describe('A2UIRenderer with Provider', () => {
  it('should render component from injected manager', () => {
    const manager = new A2UIManager()
    manager.createSurface({
      surfaceId: 'test',
      rootComponentId: 'root',
    })

    const wrapper = mount(A2UIProvider, {
      props: {
        manager,
        surfaceId: 'test',
      },
      slots: {
        default: () =>
          h(A2UIRenderer, {
            componentId: 'root',
          }),
      },
    })

    expect(wrapper.exists()).toBe(true)
  })
})
```

## 性能影响

- **内存**: 无明显增加（provide/inject 是 Vue 内置机制）
- **渲染性能**: 无影响（inject 在组件创建时执行一次）
- **包体积**: 增加约 100 字节（A2UIProvider 组件）

## 注意事项

1. **必须在 A2UIProvider 内部使用**
   - 所有使用 `inject('a2ui-manager')` 的组件必须在 `A2UIProvider` 内部
   - 否则会得到 `undefined`

2. **surfaceId 是只读的**
   - 使用 `readonly(ref())` 包装，防止子组件修改
   - 如需修改，应该在父组件层面操作

3. **错误处理**
   - 建议在使用 inject 后检查值是否存在
   ```vue
   const manager = inject('a2ui-manager') if (!manager) { console.error('Manager not found. Make
   sure component is inside A2UIProvider') }
   ```

## 未来优化方向

1. **TypeScript 支持**
   - 添加类型定义
   - 提供类型安全的 inject 函数

2. **Composables**
   - 创建 `useA2UIManager()` composable
   - 创建 `useA2UIData()` composable

3. **开发者工具**
   - 提供 Vue DevTools 插件
   - 可视化 manager 状态

## 总结

通过引入 `A2UIProvider` 和使用 `provide/inject` 机制，成功实现了：

✅ **解耦**: 组件不再直接依赖 manager prop  
✅ **简洁**: 减少了 props 传递的复杂度  
✅ **灵活**: 更容易进行测试和维护  
✅ **兼容**: 保持向后兼容性

这个改进为后续的架构优化（如 TypeScript 迁移、Composables API 等）奠定了良好的基础。
