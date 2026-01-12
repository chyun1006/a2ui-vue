# 需求：实现A2UI渲染器

## 技术栈

- Vue 3
- TypeScript
- Vite

## 项目结构

```
src/
  components/
  composables/
  stores/
  utils/
  views/
  App.vue
  main.ts
```

## 开发规范

- 遵循 Vue 3 Composition API
- 组件化开发

## 项目背景

- A2UI 是google提出的新的AI问答的交互方式，能够根据用户的输入和上下文，动态生成交互界面。
- 本项目旨在实现一个A2UI渲染器，用于渲染A2UI生成的交互界面。
- A2UI渲染器需要支持多种交互组件，包括文本输入、按钮、下拉框、表格等。
- google的 A2UI 规范：https://a2ui.org/specification/v0.8-a2ui/#introduction，参考这个文档实现
- 具体可以参考 schemas 目录下的文件，这些文件是google提供的A2UI规范的json schema

## 功能描述

- 根据sse 返回的消息，渲染对应的交互界面，消息格式参考google的A2UI规范
- 可以通过mock json来模拟sse返回的消息
