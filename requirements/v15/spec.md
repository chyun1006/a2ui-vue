# 需求 a2uiRender 用法改造

## 背景

为了支持在消息列表中展示，也就是一个页面多个a2uiRender组件

## 需求详情

- a2uiRender 组件的 用法改为传递属性 surfaceList

  ```javascript
            <a2uiRender :surfaceList="surfaceList" @action="handleAction"></a2uiRender>
  ```

- a2ui 不再是单例，而是通过 surfaceId 来管理
- a2uiRender 通过 surfaceList 去渲染
- 优化后不要影响渲染和按钮的点击逻辑

## bugFix:

- 消息列表中，a2uiRender 组件渲染出来的，但是渲染到上一个消息记录里面去了，也就是在问题的问题上方展示了，这是不对的，作为回答，应该始终在问题的下方展示
