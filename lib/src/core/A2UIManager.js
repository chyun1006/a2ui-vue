/**
 * A2UI 核心管理器 (重构版)
 * 使用 A2UIVueAdapter 处理消息和状态管理
 *
 * 主要变化：
 * - 使用 @a2ui/lit 处理 A2UI 协议消息
 * - 通过适配器桥接 Lit 和 Vue
 * - 保持与现有 API 的兼容性
 */

import { EventEmitter } from './EventEmitter.js'
import { A2UIVueAdapter } from './A2UIVueAdapter.js'
import { A2UI_EVENTS } from '../types/a2ui.js'

export class A2UIManager {
  /**
   * 创建 A2UIManager 实例
   * @param {Object} options - 配置选项
   * @param {boolean} [options.enableLogging=true] - 是否启用日志
   * @param {boolean} [options.validateMessages=true] - 是否验证消息
   * @param {boolean} [options.strictMode=false] - 是否启用严格模式
   */
  constructor(options = {}) {
    this.options = {
      enableLogging: true,
      validateMessages: true,
      strictMode: false,
      ...options,
    }

    // 使用适配器处理消息和状态
    this.adapter = new A2UIVueAdapter()

    // 事件总线
    this.eventBus = new EventEmitter()

    this._destroyed = false

    this._log('A2UIManager initialized with @a2ui/lit adapter')
  }

  // ========== 状态访问器 ==========

  /**
   * 获取响应式状态
   * 为了兼容性，返回适配器的状态
   */
  get state() {
    return this.adapter.state
  }

  // ========== Surface 管理 ==========

  /**
   * 获取 Surface
   * @param {string} surfaceId - Surface ID
   * @returns {Object|null} Surface 实例
   */
  getSurface(surfaceId) {
    return this.adapter.getSurface(surfaceId)
  }

  /**
   * 检查 Surface 是否存在
   * @param {string} surfaceId - Surface ID
   * @returns {boolean}
   */
  hasSurface(surfaceId) {
    return this.getSurface(surfaceId) !== null
  }

  /**
   * 删除 Surface
   * @param {string} surfaceId - Surface ID
   * @returns {boolean}
   */
  deleteSurface(surfaceId) {
    if (this._destroyed) {
      this._error('Cannot delete surface: manager is destroyed')
      return false
    }

    const surface = this.getSurface(surfaceId)
    if (!surface) {
      this._warn(`Surface not found: ${surfaceId}`)
      return false
    }

    this.adapter.deleteSurface(surfaceId)

    this.eventBus.emit(A2UI_EVENTS.SURFACE_DELETED, { surfaceId })
    this._log(`Surface deleted: ${surfaceId}`)
    return true
  }

  /**
   * 清空所有 Surfaces
   */
  clearSurfaces() {
    this.adapter.clearSurfaces()
    this.eventBus.emit(A2UI_EVENTS.SURFACES_CLEARED)
    this._log('All surfaces cleared')
  }

  /**
   * 获取所有 Surfaces（兼容旧 API）
   * @returns {Array} Surface 数组
   */
  getAllSurfaces() {
    const surfaces = []
    this.adapter.state.surfaces.forEach((surface, surfaceId) => {
      surfaces.push({
        id: surfaceId,
        rootComponentId: surface.root,
        components: Array.from(surface.components?.values() || []),
      })
    })
    return surfaces
  }

  /**
   * 获取状态（兼容旧 API）
   * @returns {Object} 状态对象
   */
  getState() {
    return {
      surfaces: this.adapter.state.surfaces,
      dataModels: this.adapter.state.dataModels,
    }
  }

  // ========== 组件管理 ==========

  /**
   * 获取组件定义
   * @param {string} surfaceId - Surface ID
   * @param {string} componentId - 组件 ID
   * @returns {Object|null} 组件定义
   */
  getComponent(surfaceId, componentId) {
    return this.adapter.getComponent(surfaceId, componentId)
  }

  // ========== 数据模型管理 ==========

  /**
   * 初始化数据模型
   * @param {string} _surfaceId - Surface ID (适配器会自动管理)
   * @returns {boolean}
   */
  initDataModel(_surfaceId) {
    // 适配器会自动管理数据模型
    return true
  }

  /**
   * 获取数据模型
   * @param {string} surfaceId - Surface ID
   * @returns {Object}
   */
  getDataModel(surfaceId) {
    return this.adapter.state.dataModels.get(surfaceId) || {}
  }

  /**
   * 检查数据模型是否存在
   * @param {string} surfaceId - Surface ID
   * @returns {boolean}
   */
  hasDataModel(surfaceId) {
    return this.adapter.state.dataModels.has(surfaceId)
  }

  /**
   * 更新数据
   * @param {string} surfaceId - Surface ID
   * @param {string} path - 数据路径
   * @param {*} value - 数据值
   * @returns {boolean}
   */
  updateData(surfaceId, path, value) {
    if (this._destroyed) {
      this._error('Cannot update data: manager is destroyed')
      return false
    }

    try {
      this.adapter.updateData(surfaceId, path, value)

      this.eventBus.emit(A2UI_EVENTS.DATA_UPDATED, {
        surfaceId,
        path,
        value,
      })

      this._log(`Data updated: ${surfaceId}, path: ${path}`)
      return true
    } catch (error) {
      this._error('Failed to update data', error)
      return false
    }
  }

