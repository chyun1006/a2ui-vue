/**
 * A2UI 核心管理器
 * 管理所有 Surface 实例和数据模型
 */

import { reactive } from 'vue'
import { EventEmitter } from './EventEmitter.js'
import { Surface } from './Surface.js'
import {
  validateSurfaceConfig,
  mergeObjects,
  getValueByPath,
  setValueByPath,
  deleteValueByPath,
  normalizePath,
} from './utils.js'
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

    this.state = reactive({
      surfaces: new Map(),
      dataModels: new Map(),
    })

    this.eventBus = new EventEmitter()

    this._destroyed = false

    this._log('A2UIManager initialized')
  }

  // ========== Surface 管理 ==========

  /**
   * 创建 Surface
   * @param {Object} config - Surface 配置
   * @param {string} config.surfaceId - Surface ID
   * @param {string} config.rootComponentId - 根组件 ID
   * @param {Object} [config.styles] - 样式配置
   * @returns {Surface|null} Surface 实例
   */
  createSurface(config) {
    if (this._destroyed) {
      this._error('Cannot create surface: manager is destroyed')
      return null
    }

    if (!validateSurfaceConfig(config)) {
      this._error('Invalid surface config', config)
      return null
    }

    const { surfaceId } = config || {}

    if (this.state.surfaces.has(surfaceId)) {
      this._warn(`Surface already exists: ${surfaceId}`)
      return this.state.surfaces.get(surfaceId)
    }

    try {
      const surface = new Surface(config)
      this.state.surfaces.set(surfaceId, surface)

      this.initDataModel(surfaceId)

      this.eventBus.emit(A2UI_EVENTS.SURFACE_CREATED, {
        surfaceId,
        surface,
      })

      this._log(`Surface created: ${surfaceId}`)
      return surface
    } catch (error) {
      this._error('Failed to create surface', error)
      this.eventBus.emit(A2UI_EVENTS.ERROR, {
        type: 'surface_creation_failed',
        surfaceId,
        error,
      })
      return null
    }
  }

  /**
   * 获取 Surface
   * @param {string} surfaceId - Surface ID
   * @returns {Surface|null}
   */
  getSurface(surfaceId) {
    return this.state.surfaces.get(surfaceId) || null
  }

  /**
   * 检查 Surface 是否存在
   * @param {string} surfaceId - Surface ID
   * @returns {boolean}
   */
  hasSurface(surfaceId) {
    return this.state.surfaces.has(surfaceId)
  }

  /**
   * 获取所有 Surface
   * @returns {Array<Surface>}
   */
  getAllSurfaces() {
    return Array.from(this.state.surfaces.values())
  }

  /**
   * 获取 Surface 数量
   * @returns {number}
   */
  getSurfaceCount() {
    return this.state.surfaces.size
  }

  /**
   * 删除 Surface
   * @param {string} surfaceId - Surface ID
   * @returns {boolean} 是否成功删除
   */
  deleteSurface(surfaceId) {
    if (this._destroyed) {
      this._error('Cannot delete surface: manager is destroyed')
      return false
    }

    const surface = this.state.surfaces.get(surfaceId)

    if (!surface) {
      this._warn(`Surface not found: ${surfaceId}`)
      return false
    }

    surface.destroy()
    this.state.surfaces.delete(surfaceId)
    this.deleteDataModel(surfaceId)

    this.eventBus.emit(A2UI_EVENTS.SURFACE_DELETED, { surfaceId })

    this._log(`Surface deleted: ${surfaceId}`)
    return true
  }

  /**
   * 更新 Surface 组件
   * @param {string} surfaceId - Surface ID
   * @param {Array<Object>} components - 组件定义数组
   * @returns {boolean} 是否成功
   */
  updateComponents(surfaceId, components) {
    if (this._destroyed) {
      this._error('Cannot update components: manager is destroyed')
      return false
    }

    const surface = this.state.surfaces.get(surfaceId)

    if (!surface) {
      this._error(`Surface not found: ${surfaceId}`)
      return false
    }

    if (!Array.isArray(components)) {
      this._error('Components must be an array')
      return false
    }

    const successCount = surface.addComponents(components)

    this.eventBus.emit(A2UI_EVENTS.SURFACE_UPDATED, {
      surfaceId,
      componentCount: successCount,
    })

    this._log(`Surface updated: ${surfaceId}, ${successCount} components`)
    return successCount > 0
  }

  // ========== 数据模型管理 ==========

  /**
   * 初始化数据模型
   * @param {string} surfaceId - Surface ID
   * @returns {boolean}
   */
  initDataModel(surfaceId) {
    if (!surfaceId) {
      this._error('surfaceId is required')
      return false
    }

    if (!this.state.dataModels.has(surfaceId)) {
      this.state.dataModels.set(surfaceId, reactive({}))
      this._log(`Data model initialized: ${surfaceId}`)
    }

    return true
  }

  /**
   * 获取数据模型
   * @param {string} surfaceId - Surface ID
   * @returns {Object}
   */
  getDataModel(surfaceId) {
    return this.state.dataModels.get(surfaceId) || {}
  }

  /**
   * 检查数据模型是否存在
   * @param {string} surfaceId - Surface ID
   * @returns {boolean}
   */
  hasDataModel(surfaceId) {
    return this.state.dataModels.has(surfaceId)
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

    this.initDataModel(surfaceId)

    const normalizedPath = normalizePath(path || '/')
    const dataModel = this.state.dataModels.get(surfaceId)

    if (!normalizedPath || normalizedPath === '/') {
      if (typeof value === 'object' && value !== null) {
        Object.assign(dataModel, value)
      }
    } else {
      const updatedData = setValueByPath(dataModel, normalizedPath, value)
      this.state.dataModels.set(surfaceId, updatedData)
    }

    this.eventBus.emit(A2UI_EVENTS.DATA_UPDATED, {
      surfaceId,
      path: normalizedPath,
      value,
    })

    this._log(`Data updated: ${surfaceId}, path: ${normalizedPath}`)
    return true
  }

  /**
   * 获取数据
   * @param {string} surfaceId - Surface ID
   * @param {string} path - 数据路径
   * @returns {*}
   */
  getData(surfaceId, path) {
    const dataModel = this.state.dataModels.get(surfaceId)

    if (!dataModel) {
      this._warn(`Data model not found: ${surfaceId}`)
      return undefined
    }

    if (!path || path === '/') {
      return dataModel
    }

    return getValueByPath(dataModel, path)
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

    const dataModel = this.state.dataModels.get(surfaceId)

    if (!dataModel) {
      this._warn(`Data model not found: ${surfaceId}`)
      return false
    }

    const updatedData = deleteValueByPath(dataModel, path)
    this.state.dataModels.set(surfaceId, updatedData)

    this.eventBus.emit(A2UI_EVENTS.DATA_DELETED, {
      surfaceId,
      path,
    })

    this._log(`Data deleted: ${surfaceId}, path: ${path}`)
    return true
  }

  /**
   * 删除数据模型
   * @param {string} surfaceId - Surface ID
   * @returns {boolean}
   */
  deleteDataModel(surfaceId) {
    if (!this.state.dataModels.has(surfaceId)) {
      return false
    }

    this.state.dataModels.delete(surfaceId)
    this._log(`Data model deleted: ${surfaceId}`)
    return true
  }

  /**
   * 合并数据
   * @param {string} surfaceId - Surface ID
   * @param {string} path - 数据路径
   * @param {Object} data - 要合并的数据
   * @returns {boolean}
   */
  mergeData(surfaceId, path, data) {
    const currentValue = this.getData(surfaceId, path)

    if (
      typeof currentValue === 'object' &&
      currentValue !== null &&
      typeof data === 'object' &&
      data !== null
    ) {
      const mergedValue = mergeObjects(currentValue, data)
      return this.updateData(surfaceId, path, mergedValue)
    }

    return this.updateData(surfaceId, path, data)
  }

  // ========== 事件管理 ==========

  /**
   * 监听事件
   * @param {string} event - 事件名称
   * @param {Function} handler - 事件处理函数
   * @returns {Function} 取消监听的函数
   */
  on(event, handler) {
    return this.eventBus.on(event, handler)
  }

  /**
   * 监听一次性事件
   * @param {string} event - 事件名称
   * @param {Function} handler - 事件处理函数
   * @returns {Function} 取消监听的函数
   */
  once(event, handler) {
    return this.eventBus.once(event, handler)
  }

  /**
   * 取消监听事件
   * @param {string} event - 事件名称
   * @param {Function} handler - 事件处理函数
   * @returns {boolean}
   */
  off(event, handler) {
    return this.eventBus.off(event, handler)
  }

  /**
   * 触发事件
   * @param {string} event - 事件名称
   * @param {*} data - 事件数据
   * @returns {boolean}
   */
  emit(event, data) {
    return this.eventBus.emit(event, data)
  }

  // ========== 工具方法 ==========

  /**
   * 重置所有状态
   */
  reset() {
    if (this._destroyed) {
      this._error('Cannot reset: manager is destroyed')
      return
    }

    this.state.surfaces.forEach((surface) => surface.destroy())
    this.state.surfaces.clear()
    this.state.dataModels.clear()
    this.eventBus.removeAllListeners()

    this._log('Manager reset')
  }

  /**
   * 销毁管理器
   */
  destroy() {
    if (this._destroyed) {
      return
    }

    this.reset()
    this._destroyed = true
    this._log('Manager destroyed')
  }

  /**
   * 检查是否已销毁
   * @returns {boolean}
   */
  isDestroyed() {
    return this._destroyed
  }

  /**
   * 获取管理器状态信息
   * @returns {Object}
   */
  getState() {
    return {
      surfaceCount: this.state.surfaces.size,
      dataModelCount: this.state.dataModels.size,
      destroyed: this._destroyed,
      options: { ...this.options },
    }
  }

  // ========== 私有方法 ==========

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
