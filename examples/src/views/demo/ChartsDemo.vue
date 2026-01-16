<template>
  <div class="charts-demo-page">
    <h1 class="text-3xl font-bold mb-8">A2UI 图表组件示例</h1>

    <!-- 饼图示例 -->
    <section class="mb-12">
      <h2 class="text-2xl font-semibold mb-4">饼图 (Pie Chart)</h2>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div class="border rounded-lg p-4">
          <h3 class="text-lg font-medium mb-2">基础饼图</h3>
          <A2UIPieChart :data="pieData" :title="pieTitle" :show-legend="true" />
        </div>
        <div class="border rounded-lg p-4">
          <h3 class="text-lg font-medium mb-2">环形图</h3>
          <A2UIPieChart
            :data="pieData"
            :title="pieTitle"
            :inner-radius="50"
            :show-legend="true"
            legend-position="bottom"
          />
        </div>
      </div>
    </section>

    <!-- 柱状图示例 -->
    <section class="mb-12">
      <h2 class="text-2xl font-semibold mb-4">柱状图 (Bar Chart)</h2>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div class="border rounded-lg p-4">
          <h3 class="text-lg font-medium mb-2">垂直柱状图</h3>
          <A2UIBarChart
            :data="barData"
            :title="barTitle"
            x-axis-label="星期"
            y-axis-label="销售额"
          />
        </div>
        <div class="border rounded-lg p-4">
          <h3 class="text-lg font-medium mb-2">水平柱状图</h3>
          <A2UIBarChart :data="barData" :title="barTitle" :horizontal="true" bar-color="#91cc75" />
        </div>
      </div>
    </section>

    <!-- 折线图示例 -->
    <section class="mb-12">
      <h2 class="text-2xl font-semibold mb-4">折线图 (Line Chart)</h2>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div class="border rounded-lg p-4">
          <h3 class="text-lg font-medium mb-2">基础折线图</h3>
          <A2UILineChart :data="lineData" :title="lineTitle" />
        </div>
        <div class="border rounded-lg p-4">
          <h3 class="text-lg font-medium mb-2">平滑面积图</h3>
          <A2UILineChart :data="lineData" :title="lineTitle" :smooth="true" :show-area="true" />
        </div>
      </div>
    </section>

    <!-- 堆积图示例 -->
    <section class="mb-12">
      <h2 class="text-2xl font-semibold mb-4">堆积图 (Stacked Chart)</h2>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div class="border rounded-lg p-4">
          <h3 class="text-lg font-medium mb-2">堆积柱状图</h3>
          <A2UIStackedChart :data="stackedData" :title="stackedTitle" type="bar" />
        </div>
        <div class="border rounded-lg p-4">
          <h3 class="text-lg font-medium mb-2">堆积面积图</h3>
          <A2UIStackedChart :data="stackedData" :title="stackedTitle" type="area" />
        </div>
      </div>
    </section>

    <!-- 散点图示例 -->
    <section class="mb-12">
      <h2 class="text-2xl font-semibold mb-4">散点图 (Scatter Chart)</h2>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div class="border rounded-lg p-4">
          <h3 class="text-lg font-medium mb-2">基础散点图</h3>
          <A2UIScatterChart
            :data="scatterData"
            :title="scatterTitle"
            x-axis-label="X轴"
            y-axis-label="Y轴"
          />
        </div>
        <div class="border rounded-lg p-4">
          <h3 class="text-lg font-medium mb-2">多系列散点图</h3>
          <A2UIScatterChart
            :data="multiScatterData"
            :title="scatterTitle"
            symbol-size="15"
            symbol-shape="diamond"
          />
        </div>
      </div>
    </section>
  </div>
</template>

<script setup>
import { ref } from "vue";
import {
  A2UIPieChart,
  A2UIBarChart,
  A2UILineChart,
  A2UIStackedChart,
  A2UIScatterChart,
} from "a2ui-vue";

// 饼图数据
const pieData = ref({
  literalValue: [
    { name: "直接访问", value: 335 },
    { name: "邮件营销", value: 234 },
    { name: "联盟广告", value: 154 },
    { name: "视频广告", value: 135 },
    { name: "搜索引擎", value: 548 },
  ],
});

const pieTitle = ref({ literalString: "访问来源统计" });

// 柱状图数据
const barData = ref({
  literalValue: {
    categories: ["周一", "周二", "周三", "周四", "周五", "周六", "周日"],
    values: [120, 200, 150, 80, 70, 110, 130],
  },
});

const barTitle = ref({ literalString: "每周销售额" });

// 折线图数据
const lineData = ref({
  literalValue: {
    xAxis: ["1月", "2月", "3月", "4月", "5月", "6月"],
    series: [
      {
        name: "产品A",
        data: [820, 932, 901, 934, 1290, 1330],
      },
      {
        name: "产品B",
        data: [620, 732, 701, 734, 1090, 1130],
      },
    ],
  },
});

const lineTitle = ref({ literalString: "产品销售趋势" });

// 堆积图数据
const stackedData = ref({
  literalValue: {
    xAxis: ["周一", "周二", "周三", "周四", "周五"],
    series: [
      {
        name: "邮件营销",
        data: [120, 132, 101, 134, 90],
      },
      {
        name: "联盟广告",
        data: [220, 182, 191, 234, 290],
      },
      {
        name: "视频广告",
        data: [150, 232, 201, 154, 190],
      },
    ],
  },
});

const stackedTitle = ref({ literalString: "营销渠道数据" });

// 散点图数据
const scatterData = ref({
  literalValue: {
    name: "数据集1",
    data: [
      [10.0, 8.04],
      [8.0, 6.95],
      [13.0, 7.58],
      [9.0, 8.81],
      [11.0, 8.33],
      [14.0, 9.96],
      [6.0, 7.24],
      [4.0, 4.26],
      [12.0, 10.84],
      [7.0, 4.82],
      [5.0, 5.68],
    ],
  },
});

const multiScatterData = ref({
  literalValue: {
    series: [
      {
        name: "数据集1",
        data: [
          [10.0, 8.04],
          [8.0, 6.95],
          [13.0, 7.58],
        ],
      },
      {
        name: "数据集2",
        data: [
          [10.0, 9.14],
          [8.0, 8.14],
          [13.0, 8.74],
        ],
      },
    ],
  },
});

const scatterTitle = ref({ literalString: "数据分布" });
</script>

<style scoped>
.charts-demo-page {
  max-width: 1400px;
  margin: 0 auto;
  padding: 2rem;
}
</style>
