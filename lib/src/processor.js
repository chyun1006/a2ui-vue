/**
 * A2UI 消息处理器工厂
 * 直接使用 @a2ui/lit 的 processor,并通过 adapter 同步到 Vue
 */

import { A2UIVueAdapter } from './core/A2UIVueAdapter.js'
import { getGlobalManager } from './core/singleton.js'

/**
 * 创建 A2UI 消息处理器
 * @param {Object} options - 配置选项
 * @param {boolean} options.useGlobalManager - 是否使用全局 adapter（默认 false）
 * @param {Function} options.onError - 错误回调
 * @returns {Object} Processor 对象
 */
export function createSignalA2uiMessageProcessor(options = {}) {
  const { useGlobalManager = false, onError } = options

  console.log('[A2UI] Creating processor with options:', options)

  // 根据配置决定使用全局或独立 adapter
  const adapter = useGlobalManager ? getGlobalManager() : new A2UIVueAdapter()

  console.log('[A2UI] Adapter created:', useGlobalManager ? 'global' : 'independent')

  let destroyed = false

  /**
   * 处理消息（单个或数组）
   * @param {Object|Array} messages - 消息或消息数组
   * @param {Object} processOptions - 处理选项
   * @param {boolean} processOptions.clearBefore - 处理前是否清空 surfaces（默认 false）
   * @returns {Array<Object>} Surface对象数组
   */
  function processMessages(messages, processOptions = {}) {
    if (destroyed) {
      console.error('[A2UI] Cannot process messages: processor is destroyed')
      return []
    }

    const { clearBefore = false } = processOptions

    console.log(
      '[A2UI] Processing messages:',
      Array.isArray(messages) ? `${messages.length} messages` : '1 message',
      clearBefore ? '(clearing before)' : '',
    )

    try {
      // 确保 messages 是数组
      const messageArray = Array.isArray(messages) ? messages : [messages]

      // 使用 adapter 处理消息(内部使用 @a2ui/lit)
      adapter.processMessages(messageArray, processOptions)

      // 提取本次消息涉及的Surface IDs
      const affectedSurfaceIds = new Set()
      messageArray.forEach((msg) => {
        if (msg.beginRendering) affectedSurfaceIds.add(msg.beginRendering.surfaceId)
        if (msg.surfaceUpdate) affectedSurfaceIds.add(msg.surfaceUpdate.surfaceId)
        if (msg.dataModelUpdate) affectedSurfaceIds.add(msg.dataModelUpdate.surfaceId)
      })

      // 获取所有Surface并构建返回数组
      const allSurfaces = adapter.litProcessor.getSurfaces()
      const surfaces = []

      affectedSurfaceIds.forEach((surfaceId) => {
        const surface = allSurfaces.get(surfaceId)
        if (surface) {
          // 返回完整的Surface对象（包含所有属性）
          // lit processor的surface可能使用rootComponentId而不是root
          surfaces.push({
            id: surfaceId,
            root: surface.root || surface.rootComponentId,
            components: surface.components,
            dataModel: surface.dataModel,
            styles: surface.styles,
          })
        }
      })

      console.log('[A2UI] Messages processed successfully, returning', surfaces.length, 'surfaces')

      return surfaces
    } catch (error) {
      console.error('[A2UI] Message processing error:', error)

      if (onError && typeof onError === 'function') {
        onError(error)
      }

      return []
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

    const surfaces = adapter.litProcessor.getSurfaces()
    const result = []

    surfaces.forEach((surface, surfaceId) => {
      result.push({
        id: surfaceId,
        root: surface.root,
        componentCount: surface.components?.size || 0,
        hasDataModel: surface.dataModel !== null,
      })
    })

    return result
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

    adapter.clearSurfaces()
    console.log('[A2UI] All surfaces cleared')
    return 0
  }

  /**
   * 获取 adapter 实例（高级用法）
   * @returns {A2UIVueAdapter}
   */
  function getManager() {
    return adapter
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

    // 如果使用独立 adapter，销毁它
    if (!useGlobalManager && adapter.destroy) {
      adapter.destroy()
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