  /**
   * 获取数据
   * @param {string} surfaceId - Surface ID
   * @param {string} path - 数据路径
   * @returns {*}
   */
  getData(surfaceId, path) {
    return this.adapter.getData(surfaceId, path)
  }

  /**
   * 删除数据
   * @param {string} surfaceId - Surface ID
   * @param {string} path - 数据路径
   * @returns {boolean}
   */
  deleteData(surfaceId, path) {
    if (this._destroyed) {
      this._error('Cannot delete data: manager is destroyed')
      return false
    }

    // @a2ui/lit 可能不直接支持删除，我们可以设置为 null
    try {
      this.adapter.updateData(surfaceId, path, null)

      this.eventBus.emit(A2UI_EVENTS.DATA_DELETED, {
        surfaceId,
        path,
      })

      this._log(`Data deleted: ${surfaceId}, path: ${path}`)
      return true
    } catch (error) {
      this._error('Failed to delete data', error)
      return false
    }
  }

  /**
   * 删除数据模型
   * @param {string} surfaceId - Surface ID
   * @returns {boolean}
   */
  deleteDataModel(surfaceId) {
    this.adapter.state.dataModels.delete(surfaceId)
    this._log(`Data model deleted: ${surfaceId}`)
    return true
  }

  // ========== 消息处理 ==========

  /**
   * 处理消息
   * @param {Array} messages - A2UI 消息数组
   * @param {Object} options - 处理选项
   * @returns {Object} 处理结果 { total, success, failed }
   */
  processMessages(messages, options = {}) {
    if (this._destroyed) {
      this._error('Cannot process messages: manager is destroyed')
      return { total: 0, success: 0, failed: 0 }
    }

    if (!Array.isArray(messages)) {
      this._error('Messages must be an array')
      return { total: 0, success: 0, failed: 0 }
    }

    try {
      // 记录处理前的 surface IDs
      const beforeSurfaceIds = new Set(this.adapter.state.surfaces.keys())

      // 使用适配器处理消息（内部使用 @a2ui/lit）
      this.adapter.processMessages(messages, options)

      // 检查新创建的 surfaces 并触发事件
      const afterSurfaceIds = new Set(this.adapter.state.surfaces.keys())
      afterSurfaceIds.forEach((surfaceId) => {
        if (!beforeSurfaceIds.has(surfaceId)) {
          // 新创建的 surface，触发事件
          this.eventBus.emit(A2UI_EVENTS.SURFACE_CREATED, {
            surfaceId,
            surface: this.adapter.getSurface(surfaceId),
          })
          this._log(`Surface created: ${surfaceId}`)
        }
      })

      this.eventBus.emit(A2UI_EVENTS.MESSAGES_PROCESSED, {
        count: messages.length,
        options,
      })

      this._log(`Processed ${messages.length} messages`)

      // 返回与 MessageHandler 兼容的结果格式
      return {
        total: messages.length,
        success: messages.length,
        failed: 0,
      }
    } catch (error) {
      this._error('Failed to process messages', error)
      this.eventBus.emit(A2UI_EVENTS.ERROR, {
        type: 'message_processing_failed',
        error,
      })
      return {
        total: messages.length,
        success: 0,
        failed: messages.length,
        error,
      }
    }
  }

  // ========== 事件管理 ==========

  /**
   * 监听事件
   * @param {string} event - 事件名称
   * @param {Function} handler - 事件处理函数
   */
  on(event, handler) {
    this.eventBus.on(event, handler)
  }

  /**
   * 取消监听事件
   * @param {string} event - 事件名称
   * @param {Function} handler - 事件处理函数
   */
  off(event, handler) {
    this.eventBus.off(event, handler)
  }

  /**
   * 触发事件
   * @param {string} event - 事件名称
   * @param {*} data - 事件数据
   */
  emit(event, data) {
    this.eventBus.emit(event, data)
  }

  // ========== 生命周期管理 ==========

  /**
   * 销毁管理器
   */
  destroy() {
    if (this._destroyed) {
      return
    }

    this._log('Destroying A2UIManager')

    // 销毁适配器
    this.adapter.destroy()

    // 清空事件监听器
    this.eventBus.removeAllListeners()

    this._destroyed = true

    this._log('A2UIManager destroyed')
  }

  /**
   * 检查管理器是否已销毁
   * @returns {boolean}
   */
  isDestroyed() {
    return this._destroyed
  }

  // ========== 日志工具 ==========

  _log(...args) {
    if (this.options.enableLogging) {
      console.log('[A2UIManager]', ...args)
    }
  }

  _warn(...args) {
    if (this.options.enableLogging) {
      console.warn('[A2UIManager]', ...args)
    }
  }

  _error(...args) {
    console.error('[A2UIManager]', ...args)
  }
}
