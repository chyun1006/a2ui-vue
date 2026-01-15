/**
 * 数据绑定 Composable
 * 用于解析 literalString/literalNumber/literalBoolean/literalArray/path 类型的值
 */

import { inject } from 'vue'
import { VALUE_FIELDS } from '../types/a2ui.js'

/**
 * 数据绑定 composable
 * @param {string} surfaceId - Surface ID
 */
export function useDataBinding(surfaceId) {
  const manager = inject('a2ui-manager')
  const contextPath = inject('a2ui-data-context', null)

  /**
   * 解析值或路径
   * @param {Object} valueOrPath - 值对象，可能包含 literalString/literalNumber/literalBoolean/literalArray/path
   * @returns {*} 解析后的值
   */
  const resolveValue = (valueOrPath) => {
    if (!valueOrPath) return null

    // 如果不是对象类型，直接返回原值（兼容直接传入字符串/数字等情况）
    if (typeof valueOrPath !== 'object') {
      return valueOrPath
    }

    if (VALUE_FIELDS.LITERAL_STRING in valueOrPath) {
      return valueOrPath.literalString
    }
    if (VALUE_FIELDS.LITERAL_NUMBER in valueOrPath) {
      return valueOrPath.literalNumber
    }
    if (VALUE_FIELDS.LITERAL_BOOLEAN in valueOrPath) {
      return valueOrPath.literalBoolean
    }
    if (VALUE_FIELDS.LITERAL_ARRAY in valueOrPath) {
      return valueOrPath.literalArray
    }
    if (VALUE_FIELDS.PATH in valueOrPath) {
      let path = valueOrPath.path

      // 处理相对路径: 如果 path 不以 / 开头，且存在 contextPath，则拼接
      if (path && !path.startsWith('/') && contextPath?.value) {
        // 确保 contextPath 不以 / 结尾 (通常规范如此，但为了健壮性)
        const base = contextPath.value.endsWith('/')
          ? contextPath.value.slice(0, -1)
          : contextPath.value
        path = `${base}/${path}`
      }

      const data = manager?.getData(surfaceId, path)
      return data
    }

    return null
  }

  /**
   * 批量解析值
   * @param {Object} valuesMap - 键值对映射
   * @returns {Object} 解析后的键值对
   */
  const resolveValues = (valuesMap) => {
    if (!valuesMap || typeof valuesMap !== 'object') {
      return {}
    }

    const result = {}
    for (const [key, valueOrPath] of Object.entries(valuesMap)) {
      result[key] = resolveValue(valueOrPath)
    }
    return result
  }

  /**
   * 检查是否为路径引用
   * @param {Object} valueOrPath - 值对象
   * @returns {boolean} 是否为路径引用
   */
  const isPathReference = (valueOrPath) => {
    return valueOrPath && VALUE_FIELDS.PATH in valueOrPath
  }

  /**
   * 获取路径字符串
   * @param {Object} valueOrPath - 值对象
   * @returns {string|null} 路径字符串
   */
  const getPath = (valueOrPath) => {
    if (isPathReference(valueOrPath)) {
      return valueOrPath.path
    }
    return null
  }

  return {
    resolveValue,
    resolveValues,
    isPathReference,
    getPath,
  }
}
