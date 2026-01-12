/**
 * @a2ui/renderer
 * A2UI 渲染器 - 独立的、无依赖的 A2UI 渲染包
 */

// 主要 API
export { createSignalA2uiMessageProcessor } from './processor.js'
export { default as a2uiRender } from './components/A2UIRender.vue'

// 高级 API（可选使用）
export { A2UIManager } from './core/A2UIManager.js'
export { MessageHandler } from './message/MessageHandler.js'
export { getGlobalManager, resetGlobalManager, hasGlobalManager } from './core/singleton.js'

// 工具和常量
export { A2UI_EVENTS, MESSAGE_TYPES, COMPONENT_TYPES } from './types/a2ui.js'
export { parseDataContents, deepClone, mergeObjects } from './core/utils.js'
