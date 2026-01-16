# A2UI 图表组件设计文档

## 1. 概述

本文档描述了为 A2UI 添加图表展示能力的设计方案，包括饼图、柱状图、折线图、堆积图和散点图五种图表类型。

## 2. 技术选型

### 2.1 图表库对比

| 库             | 优势                               | 劣势                       | 适用场景                 |
| -------------- | ---------------------------------- | -------------------------- | ------------------------ |
| **Chart.js**   | 轻量级、简单易用、文档完善         | 图表类型有限、复杂定制困难 | 基础图表、快速实现       |
| **ECharts**    | 功能强大、支持大数据集、高度可定制 | 学习曲线陡峭、包体积较大   | 复杂可视化、企业级应用   |
| **ApexCharts** | 现代设计、交互性强、易于集成       | 大数据集性能一般           | 交互式仪表板、中等数据量 |

### 2.2 推荐方案

**选择 ECharts (vue-echarts)**

**理由：**

1. **按需加载**：支持 tree-shaking，只打包使用的图表类型，保持轻量
2. **功能完整**：原生支持所有需求的图表类型（饼图、柱状图、折线图、堆积图、散点图）
3. **高性能**：Canvas 渲染，适合处理大数据集
4. **Vue 3 集成**：`vue-echarts` 提供完善的 Vue 3 组件封装
5. **可扩展性**：未来可轻松添加更多图表类型（3D图、地图等）
6. **中文支持**：Baidu 开发，文档和社区对中文友好

## 3. 组件架构

### 3.1 目录结构

```
lib/src/components/a2ui/
├── display/
│   ├── A2UIText.vue
│   ├── A2UIImage.vue
│   ├── A2UIVideo.vue
│   ├── A2UIAudioPlayer.vue
│   └── charts/              # 新增图表目录
│       ├── A2UIPieChart.vue
│       ├── A2UIBarChart.vue
│       ├── A2UILineChart.vue
│       ├── A2UIStackedChart.vue
│       ├── A2UIScatterChart.vue
│       └── useChartConfig.js  # 共享配置逻辑
```

### 3.2 组件设计原则

1. **数据绑定一致性**：遵循 A2UI 的 `useDataBinding` 模式
2. **响应式更新**：图表数据变化时自动重新渲染
3. **主题一致性**：使用 A2UI 的颜色系统
4. **无状态渲染**：组件不保存内部状态，完全由 props 驱动

## 4. 组件详细设计

### 4.1 A2UIPieChart (饼图)

#### Props 定义

```javascript
/**
 * @component A2UIPieChart
 * @description 饼图组件，用于展示数据占比关系
 * @param {Object} data - 数据绑定对象，包含图表数据数组
 * @param {Object} [title] - 数据绑定对象，图表标题
 * @param {Object} [subtitle] - 数据绑定对象，图表副标题
 * @param {boolean} [showLegend=true] - 是否显示图例
 * @param {string} [legendPosition='right'] - 图例位置: 'top', 'right', 'bottom', 'left'
 * @param {boolean} [showLabel=true] - 是否显示数据标签
 * @param {string} [labelFormat='percent'] - 标签格式: 'percent', 'value', 'name'
 * @param {number} [radius=75] - 饼图半径百分比 (0-100)
 * @param {number} [innerRadius=0] - 内半径百分比，大于0时为环形图
 * @param {Array<string>} [colors] - 自定义颜色数组
 * @emits {Object} sectorClick - 扇区点击事件，返回点击的数据项
 */
```

#### 数据格式

```javascript
// data 绑定的数据结构
[
  { name: "类别A", value: 335 },
  { name: "类别B", value: 234 },
  { name: "类别C", value: 154 },
];
```

#### 配置示例

```javascript
{
  title: { literalString: "销售占比" },
  subtitle: { literalString: "2024年第一季度" },
  data: {
    dataPath: "/salesData"
  },
  showLegend: true,
  legendPosition: "right",
  showLabel: true,
  labelFormat: "percent",
  radius: 75,
  innerRadius: 40,  // 环形图
  colors: ["#5470c6", "#91cc75", "#fac858", "#ee6666"]
}
```

### 4.2 A2UIBarChart (柱状图)

#### Props 定义

```javascript
/**
 * @component A2UIBarChart
 * @description 柱状图组件，用于展示分类数据对比
 * @param {Object} data - 数据绑定对象，包含图表数据
 * @param {Object} [title] - 数据绑定对象，图表标题
 * @param {Object} [xAxisLabel] - 数据绑定对象，X轴标签
 * @param {Object} [yAxisLabel] - 数据绑定对象，Y轴标签
 * @param {boolean} [horizontal=false] - 是否为横向柱状图
 * @param {boolean} [showGrid=true] - 是否显示网格线
 * @param {string} [barColor='#5470c6'] - 柱子颜色
 * @param {number} [barWidth] - 柱子宽度百分比
 * @emits {Object} barClick - 柱子点击事件
 */
```

