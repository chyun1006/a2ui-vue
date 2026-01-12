/**
 * SSE (Server-Sent Events) 连接 Composable
 * 用于建立和管理 SSE 连接
 */

import { ref, onUnmounted } from 'vue'

/**
 * SSE 连接 composable
 * @param {string} url - SSE 服务器 URL
 * @param {Object} options - 配置选项
 */
export function useSSE(url, options = {}) {
  const {
    withCredentials = false,
    autoConnect = false,
    onMessage = null,
    onError = null,
    onOpen = null,
    onClose = null,
  } = options

  const eventSource = ref(null)
  const isConnected = ref(false)
  const error = ref(null)
  const lastMessage = ref(null)

  /**
   * 连接到 SSE 服务器
   */
  const connect = () => {
    if (eventSource.value) {
      console.warn('SSE already connected')
      return
    }

    if (!url) {
      console.error('SSE URL is required')
      return
    }

    try {
      eventSource.value = new EventSource(url, { withCredentials })

      eventSource.value.onopen = (event) => {
        isConnected.value = true
        error.value = null
        console.log('SSE connected:', url)

        if (onOpen) {
          onOpen(event)
        }
      }

      eventSource.value.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data)
          lastMessage.value = data

          if (onMessage) {
            onMessage(data, event)
          }
        } catch (err) {
          console.error('Failed to parse SSE message:', err)
          lastMessage.value = event.data

          if (onMessage) {
            onMessage(event.data, event)
          }
        }
      }

      eventSource.value.onerror = (event) => {
        isConnected.value = false
        error.value = event
        console.error('SSE error:', event)

        if (onError) {
          onError(event)
        }
      }
    } catch (err) {
      console.error('Failed to create SSE connection:', err)
      error.value = err

      if (onError) {
        onError(err)
      }
    }
  }

  /**
   * 断开 SSE 连接
   */
  const disconnect = () => {
    if (eventSource.value) {
      eventSource.value.close()
      eventSource.value = null
      isConnected.value = false
      console.log('SSE disconnected')

      if (onClose) {
        onClose()
      }
    }
  }

  /**
   * 重新连接
   */
  const reconnect = () => {
    disconnect()
    setTimeout(() => {
      connect()
    }, 1000)
  }

  /**
   * 添加自定义事件监听器
   * @param {string} eventType - 事件类型
   * @param {Function} handler - 事件处理函数
   */
  const addEventListener = (eventType, handler) => {
    if (!eventSource.value) {
      console.warn('SSE not connected')
      return
    }

    eventSource.value.addEventListener(eventType, (event) => {
      try {
        const data = JSON.parse(event.data)
        handler(data, event)
      } catch (parseError) {
        console.warn('Failed to parse event data:', parseError.message)
        handler(event.data, event)
      }
    })
  }

  if (autoConnect) {
    connect()
  }

  onUnmounted(() => {
    disconnect()
  })

  return {
    eventSource,
    isConnected,
    error,
    lastMessage,
    connect,
    disconnect,
    reconnect,
    addEventListener,
  }
}
