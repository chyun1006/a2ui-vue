<script setup>
import { computed } from 'vue'
import { use } from 'echarts/core'
import { ScatterChart } from 'echarts/charts'
import {
  TitleComponent,
  TooltipComponent,
  GridComponent,
  LegendComponent,
} from 'echarts/components'
import { CanvasRenderer } from 'echarts/renderers'
import VChart from 'vue-echarts'
import { useDataBinding } from '../../../../composables/useDataBinding.js'
import { useChartConfig } from './useChartConfig.js'

use([
  ScatterChart,
  TitleComponent,
  TooltipComponent,
  GridComponent,
  LegendComponent,
  CanvasRenderer,
])

/**
 * @component A2UIScatterChart
 * @description 散点图组件，用于展示两个变量的相关性
 * @param {Object} data - 数据绑定对象，包含散点数据，格式: { name: string, data: Array<[number, number]> } 或 { series: Array<{ name: string, data: Array<[number, number]> }> }
 * @param {Object} [title] - 数据绑定对象，图表标题
 * @param {Object} [xAxisLabel] - 数据绑定对象，X轴标签
 * @param {Object} [yAxisLabel] - 数据绑定对象，Y轴标签
 * @param {number} [symbolSize=10] - 散点大小
 * @param {string} [symbolShape='circle'] - 散点形状: 'circle', 'rect', 'triangle', 'diamond'
 * @param {boolean} [showGrid=true] - 是否显示网格线
 * @param {number} [height=400] - 图表高度(px)
 * @emits {Object} pointClick - 散点点击事件
 */
const props = defineProps({
  data: {
    type: Object,
    required: true,
  },
  title: {
    type: Object,
    default: null,
  },
  xAxisLabel: {
    type: Object,
    default: null,
  },
  yAxisLabel: {
    type: Object,
    default: null,
  },
  symbolSize: {
    type: Number,
    default: 10,
  },
  symbolShape: {
    type: String,
    default: 'circle',
    validator: (value) => ['circle', 'rect', 'triangle', 'diamond'].includes(value),
  },
  showGrid: {
    type: Boolean,
    default: true,
  },
  height: {
    type: Number,
    default: 400,
  },
})

const emit = defineEmits(['pointClick'])

const { resolveValue } = useDataBinding()

const chartData = computed(() => {
  const rawData = resolveValue(props.data)
  if (!rawData) {
    console.warn('[A2UIScatterChart] Data is required')
    return { series: [] }
  }

  // 支持单个系列或多个系列
  if (rawData.series) {
    return rawData
  } else if (rawData.data) {
    return {
      series: [
        {
          name: rawData.name || '数据',
          data: rawData.data,
        },
      ],
    }
  }

  return { series: [] }
})

const titleText = computed(() => resolveValue(props.title) || '')
const xLabel = computed(() => resolveValue(props.xAxisLabel) || '')
const yLabel = computed(() => resolveValue(props.yAxisLabel) || '')

const chartOption = computed(() => {
  const baseConfig = useChartConfig({
    title: titleText.value,
    legend: chartData.value.series.length > 1,
    grid: {
      show: props.showGrid,
    },
  })

  return {
    ...baseConfig,
    xAxis: {
      type: 'value',
      name: xLabel.value,
      splitLine: {
        show: props.showGrid,
      },
    },
    yAxis: {
      type: 'value',
      name: yLabel.value,
      splitLine: {
        show: props.showGrid,
      },
    },
    series: chartData.value.series.map((item) => ({
      name: item.name,
      type: 'scatter',
      data: item.data,
      symbolSize: props.symbolSize,
      symbol: props.symbolShape,
      emphasis: {
        focus: 'series',
      },
    })),
  }
})

const handleClick = (params) => {
  if (params.componentType === 'series') {
    emit('pointClick', {
      seriesName: params.seriesName,
      value: params.value,
      dataIndex: params.dataIndex,
    })
  }
}
</script>

<template>
  <div class="a2ui-scatter-chart-container">
    <v-chart
      :option="chartOption"
      :autoresize="true"
      :style="{ height: `${height}px` }"
      class="a2ui-chart"
      @click="handleClick"
    />
  </div>
</template>

<style scoped>
.a2ui-scatter-chart-container {
  width: 100%;
  padding: 1rem;
}

.a2ui-chart {
  width: 100%;
}
</style>
