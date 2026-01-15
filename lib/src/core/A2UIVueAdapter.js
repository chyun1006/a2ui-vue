/**
 * A2UIVueAdapter - 适配器层
 *
 * 将 @a2ui/lit 的消息处理能力与 Vue 的响应式系统桥接
 * - 使用 @a2ui/lit 处理 A2UI 协议消息
 * - 将状态转换为 Vue 响应式状态
 * - 提供与现有 Vue 组件兼容的 API
 */

import { reactive } from 'vue'
import { v0_8 } from '@a2ui/lit'
import { getValueByPath, setValueByPath } from './utils.js'
import { EventEmitter } from './EventEmitter.js'
import { A2UI_EVENTS } from '../types/a2ui.js'

const { Data } = v0_8

export class A2UIVueAdapter {
  constructor() {
    // 使用 @a2ui/lit 的消息处理器
    this.litProcessor = Data.createSignalA2uiMessageProcessor()

    // Vue 响应式状态
    this.state = reactive({
      surfaces: new Map(),
      dataModels: new Map(),
      initialized: false,
    })

    // 事件总线
    this.eventBus = new EventEmitter()

    // 追踪已创建的 surface,用于触发 SURFACE_CREATED 事件
    this._surfaces = new Set()

    // 设置状态同步
    this._setupStateSync()
  }

  /**
   * 设置状态同步机制
   * 监听 lit processor 的变化并同步到 Vue 响应式状态
   */
  _setupStateSync() {
    // 注意：@a2ui/lit 使用 signals，我们需要定期同步状态
    // 或者在每次操作后手动同步
  }

  /**
   * 处理 A2UI 消息
   * @param {Array} messages - A2UI 消息数组
   * @param {Object} options - 处理选项
   */
  processMessages(messages, options = {}) {
    const { clearBefore = false } = options

    if (clearBefore) {
      this.clearSurfaces()
    }

    // 使用 @a2ui/lit 处理消息
    this.litProcessor.processMessages(messages)

    // 同步状态到 Vue
    this._syncAllSurfaces()
  }

  /**
   * 清空所有 surfaces
   */
  clearSurfaces() {
    this.litProcessor.clearSurfaces()
    this.state.surfaces.clear()
    this.state.dataModels.clear()
  }

  /**
   * 获取 Surface
   * @param {string} surfaceId - Surface ID
   * @returns {Object|null} Surface 对象
   */
  getSurface(surfaceId) {
    const surfaces = this.litProcessor.getSurfaces()
    return surfaces.get(surfaceId) || null
  }

  /**
   * 获取组件定义
   * @param {string} surfaceId - Surface ID
   * @param {string} componentId - 组件 ID
   * @returns {Object|null} 组件定义
   */
  getComponent(surfaceId, componentId) {
    const surface = this.getSurface(surfaceId)
    if (!surface) {
      return null
    }

    // 从 surface 的 components 中获取组件
    return surface.components?.get(componentId) || null
  }

  /**
   * 递归解包 Signal 对象
   * @param {*} value - 可能是 Signal 对象的值
   * @returns {*} 解包后的实际值
   */
  _peekSignal(value) {
    // 如果值有 peek 方法,说明是 Signal 对象
    if (value && typeof value === 'object' && typeof value.peek === 'function') {
      const peeked = value.peek()
      // 递归解包,因为 peek 的结果可能仍然是 Signal
      return this._peekSignal(peeked)
    }
    return value
  }

