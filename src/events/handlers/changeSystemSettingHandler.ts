/**
 * 修改系统设置处理器
 */

import type {
  ActionHandler,
  ActionResult,
  EventContext,
  ChangeSystemSettingParams,
} from '../events.types'
import { showResultMessage } from './utils'
import { createAPI } from '../../api'
import { showSchemaFormDialog } from '../dialog-atom'

const settingsSchema = {
  type: 'object',
  properties: {
    name: {
      title: '系统名称',
      type: 'string'
    },
    logo: {
      title: '系统图片',
      type: 'string',
    },
    backgroundImage: {
      title: '系统背景',
      type: 'string',
    },
    copyright: {
      title: '系统版权信息',
      type: 'string'
    },
    language: {
      title: '系统语言',
      type: 'string',
    }
  }
}
export const changeSystemSettingHandler: ActionHandler = async (
  params: ChangeSystemSettingParams,
  _context: EventContext
): Promise<ActionResult> => {
  try {
    const { nodeProp, fields, showForm } = params
    if (showForm) {
      const formData = await showSchemaFormDialog({
        schema: settingsSchema,
        formSchema: fields,
        title: '修改系统配置',
      })
      await createAPI({ name: 'core/setting' }).save(formData)
    } else {
      const updates: Record<string, string> = {}

      if (nodeProp) {
        for (const item of nodeProp) {
          updates[item.key] = item.value
        }
      }
      await createAPI({ name: 'core/setting' }).save(updates)
    }

    showResultMessage({ success: true }, params)

    return { success: true }
  } catch (error) {
    const result: ActionResult = {
      success: false,
      error: error instanceof Error ? error.message : '修改系统设置失败',
    }
    showResultMessage(result, params)
    return result
  }
}
