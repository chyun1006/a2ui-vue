/**
 * 核心工具函数
 */

import { clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'
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

  console.log('[parseDataContents] Parsed result:', result)
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

/**
 * 合并 Tailwind CSS 类名
 * @param {...any} inputs - 类名输入
 * @returns {string} 合并后的类名
 */
export function cn(...inputs) {
  return twMerge(clsx(inputs))
}

/**
 * 规范化路径
 * @param {string} path - 路径字符串
 * @returns {string} 规范化后的路径
 */
export function normalizePath(path) {
  if (!path || typeof path !== 'string') {
    return ''
  }
  return path.replace(/^\/*/, '/').replace(/\/*$/, '')
}

/**
 * 根据路径获取对象中的值
 * @param {Object} obj - 数据对象
 * @param {string} path - 路径字符串，如 '/user/name'
 * @returns {*} 路径对应的值，如果路径不存在返回 undefined
 */
export function getValueByPath(obj, path) {
  if (!obj || !path) {
    return undefined
  }

  const normalizedPath = normalizePath(path)

  if (!normalizedPath) {
    return obj
  }

  const keys = normalizedPath.split('/').filter((key) => key !== '')

  let current = obj
  for (const key of keys) {
    if (current === null || current === undefined) {
      return undefined
    }

    if (typeof current === 'object' && key in current) {
      current = current[key]
    } else {
      return undefined
    }
  }

  return current
}

/**
 * 根据路径设置对象中的值
 * @param {Object} obj - 数据对象
 * @param {string} path - 路径字符串
 * @param {*} value - 要设置的值
 * @returns {boolean} 是否设置成功
 */
export function setValueByPath(obj, path, value) {
  if (!obj || !path) {
    return false
  }

  const normalizedPath = normalizePath(path)

  if (!normalizedPath) {
    return false
  }

  const keys = normalizedPath.split('/').filter((key) => key !== '')

  if (keys.length === 0) {
    return false
  }

  let current = obj
  for (let i = 0; i < keys.length - 1; i++) {
    const key = keys[i]

    if (!(key in current) || typeof current[key] !== 'object' || current[key] === null) {
      current[key] = {}
    }

    current = current[key]
  }

  const lastKey = keys[keys.length - 1]

  current[lastKey] = value
  return true
}

/**
 * 根据路径删除对象中的值
 * @param {Object} obj - 数据对象
 * @param {string} path - 路径字符串
 * @returns {Object} 删除后的对象
 */
export function deleteValueByPath(obj, path) {
  if (!obj || !path) {
    return obj
  }

  const normalizedPath = normalizePath(path)

  if (!normalizedPath) {
    return obj
  }

  const keys = normalizedPath.split('/').filter((key) => key !== '')

  if (keys.length === 0) {
    return obj
  }

  const clonedObj = deepClone(obj)

  if (keys.length === 1) {
    delete clonedObj[keys[0]]
    return clonedObj
  }

  let current = clonedObj
  for (let i = 0; i < keys.length - 1; i++) {
    const key = keys[i]

    if (!(key in current) || typeof current[key] !== 'object') {
      return clonedObj
    }

    current = current[key]
  }

  const lastKey = keys[keys.length - 1]
  delete current[lastKey]

  return clonedObj
}
