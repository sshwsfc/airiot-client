/**
 * 修改数据点配置处理器
 */

import type {
  ActionHandler,
  ActionResult,
  EventContext,
  ChangeDataPointParams,
} from '../events.types'
import { showSchemaFormDialog } from '../dialog-atom'
import { createAPI } from '../../api'
import get from 'lodash/get.js'
import set from 'lodash/set.js'
import { showResultMessage } from './utils'

/**
 * 更新资产数据点
 */
async function updateRecordDataPoint(
  dp: any,
  pointValue: any
): Promise<void> {
  const recordDataPoint = dp.recordDataPoint
  const tableId = recordDataPoint?.tableId
  const tableDataId = recordDataPoint?.tableDataId
  const tagId = recordDataPoint?.tagId

  if (!tableDataId || !tableId) {
    throw new Error('资产数据点缺少 tableId 或 tableDataId')
  }

  // 查询资产数据
  const dataApi = createAPI({ name: `core/t/${tableId}/d` })
  const { items } = await dataApi.query(
    { fields: ['device'] },
    { where: { id: { '$in': [tableDataId] } } }
  )

  const oldData = items?.[0]?._settings
  if (!oldData) {
    throw new Error('找不到资产数据')
  }

  // 更新数据点值
  let hasTag = false
  oldData.device?.tags?.forEach((tag: any) => {
    if (tag.id === tagId) {
      set(tag, dp.key, pointValue)
      hasTag = true
    }
  })

  if (!hasTag) {
    throw new Error(`资产数据中找不到数据点 ${tagId}`)
  }

  // 准备保存数据
  oldData.tableInfo = { id: tableId }
  oldData.tableData = { id: tableDataId }
  oldData.id = tableDataId

  // 保存到 record
  const recordApi = createAPI({ name: 'core/t' })
  await recordApi.fetch(`/record`, {
    method: 'POST',
    noMessage: true,
    body: JSON.stringify(oldData),
  })
}

/**
 * 更新模型数据点
 */
async function updateTableDataPoint(
  dp: any,
  pointValue: any
): Promise<void> {
  const tableDataPoint = dp.tableDataPoint
  const tableId = tableDataPoint?.tableId
  const tagId = tableDataPoint?.tagId

  if (!tableId) {
    throw new Error('模型数据点缺少 tableId')
  }

  // 查询模型数据
  const schemaApi = createAPI({ name: 'core/t/schema' })
  const { items } = await schemaApi.query(
    { fields: ['device'] },
    { where: { id: { '$in': [tableId] } } }
  )

  const oldData = items?.[0]
  if (!oldData) {
    throw new Error('找不到模型数据')
  }

  // 更新数据点值
  let hasTag = false
  oldData.device?.tags?.forEach((tag: any) => {
    if (tag.id === tagId) {
      set(tag, dp.key, pointValue)
      hasTag = true
    }
  })

  if (!hasTag) {
    throw new Error(`模型数据中找不到数据点 ${tagId}`)
  }

  // 保存到 schema
  const updateApi = createAPI({ name: 'core/t' })
  await updateApi.fetch(`/schema/${tableId}`, {
    method: 'PATCH',
    noMessage: true,
    body: JSON.stringify(oldData),
  })
}

export const changeDataPointHandler: ActionHandler = async (
  params: ChangeDataPointParams,
  _context: EventContext
): Promise<ActionResult> => {
  try {
    const { dataPointMulti, showForm } = params

    if (!dataPointMulti || dataPointMulti.length === 0) {
      throw new Error('缺少 dataPointMulti 参数')
    }

    // 如果是弹出表单模式
    if (showForm) {
      // 获取当前的数据点值
      const initialValues: any = {}

      // 查询每个数据点的当前值
      for (const dp of dataPointMulti) {
        if (dp.recordDataPoint) {
          const { tableId, tableDataId, tagId } = dp.recordDataPoint

          if (tableDataId && tableId) {
            const dataApi = createAPI({ name: `core/t/${tableId}/d` })
            const { items } = await dataApi.query(
              { fields: ['device'] },
              { where: { id: { '$in': [tableDataId] } } }
            )

            const oldData = items?.[0]?._settings
            const tag = oldData?.device?.tags?.find((t: any) => t.id === tagId)

            if (tag) {
              initialValues[dp.key] = get(tag, dp.key)
            }
          }
        } else if (dp.tableDataPoint) {
          const { tableId, tagId } = dp.tableDataPoint

          if (tableId) {
            const schemaApi = createAPI({ name: 'core/t/schema' })
            const { items } = await schemaApi.query(
              { fields: ['device'] },
              { where: { id: { '$in': [tableId] } } }
            )

            const oldData = items?.[0]
            const tag = oldData?.device?.tags?.find((t: any) => t.id === tagId)
            if (tag) {
              initialValues[dp.key] = get(tag, dp.key)
            }
          }
        }
      }

      // 弹出表单对话框
      const formData = await showSchemaFormDialog({
        formSchema: {},
        schema: {},
        initialValues,
        title: '修改数据点',
        description: `请填写要修改的数据点值`,
      })

      // 用户取消操作
      if (!formData) {
        return { success: true, data: { dataPointMulti, cancelled: true } }
      }

      // 构建表单值数组
      const formValues = dataPointMulti.map(dp => formData[dp.key])

      // 更新数据点
      const results: any[] = []
      for (let i = 0; i < dataPointMulti.length; i++) {
        const dp = dataPointMulti[i]
        const pointValue = formValues[i]

        if (dp.recordDataPoint) {
          // 资产数据点
          await updateRecordDataPoint(dp, pointValue)
          results.push({ type: 'record', recordDataPoint: dp.recordDataPoint, value: pointValue })
        } else if (dp.tableDataPoint) {
          // 模型数据点
          await updateTableDataPoint(dp, pointValue)
          results.push({ type: 'table', tableDataPoint: dp.tableDataPoint, value: pointValue })
        } else {
          throw new Error(`数据点配置错误：既没有 recordDataPoint 也没有 tableDataPoint`)
        }
      }

      showResultMessage({ success: true }, params)

      return { success: true, data: { results } }
    } else {
      // 直接修改模式 - 使用每个元素内部的 value
      const results: any[] = []

      // 遍历所有数据点进行更新
      for (const dp of dataPointMulti) {
        const pointValue = dp.value

        if (dp.recordDataPoint) {
          // 资产数据点
          await updateRecordDataPoint(dp, pointValue)
          results.push({ type: 'record', recordDataPoint: dp.recordDataPoint, value: pointValue })
        } else if (dp.tableDataPoint) {
          // 模型数据点
          await updateTableDataPoint(dp, pointValue)
          results.push({ type: 'table', tableDataPoint: dp.tableDataPoint, value: pointValue })
        } else {
          throw new Error(`数据点配置错误：既没有 recordDataPoint 也没有 tableDataPoint`)
        }
      }

      showResultMessage({ success: true }, params)

      return { success: true, data: { results } }
    }
  } catch (error) {
    const result: ActionResult = {
      success: false,
      error: error instanceof Error ? error.message : '修改数据点配置失败',
    }
    showResultMessage(result, params)
    return result
  }
}
