/**
 * A2UI 全局单例管理
 * 提供全局 A2UIManager 实例的创建和访问
 */

import { A2UIManager } from './A2UIManager.js'

let globalManager = null
let globalOptions = null

/**
 * 获取全局 A2UIManager 实例
 * @param {Object} options - 配置选项
 * @returns {A2UIManager}
 */
export function getGlobalManager(options = {}) {
  if (!globalManager) {
    globalOptions = options
    globalManager = new A2UIManager(options)

    if (options.enableLogging) {
      console.log('[A2UI] Global manager created')
    }
  }

  return globalManager
}

/**
 * 重置全局 A2UIManager 实例
 * 主要用于测试或需要完全重新初始化的场景
 */
export function resetGlobalManager() {
  if (globalManager) {
    if (globalOptions?.enableLogging) {
      console.log('[A2UI] Global manager destroyed')
    }

    globalManager.destroy()
    globalManager = null
    globalOptions = null
  }
}

/**
 * 检查全局 Manager 是否已创建
 * @returns {boolean}
 */
export function hasGlobalManager() {
  return globalManager !== null
}

/**
 * 获取全局配置选项
 * @returns {Object|null}
 */
export function getGlobalOptions() {
  return globalOptions
}
