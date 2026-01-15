/**
 * A2UI 全局单例管理
 * 提供全局 A2UIVueAdapter 实例的创建和访问
 */

import { A2UIVueAdapter } from './A2UIVueAdapter.js'

let globalAdapter = null
let globalOptions = null

/**
 * 获取全局 A2UIVueAdapter 实例
 * @param {Object} options - 配置选项
 * @returns {A2UIVueAdapter}
 */
export function getGlobalManager(options = {}) {
  if (!globalAdapter) {
    globalOptions = options
    globalAdapter = new A2UIVueAdapter(options)

    if (options.enableLogging) {
      console.log('[A2UI] Global adapter created')
    }
  }

  return globalAdapter
}

/**
 * 重置全局 A2UIVueAdapter 实例
 * 主要用于测试或需要完全重新初始化的场景
 */
export function resetGlobalManager() {
  if (globalAdapter) {
    if (globalOptions?.enableLogging) {
      console.log('[A2UI] Global adapter destroyed')
    }

    globalAdapter.destroy()
    globalAdapter = null
    globalOptions = null
  }
}

/**
 * 检查全局 Adapter 是否已创建
 * @returns {boolean}
 */
export function hasGlobalManager() {
  return globalAdapter !== null
}

/**
 * 获取全局配置选项
 * @returns {Object|null}
 */
export function getGlobalOptions() {
  return globalOptions
}
