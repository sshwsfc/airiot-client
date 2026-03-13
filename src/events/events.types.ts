/**
 * 事件和动作类型定义
 */

/** 事件类型 */
export type EventType =
  | 'click' // 单击
  | 'doubleClick' // 双击
  | 'mouseEnter' // 移入
  | 'mouseLeave' // 移出
  | 'change' // 值变化
  | 'submit' // 表单提交
  | 'focus' // 聚焦
  | 'blur' // 失焦
  | 'input' // 输入

/** 动作类型 */
export type ActionType =
  | 'pageJump' // 页面跳转
  | 'changeVar' // 修改变量
  | 'changeTableData' // 修改表数据
  | 'changeDict' // 修改数据字典
  | 'changeDataPoint' // 修改数据点配置
  | 'changeSystemSetting' // 修改系统设置
  | 'changeUser' // 修改用户
  | 'callFlow' // 调用流程
  | 'executeCommand' // 执行指令
  | 'sendRequest' // 发送请求

/** 值类型 - 变量值或组件值 */
export type ValueType = 'varValue' | 'comValue'

/** 执行结果消息配置 */
export interface ResultMessage {
  /** 成功提示 */
  successMess?: boolean
  /** 成功显示时常（秒） */
  successTime?: number
  /** 成功显示内容 */
  successContent?: string
  /** 失败提示 */
  errorMess?: boolean
  /** 失败显示时常（秒） */
  errorTime?: number
  /** 失败显示内容 */
  errorContent?: string
}

/** 打开方式 */
export type OpenWay = '_blank' | '_self' | '_parent' | '_top'

/** 权限类型 */
export type PermissionType = 'users' | 'roles'

/** 页面跳转动作参数 */
export interface PageJumpParams {
  url: string
  openWay?: OpenWay
  showMessage?: boolean
  permission?: PermissionType
  users?: string[]
  roles?: string[]
}

/** 修改变量动作参数 */
export interface ChangeVarParams extends ResultMessage {
  var: Record<string, any>
  varValue?: Record<string, any>
}

/** 修改表数据动作参数 */
export interface ChangeTableDataParams extends ResultMessage {
  table: Record<string, any>
  data: Record<string, any>
  /** 触发时修改（弹出表单） */
  showForm?: boolean
  fields?: string[]
  nodeProp?: Array<{
    key: string
    value: string
  }>
}

/** 修改数据字典动作参数 */
export interface ChangeDictParams extends ResultMessage {
  systemVar: Record<string, any>
  value?: Record<string, any>
}

/** 数据点属性 */
export interface DataPointProperty {
  /** 资产数据点 */
  recordDataPoint?: {
    tableId: string
    tableDataId: string
    tagId: string
  }
  /** 模型数据点 */
  tableDataPoint?: {
    tableId: string
    tagId: string
  }
  /** 要更新的属性键 */
  key: string
  /** 要设置的值 */
  value?: any
}

/** 修改数据点配置动作参数 */
export interface ChangeDataPointParams extends ResultMessage {
  /** 触发时修改（弹出表单） */
  showForm?: boolean
  /** 数据点配置数组 */
  dataPointMulti: DataPointProperty[]
}

/** 字段和值 */
export interface FieldValuePair {
  key: string
  value: string
}

/** 修改系统设置动作参数 */
export interface ChangeSystemSettingParams extends ResultMessage {
  /** 触发时修改（弹出表单） */
  showForm?: boolean
  fields?: string[]
  nodeProp?: FieldValuePair[]
}

/** 修改用户动作参数 */
export interface ChangeUserParams extends ResultMessage {
  /** 触发时修改（弹出表单） */
  showForm?: boolean
  fields?: string[]
  nodeProp?: FieldValuePair[]
}

/** 调用流程动作参数 */
export interface CallFlowParams extends ResultMessage {
  flow: Record<string, any>
  /** 触发时修改（弹出表单） */
  showForm?: boolean
  params?: Record<string, any>
}

/** 动作基础接口 */
export interface Action {
  /** 动作类型 */
  type: ActionType
  /** 动作参数 */
  params: any
  /** 是否需要二次确认 */
  confirm?: {
    title?: string
    message?: string
    confirmText?: string
    cancelText?: string
  }
  /** 延迟执行（毫秒） */
  delay?: number
}

/** 事件配置 */
export interface EventConfig {
  [eventType: string]: Action[]
}

/** 事件函数集合 */
export interface EventFunctions {
  /** 设置页面变量 */
  setPageVar?: (path: string, value: any) => void
}

/** 事件执行上下文 */
export interface EventContext {
  /** 事件源组件 */
  component?: React.ComponentType<any>
  /** 当前事件类型 */
  eventType: EventType
  /** 事件触发参数（如事件对象） */
  eventParams?: any
  /** 前一个动作的执行结果 */
  prevResult?: any
  /** 事件函数集合 */
  eventFunctions?: EventFunctions
}

/** 动作执行结果 */
export interface ActionResult {
  /** 是否成功 */
  success: boolean
  /** 返回数据 */
  data?: any
  /** 错误信息 */
  error?: string
}

/** 动作处理器 */
export type ActionHandler = (
  params: any,
  context: EventContext
) => Promise<ActionResult> | ActionResult

/** 事件处理器返回值 */
export interface EventHandlerReturn {
  /** 事件处理函数 */
  handler: (e?: React.SyntheticEvent) => void | Promise<void>
  /** 是否正在执行 */
  loading: boolean
  /** 执行错误 */
  error: string | null
}

/** 事件配置对象 */
export interface EventsReturn extends Partial<Record<EventType, (e?: React.SyntheticEvent) => void | Promise<void>>> {
  /** 各事件的处理器 */
  [key: string]: ((e?: React.SyntheticEvent) => void | Promise<void>) | EventConfig | undefined
  /** 事件配置原始数据 */
  config: EventConfig
}
