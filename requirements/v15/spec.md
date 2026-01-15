# 需求 a2uiRender 用法改造

## 背景

为了支持在消息列表中展示，也就是一个页面多个a2uiRender组件

## 需求详情

- a2uiRender 组件的 用法改为传递属性 surfaceList

  ```javascript
            <a2uiRender :surfaceList="surfaceList" @action="handleAction"></a2uiRender>
  ```

- a2uiRender 只用来展示传递给它的surfaceList, surfaceList
- 取消process 对消息状态的管理，去掉单例的概念
- surfaceList -> a2uiRender -> 处理surfaceList -> 内部渲染出对应组件。

## 注意

- 不要影响组件的渲染功能
- 不要影响按钮点击后的取值功能
