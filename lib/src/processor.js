/**
 * A2UI 消息处理器工厂
 * 创建消息处理器对象，提供完整的生命周期管理 API
 */

import { getGlobalManager } from './core/singleton.js'
import { A2UIManager } from './core/A2UIManager.js'
import { MessageHandler } from './message/MessageHandler.js'

/**
 * 创建 A2UI 消息处理器
 * @param {Object} options - 配置选项
 * @param {boolean} options.enableLogging - 是否启用日志
 * @param {boolean} options.validateMessages - 是否验证消息
 * @param {Function} options.onError - 错误回调
 * @param {boolean} options.useGlobalManager - 是否使用全局 manager（默认 false）
 * @returns {Object} Processor 对象
 */
export function createSignalA2uiMessageProcessor(options = {}) {
  const { useGlobalManager = false, onError, ...managerOptions } = options

  console.log('[A2UI] Creating processor with options:', options)

  // 根据配置决定使用全局或独立 manager
  const manager = useGlobalManager
    ? getGlobalManager(managerOptions)
    : new A2UIManager(managerOptions)

  console.log('[A2UI] Manager created:', useGlobalManager ? 'global' : 'independent')

  const messageHandler = new MessageHandler(manager)
  let destroyed = false

  /**
   * 处理消息（单个或数组）
   * @param {Object|Array} messages - 消息或消息数组
   * @param {Object} processOptions - 处理选项
   * @param {boolean} processOptions.clearBefore - 处理前是否清空 surfaces（默认 false）
   * @returns {Object} 处理结果 { total, success, failed, surfaces }
   */
  function processMessages(messages, processOptions = {}) {
    if (destroyed) {
      console.error('[A2UI] Cannot process messages: processor is destroyed')
      return { total: 0, success: 0, failed: 0, surfaces: [] }
    }

    const { clearBefore = false } = processOptions

    console.log(
      '[A2UI] Processing messages:',
      Array.isArray(messages) ? `${messages.length} messages` : '1 message',
      clearBefore ? '(clearing before)' : '',
    )

    try {
      // 如果需要，先清空 surfaces
      if (clearBefore) {
        const cleared = clearSurfaces()
        console.log(`[A2UI] Cleared ${cleared} surfaces before processing`)
      }

      // 处理消息
      let result
      if (Array.isArray(messages)) {
        result = messageHandler.processMessages(messages)
      } else {
        result = messageHandler.processMessage(messages)
      }

      console.log('[A2UI] Processing result:', result)
      console.log('[A2UI] Manager state after processing:', manager.getState())

      return result
    } catch (error) {
      console.error('[A2UI] Message processing error:', error)

      if (onError && typeof onError === 'function') {
        onError(error)
      }

      return { total: 0, success: 0, failed: 1, error }
    }
  }

  /**
   * 获取当前所有 surfaces
   * @returns {Array<Object>} Surface 信息数组
   */
  function getSurfaces() {
    if (destroyed) {
      console.warn('[A2UI] Cannot get surfaces: processor is destroyed')
      return []
    }

    const surfaces = manager.getAllSurfaces()
    return surfaces.map((surface) => ({
      id: surface.id,
      rootComponentId: surface.rootComponentId,
      componentCount: surface.components.length,
      hasDataModel: manager.getDataModel(surface.id) !== null,
    }))
  }

  /**
   * 清空所有 surfaces
   * @returns {number} 清空的 surface 数量
   */
  function clearSurfaces() {
    if (destroyed) {
      console.warn('[A2UI] Cannot clear surfaces: processor is destroyed')
      return 0
    }

    const surfaces = manager.getAllSurfaces()
    const count = surfaces.length

    surfaces.forEach((surface) => {
      manager.deleteSurface(surface.id)
    })

    console.log(`[A2UI] Cleared ${count} surfaces`)
    return count
  }

  /**
   * 获取 manager 实例（高级用法）
   * @returns {A2UIManager}
   */
  function getManager() {
    return manager
  }

  /**
   * 销毁 processor，释放资源
   */
  function destroy() {
    if (destroyed) {
      console.warn('[A2UI] Processor already destroyed')
      return
    }

    console.log('[A2UI] Destroying processor...')

    // 清空所有 surfaces
    clearSurfaces()

    // 如果使用独立 manager，销毁它
    if (!useGlobalManager && manager.destroy) {
      manager.destroy()
    }

    destroyed = true
    console.log('[A2UI] Processor destroyed')
  }

  // 创建 processor 对象
  const processorAPI = {
    processMessages,
    getSurfaces,
    clearSurfaces,
    getManager,
    destroy,
  }

  // 使 processor 对象可调用（向后兼容）
  const processor = Object.assign(function (messages) {
    return processMessages(messages)
  }, processorAPI)

  return processor
}
