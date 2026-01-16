<script setup>
import { computed } from 'vue'
import { use } from 'echarts/core'
import { BarChart } from 'echarts/charts'
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

use([BarChart, TitleComponent, TooltipComponent, GridComponent, LegendComponent, CanvasRenderer])

/**
 * @component A2UIBarChart
 * @description 柱状图组件，用于展示分类数据对比
 * @param {Object} data - 数据绑定对象，包含图表数据，格式: { categories: string[], values: number[] }
 * @param {Object} [title] - 数据绑定对象，图表标题
 * @param {Object} [xAxisLabel] - 数据绑定对象，X轴标签
 * @param {Object} [yAxisLabel] - 数据绑定对象，Y轴标签
 * @param {boolean} [horizontal=false] - 是否为横向柱状图
 * @param {boolean} [showGrid=true] - 是否显示网格线
 * @param {string} [barColor='#5470c6'] - 柱子颜色
 * @param {number} [barWidth] - 柱子宽度百分比
 * @param {number} [height=400] - 图表高度(px)
 * @emits {Object} barClick - 柱子点击事件
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
  horizontal: {
    type: Boolean,
    default: false,
  },
  showGrid: {
    type: Boolean,
    default: true,
  },
  barColor: {
    type: String,
    default: '#5470c6',
  },
  barWidth: {
    type: Number,
    default: null,
  },
  height: {
    type: Number,
    default: 400,
  },
})

const emit = defineEmits(['barClick'])

const { resolveValue } = useDataBinding()

const chartData = computed(() => {
  const rawData = resolveValue(props.data)
  if (!rawData || !rawData.categories || !rawData.values) {
    console.warn('[A2UIBarChart] Data must contain categories and values')
    return { categories: [], values: [] }
  }
  return rawData
})

const titleText = computed(() => resolveValue(props.title) || '')
const xLabel = computed(() => resolveValue(props.xAxisLabel) || '')
const yLabel = computed(() => resolveValue(props.yAxisLabel) || '')

const chartOption = computed(() => {
  const baseConfig = useChartConfig({
    title: titleText.value,
    colors: [props.barColor],
    grid: {
      show: props.showGrid,
    },
  })

  const xAxis = {
    type: props.horizontal ? 'value' : 'category',
    data: props.horizontal ? undefined : chartData.value.categories,
    name: xLabel.value,
    axisLabel: {
      rotate: 0,
    },
  }

  const yAxis = {
    type: props.horizontal ? 'category' : 'value',
    data: props.horizontal ? chartData.value.categories : undefined,
    name: yLabel.value,
  }

  return {
    ...baseConfig,
    xAxis,
    yAxis,
    series: [
      {
        type: 'bar',
        data: chartData.value.values,
        barWidth: props.barWidth ? `${props.barWidth}%` : undefined,
        itemStyle: {
          color: props.barColor,
        },
      },
    ],
  }
})

const handleClick = (params) => {
  if (params.componentType === 'series') {
    emit('barClick', {
      category: chartData.value.categories[params.dataIndex],
      value: params.value,
      dataIndex: params.dataIndex,
    })
  }
}
</script>

<template>
  <div class="a2ui-bar-chart-container">
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
.a2ui-bar-chart-container {
  width: 100%;
  padding: 1rem;
}

.a2ui-chart {
  width: 100%;
}
</style>
