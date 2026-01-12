# A2UI Mock 数据说明

本目录包含用于演示和测试的 A2UI 消息 Mock 数据。

## 文件列表

### 1. messages.json

**基础演示数据** - 简单的表单示例

包含的消息类型：

- ✅ `beginRendering` - 创建 Surface
- ✅ `surfaceUpdate` - 添加表单组件
- ✅ `dataModelUpdate` - 初始化用户数据

演示内容：

- 文本展示（Markdown）
- 文本输入框
- 复选框
- 滑块
- 按钮交互

访问路径：`/` 或 `/demo`

---

### 2. complete-demo.json

**完整演示数据** - 展示所有四种消息类型和 18 个组件

包含的消息类型：

- ✅ `beginRendering` - 创建多个 Surface
- ✅ `surfaceUpdate` - 更新组件树
- ✅ `dataModelUpdate` - 更新数据模型（根路径和子路径）
- ✅ `deleteSurface` - 删除 Surface

演示内容：

- **展示组件**：Text, Image, Icon, Video, AudioPlayer
- **布局组件**：Row, Column, List, Card, Tabs, Modal, Divider
- **交互组件**：Button, TextField, CheckBox, DateTimeInput, MultipleChoice, Slider

访问路径：`/complete`

---

## 消息序列说明

### complete-demo.json 消息流程

1. **消息 1** - `beginRendering`
   - 创建主 Surface (`chat-surface`)
   - 设置样式（字体、主色调）

2. **消息 2** - `surfaceUpdate`
   - 添加完整的组件树
   - 包含 Tabs、Card、Form、List、Modal 等

3. **消息 3** - `dataModelUpdate` (根路径 `/`)
   - 初始化所有数据模型
   - 包括 profile、settings、items 三个主要数据块

4. **消息 4** - `dataModelUpdate` (子路径 `/profile/name`)
   - 演示更新单个字段
   - 姓名从"李明"更新为"李明（已更新）"

5. **消息 5** - `dataModelUpdate` (子路径 `/items`)
   - 演示添加新数据
   - 向列表添加第四个项目

6. **消息 6** - `surfaceUpdate`
   - 演示组件更新
   - 修改按钮文本为"已保存 ✓"

7. **消息 7** - `beginRendering`
   - 创建第二个 Surface (`secondary-surface`)
   - 演示多 Surface 管理

8. **消息 8** - `surfaceUpdate`
   - 为第二个 Surface 添加组件

9. **消息 9** - `deleteSurface`
   - 删除第二个 Surface
   - 演示 Surface 生命周期管理

---

## 数据模型结构

### Profile 数据

```json
{
  "profile": {
    "name": "李明",
    "email": "liming@example.com",
    "bio": "热爱技术的全栈开发工程师...",
    "birthday": "1990-05-15",
    "avatar": "https://api.dicebear.com/7.x/avataaars/svg?seed=Felix"
  }
}
```

### Settings 数据

```json
{
  "settings": {
    "notifications": true,
    "theme": ["light"],
    "volume": 75
  }
}
```

### Items 数据（用于 List 模板渲染）

```json
{
  "items": {
    "item1": "第一个列表项",
    "item2": "第二个列表项",
    "item3": "第三个列表项",
    "item4": "新增的第四个列表项"
  }
}
```

---

## 使用方法

### 在代码中使用

```javascript
import { useA2UIMessage } from '@/composables/useA2UIMessage'
import mockMessages from '@/mock/messages.json'
import completeDemoMessages from '@/mock/complete-demo.json'

const { processMessages, processMessage } = useA2UIMessage()

// 加载基础演示
processMessages(mockMessages)

// 或逐条播放完整演示
completeDemoMessages.forEach((message, index) => {
  setTimeout(() => {
    processMessage(message)
  }, index * 2000)
})
```

### 通过页面访问

- 基础演示：http://localhost:5177/
- 完整演示：http://localhost:5177/complete

---

## 自定义 Mock 数据

### 创建新的 Mock 文件

1. 在 `src/mock/` 目录下创建新的 JSON 文件
2. 按照 A2UI 消息格式编写数据
3. 在 Vue 组件中导入并使用

### 消息格式参考

#### beginRendering

```json
{
  "beginRendering": {
    "surfaceId": "your-surface-id",
    "root": "root-component-id",
    "styles": {
      "font": "Roboto",
      "primaryColor": "#1976d2"
    }
  }
}
```

#### surfaceUpdate

```json
{
  "surfaceUpdate": {
    "surfaceId": "your-surface-id",
    "components": [
      {
        "id": "component-id",
        "component": {
          "Text": {
            "text": { "literalString": "Hello" },
            "usageHint": "body"
          }
        }
      }
    ]
  }
}
```

#### dataModelUpdate

```json
{
  "dataModelUpdate": {
    "surfaceId": "your-surface-id",
    "path": "/",
    "contents": [
      { "key": "name", "valueString": "John" },
      { "key": "age", "valueNumber": 30 },
      { "key": "active", "valueBoolean": true }
    ]
  }
}
```

#### deleteSurface

```json
{
  "deleteSurface": {
    "surfaceId": "your-surface-id"
  }
}
```

---

## 注意事项

1. **组件 ID 必须唯一**：每个组件的 `id` 在同一个 Surface 中必须唯一
2. **路径格式**：数据模型路径使用 `/` 分隔，如 `/user/profile/name`
3. **数据类型**：支持 `valueString`、`valueNumber`、`valueBoolean`、`valueArray`、`valueMap`
4. **引用顺序**：组件引用的子组件必须在同一个或后续的 `surfaceUpdate` 中定义
5. **Surface ID**：删除 Surface 前确保该 Surface 已通过 `beginRendering` 创建

---

## 相关文档

- [A2UI 规范 v0.8](https://a2ui.org/specification/v0.8-a2ui/)
- [项目 README](../../README_A2UI.md)
- [设计文档](../../requirements/design.md)
