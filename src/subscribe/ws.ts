import React from 'react'
import api from '../api'

// ============================================================================
// Types
// ============================================================================

interface WSMessage {
  message?: string
  data?: any
}

interface OnMessageFunc {
  (message: WSMessage): void
}

interface OnDataFunc {
  (data: any, socket: WebSocket): void
}

interface OnStatusFunc {
  (status: string, event?: Event | CloseEvent): void
}

interface UseCommWSResult {
  subscribe: (url: string, query: any) => () => void
  onData: (fn: OnDataFunc) => void
  onMessage: (fn: OnMessageFunc) => void
  onStatus: (fn: OnStatusFunc) => void
}

interface UseWSResult {
  subscribe: (subType: string, query: any) => () => void
  onData: (fn: OnDataFunc) => void
  onMessage: (fn: OnMessageFunc) => void
  onStatus: (fn: OnStatusFunc) => void
}

interface UseWSDataProps {
  query: any
}

interface UseWSDataResult {
  onData: (fn: OnDataFunc) => void
  onStatus: (fn: OnStatusFunc) => void
}

// ============================================================================
// Hooks
// ============================================================================

export const useCommWS = (): UseCommWSResult => {
  const onMessageFunc = React.useRef<OnMessageFunc | null>(null)
  const onDataFunc = React.useRef<OnDataFunc | null>(null)
  const onStatusFunc = React.useRef<OnStatusFunc | null>(null)

  const onMessage = React.useCallback((fn: OnMessageFunc) => {
    onMessageFunc.current = fn
  }, [])

  const onData = React.useCallback((fn: OnDataFunc) => {
    onDataFunc.current = fn
  }, [])

  const onStatus = React.useCallback((fn: OnStatusFunc) => {
    onStatusFunc.current = fn
  }, [])

  const subscribe = React.useCallback((url: string, query: any) => {
    let socket: WebSocket | null = null
    let connecting = false
    let forceDisconnect = false
    let reConnectCount = 0
    let keepLiveTimer: NodeJS.Timeout | null = null

    const status = (status: string, event?: Event | CloseEvent) => {
      if (onStatusFunc.current) {
        onStatusFunc.current(status, event)
      }
    }

    const keepLive = () => {
      const emitMessage = () => {
        const readyState = socket?.readyState
        if (readyState === 1) {
          socket?.send('client send keeplive message!')
          keepLiveTimer = keepLive()
        }
      }
      return setTimeout(emitMessage, 30000)
    }

    let creatSocket: () => void

    const reconnectSocket = () => {
      if (!connecting && !forceDisconnect) {
        let timeout = 3000
        if (reConnectCount > 10 && reConnectCount < 20) timeout = 10000
        if (reConnectCount > 20) {
          return
        }
        reConnectCount++
        setTimeout(() => creatSocket(), timeout)
      }
    }

    creatSocket = () => {
      socket = new WebSocket(url)
      connecting = true
      status('connecting')

      socket.onopen = () => {
        connecting = false
        reConnectCount = 0
        status('connected')

        if (socket) {
          socket.onmessage = (msg: MessageEvent) => {
            const message: WSMessage = JSON.parse(msg.data)
            if (message.message && message.message.indexOf('获取当前用户ID失败') >= 0) {
              forceDisconnect = true
            }
            if (onMessageFunc.current) {
              onMessageFunc.current(message)
            }
            if (onDataFunc.current && socket) {
              onDataFunc.current(message.data, socket)
            }
          }

          socket.onclose = (v: CloseEvent) => {
            status('close', v)
            reconnectSocket()
          }

          // 发送订阅条件
          const subscribeQuery = JSON.stringify({ type: 'query', data: query })
          socket.send(subscribeQuery)
        }

        keepLive()
      }

      socket.onerror = (err: Event) => {
        status('error', err)
        reconnectSocket()
      }
    }

    creatSocket()

    return () => {
      forceDisconnect = true
      if (keepLiveTimer) {
        clearTimeout(keepLiveTimer)
      }
      if (socket) {
        socket.close()
      }
    }
  }, [])

  return { subscribe, onData, onMessage, onStatus }
}

export const useWS = (): UseWSResult => {
  const { subscribe: commSubscribe, onData, onMessage, onStatus } = useCommWS()

  const headers = api({ name: '' }).headers
  const token = headers?.Authorization ? `token=${headers.Authorization}` : ''
  const projectID = headers && headers['x-request-project']

  const subscribe = React.useCallback((subType: string, query: any) => {
    const protocol = window.location.protocol.indexOf('https') === 0 ? 'wss' : 'ws'
    const project = projectID ? `${token ? '&' : ''}x-request-project=${projectID}` : ''
    const url = `${protocol}://${window.location.host}/ws/${subType}?${token}${project}`
    return commSubscribe(url, query)
  }, [commSubscribe, projectID, token])

  return { subscribe, onData, onMessage, onStatus }
}

export const useWSData = ({ query }: UseWSDataProps): UseWSDataResult => {
  const { subscribe, onData, onStatus } = useWS()

  React.useEffect(() => {
    return subscribe('data', query)
  }, [query, subscribe])

  return { onData, onStatus }
}
