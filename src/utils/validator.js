/**
 * A2UI 消息和数据验证工具
 */

import { COMPONENT_TYPES, VALUE_FIELDS } from '../types/a2ui.js'

/**
 * 验证组件定义
 * @param {Object} componentDef - 组件定义对象
 * @returns {boolean} 是否有效
 */
export function validateComponentDefinition(componentDef) {
  if (!componentDef || typeof componentDef !== 'object') {
    return false
  }

  if (!componentDef.id || typeof componentDef.id !== 'string') {
    return false
  }

  if (!componentDef.component || typeof componentDef.component !== 'object') {
    return false
  }

  const componentKeys = Object.keys(componentDef.component)
  if (componentKeys.length !== 1) {
    return false
  }

  const componentType = componentKeys[0]
  if (!Object.values(COMPONENT_TYPES).includes(componentType)) {
    console.warn(`Unknown component type: ${componentType}`)
  }

  return true
}

/**
 * 验证值或路径对象
 * @param {Object} valueOrPath - 值或路径对象
 * @returns {boolean} 是否有效
 */
export function validateValueOrPath(valueOrPath) {
  if (!valueOrPath || typeof valueOrPath !== 'object') {
    return false
  }

  const keys = Object.keys(valueOrPath)
  if (keys.length !== 1) {
    return false
  }

  const key = keys[0]
  return Object.values(VALUE_FIELDS).includes(key)
}

/**
 * 验证 children 定义
 * @param {Object} children - children 对象
 * @returns {boolean} 是否有效
 */
export function validateChildren(children) {
  if (!children || typeof children !== 'object') {
    return false
  }

  const hasExplicitList = 'explicitList' in children
  const hasTemplate = 'template' in children

  if (hasExplicitList && hasTemplate) {
    return false
  }

  if (!hasExplicitList && !hasTemplate) {
    return false
  }

  if (hasExplicitList) {
    return Array.isArray(children.explicitList)
  }

  if (hasTemplate) {
    const { template = {} } = children
    return typeof template.componentId === 'string' && typeof template.dataBinding === 'string'
  }

  return false
}

/**
 * 验证 action 定义
 * @param {Object} action - action 对象
 * @returns {boolean} 是否有效
 */
export function validateAction(action) {
  if (!action || typeof action !== 'object') {
    return false
  }

  if (!action.name || typeof action.name !== 'string') {
    return false
  }

  if (action.context) {
    if (!Array.isArray(action.context)) {
      return false
    }

    for (const item of action.context) {
      if (!item.key || typeof item.key !== 'string') {
        return false
      }
      if (!validateValueOrPath(item.value)) {
        return false
      }
    }
  }

  return true
}

/**
 * 验证样式对象
 * @param {Object} styles - 样式对象
 * @returns {boolean} 是否有效
 */
export function validateStyles(styles) {
  if (!styles || typeof styles !== 'object') {
    return true
  }

  if (styles.font && typeof styles.font !== 'string') {
    return false
  }

  if (styles.primaryColor) {
    if (typeof styles.primaryColor !== 'string') {
      return false
    }
    const hexColorPattern = /^#[0-9a-fA-F]{6}$/
    if (!hexColorPattern.test(styles.primaryColor)) {
      return false
    }
  }

  return true
}

/**
 * 验证数据模型内容
 * @param {Array} contents - 数据内容数组
 * @returns {boolean} 是否有效
 */
export function validateDataContents(contents) {
  if (!Array.isArray(contents)) {
    return false
  }

  for (const item of contents) {
    if (!item || typeof item !== 'object') {
      return false
    }

    if (!item.key || typeof item.key !== 'string') {
      return false
    }

    const valueKeys = ['valueString', 'valueNumber', 'valueBoolean', 'valueMap']
    const hasValue = valueKeys.some((key) => key in item)

    if (!hasValue) {
      return false
    }
  }

  return true
}

/**
 * 验证 Surface ID
 * @param {string} surfaceId - Surface ID
 * @returns {boolean} 是否有效
 */
export function validateSurfaceId(surfaceId) {
  return typeof surfaceId === 'string' && surfaceId.length > 0
}

/**
 * 验证组件 ID
 * @param {string} componentId - 组件 ID
 * @returns {boolean} 是否有效
 */
export function validateComponentId(componentId) {
  return typeof componentId === 'string' && componentId.length > 0
}

/**
 * 安全地获取组件类型
 * @param {Object} componentDef - 组件定义
 * @returns {string|null} 组件类型
 */
export function getComponentType(componentDef) {
  if (!componentDef || !componentDef.component) {
    return null
  }

  const keys = Object.keys(componentDef.component)
  return keys.length === 1 ? keys[0] : null
}

/**
 * 安全地获取组件属性
 * @param {Object} componentDef - 组件定义
 * @returns {Object|null} 组件属性
 */
export function getComponentProps(componentDef) {
  const type = getComponentType(componentDef)
  if (!type) {
    return null
  }

  return componentDef.component[type]
}
