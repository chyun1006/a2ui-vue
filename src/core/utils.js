/**
 * 核心工具函数
 */

import { DATA_VALUE_FIELDS } from '../types/a2ui.js'

/**
 * 解析 A2UI 数据内容格式
 * @param {Array} contents - 数据内容数组
 * @returns {Object} 解析后的数据对象
 */
export function parseDataContents(contents) {
  if (!Array.isArray(contents)) {
    console.error('Contents must be an array')
    return {}
  }

  const result = {}

  for (const item of contents) {
    const { key } = item || {}

    if (!key) {
      console.warn('Data item missing key:', item)
      continue
    }

    if (DATA_VALUE_FIELDS.VALUE_STRING in item) {
      result[key] = item.valueString
    } else if (DATA_VALUE_FIELDS.VALUE_NUMBER in item) {
      result[key] = item.valueNumber
    } else if (DATA_VALUE_FIELDS.VALUE_BOOLEAN in item) {
      result[key] = item.valueBoolean
    } else if (DATA_VALUE_FIELDS.VALUE_ARRAY in item) {
      result[key] = item.valueArray
    } else if (DATA_VALUE_FIELDS.VALUE_MAP in item) {
      result[key] = parseDataContents(item.valueMap)
    } else {
      console.warn('Unknown value type for key:', key, item)
    }
  }

  return result
}

/**
 * 规范化组件定义
 * @param {Object} componentDef - 组件定义
 * @returns {Object} 规范化后的组件定义
 */
export function normalizeComponentDef(componentDef) {
  if (!componentDef || typeof componentDef !== 'object') {
    return null
  }

  const { id, component, weight } = componentDef || {}

  if (!id || !component) {
    return null
  }

  return {
    id,
    component,
    weight: weight || null,
  }
}

/**
 * 验证 Surface 配置
 * @param {Object} config - Surface 配置
 * @returns {boolean} 是否有效
 */
export function validateSurfaceConfig(config) {
  if (!config || typeof config !== 'object') {
    return false
  }

  const { surfaceId, rootComponentId } = config || {}

  if (!surfaceId || typeof surfaceId !== 'string') {
    console.error('Invalid surfaceId')
    return false
  }

  if (!rootComponentId || typeof rootComponentId !== 'string') {
    console.error('Invalid rootComponentId')
    return false
  }

  return true
}

/**
 * 验证样式对象
 * @param {Object} styles - 样式对象
 * @returns {boolean} 是否有效
 */
export function validateStyles(styles) {
  if (!styles) {
    return true
  }

  if (typeof styles !== 'object') {
    return false
  }

  return true
}

/**
 * 深度克隆对象
 * @param {*} obj - 要克隆的对象
 * @returns {*} 克隆后的对象
 */
export function deepClone(obj) {
  if (obj === null || typeof obj !== 'object') {
    return obj
  }

  if (obj instanceof Date) {
    return new Date(obj.getTime())
  }

  if (obj instanceof Array) {
    return obj.map((item) => deepClone(item))
  }

  if (obj instanceof Map) {
    const clonedMap = new Map()
    obj.forEach((value, key) => {
      clonedMap.set(key, deepClone(value))
    })
    return clonedMap
  }

  if (obj instanceof Set) {
    const clonedSet = new Set()
    obj.forEach((value) => {
      clonedSet.add(deepClone(value))
    })
    return clonedSet
  }

  const clonedObj = {}
  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      clonedObj[key] = deepClone(obj[key])
    }
  }

  return clonedObj
}

/**
 * 合并对象
 * @param {Object} target - 目标对象
 * @param {Object} source - 源对象
 * @returns {Object} 合并后的对象
 */
export function mergeObjects(target, source) {
  if (!source || typeof source !== 'object') {
    return target
  }

  if (!target || typeof target !== 'object') {
    return source
  }

  const result = { ...target }

  for (const key in source) {
    if (Object.prototype.hasOwnProperty.call(source, key)) {
      const sourceValue = source[key]
      const targetValue = result[key]

      if (
        typeof sourceValue === 'object' &&
        sourceValue !== null &&
        !Array.isArray(sourceValue) &&
        typeof targetValue === 'object' &&
        targetValue !== null &&
        !Array.isArray(targetValue)
      ) {
        result[key] = mergeObjects(targetValue, sourceValue)
      } else {
        result[key] = sourceValue
      }
    }
  }

  return result
}

/**
 * 生成唯一 ID
 * @param {string} prefix - ID 前缀
 * @returns {string} 唯一 ID
 */
export function generateId(prefix = 'id') {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}
