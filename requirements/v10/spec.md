# 需求 createSignalA2uiMessageProcessor 重构

## 背景

- 在每次处理消息之前，也就是用户进行页面交互之后，需要清空之前的 surfaces，展示新的 surfaces

## 需求说明

- createSignalA2uiMessageProcessor 返回方法扩展
  - processMessages: 处理消息
  - getSurfaces: 获取 surfaces
  - clearSurfaces: 清空 surfaces