  /**
   * 获取数据
   * @param {string} surfaceId - Surface ID
   * @param {string} path - 数据路径
   * @returns {*} 数据值
   */
  getData(surfaceId, path) {
    const surface = this.getSurface(surfaceId)
    if (!surface) {
      console.warn(`[Adapter.getData] Surface not found: ${surfaceId}`)
      return null
    }

    console.log(`[Adapter.getData] surfaceId: ${surfaceId}, path: ${path}`)
    console.log(`[Adapter.getData] surface.root:`, surface.root)
    console.log(`[Adapter.getData] surface.dataModel:`, surface.dataModel)

    // 优先使用 @a2ui/lit 的 getData 方法获取最新数据
    // 注意: litProcessor.getData(component, path) 需要 component 才能解析相对路径
    // 如果没有 component (rootComponent 为 undefined),它可能会报错

    try {
      // 尝试直接从 litProcessor 的内部状态获取最新的 dataModel
      // 这是一个 hack,因为 processor 可能没有公开这个 API
      // 但对于全局 adapter,我们需要访问最新的 signal 值
      let latestDataModel = null

      // 尝试调用 getSurfaces
      if (typeof this.litProcessor.getSurfaces === 'function') {
        const surfaces = this.litProcessor.getSurfaces()
        const litSurface = surfaces.get(surfaceId)
        if (litSurface && litSurface.dataModel) {
          latestDataModel = litSurface.dataModel
        }
      }

      if (latestDataModel) {
        // 解包 Signal 对象获取最新值
        const dataModelValue = latestDataModel.peek ? latestDataModel.peek() : latestDataModel

        // 递归获取路径值
        if (!path || path === '/') {
          const finalValue = this._peekSignal(dataModelValue)
          // 如果是内部对象且包含 vals Map，直接返回 vals
          if (finalValue && finalValue.vals instanceof Map) {
            return finalValue.vals
          }
          return finalValue
        }

        // 使用通用的路径解析逻辑
        const normalizedPath = path.startsWith('/') ? path.substring(1) : path
        const pathSegments = normalizedPath.split('/').filter((s) => s)

        let currentValue = dataModelValue
        for (const segment of pathSegments) {
          currentValue = this._peekSignal(currentValue)

          if (currentValue && currentValue.vals instanceof Map) {
            currentValue = currentValue.vals.get(segment)
          } else if (currentValue && typeof currentValue === 'object') {
            currentValue = currentValue[segment]
          } else {
            currentValue = undefined
            break
          }

          if (currentValue === undefined) break
        }

        const finalValue = this._peekSignal(currentValue)
        return finalValue
      }
    } catch (error) {
      console.warn(`[Adapter.getData] Error accessing litProcessor state:`, error)
    }

    // 直接从 surface.dataModel 获取数据
    // @a2ui/lit 的 dataModel 是一个 reactive 对象
    if (surface.dataModel) {
      // dataModel 可能是 @a2ui/lit 的 signal 对象,需要获取其值
      let dataModel = surface.dataModel.peek ? surface.dataModel.peek() : surface.dataModel
      console.log(`[Adapter.getData] Actual dataModel:`, dataModel)

      // 如果 dataModel 是 Signal 对象(有 vals 属性),尝试从 vals Map 获取
      if (dataModel && dataModel.vals instanceof Map) {
        console.log(`[Adapter.getData] dataModel.vals:`, dataModel.vals)
        console.log(`[Adapter.getData] dataModel.vals keys:`, Array.from(dataModel.vals.keys()))

        // 分段解析路径
        const normalizedPath = path.startsWith('/') ? path.substring(1) : path
        const pathSegments = normalizedPath.split('/').filter((s) => s)

        console.log(`[Adapter.getData] Path segments:`, pathSegments)

        // 递归访问路径
        let currentValue = dataModel
        for (const segment of pathSegments) {
          // 解包当前值(如果是 Signal)
          currentValue = this._peekSignal(currentValue)

          // 如果当前值有 vals Map,从中获取下一段
          if (currentValue && currentValue.vals instanceof Map) {
            currentValue = currentValue.vals.get(segment)
            console.log(`[Adapter.getData] Got '${segment}':`, currentValue)
          } else if (currentValue && typeof currentValue === 'object') {
            // 否则作为普通对象访问
            currentValue = currentValue[segment]
            console.log(`[Adapter.getData] Got '${segment}' from object:`, currentValue)
          } else {
            console.log(`[Adapter.getData] Cannot access '${segment}' from:`, currentValue)
            return undefined
          }

          if (currentValue === undefined) {
            return undefined
          }
        }

        // 最后完全解包结果
        const finalValue = this._peekSignal(currentValue)
        console.log(`[Adapter.getData] Final value:`, finalValue)
        return finalValue
      }

      if (!path || path === '/') {
        return dataModel
      }

      const value = getValueByPath(dataModel, path)
      console.log(`[Adapter.getData] Value from path ${path}:`, value)
      return value
    }

    return null
  }

  /**
   * 更新数据
   * @param {string} surfaceId - Surface ID
   * @param {string} path - 数据路径
   * @param {*} value - 数据值
   */
  async updateData(surfaceId, path, value) {
    const surface = this.getSurface(surfaceId)
    if (!surface) {
      console.warn(`[Adapter.updateData] Surface not found: ${surfaceId}`)
      return
    }

    console.log(`[Adapter.updateData] surfaceId: ${surfaceId}, path: ${path}, value:`, value)

    const rootComponent = surface.root ? surface.components.get(surface.root) : null

    // 调用 @a2ui/lit 的 setData 方法
    // setData(node, relativePath, value, surfaceId)
    // 当 node 为 null 时，会直接操作 surfaceId 对应的 dataModel
    try {
      this.litProcessor.setData(rootComponent, path, value, surfaceId)
    } catch (e) {
      console.warn(`[Adapter.updateData] litProcessor.setData failed:`, e)
    }

    // 立即从 litProcessor 获取最新的 surface 状态
    const updatedSurface = this.litProcessor.getSurfaces().get(surfaceId)
    if (updatedSurface) {
      // 强制更新 Vue 响应式状态
      this.state.surfaces.set(surfaceId, updatedSurface)
      this.state.dataModels.set(surfaceId, updatedSurface.dataModel)
    }

    // 验证更新是否成功
    const verifyValue = this.getData(surfaceId, path)

    if (verifyValue !== value) {
      console.warn(
        `[Adapter.updateData] WARNING: Verification failed! Expected:`,
        value,
        'Got:',
        verifyValue,
      )
      console.warn(`[Adapter.updateData] Attempting manual update fallback...`)

      if (this._manualUpdateData(surfaceId, path, value)) {
        console.log(`[Adapter.updateData] Manual update successful`)
        // Force sync again
        const updatedSurface = this.litProcessor.getSurfaces().get(surfaceId)
        this.state.surfaces.set(surfaceId, updatedSurface)
        this.state.dataModels.set(surfaceId, updatedSurface.dataModel)
      } else {
        console.error(`[Adapter.updateData] Manual update failed`)
      }
    }
  }

