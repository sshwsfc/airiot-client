/**
 * 动作处理器 - 索引文件
 *
 * 导出所有动作处理器
 */

import { atom } from 'jotai'
import type { ActionHandler } from './events.types'

// 表单字段类型
export type FormField = {
  name: string
  label: string
  type?: 'text' | 'number' | 'boolean' | 'select' | 'textarea'
  defaultValue?: any
  required?: boolean
  placeholder?: string
  options?: { label: string; value: string | number }[]
  validate?: (value: any) => string | null
}

// ============== 对话框状态 atoms ==============

/**
 * 确认对话框配置
 */
export interface ConfirmDialogConfig {
  title?: string
  message?: string
  confirmText?: string
  cancelText?: string
}

/**
 * 表单对话框配置
 */
export interface FormDialogConfig {
  title?: string
  description?: string
  fields: FormField[]
  confirmText?: string
  cancelText?: string
  initialValues?: Record<string, any>
}

/**
 * 确认对话框状态 atom
 */
export const confirmDialogAtom = atom<ConfirmDialogConfig | null>(null)

/**
 * 表单对话框状态 atom
 */
export const formDialogAtom = atom<FormDialogConfig | null>(null)

/**
 * 确认对话框的 resolve 函数 atom
 */
export const confirmDialogResolveAtom = atom<((value: boolean) => void) | null>(null)

/**
 * 表单对话框的 resolve 函数 atom
 */
export const formDialogResolveAtom = atom<((value: any) => void) | null>(null)

// ============== 导入所有处理器 ==============

export { pageJumpHandler } from './handlers/pageJumpHandler'
export { changeVarHandler } from './handlers/changeVarHandler'
export { changeTableDataHandler } from './handlers/changeTableDataHandler'
export { changeDictHandler } from './handlers/changeDictHandler'
export { changeDataPointHandler } from './handlers/changeDataPointHandler'
export { changeSystemSettingHandler } from './handlers/changeSystemSettingHandler'
export { changeUserHandler } from './handlers/changeUserHandler'
export { callFlowHandler } from './handlers/callFlowHandler'
export { executeCommandHandler } from './handlers/executeCommandHandler'
export { sendRequestHandler } from './handlers/sendRequestHandler'

// ============== 动作处理器注册表 ==============

import {
  pageJumpHandler,
  changeVarHandler,
  changeTableDataHandler,
  changeDictHandler,
  changeDataPointHandler,
  changeSystemSettingHandler,
  changeUserHandler,
  callFlowHandler,
  executeCommandHandler,
  sendRequestHandler,
} from './handlers'

export const actionHandlers: Record<string, ActionHandler> = {
  pageJump: pageJumpHandler,
  changeVar: changeVarHandler,
  changeTableData: changeTableDataHandler,
  changeDict: changeDictHandler,
  changeDataPoint: changeDataPointHandler,
  changeSystemSetting: changeSystemSettingHandler,
  changeUser: changeUserHandler,
  callFlow: callFlowHandler,
  executeCommand: executeCommandHandler,
  sendRequest: sendRequestHandler,
}

/**
 * 获取动作处理器
 */
export function getActionHandler(actionType: string): ActionHandler {
  return actionHandlers[actionType] || (() => ({
    success: false,
    error: '未知的动作类型',
  }))
}
