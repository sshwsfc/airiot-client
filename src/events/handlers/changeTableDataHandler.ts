/**
 * 修改表数据处理器
 */

import type {
  ActionHandler,
  ActionResult,
  EventContext,
  ChangeTableDataParams,
} from '../events.types'
import { showSchemaFormDialog } from '../dialog-atom'
import { createAPI } from '../../api'
import { showResultMessage } from './utils'

export const changeTableDataHandler: ActionHandler = async (
  params: ChangeTableDataParams,
  _context: EventContext
): Promise<ActionResult> => {
  try {
    const { table, data, nodeProp, showForm } = params

    // 检查必要的参数
    if (!table?.id || !data?.id) {
      throw new Error('缺少必要的表或数据ID')
    }

    // 构建 API
    const api = createAPI({ name: 'core/t' })

    // 如果需要弹出表单
    if (showForm) {
      // 获取表的 schema
      const schemaApi = createAPI({ name: 'core/t/schema' })
      const schema = await schemaApi.get(table.id)

      // 获取当前数据
      const dataApi = createAPI({ name: `core/t/${table.id}/d/` })
      const currentData = await dataApi.get(data.id)

      const formData = await showSchemaFormDialog({
        schema: schema.schema,
        formSchema: schema.formSchema || ['number-7B4F'],
        initialValues: currentData,
        title: '修改数据',
        description: `修改表 ${table.name || table.id} 的数据`,
      })

      // 用户取消操作
      if (!formData) {
        return { success: true, data: { table, data, cancelled: true } }
      }

      // 构建修改数据
      const changeData = formData

      // 调用 API 修改数据
      await api.fetch(`/${table.id}/d/${data.id}`, {
        method: 'PATCH',
        noMessage: true,
        body: JSON.stringify(changeData)
      })
    } else {
      // 直接修改模式
      let changeData = (nodeProp || []).reduce((prev, cur: { key?: string; value?: any }) => ({
        ...prev,
        [cur?.key as string]: cur?.value
      }), {})

      await api.fetch(`/${table.id}/d/${data.id}`, {
        method: 'PATCH',
        noMessage: true,
        body: JSON.stringify(changeData)
      })
    }

    showResultMessage({ success: true }, params)

    return { success: true, data: { table, data } }
  } catch (error) {
    const result: ActionResult = {
      success: false,
      error: error instanceof Error ? error.message : '修改表数据失败',
    }
    showResultMessage(result, params)
    return result
  }
}