  /**
   * 手动更新数据的后备方案
   * 绕过 litProcessor.setData 可能存在的问题
   */
  _manualUpdateData(surfaceId, path, value) {
    try {
      const surface = this.litProcessor.getSurfaces().get(surfaceId)
      if (!surface || !surface.dataModel) return false

      const dataModel = surface.dataModel.peek ? surface.dataModel.peek() : surface.dataModel

      const normalizedPath = path.startsWith('/') ? path.substring(1) : path
      const segments = normalizedPath.split('/').filter((s) => s)

      if (segments.length === 0) return false

      let current = dataModel
      // 遍历到倒数第二个
      for (let i = 0; i < segments.length - 1; i++) {
        const seg = segments[i]
        current = this._peekSignal(current)
        if (current && current.vals instanceof Map) {
          current = current.vals.get(seg)
        } else if (current && typeof current === 'object') {
          current = current[seg]
        } else {
          return false
        }
      }

      // 设置最后一个值
      const lastKey = segments[segments.length - 1]
      current = this._peekSignal(current)

      if (current && current.vals instanceof Map) {
        console.log(`[Adapter._manualUpdateData] Setting Map key '${lastKey}' to '${value}'`)
        current.vals.set(lastKey, value)
        return true
      } else if (current && typeof current === 'object') {
        console.log(`[Adapter._manualUpdateData] Setting Object key '${lastKey}' to '${value}'`)
        current[lastKey] = value
        return true
      }
    } catch (e) {
      console.error(`[Adapter._manualUpdateData] Error:`, e)
    }
    return false
  }
  deleteSurface(surfaceId) {
    // @a2ui/lit 的 clearSurfaces 会清空所有，我们需要手动管理
    this.state.surfaces.delete(surfaceId)
    this.state.dataModels.delete(surfaceId)
  }

  /**
   * 同步所有 surfaces 到 Vue 状态
   */
  _syncAllSurfaces() {
    // 强制从 litProcessor 同步所有 surfaces
    const surfaces = this.litProcessor.getSurfaces()

    surfaces.forEach((surface, surfaceId) => {
      this._syncSurface(surfaceId, surface)
      this._syncDataModel(surfaceId)
    })

    this.state.initialized = true
  }

  /**
   * 同步单个 surface 到 Vue 状态
   * @param {string} surfaceId - Surface ID
   * @param {Object} [existingSurface] - 可选的 Surface 对象
   */
  _syncSurface(surfaceId, existingSurface) {
    // 优先使用传入的 surface,否则从 litProcessor 获取
    let surface = existingSurface

    if (!surface && this.litProcessor && this.litProcessor.getSurfaces) {
      surface = this.litProcessor.getSurfaces().get(surfaceId)
    }

    if (surface) {
      console.log(`[Adapter._syncSurface] Syncing surface ${surfaceId}, root: ${surface.root}`)
      this.state.surfaces.set(surfaceId, surface)

      // 检查是否有新的 surface 创建
      if (!this._surfaces.has(surfaceId)) {
        console.log(`[Adapter._syncSurface] New surface created: ${surfaceId}`)
        this._surfaces.add(surfaceId)
        this.eventBus.emit(A2UI_EVENTS.SURFACE_CREATED, { surfaceId })
      }
    }
  }

  /**
   * 同步数据模型到 Vue 状态
   * @param {string} surfaceId - Surface ID
   */
  _syncDataModel(surfaceId) {
    const surface = this.getSurface(surfaceId)
    if (!surface) {
      return
    }

    // 获取整个数据模型
    const dataModel = surface.dataModel || {}
    console.log(`[Adapter._syncDataModel] surfaceId: ${surfaceId}`)
    console.log(`[Adapter._syncDataModel] dataModel type:`, typeof dataModel)
    console.log(`[Adapter._syncDataModel] dataModel:`, dataModel)

    // 尝试 peek 获取实际值
    const actualModel = dataModel.peek ? dataModel.peek() : dataModel
    console.log(`[Adapter._syncDataModel] actualModel:`, actualModel)
    console.log(`[Adapter._syncDataModel] actualModel.orders:`, actualModel?.orders)

    this.state.dataModels.set(surfaceId, dataModel)
  }

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
   * 触发事件
   * @param {string} event - 事件名称
   * @param {*} data - 事件数据
   */
  emit(event, data) {
    this.eventBus.emit(event, data)
  }

  /**
   * 销毁适配器
   */
  destroy() {
    this.clearSurfaces()
    this.state.initialized = false
  }
}
