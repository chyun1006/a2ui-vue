/**
 * A2UI 事件处理 Composable
 * 用于处理按钮点击等用户交互事件
 */

import { useDataBinding } from './useDataBinding.js'

/**
 * 事件处理 composable
 * @param {string} surfaceId - Surface ID (保留用于日志，但不传递给useDataBinding)
 * @param {Function} emit - Vue emit 函数
 */
export function useA2UIAction(surfaceId, emit) {
  const { resolveValue } = useDataBinding() // 不再需要传递surfaceId

  /**
   * 处理动作
   * @param {Object} action - 动作对象
   * @param {string} action.name - 动作名称
   * @param {Array} [action.context] - 上下文数组
   */
  const handleAction = (action) => {
    if (!action || !action.name) {
      console.warn('Invalid action:', action)
      return
    }

    const context = {}

    if (action.context && Array.isArray(action.context)) {
      action.context.forEach((item) => {
        const { key, value } = item || {}
        if (key) {
          const resolvedValue = resolveValue(value)
          console.log(`[useA2UIAction] Resolving ${key}:`, value, '→', resolvedValue)
          context[key] = resolvedValue
        }
      })
    }

    emit('action', {
      name: action.name,
      context,
    })

    console.log('Action triggered:', action.name, 'context:', context)
  }

  /**
   * 创建动作处理器
   * @param {Object} action - 动作对象
   * @returns {Function} 动作处理函数
   */
  const createActionHandler = (action) => {
    return () => handleAction(action)
  }

  return {
    handleAction,
    createActionHandler,
  }
}
