/**
 * Surface 类
 * 表示一个独立的渲染表面，包含组件树和样式
 */

import { reactive } from 'vue'

export class Surface {
  /**
   * 创建 Surface 实例
   * @param {Object} config - 配置对象
   * @param {string} config.surfaceId - Surface ID
   * @param {string} config.rootComponentId - 根组件 ID
   * @param {Object} [config.styles] - 样式配置
   */
  constructor(config) {
    const { surfaceId, rootComponentId, styles = {} } = config || {}

    if (!surfaceId) {
      throw new Error('surfaceId is required')
    }

    if (!rootComponentId) {
      throw new Error('rootComponentId is required')
    }

    this.id = surfaceId
    this.rootComponentId = rootComponentId

    this.styles = reactive({
      font: styles.font || null,
      primaryColor: styles.primaryColor || null,
      ...styles,
    })

    this.components = reactive(new Map())

    this._destroyed = false
  }

  /**
   * 添加或更新组件
   * @param {Object} componentDef - 组件定义
   * @param {string} componentDef.id - 组件 ID
   * @param {Object} componentDef.component - 组件配置
   * @param {number} [componentDef.weight] - 权重
   * @returns {boolean} 是否成功
   */
  addComponent(componentDef) {
    if (this._destroyed) {
      console.warn('Cannot add component to destroyed surface')
      return false
    }

    if (!componentDef || !componentDef.id) {
      console.error('Invalid component definition: missing id')
      return false
    }

    this.components.set(componentDef.id, componentDef)
    return true
  }

  /**
   * 批量添加组件
   * @param {Array<Object>} components - 组件定义数组
   * @returns {number} 成功添加的数量
   */
  addComponents(components) {
    if (!Array.isArray(components)) {
      console.error('Components must be an array')
      return 0
    }

    let successCount = 0
    for (const componentDef of components) {
      if (this.addComponent(componentDef)) {
        successCount++
      }
    }

    return successCount
  }

  /**
   * 获取组件
   * @param {string} componentId - 组件 ID
   * @returns {Object|null} 组件定义
   */
  getComponent(componentId) {
    return this.components.get(componentId) || null
  }

  /**
   * 检查组件是否存在
   * @param {string} componentId - 组件 ID
   * @returns {boolean}
   */
  hasComponent(componentId) {
    return this.components.has(componentId)
  }

  /**
   * 移除组件
   * @param {string} componentId - 组件 ID
   * @returns {boolean} 是否成功移除
   */
  removeComponent(componentId) {
    if (this._destroyed) {
      console.warn('Cannot remove component from destroyed surface')
      return false
    }

    return this.components.delete(componentId)
  }

  /**
   * 获取所有组件
   * @returns {Array<Object>} 组件数组
   */
  getAllComponents() {
    return Array.from(this.components.values())
  }

  /**
   * 获取组件数量
   * @returns {number}
   */
  getComponentCount() {
    return this.components.size
  }

  /**
   * 更新样式
   * @param {Object} newStyles - 新样式
   * @returns {boolean} 是否成功
   */
  updateStyles(newStyles) {
    if (this._destroyed) {
      console.warn('Cannot update styles of destroyed surface')
      return false
    }

    if (!newStyles || typeof newStyles !== 'object') {
      console.error('Invalid styles object')
      return false
    }

    Object.assign(this.styles, newStyles)
    return true
  }

  /**
   * 清空所有组件
   */
  clearComponents() {
    if (this._destroyed) {
      console.warn('Cannot clear components of destroyed surface')
      return
    }

    this.components.clear()
  }

  /**
   * 销毁 Surface
   */
  destroy() {
    if (this._destroyed) {
      return
    }

    this.components.clear()
    this._destroyed = true
  }

  /**
   * 检查是否已销毁
   * @returns {boolean}
   */
  isDestroyed() {
    return this._destroyed
  }

  /**
   * 获取 Surface 信息
   * @returns {Object}
   */
  toJSON() {
    return {
      id: this.id,
      rootComponentId: this.rootComponentId,
      styles: { ...this.styles },
      componentCount: this.components.size,
      destroyed: this._destroyed,
    }
  }
}
