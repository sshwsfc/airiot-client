import type {
  ActionHandler,
  ActionResult,
  EventContext,
  ChangeVarParams,
} from '../events.types'
import _ from 'lodash'

export const changeVarHandler: ActionHandler = async (
  params: ChangeVarParams,
  context: EventContext
): Promise<ActionResult> => {
  try {
    const { var: varConfig, varValue } = params
    const varPath = varConfig.path || Object.keys(varConfig).join('.')

    if (context.eventFunctions?.setPageVar) {
      // setPageVar 一定支持函数式更新 
      context.eventFunctions.setPageVar(state => ({ ..._.set(state, varPath, varValue) }))
    } else {
      throw new Error('EventContext 必须包含 eventFunctions.setPageVar 函数来设置页面变量')
    }
    return { success: true, data: { var: varConfig, value: varValue } }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : '修改变量失败'
    return {
      success: false,
      error: errorMessage,
    }
  }
}
