/**
 * A2UI 消息处理器工厂
 * 创建消息处理函数
 */

import { getGlobalManager } from './core/singleton.js'
import { MessageHandler } from './message/MessageHandler.js'

let globalMessageHandler = null

/**
 * 创建 A2UI 消息处理器
 * @param {Object} options - 配置选项
 * @param {boolean} options.enableLogging - 是否启用日志
 * @param {boolean} options.validateMessages - 是否验证消息
 * @param {Function} options.onError - 错误回调
 * @returns {Function} processor 函数
 */
export function createSignalA2uiMessageProcessor(options = {}) {
  console.log('[A2UI] Creating processor with options:', options)
  const manager = getGlobalManager(options)
  console.log('[A2UI] Manager created/retrieved:', manager)

  if (!globalMessageHandler) {
    globalMessageHandler = new MessageHandler(manager)
    console.log('[A2UI] MessageHandler created')
  }

  const { onError } = options

  /**
   * 处理 A2UI 消息
   * @param {Object|Array} message - 单个消息或消息数组
   * @returns {boolean|Object} 处理结果
   */
  function processor(message) {
    console.log(
      '[A2UI] Processing message:',
      Array.isArray(message) ? `${message.length} messages` : message,
    )
    try {
      let result
      if (Array.isArray(message)) {
        result = globalMessageHandler.processMessages(message)
      } else {
        result = globalMessageHandler.processMessage(message)
      }
      console.log('[A2UI] Processing result:', result)
      console.log('[A2UI] Manager state after processing:', manager.getState())
      return result
    } catch (error) {
      console.error('[A2UI] Message processing error:', error)

      if (onError && typeof onError === 'function') {
        onError(error)
      }

      return false
    }
  }

  return processor
}
