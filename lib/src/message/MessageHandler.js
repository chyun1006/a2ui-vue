/**
 * A2UI 消息处理器
 * 负责解析和处理 A2UI 消息，调用 A2UIManager API
 */

import { parseDataContents } from '../core/utils.js'
import { MESSAGE_TYPES } from '../types/a2ui.js'

export class MessageHandler {
  /**
   * 创建 MessageHandler 实例
   * @param {Object} manager - A2UIManager 实例
   */
  constructor(manager) {
    if (!manager) {
      throw new Error('A2UIManager instance is required')
    }

    this.manager = manager
  }

  /**
   * 处理单个消息
   * @param {Object} message - A2UI 消息对象
   * @returns {boolean} 是否成功处理
   */
  processMessage(message) {
    if (!message || typeof message !== 'object') {
      console.error('Invalid message:', message)
      return false
    }

    try {
      if (message.beginRendering) {
        return this.handleBeginRendering(message.beginRendering)
      }

      if (message.surfaceUpdate) {
        return this.handleSurfaceUpdate(message.surfaceUpdate)
      }

      if (message.dataModelUpdate) {
        return this.handleDataModelUpdate(message.dataModelUpdate)
      }

      if (message.deleteSurface) {
        return this.handleDeleteSurface(message.deleteSurface)
      }

      console.warn('Unknown message type:', message)
      return false
    } catch (error) {
      console.error('Error processing message:', error)
      this.manager.emit('error', {
        type: 'message_processing_failed',
        message,
        error,
      })
      return false
    }
  }

  /**
   * 批量处理消息
   * @param {Array} messages - 消息数组
   * @returns {Object} 处理结果统计
   */
  processMessages(messages) {
    if (!Array.isArray(messages)) {
      console.error('Messages must be an array')
      return { total: 0, success: 0, failed: 0 }
    }

    let successCount = 0
    let failedCount = 0

    for (const message of messages) {
      if (this.processMessage(message)) {
        successCount++
      } else {
        failedCount++
      }
    }

    console.log(`Processed ${successCount}/${messages.length} messages successfully`)

    return {
      total: messages.length,
      success: successCount,
      failed: failedCount,
    }
  }

  /**
   * 处理 BeginRendering 消息
   * @param {Object} data - BeginRendering 数据
   * @returns {boolean}
   */
  handleBeginRendering(data) {
    const { surfaceId, root, styles = null } = data || {}

    if (!surfaceId || !root) {
      console.error('Invalid beginRendering data:', data)
      return false
    }

    console.log('Begin rendering:', surfaceId)

    const surface = this.manager.createSurface({
      surfaceId,
      rootComponentId: root,
      styles,
    })

    return surface !== null
  }

  /**
   * 处理 SurfaceUpdate 消息
   * @param {Object} data - SurfaceUpdate 数据
   * @returns {boolean}
   */
  handleSurfaceUpdate(data) {
    const { surfaceId, components = [] } = data || {}

    if (!surfaceId) {
      console.error('Invalid surfaceUpdate data:', data)
      return false
    }

    console.log('Surface update:', surfaceId, components.length, 'components')

    return this.manager.updateComponents(surfaceId, components)
  }

  /**
   * 处理 DataModelUpdate 消息
   * @param {Object} data - DataModelUpdate 数据
   * @returns {boolean}
   */
  handleDataModelUpdate(data) {
    const { surfaceId, path = null, contents = [] } = data || {}

    if (!surfaceId) {
      console.error('Invalid dataModelUpdate data:', data)
      return false
    }

    console.log('Data model update:', surfaceId, 'path:', path || '/')

    const parsedData = parseDataContents(contents)
    return this.manager.updateData(surfaceId, path || '/', parsedData)
  }

  /**
   * 处理 DeleteSurface 消息
   * @param {Object} data - DeleteSurface 数据
   * @returns {boolean}
   */
  handleDeleteSurface(data) {
    const { surfaceId } = data || {}

    if (!surfaceId) {
      console.error('Invalid deleteSurface data:', data)
      return false
    }

    console.log('Delete surface:', surfaceId)

    return this.manager.deleteSurface(surfaceId)
  }

  /**
   * 获取消息类型
   * @param {Object} message - 消息对象
   * @returns {string|null} 消息类型
   */
  getMessageType(message) {
    if (message.beginRendering) return MESSAGE_TYPES.BEGIN_RENDERING
    if (message.surfaceUpdate) return MESSAGE_TYPES.SURFACE_UPDATE
    if (message.dataModelUpdate) return MESSAGE_TYPES.DATA_MODEL_UPDATE
    if (message.deleteSurface) return MESSAGE_TYPES.DELETE_SURFACE
    return null
  }

  /**
   * 验证消息格式
   * @param {Object} message - 消息对象
   * @returns {boolean}
   */
  validateMessage(message) {
    if (!message || typeof message !== 'object') {
      return false
    }

    const type = this.getMessageType(message)
    return type !== null
  }
}
