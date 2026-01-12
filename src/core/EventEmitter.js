/**
 * 事件发射器
 * 用于实现发布-订阅模式的事件系统
 */

export class EventEmitter {
  constructor() {
    this.events = new Map()
  }

  /**
   * 注册事件监听器
   * @param {string} event - 事件名称
   * @param {Function} handler - 事件处理函数
   * @returns {Function} 取消监听的函数
   */
  on(event, handler) {
    if (typeof handler !== 'function') {
      throw new TypeError('Handler must be a function')
    }

    if (!this.events.has(event)) {
      this.events.set(event, [])
    }

    const handlers = this.events.get(event)
    handlers.push(handler)

    return () => this.off(event, handler)
  }

  /**
   * 注册一次性事件监听器
   * @param {string} event - 事件名称
   * @param {Function} handler - 事件处理函数
   * @returns {Function} 取消监听的函数
   */
  once(event, handler) {
    if (typeof handler !== 'function') {
      throw new TypeError('Handler must be a function')
    }

    const onceWrapper = (...args) => {
      handler(...args)
      this.off(event, onceWrapper)
    }

    return this.on(event, onceWrapper)
  }

  /**
   * 取消事件监听器
   * @param {string} event - 事件名称
   * @param {Function} handler - 要移除的事件处理函数
   * @returns {boolean} 是否成功移除
   */
  off(event, handler) {
    if (!this.events.has(event)) {
      return false
    }

    const handlers = this.events.get(event)
    const index = handlers.indexOf(handler)

    if (index === -1) {
      return false
    }

    handlers.splice(index, 1)

    if (handlers.length === 0) {
      this.events.delete(event)
    }

    return true
  }

  /**
   * 触发事件
   * @param {string} event - 事件名称
   * @param {*} data - 事件数据
   * @returns {boolean} 是否有监听器被触发
   */
  emit(event, data) {
    const handlers = this.events.get(event)

    if (!handlers || handlers.length === 0) {
      return false
    }

    handlers.forEach((handler) => {
      try {
        handler(data)
      } catch (error) {
        console.error(`Error in event handler for "${event}":`, error)
      }
    })

    this.emitWildcard(event, data)

    return true
  }

  /**
   * 触发通配符事件
   * @param {string} event - 原始事件名称
   * @param {*} data - 事件数据
   * @private
   */
  emitWildcard(event, data) {
    const wildcardHandlers = this.events.get('*')

    if (!wildcardHandlers || wildcardHandlers.length === 0) {
      return
    }

    wildcardHandlers.forEach((handler) => {
      try {
        handler({ event, data })
      } catch (error) {
        console.error(`Error in wildcard handler for "${event}":`, error)
      }
    })
  }

  /**
   * 移除指定事件的所有监听器
   * @param {string} event - 事件名称
   * @returns {boolean} 是否成功移除
   */
  removeAllListeners(event) {
    if (event) {
      return this.events.delete(event)
    }

    this.events.clear()
    return true
  }

  /**
   * 获取指定事件的监听器数量
   * @param {string} event - 事件名称
   * @returns {number} 监听器数量
   */
  listenerCount(event) {
    const handlers = this.events.get(event)
    return handlers ? handlers.length : 0
  }

  /**
   * 获取所有事件名称
   * @returns {Array<string>} 事件名称数组
   */
  eventNames() {
    return Array.from(this.events.keys())
  }

  /**
   * 获取指定事件的所有监听器
   * @param {string} event - 事件名称
   * @returns {Array<Function>} 监听器数组
   */
  listeners(event) {
    const handlers = this.events.get(event)
    return handlers ? [...handlers] : []
  }

  /**
   * 销毁事件发射器，清理所有监听器
   */
  destroy() {
    this.events.clear()
  }
}
