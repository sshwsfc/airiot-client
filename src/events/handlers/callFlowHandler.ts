/**
 * 调用流程处理器
 */

import type {
  ActionHandler,
  ActionResult,
  EventContext,
  CallFlowParams,
} from '../events.types'
import { showSchemaFormDialog } from '../dialog-atom'
import { createAPI } from '../../api'
import { showResultMessage } from './utils'

export const callFlowHandler: ActionHandler = async (
  params: CallFlowParams,
  _context: EventContext
): Promise<ActionResult> => {
  try {
    const { flow, params: flowParams, showForm } = params

    const manualTriggerApi = createAPI({ name: 'engine/manualTrigger' })

    const executionFlowApi = async ({ flowId, variable }: { flowId: string; variable: any }) => manualTriggerApi.fetch('', {
      method: 'POST',
      body: JSON.stringify({ flowId, variable })
    })

    if (showForm) {
      // 如果需要展示表单，先获取流程的输入变量定义
      const flowDetailApi = createAPI({ name: 'flow/flow/' })
      const schema = await flowDetailApi.fetch(flow.id, { headers: { cache: 'no-cache' } }).then(({ json }) => json?.settings?.schema)

      const formData = await showSchemaFormDialog({
        schema,
        title: '调用流程',
        description: `请输入流程 ${flow.name || flow.id} 的输入参数`,
      })

      if (!formData) {
        return { success: true, data: { flowId: flow.id || JSON.stringify(flow), params: flowParams, cancelled: true } }
      }

      await executionFlowApi({ flowId: flow.id, variable: formData })
    } else {
      await executionFlowApi({ flowId: flow.id, variable: flowParams })
    }

    showResultMessage({ success: true }, params)

    return {
      success: true,
      data: {
        flowId: flow.name,
        params: flowParams,
      },
    }
  } catch (error) {
    const result: ActionResult = {
      success: false,
      error: error instanceof Error ? error.message : '调用流程失败',
    }
    showResultMessage(result, params)
    return result
  }
}
