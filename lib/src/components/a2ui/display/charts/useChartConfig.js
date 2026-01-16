/**
 * @fileoverview 图表组件共享配置工具
 * @description 提供通用的 ECharts 配置生成和主题管理
 */

/**
 * 获取默认颜色主题
 * @returns {Array<string>} 颜色数组
 */
export function getDefaultColors() {
  return [
    '#5470c6',
    '#91cc75',
    '#fac858',
    '#ee6666',
    '#73c0de',
    '#3ba272',
    '#fc8452',
    '#9a60b4',
    '#ea7ccc',
    '#5470c6',
  ]
}

/**
 * 生成 ECharts 基础配置
 * @param {Object} options - 配置选项
 * @param {string} [options.title] - 图表标题
 * @param {string} [options.subtitle] - 图表副标题
 * @param {Array<string>} [options.colors] - 自定义颜色数组
 * @param {Object} [options.grid] - 网格配置
 * @param {Object} [options.tooltip] - 提示框配置
 * @param {Object} [options.legend] - 图例配置
 * @returns {Object} ECharts 配置对象
 */
export function useChartConfig(options = {}) {
  const { title, subtitle, colors, grid, tooltip, legend } = options

  return {
    color: colors || getDefaultColors(),
    title: title
      ? {
          text: title,
          subtext: subtitle,
          left: 'center',
          textStyle: {
            fontSize: 16,
            fontWeight: 'bold',
            color: '#333',
          },
          subtextStyle: {
            fontSize: 12,
            color: '#999',
          },
        }
      : undefined,
    tooltip: {
      trigger: tooltip?.trigger || 'item',
      backgroundColor: 'rgba(255, 255, 255, 0.95)',
      borderColor: '#ddd',
      borderWidth: 1,
      textStyle: {
        color: '#333',
      },
      ...tooltip,
    },
    legend:
      legend !== false
        ? {
            show: legend?.show !== false,
            orient: legend?.orient || 'horizontal',
            left: legend?.left || 'center',
            top: legend?.top || 'bottom',
            textStyle: {
              color: '#666',
            },
            ...legend,
          }
        : undefined,
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true,
      ...grid,
    },
  }
}

/**
 * 格式化数值为百分比
 * @param {number} value - 数值
 * @param {number} [decimals=1] - 小数位数
 * @returns {string} 格式化后的百分比字符串
 */
export function formatPercent(value, decimals = 1) {
  return `${value.toFixed(decimals)}%`
}

/**
 * 格式化大数字
 * @param {number} value - 数值
 * @returns {string} 格式化后的字符串
 */
export function formatNumber(value) {
  if (value >= 1000000) {
    return `${(value / 1000000).toFixed(1)}M`
  }
  if (value >= 1000) {
    return `${(value / 1000).toFixed(1)}K`
  }
  return value.toString()
}

/**
 * 验证图表数据
 * @param {*} data - 待验证的数据
 * @param {string} type - 图表类型
 * @returns {boolean} 是否有效
 */
export function validateChartData(data, type) {
  if (!data) return false

  switch (type) {
    case 'pie':
      return (
        Array.isArray(data) &&
        data.every(
          (item) => item && typeof item.name === 'string' && typeof item.value === 'number',
        )
      )
    case 'bar':
    case 'line':
      return (
        data.categories &&
        Array.isArray(data.categories) &&
        data.values &&
        Array.isArray(data.values)
      )
    case 'scatter':
      return Array.isArray(data) || (data.series && Array.isArray(data.series))
    default:
      return true
  }
}
