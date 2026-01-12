# 需求 ：a2ui重构

## 背景

- 现在在a2ui渲染器中，还强依赖了pinia，这使得a2ui的使用变得复杂，且不利于维护和扩展，将a2ui单独作为一个包都不行，耦合性太高

## 目标

- 将message 和a2ui渲染器逻辑进行拆分，a2ui作为独立的包，暴露出必要的接口给使用者
- 重构a2ui，使其更加模块化，易于维护和扩展

## 最终使用

```javascript
import { a2uiRender, createSignalA2uiMessageProcessor } from '../components/a2uiRenderer'

const processor = createSignalA2uiMessageProcessor()
```

组件渲染：

```vue
<template>
  <a2uiRender @action="sendMessage" />
</template>
```

消息发送：

```javascript
const sendMessage = async (payload) => {
  // 1、 fetch请求
  const message = await fetch('/api/send', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
  // 2、 消息处理
  processor(message)
}
```
