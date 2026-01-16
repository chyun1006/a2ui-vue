<script setup>
import { computed } from 'vue'
import { use } from 'echarts/core'
import { PieChart } from 'echarts/charts'
import { TitleComponent, TooltipComponent, LegendComponent } from 'echarts/components'
import { CanvasRenderer } from 'echarts/renderers'
import VChart from 'vue-echarts'
import { useDataBinding } from '../../../../composables/useDataBinding.js'
import { useChartConfig, formatPercent } from './useChartConfig.js'

use([PieChart, TitleComponent, TooltipComponent, LegendComponent, CanvasRenderer])

/**
 * @component A2UIPieChart
 * @description 饼图组件，用于展示数据占比关系
 * @param {Object} data - 数据绑定对象，包含图表数据数组，格式: [{ name: string, value: number }]
 * @param {Object} [title] - 数据绑定对象，图表标题
 * @param {Object} [subtitle] - 数据绑定对象，图表副标题
 * @param {boolean} [showLegend=true] - 是否显示图例
 * @param {string} [legendPosition='right'] - 图例位置: 'top', 'right', 'bottom', 'left'
 * @param {boolean} [showLabel=true] - 是否显示数据标签
 * @param {string} [labelFormat='percent'] - 标签格式: 'percent', 'value', 'name'
 * @param {number} [radius=75] - 饼图半径百分比 (0-100)
 * @param {number} [innerRadius=0] - 内半径百分比，大于0时为环形图
 * @param {Array<string>} [colors] - 自定义颜色数组
 * @param {number} [height=400] - 图表高度(px)
 * @emits {Object} sectorClick - 扇区点击事件，返回点击的数据项
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
  subtitle: {
    type: Object,
    default: null,
  },
  showLegend: {
    type: Boolean,
    default: true,
  },
  legendPosition: {
    type: String,
    default: 'right',
    validator: (value) => ['top', 'right', 'bottom', 'left'].includes(value),
  },
  showLabel: {
    type: Boolean,
    default: true,
  },
  labelFormat: {
    type: String,
    default: 'percent',
    validator: (value) => ['percent', 'value', 'name'].includes(value),
  },
  radius: {
    type: Number,
    default: 75,
    validator: (value) => value >= 0 && value <= 100,
  },
  innerRadius: {
    type: Number,
    default: 0,
    validator: (value) => value >= 0 && value <= 100,
  },
  colors: {
    type: Array,
    default: null,
  },
  height: {
    type: Number,
    default: 400,
  },
})

const emit = defineEmits(['sectorClick'])

const { resolveValue } = useDataBinding()

// 解析数据
const chartData = computed(() => {
  const rawData = resolveValue(props.data)
  if (!Array.isArray(rawData)) {
    console.warn('[A2UIPieChart] Data must be an array')
    return []
  }
  return rawData.filter((item) => item && typeof item.value === 'number')
})

const titleText = computed(() => resolveValue(props.title) || '')
const subtitleText = computed(() => resolveValue(props.subtitle) || '')

// 生成图表配置
const chartOption = computed(() => {
  const baseConfig = useChartConfig({
    title: titleText.value,
    subtitle: subtitleText.value,
    colors: props.colors,
    legend: props.showLegend
      ? {
          orient:
            props.legendPosition === 'top' || props.legendPosition === 'bottom'
              ? 'horizontal'
              : 'vertical',
          left:
            props.legendPosition === 'left'
              ? 'left'
              : props.legendPosition === 'right'
                ? 'right'
                : 'center',
          top:
            props.legendPosition === 'top'
              ? 'top'
              : props.legendPosition === 'bottom'
                ? 'bottom'
                : 'middle',
        }
      : false,
    tooltip: {
      trigger: 'item',
      formatter: (params) => {
        const percent = formatPercent(params.percent)
        return `${params.marker} ${params.name}<br/>数值: ${params.value}<br/>占比: ${percent}`
      },
    },
  })

  // 计算半径
  const radiusValue = `${props.radius}%`
  const innerRadiusValue = `${props.innerRadius}%`

  return {
    ...baseConfig,
    series: [
      {
        type: 'pie',
        radius: props.innerRadius > 0 ? [innerRadiusValue, radiusValue] : radiusValue,
        data: chartData.value,
        label: {
          show: props.showLabel,
          formatter: (params) => {
            switch (props.labelFormat) {
              case 'percent':
                return `${params.name}: ${formatPercent(params.percent)}`
              case 'value':
                return `${params.name}: ${params.value}`
              case 'name':
                return params.name
              default:
                return params.name
            }
          },
        },
        emphasis: {
          itemStyle: {
            shadowBlur: 10,
            shadowOffsetX: 0,
            shadowColor: 'rgba(0, 0, 0, 0.5)',
          },
        },
      },
    ],
  }
})

// 处理点击事件
const handleClick = (params) => {
  if (params.componentType === 'series') {
    emit('sectorClick', {
      name: params.name,
      value: params.value,
      percent: params.percent,
      dataIndex: params.dataIndex,
    })
  }
}
</script>

<template>
  <div class="a2ui-pie-chart-container">
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
.a2ui-pie-chart-container {
  width: 100%;
  padding: 1rem;
}

.a2ui-chart {
  width: 100%;
}
</style>
