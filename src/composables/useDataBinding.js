/**
 * 数据绑定 Composable
 * 用于解析 literalString/literalNumber/literalBoolean/literalArray/path 类型的值
 */

import { useDataModelStore } from '../stores/dataModelStore.js'
import { VALUE_FIELDS } from '../types/a2ui.js'

/**
 * 数据绑定 composable
 * @param {string} surfaceId - Surface ID
 */
export function useDataBinding(surfaceId) {
  const dataModelStore = useDataModelStore()

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
      return dataModelStore.getValueByPath(surfaceId, valueOrPath.path)
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
