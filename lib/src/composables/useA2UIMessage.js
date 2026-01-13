/**
 * A2UI 消息处理 Composable
 * 用于处理服务器发送的 A2UI 消息
 */

import { useSurfaceStore } from '../stores/surfaceStore.js'
import { useDataModelStore } from '../stores/dataModelStore.js'
import { getMessageType, isValidMessage } from '../types/messages.js'
import { MESSAGE_TYPES } from '../types/a2ui.js'

/**
 * A2UI 消息处理 composable
 */
export function useA2UIMessage() {
  const surfaceStore = useSurfaceStore()
  const dataModelStore = useDataModelStore()

  /**
   * 处理消息
   * @param {Object} message - A2UI 消息对象
   */
  const processMessage = (message) => {
    if (!isValidMessage(message)) {
      console.error('Invalid A2UI message:', message)
      return false
    }

    const messageType = getMessageType(message)

    switch (messageType) {
      case MESSAGE_TYPES.BEGIN_RENDERING:
        return handleBeginRendering(message.beginRendering)
      case MESSAGE_TYPES.SURFACE_UPDATE:
        return handleSurfaceUpdate(message.surfaceUpdate)
      case MESSAGE_TYPES.DATA_MODEL_UPDATE:
        return handleDataModelUpdate(message.dataModelUpdate)
      case MESSAGE_TYPES.DELETE_SURFACE:
        return handleDeleteSurface(message.deleteSurface)
      default:
        console.error('Unknown message type:', messageType)
        return false
    }
  }

  /**
   * 处理 BeginRendering 消息
   */
  const handleBeginRendering = (data) => {
    const { surfaceId, root, styles = null } = data || {}

    console.log('Begin rendering:', surfaceId)

    const success = surfaceStore.createSurface({
      id: surfaceId,
      rootComponentId: root,
      styles,
    })

    if (success) {
      dataModelStore.initDataModel(surfaceId)
    }

    return success
  }

  /**
   * 处理 SurfaceUpdate 消息
   */
  const handleSurfaceUpdate = (data) => {
    const { surfaceId, components = [] } = data || {}

    console.log('Surface update:', surfaceId, components.length, 'components')

    return surfaceStore.updateComponents(surfaceId, components)
  }

  /**
   * 处理 DataModelUpdate 消息
   */
  const handleDataModelUpdate = (data) => {
    const { surfaceId, path = null, contents = [] } = data || {}

    console.log('Data model update:', surfaceId, 'path:', path || '/')

    return dataModelStore.updateData(surfaceId, path, contents)
  }

  /**
   * 处理 DeleteSurface 消息
   */
  const handleDeleteSurface = (data) => {
    const { surfaceId } = data || {}

    console.log('Delete surface:', surfaceId)

    const surfaceDeleted = surfaceStore.deleteSurface(surfaceId)
    const dataDeleted = dataModelStore.deleteDataModel(surfaceId)

    return surfaceDeleted || dataDeleted
  }

  /**
   * 批量处理消息
   * @param {Array} messages - 消息数组
   */
  const processMessages = (messages) => {
    if (!Array.isArray(messages)) {
      console.error('Messages must be an array')
      return false
    }

    let successCount = 0
    for (const message of messages) {
      if (processMessage(message)) {
        successCount++
      }
    }

    console.log(`Processed ${successCount}/${messages.length} messages`)
    return successCount === messages.length
  }

  return {
    processMessage,
    processMessages,
    handleBeginRendering,
    handleSurfaceUpdate,
    handleDataModelUpdate,
    handleDeleteSurface,
  }
}
