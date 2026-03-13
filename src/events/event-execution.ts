/**
 * 事件执行工具函数
 */

import type {
  Action,
  ActionResult,
  EventConfig,
  EventContext,
  EventFunctions,
  EventType,
} from './events.types'
import { getActionHandler } from './action-handlers'
import {
  showConfirmDialog as baseShowConfirmDialog,
  showFormDialog as baseShowFormDialog,
} from './dialog-atom'

/**
 * 解析事件类型到 React 事件名称的映射
 */
export const eventTypeToReactEvent: Record<EventType, string> = {
  click: 'onClick',
  doubleClick: 'onDoubleClick',
  mouseEnter: 'onMouseEnter',
  mouseLeave: 'onMouseLeave',
  change: 'onChange',
  submit: 'onSubmit',
  focus: 'onFocus',
  blur: 'onBlur',
  input: 'onInput',
}

/**
 * 解析 React 事件名称到事件类型的映射
 */
export const reactEventToEventType: Record<string, EventType> = {
  onClick: 'click',
  onDoubleClick: 'doubleClick',
  onMouseEnter: 'mouseEnter',
  onMouseLeave: 'mouseLeave',
  onChange: 'change',
  onSubmit: 'submit',
  onFocus: 'focus',
  onBlur: 'blur',
  onInput: 'input',
}

/**
 * 显示二次确认对话框
 */
export function showConfirmDialog(
  confirmConfig?: {
    title?: string
    message?: string
    confirmText?: string
    cancelText?: string
  }
): Promise<boolean> {

  return baseShowConfirmDialog(confirmConfig)
}

/**
 * 显示表单对话框
 */
export function showFormDialog(
  fields: any[],
  initialValues?: Record<string, any>,
  title?: string,
  description?: string
): Promise<Record<string, any> | null> {
  return baseShowFormDialog(fields, initialValues, title, description)
}

/**
 * 执行单个动作
 */
export async function executeAction(
  action: Action,
  context: EventContext
): Promise<ActionResult> {

  try {
    // 检查是否需要二次确认
    if (action.confirm) {

      const confirmed = await showConfirmDialog(action.confirm)

      if (!confirmed) {
        return { success: false, error: '用户取消操作' }
      }
    }

    // 检查是否需要延迟执行
    if (action.delay && action.delay > 0) {
      await new Promise((resolve) => setTimeout(resolve, action.delay))
    }

    // 获取动作处理器并执行
    const handler = getActionHandler(action.type)
    const result = await handler(action.params, context)

    return result
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : '执行动作失败',
    }
  }
}

/**
 * 执行事件的所有动作（按顺序）
 */
export async function executeActions(
  actions: Action[],
  context: EventContext
): Promise<ActionResult[]> {
  const results: ActionResult[] = []
  let prevResult: any = undefined

  for (let i = 0; i < actions.length; i++) {
    const action = actions[i]
    const actionContext = {
      ...context,
      prevResult,
    }

    const result = await executeAction(action, actionContext)
    results.push(result)

    // 保存当前结果供下一个动作使用
    if (result.success) {
      prevResult = result.data
    } else {
      // 如果动作执行失败，可以选择停止或继续
      // 这里选择停止执行后续动作
      break
    }
  }

  return results
}

/**
 * 创建事件处理器函数
 */
export function createEventHandler(
  eventType: EventType,
  actions: Action[],
  onLoadingChange?: (loading: boolean) => void,
  onError?: (error: string) => void,
  eventFunctions?: EventFunctions
) {
  return async (e?: React.SyntheticEvent) => {
    if (!actions || actions.length === 0) {
      return
    }

    // 阻止默认行为（如表单提交）
    e?.preventDefault()

    onLoadingChange?.(true)

    try {
      const context: EventContext = {
        eventType,
        eventParams: e,
        eventFunctions,
      }

      const results = await executeActions(actions, context)

      // 检查是否有失败的执行
      const hasFailure = results.some((r) => !r.success)
      if (hasFailure) {
        const lastError = results.reverse().find((r) => r.error)?.error
        onError?.(lastError || '事件执行失败')
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : '未知错误'
      onError?.(errorMessage)
    } finally {
      onLoadingChange?.(false)
    }
  }
}

/**
 * 解析事件配置，生成事件处理器映射
 */
export function parseEventConfig(
  config: EventConfig,
  eventFunctions?: EventFunctions
): Record<EventType, (e?: React.SyntheticEvent) => Promise<void>> {
  const handlers: Record<
    EventType,
    (e?: React.SyntheticEvent) => Promise<void>
  > = {} as any

  for (const [eventType, actions] of Object.entries(config)) {
    if (actions && actions.length > 0) {
      handlers[eventType as EventType] = createEventHandler(
        eventType as EventType,
        actions,
        undefined,
        undefined,
        eventFunctions
      )
    }
  }

  return handlers
}
