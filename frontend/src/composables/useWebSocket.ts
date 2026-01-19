import { ref, onUnmounted } from 'vue'
import type { ProgressState } from '@/types'
import { useProgressStore } from '@/stores/progressStore'

export function useWebSocket() {
  const progressStore = useProgressStore()
  const ws = ref<WebSocket | null>(null)
  const reconnectAttempts = ref(0)
  const maxReconnectAttempts = 5
  const reconnectDelay = 2000

  let reconnectTimeout: ReturnType<typeof setTimeout> | null = null
  let pingInterval: ReturnType<typeof setInterval> | null = null

  function connect() {
    if (ws.value?.readyState === WebSocket.OPEN) return

    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:'
    const host = window.location.host
    const wsUrl = `${protocol}//${host}/ws/progress`

    try {
      ws.value = new WebSocket(wsUrl)

      ws.value.onopen = () => {
        console.log('[WebSocket] Connected')
        progressStore.setWsConnected(true)
        reconnectAttempts.value = 0

        // Start ping interval
        pingInterval = setInterval(() => {
          if (ws.value?.readyState === WebSocket.OPEN) {
            ws.value.send('ping')
          }
        }, 25000)
      }

      ws.value.onmessage = (event) => {
        if (event.data === 'pong') return

        try {
          const data: ProgressState = JSON.parse(event.data)
          progressStore.updateFromWebSocket(data)
        } catch (e) {
          console.error('[WebSocket] Failed to parse message:', e)
        }
      }

      ws.value.onclose = () => {
        console.log('[WebSocket] Disconnected')
        progressStore.setWsConnected(false)
        cleanup()
        attemptReconnect()
      }

      ws.value.onerror = (error) => {
        console.error('[WebSocket] Error:', error)
      }
    } catch (e) {
      console.error('[WebSocket] Failed to connect:', e)
      attemptReconnect()
    }
  }

  function disconnect() {
    cleanup()
    if (ws.value) {
      ws.value.close()
      ws.value = null
    }
    progressStore.setWsConnected(false)
  }

  function cleanup() {
    if (pingInterval) {
      clearInterval(pingInterval)
      pingInterval = null
    }
    if (reconnectTimeout) {
      clearTimeout(reconnectTimeout)
      reconnectTimeout = null
    }
  }

  function attemptReconnect() {
    if (reconnectAttempts.value >= maxReconnectAttempts) {
      console.log('[WebSocket] Max reconnect attempts reached')
      return
    }

    reconnectAttempts.value++
    console.log(`[WebSocket] Reconnecting (attempt ${reconnectAttempts.value})...`)

    reconnectTimeout = setTimeout(() => {
      connect()
    }, reconnectDelay * reconnectAttempts.value)
  }

  function send(data: unknown) {
    if (ws.value?.readyState === WebSocket.OPEN) {
      ws.value.send(JSON.stringify(data))
    }
  }

  onUnmounted(() => {
    disconnect()
  })

  return {
    connect,
    disconnect,
    send,
    isConnected: () => ws.value?.readyState === WebSocket.OPEN,
  }
}