#### 数据格式

```javascript
{
  categories: ["周一", "周二", "周三", "周四", "周五"],
  values: [120, 200, 150, 80, 70]
}
```

### 4.3 A2UILineChart (折线图)

#### Props 定义

```javascript
/**
 * @component A2UILineChart
 * @description 折线图组件，用于展示趋势变化
 * @param {Object} data - 数据绑定对象，包含一条或多条折线数据
 * @param {Object} [title] - 数据绑定对象，图表标题
 * @param {Object} [xAxisLabel] - 数据绑定对象，X轴标签
 * @param {Object} [yAxisLabel] - 数据绑定对象，Y轴标签
 * @param {boolean} [smooth=false] - 是否平滑曲线
 * @param {boolean} [showArea=false] - 是否显示面积
 * @param {boolean} [showPoints=true] - 是否显示数据点
 * @param {boolean} [showLegend=true] - 是否显示图例（多条线时）
 * @emits {Object} pointClick - 数据点点击事件
 */
```

#### 数据格式

```javascript
// 单条线
{
  xAxis: ["1月", "2月", "3月", "4月", "5月"],
  series: [
    {
      name: "销售额",
      data: [820, 932, 901, 934, 1290]
    }
  ]
}

// 多条线
{
  xAxis: ["1月", "2月", "3月", "4月", "5月"],
  series: [
    {
      name: "产品A",
      data: [820, 932, 901, 934, 1290]
    },
    {
      name: "产品B",
      data: [620, 732, 701, 734, 1090]
    }
  ]
}
```

### 4.4 A2UIStackedChart (堆积图)

#### Props 定义

```javascript
/**
 * @component A2UIStackedChart
 * @description 堆积图组件，支持堆积柱状图和堆积面积图
 * @param {Object} data - 数据绑定对象，包含多个系列数据
 * @param {Object} [title] - 数据绑定对象，图表标题
 * @param {string} [type='bar'] - 图表类型: 'bar' 或 'area'
 * @param {boolean} [percentage=false] - 是否显示为百分比堆积
 * @param {boolean} [showLegend=true] - 是否显示图例
 * @emits {Object} itemClick - 数据项点击事件
 */
```

#### 数据格式

```javascript
{
  xAxis: ["周一", "周二", "周三", "周四", "周五"],
  series: [
    {
      name: "邮件营销",
      data: [120, 132, 101, 134, 90]
    },
    {
      name: "联盟广告",
      data: [220, 182, 191, 234, 290]
    },
    {
      name: "视频广告",
      data: [150, 232, 201, 154, 190]
    }
  ]
}
```

### 4.5 A2UIScatterChart (散点图)

#### Props 定义

```javascript
/**
 * @component A2UIScatterChart
 * @description 散点图组件，用于展示两个变量的相关性
 * @param {Object} data - 数据绑定对象，包含散点数据
 * @param {Object} [title] - 数据绑定对象，图表标题
 * @param {Object} [xAxisLabel] - 数据绑定对象，X轴标签
 * @param {Object} [yAxisLabel] - 数据绑定对象，Y轴标签
 * @param {number} [symbolSize=10] - 散点大小
 * @param {string} [symbolShape='circle'] - 散点形状: 'circle', 'rect', 'triangle', 'diamond'
 * @param {boolean} [showGrid=true] - 是否显示网格线
 * @emits {Object} pointClick - 散点点击事件
 */
```

#### 数据格式

```javascript
// 单个系列
{
  name: "数据集1",
  data: [
    [10.0, 8.04],
    [8.0, 6.95],
    [13.0, 7.58],
    [9.0, 8.81]
  ]
}

// 多个系列
{
  series: [
    {
      name: "数据集1",
      data: [[10.0, 8.04], [8.0, 6.95]]
    },
    {
      name: "数据集2",
      data: [[10.0, 9.14], [8.0, 8.14]]
    }
  ]
}
```

## 5. 共享逻辑设计

### 5.1 useChartConfig.js

提供通用的图表配置生成和主题管理：

