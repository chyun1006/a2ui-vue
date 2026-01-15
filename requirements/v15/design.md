# A2UI 无状态渲染架构设计

## 设计目标

基于v15需求，实现真正的无状态A2UI渲染架构：

- `a2uiRender`组件只负责渲染传入的`surfaceList`
- 移除processor对消息状态的管理
- 取消单例概念，每个组件独立渲染

## 核心设计原则

### 1. 数据流向

```
A2UI JSON → processor.parse() → Surface对象数组 → a2uiRender → 渲染UI
```

**关键点**：

- processor只做解析，不保存状态
- Surface对象是纯数据，完全独立
- a2uiRender是无状态组件，只渲染传入的数据

### 2. 组件职责划分

#### processor（纯函数）

```javascript
// 输入：A2UI JSON消息数组
// 输出：Surface对象数组
function processMessages(messages) {
  // 解析JSON，构建Surface对象
  // 不保存任何状态
  return surfaceObjects;
}
```

#### a2uiRender（无状态组件）

```vue
<script setup>
const props = defineProps({
  surfaceList: Array, // Surface对象数组
});
// 直接渲染surfaceList，不依赖任何全局状态
</script>
```

#### A2UISurface（纯展示组件）

```vue
<script setup>
const props = defineProps({
  surface: Object, // 单个Surface对象
});
// 直接使用surface对象渲染，不需要manager
</script>
```

## 架构设计

### 当前问题分析

**问题1：全局状态污染**

- processor使用全局manager存储所有Surface
- 所有a2uiRender组件共享同一个Surface Map
- 导致消息间互相干扰

**问题2：状态管理混乱**

- processor既负责解析，又负责状态管理
- 组件依赖全局manager获取数据
- 违反单一职责原则

### 新架构设计

#### 1. Processor改造

**当前实现**：

```javascript
// 错误：保存状态
processor.processMessages(json); // 内部存储到全局Map
const surfaces = manager.getSurfaces(); // 从全局Map读取
```

**目标实现**：

```javascript
// 正确：纯函数
const surfaces = processor.processMessages(json); // 直接返回Surface对象数组
// surfaces = [
//   { id, root, components, dataModel, styles },
//   ...
// ]
```

**实现要点**：

- 修改`lib/src/processor.js`的`processMessages`方法
- 提取A2UI消息中涉及的Surface IDs
- 从lit processor获取Surface对象
- 构建并返回完整的Surface对象数组

#### 2. 组件改造

**A2UIRender.vue**：

```vue
<script setup>
import { computed } from "vue";
import A2UISurface from "./A2UISurface.vue";

const props = defineProps({
  surfaceList: {
    type: Array, // Surface对象数组
    default: () => [],
  },
});

// 直接使用surfaceList，无需任何全局依赖
const surfaces = computed(() => props.surfaceList || []);
</script>

<template>
  <div class="a2ui-render">
    <A2UISurface
      v-for="surface in surfaces"
      :key="surface.id"
      :surface="surface"
    />
  </div>
</template>
```

**A2UISurface.vue**：

```vue
<script setup>
const props = defineProps({
  surface: {
    type: Object, // 完整的Surface对象
    required: true,
  },
});

// 直接使用surface对象，不需要manager.getSurface()
// surface包含：id, root, components, dataModel, styles
</script>
```

#### 3. HXT页面集成

```javascript
// 处理用户消息
const processUserMessage = async (text) => {
  // 1. 获取A2UI JSON
  const a2uiJson = await getA2UIFromAPI(text);

  // 2. 解析为Surface对象（纯函数调用）
  const surfaces = processor.processMessages(a2uiJson);

  // 3. 存储到消息中
  const newMessage = {
    id: messageId,
    type: "A2UI_WIDGET",
    widgetPayload: {
      surfaces: surfaces, // 直接存储Surface对象数组
    },
  };

  messages.value.push(newMessage);
};
```

```vue
<!-- ChatBubble.vue -->
<a2uiRender
  :surfaceList="message.widgetPayload.surfaces"
  @action="handleAction"
/>
```

## 数据结构设计

### Surface对象结构

```typescript
interface Surface {
  id: string; // Surface唯一标识
  root: string; // 根组件ID
  components: Map; // 组件定义Map
  dataModel: Object; // 数据模型
  styles: Object; // 样式配置
}
```

### 消息对象结构

```typescript
interface Message {
  id: string;
  type: "A2UI_WIDGET";
  widgetPayload: {
    surfaces: Surface[]; // Surface对象数组
  };
}
```

## 实施计划

### Phase 1: Processor改造

- [ ] 修改`processMessages`返回Surface对象数组
- [ ] 确保Surface对象包含所有必要数据
- [ ] 移除全局状态依赖

### Phase 2: 组件简化

- [ ] 简化`A2UIRender.vue`，移除manager依赖
- [ ] 修改`A2UISurface.vue`直接使用surface prop
- [ ] 移除所有全局事件监听

### Phase 3: 集成测试

- [ ] 修改HXT页面使用新架构
- [ ] 测试多消息场景
- [ ] 验证按钮点击功能

### Phase 4: 清理优化

- [ ] 移除废弃代码
- [ ] 更新文档
- [ ] 性能优化

## 关键技术点

### 1. Surface对象的完整性

确保从processor返回的Surface对象包含所有渲染所需的数据：

- `components` Map需要包含所有组件定义
- `dataModel`需要包含所有表单数据
- `styles`需要包含样式配置

### 2. 数据隔离

每个消息的Surface对象必须完全独立：

- 使用深拷贝或独立创建
- 避免共享引用
- 确保修改不会影响其他消息

### 3. 事件处理

按钮点击等事件的处理：

```vue
<!-- A2UISurface内部 -->
<A2UIButton
  :config="buttonConfig"
  @action="(data) => emit('action', { surfaceId: surface.id, ...data })"
/>
```

## 预期效果

✅ **完全隔离**：每个消息有独立的Surface对象，互不影响  
✅ **无状态渲染**：a2uiRender只渲染传入的数据  
✅ **简化架构**：移除全局manager依赖，代码更清晰  
✅ **易于测试**：纯函数和无状态组件更容易测试  
✅ **性能优化**：减少不必要的响应式追踪

## 风险与挑战

### 风险1：Surface对象大小

- **问题**：每个消息存储完整Surface对象可能占用较多内存
- **方案**：实际使用中Surface数量有限，可接受

### 风险2：lit processor依赖

- **问题**：仍需要lit processor来解析A2UI JSON
- **方案**：保留adapter，但只用于解析，不用于状态管理

### 风险3：数据模型更新

- **问题**：表单输入需要更新dataModel
- **方案**：使用Vue的响应式系统，Surface对象中的dataModel是响应式的

## 总结

新架构的核心思想是**数据驱动**：

- processor负责数据转换（JSON → Surface对象）
- 组件负责数据展示（Surface对象 → UI）
- 没有全局状态，没有单例，完全解耦

这样的设计符合Vue的理念，也更容易维护和扩展。
