# TextField 数据绑定问题调试指南

## 问题描述

点击按钮后无法获取 TextField 输入的值，`getData` 返回空字符串。

## 诊断步骤

### 1. 清除浏览器缓存

**重要**: 先清除浏览器缓存或强制刷新（Cmd+Shift+R）

### 2. 在浏览器控制台运行以下命令

```javascript
// 1. 获取全局 adapter (注意：现在使用 adapter 而不是 manager)
const adapter =
  window.__A2UI_GLOBAL_MANAGER__?.adapter || window.__A2UI_GLOBAL_MANAGER__;

// 2. 查看所有 surfaces
const surfaces = adapter.litProcessor.getSurfaces();
console.log("All surfaces:", surfaces);

// 3. 查看 chat_input_surface
const surface = surfaces.get("chat_input_surface");
console.log("Surface:", surface);
console.log("Surface root:", surface?.root);
console.log("Surface components:", surface?.components);
console.log("Surface dataModel:", surface?.dataModel);

// 4. 查看 dataModel 的原始值
const dm = surface.dataModel.peek
  ? surface.dataModel.peek()
  : surface.dataModel;
console.log("DataModel raw:", dm);
console.log("DataModel.vals:", dm.vals);
console.log("DataModel keys:", Array.from(dm.vals.keys()));

// 5. 查看 chat 对象
const chat = dm.vals.get("chat");
console.log("chat:", chat);
const chatValue = chat.peek ? chat.peek() : chat;
console.log("chat value:", chatValue);
console.log("chat.vals:", chatValue.vals);
console.log("chat keys:", Array.from(chatValue.vals.keys()));

// 6. 查看 input_text 的值
const inputText = chatValue.vals.get("input_text");
console.log("input_text Signal:", inputText);
const inputTextValue = inputText.peek ? inputText.peek() : inputText;
console.log("input_text value:", inputTextValue);

// 7. 手动测试 updateData
adapter.updateData("chat_input_surface", "/chat/input_text", "手动测试数据");

// 8. 再次查看值
const testValue = adapter.getData("chat_input_surface", "/chat/input_text");
console.log("After manual update, getData result:", testValue);
```

### 3. 检查 TextField 组件是否渲染

在控制台查找以下日志：

- `[TextField] Component created` - 应该在页面加载时出现
- `[TextField.handleInput]` - 应该在输入时出现
- `[TextField.updateDataModel]` - 应该在输入时出现

如果**没有看到这些日志**，说明：

1. 浏览器使用了缓存的旧代码
2. 或者 TextField 组件没有正确渲染

### 4. 强制清除缓存的方法

```bash
# 在 examples 目录
cd examples
rm -rf node_modules/.vite
pnpm dev
```

然后在浏览器中：

1. 打开开发者工具
2. 右键点击刷新按钮
3. 选择"清空缓存并硬性重新加载"

## 可能的问题和解决方案

### 问题 1: TextField 没有触发 updateData

**症状**: 没有看到 `[TextField.handleInput]` 或 `[TextField.updateDataModel]` 日志

**解决方案**:

1. 检查 TextField 组件的 `@input` 事件绑定
2. 检查 `props.text` 是否正确传递
3. 检查 `manager` 是否正确注入

### 问题 2: updateData 被调用但数据没有保存

**症状**: 看到 `[Adapter.updateData]` 日志，但 `getData` 返回空值

**解决方案**:

1. 检查 `@a2ui/lit` 的 `setData` 调用是否成功
2. 检查 path 格式是否正确（应该是 `/chat/input_text`）
3. 检查 surfaceId 是否正确（应该是 `chat_input_surface`）

### 问题 3: getData 无法读取已保存的数据

**症状**: `updateData` 成功，但 `getData` 返回空值

**解决方案**:
这是最可能的问题。`@a2ui/lit` 使用 Signal 对象存储数据，需要正确解包：

```javascript
// 错误的方式
const value = dataModel.vals.get("chat"); // 返回 Signal 对象

// 正确的方式
const chatSignal = dataModel.vals.get("chat");
const chat = chatSignal.peek(); // 解包 Signal
const inputTextSignal = chat.vals.get("input_text");
const inputText = inputTextSignal.peek(); // 再次解包
```

## 临时解决方案

如果问题仍然存在，可以尝试以下临时解决方案：

### 方案 1: 直接在 Button 的 action handler 中获取输入值

修改 `ChatDemo3.vue`:

```javascript
const handleAction = (action) => {
  console.log("Action received:", action);

  // 直接从 DOM 获取输入值作为临时方案
  const inputElement = document.querySelector("textarea");
  const inputValue = inputElement?.value || "";

  console.log("Input value from DOM:", inputValue);

  // 使用这个值发送消息
  if (inputValue) {
    sendMsgFromA2UI({ ...action, inputValue });
  }
};
```

### 方案 2: 使用 Vue ref 绑定

在 TextField 组件中添加一个 ref，直接访问输入值。

## 下一步

1. **清除缓存并刷新浏览器**
2. **运行控制台诊断命令**
3. **查看完整的日志输出**
4. **将日志结果反馈给开发者**

特别关注：

- 是否看到 `[TextField]` 相关日志
- `updateData` 是否被调用
- `getData` 返回什么值
- 手动调用 `updateData` 和 `getData` 的结果
