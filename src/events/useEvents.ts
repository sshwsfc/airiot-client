'use client'

import { useState, useMemo, useCallback, useRef } from 'react'
import { useSetPageVar } from '../page/hooks'
import type {
  EventConfig,
  EventType,
  EventsReturn,
  Action,
  EventContext,
} from './events.types'
import { executeActions } from './event-execution'
import { eventTypeToReactEvent } from './event-execution'

/**
 * useEvents Hook
 *
 * @param config - 事件配置对象，键为事件类型，值为动作数组
 * @returns 事件处理器对象
 */
export function useEvents(config: EventConfig = {}): EventsReturn {

  const setPageVar = useSetPageVar()

  // 状态管理
  const [loading, setLoading] = useState(false)
  const [_error, setError] = useState<string | null>(null)

  // 使用 ref 避免在循环中依赖 loading
  const loadingRef = useRef(loading)
  loadingRef.current = loading

  // 创建事件处理器
  const handlers = useMemo(() => {
    const result: Record<EventType, (e?: React.SyntheticEvent) => Promise<void>> = {} as any

    for (const [eventType, actions] of Object.entries(config)) {
      if (actions && actions.length > 0) {
        result[eventType as EventType] = async (e?: React.SyntheticEvent) => {
          // 如果正在执行，则忽略
          if (loadingRef.current) {
            return Promise.resolve()
          }

          e?.preventDefault()

          setLoading(true)
          setError(null)

          try {
            const context: EventContext = {
              eventType: eventType as EventType,
              eventParams: e,
              eventFunctions: {
                setPageVar,
              },
            }

            const results = await executeActions(actions, context)

            // 检查是否有失败的执行
            const failedResult = results.find((r) => !r.success)
            if (failedResult) {
              setError(failedResult.error || '动作执行失败')
            }
          } catch (err) {
            const errorMessage = err instanceof Error ? err.message : '未知错误'
            setError(errorMessage)
          } finally {
            setLoading(false)
          }
        }
      }
    }

    return result
  }, [config, setPageVar])

  // 返回事件处理器和配置
  return {
    ...handlers,
    config,
  } as EventsReturn
}

/**
 * useEvent Hook - 单个事件的快捷方式
 *
 * @param eventType - 事件类型
 * @param actions - 动作数组
 * @returns 事件处理器函数和状态
 */
export function useEvent(
  eventType: EventType,
  actions: Action[] = []
) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // 自动创建页面变量设置函数
  const setPageVar = useSetPageVar()

  const loadingRef = useRef(loading)
  loadingRef.current = loading

  const handler = useCallback(async (e?: React.SyntheticEvent) => {
    if (!actions || actions.length === 0 || loadingRef.current) {
      return Promise.resolve()
    }

    e?.preventDefault()

    setLoading(true)
    setError(null)

    try {
      const context: EventContext = {
        eventType,
        eventParams: e,
        eventFunctions: {
          setPageVar,
        },
      }

      const results = await executeActions(actions, context)

      const failedResult = results.find((r) => !r.success)
      if (failedResult) {
        setError(failedResult.error || '动作执行失败')
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '未知错误'
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }, [eventType, actions, setPageVar])

  return { handler, loading, error }
}

/**
 * useEventWithSpread Hook - 返回可展开的事件处理器对象
 *
 * @example
 * ```tsx
 * const events = useEventsWithSpread({
 *   click: [{ type: 'changeVar', params: { ... } }],
 *   doubleClick: [{ type: 'pageJump', params: { ... } }]
 * })
 *
 * // 可以展开到组件上
 * <div {...events}>
 *   <Button>Click me</Button>
 * </div>
 *
 * // 也可以单独使用
 * <Button onClick={events.onClick}>Click me</Button>
 * ```
 */
export function useEventsWithSpread(config: EventConfig = {}) {
  const handlers = useEvents(config)

  // 转换为 React 事件格式（onClick, onDoubleClick 等）
  const reactHandlers = useMemo(() => {
    const result: Record<string, (e?: React.SyntheticEvent) => Promise<void>> = {}

    for (const [eventType, handler] of Object.entries(handlers)) {
      // 跳过 config 属性
      if (eventType === 'config') {
        continue
      }
      const reactEventName = eventTypeToReactEvent[eventType as EventType]
      if (reactEventName && typeof handler === 'function') {
        result[reactEventName] = handler
      }
    }

    return result
  }, [handlers])

  return reactHandlers
}

// ============== 导出所有相关类型和函数 ==============

export * from './events.types'
export * from './event-execution'
export * from './action-handlers'
