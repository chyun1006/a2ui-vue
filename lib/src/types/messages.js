/**
 * A2UI 消息相关的常量和工具函数
 */

import { MESSAGE_TYPES } from './a2ui.js'

/**
 * 检查消息类型
 * @param {Object} message - A2UI 消息对象
 * @returns {string|null} 消息类型或 null
 */
export function getMessageType(message) {
  if (!message) return null

  if (message.beginRendering) return MESSAGE_TYPES.BEGIN_RENDERING
  if (message.surfaceUpdate) return MESSAGE_TYPES.SURFACE_UPDATE
  if (message.dataModelUpdate) return MESSAGE_TYPES.DATA_MODEL_UPDATE
  if (message.deleteSurface) return MESSAGE_TYPES.DELETE_SURFACE

  return null
}

/**
 * 验证消息格式
 * @param {Object} message - A2UI 消息对象
 * @returns {boolean} 是否有效
 */
export function isValidMessage(message) {
  if (!message || typeof message !== 'object') {
    return false
  }

  const type = getMessageType(message)
  if (!type) {
    return false
  }

  switch (type) {
    case MESSAGE_TYPES.BEGIN_RENDERING:
      return validateBeginRendering(message.beginRendering)
    case MESSAGE_TYPES.SURFACE_UPDATE:
      return validateSurfaceUpdate(message.surfaceUpdate)
    case MESSAGE_TYPES.DATA_MODEL_UPDATE:
      return validateDataModelUpdate(message.dataModelUpdate)
    case MESSAGE_TYPES.DELETE_SURFACE:
      return validateDeleteSurface(message.deleteSurface)
    default:
      return false
  }
}

/**
 * 验证 BeginRendering 消息
 */
function validateBeginRendering(data) {
  return data && typeof data.surfaceId === 'string' && typeof data.root === 'string'
}

/**
 * 验证 SurfaceUpdate 消息
 */
function validateSurfaceUpdate(data) {
  return data && typeof data.surfaceId === 'string' && Array.isArray(data.components)
}

/**
 * 验证 DataModelUpdate 消息
 */
function validateDataModelUpdate(data) {
  return data && typeof data.surfaceId === 'string' && Array.isArray(data.contents)
}

/**
 * 验证 DeleteSurface 消息
 */
function validateDeleteSurface(data) {
  return data && typeof data.surfaceId === 'string'
}

/**
 * 创建 BeginRendering 消息
 */
export function createBeginRenderingMessage(surfaceId, root, styles = null) {
  const message = {
    beginRendering: {
      surfaceId,
      root,
    },
  }

  if (styles) {
    message.beginRendering.styles = styles
  }

  return message
}

/**
 * 创建 SurfaceUpdate 消息
 */
export function createSurfaceUpdateMessage(surfaceId, components) {
  return {
    surfaceUpdate: {
      surfaceId,
      components,
    },
  }
}

/**
 * 创建 DataModelUpdate 消息
 */
export function createDataModelUpdateMessage(surfaceId, contents, path = null) {
  const message = {
    dataModelUpdate: {
      surfaceId,
      contents,
    },
  }

  if (path) {
    message.dataModelUpdate.path = path
  }

  return message
}

/**
 * 创建 DeleteSurface 消息
 */
export function createDeleteSurfaceMessage(surfaceId) {
  return {
    deleteSurface: {
      surfaceId,
    },
  }
}
