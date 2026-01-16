<script setup>
import { computed } from 'vue'
import { use } from 'echarts/core'
import { BarChart, LineChart } from 'echarts/charts'
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
  BarChart,
  LineChart,
  TitleComponent,
  TooltipComponent,
  GridComponent,
  LegendComponent,
  CanvasRenderer,
])

/**
 * @component A2UIStackedChart
 * @description 堆积图组件，支持堆积柱状图和堆积面积图
 * @param {Object} data - 数据绑定对象，包含多个系列数据，格式: { xAxis: string[], series: Array<{ name: string, data: number[] }> }
 * @param {Object} [title] - 数据绑定对象，图表标题
 * @param {string} [type='bar'] - 图表类型: 'bar' 或 'area'
 * @param {boolean} [percentage=false] - 是否显示为百分比堆积
 * @param {boolean} [showLegend=true] - 是否显示图例
 * @param {number} [height=400] - 图表高度(px)
 * @emits {Object} itemClick - 数据项点击事件
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
  type: {
    type: String,
    default: 'bar',
    validator: (value) => ['bar', 'area'].includes(value),
  },
  percentage: {
    type: Boolean,
    default: false,
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

const emit = defineEmits(['itemClick'])

const { resolveValue } = useDataBinding()

const chartData = computed(() => {
  const rawData = resolveValue(props.data)
  if (!rawData || !rawData.xAxis || !rawData.series) {
    console.warn('[A2UIStackedChart] Data must contain xAxis and series')
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

const chartOption = computed(() => {
  const baseConfig = useChartConfig({
    title: titleText.value,
    legend: props.showLegend,
  })

  const seriesType = props.type === 'area' ? 'line' : 'bar'

  return {
    ...baseConfig,
    xAxis: {
      type: 'category',
      data: chartData.value.xAxis,
      boundaryGap: props.type === 'bar',
    },
    yAxis: {
      type: 'value',
      axisLabel: {
        formatter: props.percentage ? '{value}%' : '{value}',
      },
    },
    series: chartData.value.series.map((item) => ({
      name: item.name,
      type: seriesType,
      stack: 'total',
      data: item.data,
      areaStyle: props.type === 'area' ? {} : undefined,
      emphasis: {
        focus: 'series',
      },
      ...(props.percentage && {
        label: {
          show: true,
          formatter: (params) => {
            const total = chartData.value.series.reduce((sum, s) => {
              return sum + (s.data[params.dataIndex] || 0)
            }, 0)
            const percent = ((params.value / total) * 100).toFixed(1)
            return `${percent}%`
          },
        },
      }),
    })),
  }
})

const handleClick = (params) => {
  if (params.componentType === 'series') {
    emit('itemClick', {
      seriesName: params.seriesName,
      category: chartData.value.xAxis[params.dataIndex],
      value: params.value,
      dataIndex: params.dataIndex,
    })
  }
}
</script>

<template>
  <div class="a2ui-stacked-chart-container">
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
.a2ui-stacked-chart-container {
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