```javascript
/**
 * 生成 ECharts 基础配置
 * @param {Object} options - 配置选项
 * @returns {Object} ECharts 配置对象
 */
export function useChartConfig(options) {
  const { title, subtitle, colors, grid, tooltip, legend } = options;

  return {
    color: colors || getDefaultColors(),
    title: {
      text: title,
      subtext: subtitle,
      left: "center",
      textStyle: {
        fontSize: 16,
        fontWeight: "bold",
      },
    },
    tooltip: {
      trigger: tooltip?.trigger || "item",
      ...tooltip,
    },
    legend: {
      show: legend?.show !== false,
      orient: legend?.orient || "horizontal",
      left: legend?.left || "center",
      top: legend?.top || "bottom",
    },
    grid: {
      left: "3%",
      right: "4%",
      bottom: "3%",
      containLabel: true,
      ...grid,
    },
  };
}

/**
 * 获取默认颜色主题
 */
function getDefaultColors() {
  return [
    "#5470c6",
    "#91cc75",
    "#fac858",
    "#ee6666",
    "#73c0de",
    "#3ba272",
    "#fc8452",
    "#9a60b4",
  ];
}
```

### 5.2 数据绑定集成

所有图表组件都使用 `useDataBinding` 来解析数据：

```javascript
import { useDataBinding } from "../../../composables/useDataBinding.js";

const { resolveValue } = useDataBinding();

const chartData = computed(() => {
  const rawData = resolveValue(props.data);
  // 数据转换和验证
  return transformData(rawData);
});
```

## 6. 实现步骤

### Phase 1: 环境准备

1. 安装依赖：`pnpm add echarts vue-echarts`
2. 创建 `charts` 目录和基础文件
3. 实现 `useChartConfig.js` 共享逻辑

### Phase 2: 核心组件开发

1. 实现 `A2UIPieChart` 作为参考实现
2. 编写完整的 JSDoc 和 TypeScript 类型定义
3. 创建示例页面验证功能

### Phase 3: 其他图表组件

1. 依次实现 `A2UIBarChart`、`A2UILineChart`
2. 实现 `A2UIStackedChart`、`A2UIScatterChart`
3. 确保所有组件遵循相同的设计模式

### Phase 4: 集成和测试

1. 在 `index.js` 中导出所有图表组件
2. 创建综合示例页面展示所有图表
3. 编写单元测试
4. 性能测试和优化

### Phase 5: 文档和发布

1. 更新组件文档
2. 添加使用示例
3. 构建库并验证
4. 更新 CHANGELOG

## 7. 样式设计

### 7.1 容器样式

所有图表组件使用统一的容器样式：

```vue
<template>
  <div class="a2ui-chart-container">
    <v-chart :option="chartOption" :autoresize="true" class="a2ui-chart" />
  </div>
</template>

<style scoped>
.a2ui-chart-container {
  width: 100%;
  min-height: 300px;
  padding: 1rem;
}

.a2ui-chart {
  width: 100%;
  height: 100%;
  min-height: 300px;
}
</style>
```

### 7.2 响应式设计

- 使用 `autoresize` 属性自动适应容器大小
- 提供 `height` prop 允许自定义高度
- 移动端优化：自动调整字体大小和间距

## 8. 性能优化

1. **按需加载**：只导入使用的 ECharts 组件

   ```javascript
   import { use } from "echarts/core";
   import { PieChart } from "echarts/charts";
   import { CanvasRenderer } from "echarts/renderers";

   use([PieChart, CanvasRenderer]);
   ```

2. **数据缓存**：使用 `computed` 缓存转换后的数据
3. **防抖更新**：数据频繁变化时使用防抖
4. **懒加载**：大数据集时使用分页或虚拟滚动

## 9. 验收标准

### 9.1 功能验收

- [ ] 所有5种图表类型正常渲染
- [ ] 数据绑定正确工作
- [ ] 交互事件正确触发
- [ ] 响应式更新正常

### 9.2 代码质量

- [ ] 所有组件有完整的 JSDoc
- [ ] Props 类型定义完整
- [ ] 代码通过 ESLint 检查
- [ ] 无 console 警告或错误

### 9.3 性能验收

- [ ] 首次渲染时间 < 100ms
- [ ] 数据更新响应时间 < 50ms
- [ ] 打包后单个图表组件 < 50KB (gzip)

### 9.4 文档验收

- [ ] 每个组件有使用示例
- [ ] API 文档完整
- [ ] 有常见问题解答

## 10. 风险和注意事项

### 10.1 潜在风险

1. **包体积增加**：ECharts 核心库较大，需要严格按需加载
2. **学习曲线**：团队需要熟悉 ECharts 配置
3. **浏览器兼容性**：确保在目标浏览器中正常工作

### 10.2 缓解措施

1. 使用 tree-shaking 和按需加载
2. 提供详细的配置示例和文档
3. 在多个浏览器中进行测试

## 11. 未来扩展

### 11.1 短期扩展

- 添加更多图表类型（雷达图、仪表盘）
- 支持图表导出（PNG、SVG）
- 添加数据缩放和平移功能

### 11.2 长期规划

- 3D 图表支持
- 地图可视化
- 实时数据流图表
- 自定义主题系统
