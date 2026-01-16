<script setup>
import { computed } from 'vue'
import { use } from 'echarts/core'
import { LineChart } from 'echarts/charts'
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

use([LineChart, TitleComponent, TooltipComponent, GridComponent, LegendComponent, CanvasRenderer])

/**
 * @component A2UILineChart
 * @description 折线图组件，用于展示趋势变化
 * @param {Object} data - 数据绑定对象，包含一条或多条折线数据，格式: { xAxis: string[], series: Array<{ name: string, data: number[] }> }
 * @param {Object} [title] - 数据绑定对象，图表标题
 * @param {Object} [xAxisLabel] - 数据绑定对象，X轴标签
 * @param {Object} [yAxisLabel] - 数据绑定对象，Y轴标签
 * @param {boolean} [smooth=false] - 是否平滑曲线
 * @param {boolean} [showArea=false] - 是否显示面积
 * @param {boolean} [showPoints=true] - 是否显示数据点
 * @param {boolean} [showLegend=true] - 是否显示图例（多条线时）
 * @param {number} [height=400] - 图表高度(px)
 * @emits {Object} pointClick - 数据点点击事件
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
  smooth: {
    type: Boolean,
    default: false,
  },
  showArea: {
    type: Boolean,
    default: false,
  },
  showPoints: {
    type: Boolean,
    default: true,
  },
  showLegend: {
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
  if (!rawData || !rawData.xAxis || !rawData.series) {
    console.warn('[A2UILineChart] Data must contain xAxis and series')
    return { xAxis: [], series: [] }
  }
  return rawData
})

// 判断是否有有效数据
const hasData = computed(() => {
  return (
    chartData.value.xAxis.length > 0 &&
    chartData.value.series.some((item) => item.data && item.data.length > 0)
  )
})

const titleText = computed(() => resolveValue(props.title) || '')
const xLabel = computed(() => resolveValue(props.xAxisLabel) || '')
const yLabel = computed(() => resolveValue(props.yAxisLabel) || '')

const chartOption = computed(() => {
  const baseConfig = useChartConfig({
    title: titleText.value,
    legend: props.showLegend && chartData.value.series.length > 1,
  })

  const options = {
    ...baseConfig,
    xAxis: {
      type: 'category',
      data: chartData.value.xAxis,
      name: xLabel.value,
      boundaryGap: false,
    },
    yAxis: {
      type: 'value',
      name: yLabel.value,
    },
    series: chartData.value.series.map((item) => ({
      name: item.name,
      type: 'line',
      data: item.data,
      smooth: props.smooth,
      showSymbol: props.showPoints,
      areaStyle: props.showArea ? {} : undefined,
    })),
  }

  console.log('options', options)

  return options
})

const handleClick = (params) => {
  if (params.componentType === 'series') {
    emit('pointClick', {
      seriesName: params.seriesName,
      category: chartData.value.xAxis[params.dataIndex],
      value: params.value,
      dataIndex: params.dataIndex,
    })
  }
}
</script>

<template>
  <div class="a2ui-line-chart-container">
    <v-chart
      v-if="hasData"
      :option="chartOption"
      :autoresize="true"
      :style="{ height: `${height}px` }"
      class="a2ui-chart"
      @click="handleClick"
    />
    <div v-else class="a2ui-chart-empty">
      <svg
        width="48"
        height="48"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="1.5"
        class="a2ui-empty-icon"
      >
        <path
          d="M3 3v18h18"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
        <path
          d="M7 14l4-4 4 4 5-5"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
      </svg>
      <span class="a2ui-empty-text">暂无数据</span>
    </div>
  </div>
</template>

<style scoped>
.a2ui-line-chart-container {
  width: 100%;
  padding: 1rem;
}

.a2ui-chart {
  width: 100%;
}

.a2ui-chart-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 200px;
  color: #94a3b8;
  gap: 12px;
}

.a2ui-empty-icon {
  opacity: 0.5;
}

.a2ui-empty-text {
  font-size: 14px;
  color: #94a3b8;
}
</style>
