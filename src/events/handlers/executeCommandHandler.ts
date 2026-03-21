/**
 * 执行指令处理器
 */

import type {
  ActionHandler,
  ActionResult,
  EventContext,
} from '../events.types'
import { createAPI } from '../../api'
import { showResultMessage } from './utils'
import { showSchemaFormDialog } from '../dialog-atom'
import _ from 'lodash'

// 临时方法，确保不报错
// const getQueryFilter = (commandNodeFilter: any = {}, schema: any = {}) => {
//   // 简单实现，确保不报错
//   return commandNodeFilter || {}
// }

// 创建请求参数的通用函数
const buildCommandRequest = (command: any, commandType: string, deviceId: any, params: any, modelId: any) => {
  const baseData: any = {
    ..._.omit(command, 'id'),
    name: command.name,
    params,
    _nonce: Math.random()
  }

  // 添加设备相关字段
  if (deviceId) {
    baseData.tableData = deviceId
  }
  if (modelId) {
    baseData.table = modelId
  }

  // 添加其他可选字段
  if (command.modelId) { baseData.modelId = command.modelId }
  if (command.nodeId) { baseData.nodeId = command.nodeId }
  if (command.type) { baseData.type = command.type }
  if (commandType === 'point') { baseData.id = command.id || command.tag?.id }

  return baseData
}

// 发送单个命令的函数
const sendCommand = async (commandType: string, command: any, deviceId: any, params: any, modelId: any) => {
  const apiName = commandType === 'point' ? `driver/driver/tag` : `driver/driver/command`
  const sendAPI = createAPI({ name: apiName })
  const data = buildCommandRequest(command, commandType, deviceId, params, modelId)

  await sendAPI.fetch('', {
    method: 'POST',
    noMessage: true,
    body: JSON.stringify(data)
  })

  // 获取响应数据
  const response = await sendAPI.getOrigin('')
  return response?.json || {}
}

// 根据 command.form 构造 schema
const buildSchemaFromForm = (form: any[]) => {
  if (!Array.isArray(form)) return {}

  const properties: any = {}
  const required: string[] = []

  form.forEach(field => {
    if (field.name) {
      const fieldSchema: any = {
        type: field.type || 'string',
        title: field.showName || field.title || field.name,
        default: field.defaultValue?.default
      }

      // 根据类型添加特定的验证规则
      if (field.type === 'string') {
        fieldSchema.minLength = 1
      } else if (field.type === 'number') {
        fieldSchema.minimum = 0
      } else if (field.type === 'boolean') {
        fieldSchema.type = 'boolean'
      }

      properties[field.name] = fieldSchema

      // 如果有默认值，则不是必填
      if (field.defaultValue?.default === undefined) {
        required.push(field.name)
      }
    }
  })

  return {
    type: 'object',
    properties,
    required: required.length > 0 ? required : undefined
  }
}

// 批量执行的策略枚举
const ExecutionStrategy = {
  SERIAL: 'serial',      // 串行执行
  PARALLEL: 'parallel',   // 并行执行
  ASYNC_BATCH: 'async'    // 异步批量
}

export const executeCommandHandler: ActionHandler = async (
  params: any,
  _context: EventContext
): Promise<ActionResult> => {
  try {
    const {
      commandType, commandModel, commandNode, commandStyle, commandBatchType, isAsync,
      commandNodes, commandNodeFilter, commandValue, command, showForm
    } = params

    let finalCommandValue = commandValue

    // 如果 showForm 为 true，显示表单让用户输入参数
    if (showForm && command?.form) {
      const schema = buildSchemaFromForm(command.form)
      const formData = await showSchemaFormDialog({
        schema,
        title: '执行指令',
        description: `请输入指令 ${command.name || command.title || ''} 的参数`,
      })

      if (!formData) {
        return { success: true, data: { cancelled: true } }
      }

      finalCommandValue = formData
    }

    // 布尔类型指令，默认是false
    if (command?.tag?.dataType === 'Boolean') {
      finalCommandValue = finalCommandValue ?? false
    }

    let nodeId, modelId: any

    // 根据 commandType 处理不同逻辑
    if (commandType === 'node') { // 单个资产
      nodeId = commandNode?.id
      modelId = commandNode?.table?.id
      if (!nodeId) {
        return { success: false, error: '未指定节点ID' }
      }

      // 直接发送单个请求
      const result = await sendCommand(commandType, command, nodeId, finalCommandValue, modelId)
      showResultMessage({ success: true }, params)
      return { success: true, data: result }
    }
    else if (commandType === 'model') { // 多个资产
      modelId = commandModel?.id

      if (isAsync) { // 异步批量 - 使用 ExecutionStrategy.ASYNC_BATCH
        // using a flexible record so we can assign arbitrary keys later
        const batchParams: Record<string, any> = {
          tableId: commandModel?.id  // 提取公共的 tableId
        }
        if (commandStyle) {
          // 使用条件查询
          // const table = await createAPI({ name: 'core/t/schema' }).get(commandModel?.id)
          const query = { filter: commandNodeFilter }
          batchParams['query'] = JSON.stringify(query)
        } else {
          // 直接使用节点列表
          batchParams['tableDataIds'] = (_.isArray(commandNodes) && commandNodes?.map(node => node?.id)) || []
        }
  
        // 批量执行异步指令
        const sendAPI = createAPI({ name: `driver/driver/batchRun` })
        const data = {
          command: { ..._.omit(command, 'id'), params: finalCommandValue },
          ...batchParams,
          type: commandBatchType || 'sync'  // 添加缺失的 type 参数
        }

        const response = await sendAPI.fetch('', {
          method: 'POST',
          noMessage: true,
          body: JSON.stringify(data)
        })

        showResultMessage({ success: true }, params)
        return { success: true, data: response?.json || {} }
      } else { // 同步批量 - 使用串行或并行执行
        if (commandStyle) {
          // 查询符合条件的节点
          // const table = await createAPI({ name: 'core/t/schema' }).get(commandModel?.id)
          const filter = commandNodeFilter //getQueryFilter(commandNodeFilter, table?.schema)
          const nodeList = await createAPI({ name: `core/t/${commandModel?.id}/d` }).query(
            { fields: ['id'] },
            { where: filter }
          ).then(({ items }) => items)
          nodeId = nodeList?.map(d => d.id) || []
        } else {
          // 直接使用节点列表
          nodeId = _.isArray(commandNodes) ? commandNodes.map(node => node?.id) : []
        }

        if (nodeId.length === 0) {
          return { success: false, error: '未找到符合条件的节点' }
        }

        // 根据策略执行：默认串行
        const executionStrategy = commandBatchType === 'sync' ? ExecutionStrategy.SERIAL : ExecutionStrategy.PARALLEL

        if (executionStrategy === ExecutionStrategy.SERIAL) {
          // 串行执行 - 确保顺序执行，适合需要严格顺序的场景
          for (const id of nodeId) {
            await sendCommand(commandType, command, id,
              { [command?.name]: finalCommandValue },
              modelId
            )
          }
        } else {
          // 并行执行 - 提高性能，适合可以乱序的场景
          const commandPayload = { [command?.name]: finalCommandValue }
          await Promise.all(
            nodeId.map(id =>
              sendCommand(commandType, command, id, commandPayload, modelId)
            )
          )
        }

        showResultMessage({ success: true }, params)
        return { success: true, data: { executedCount: nodeId.length } }
      }
    }
    else if (commandType === 'point') { // 数据点
      nodeId = commandNode?.id
      if (!nodeId) {
        return { success: false, error: '未指定节点ID' }
      }

      // 单个数据点执行
      const result = await sendCommand(commandType, command, nodeId, finalCommandValue, modelId)
      showResultMessage({ success: true }, params)
      return { success: true, data: result }
    }

    return { success: false, error: '不支持的指令类型' }
  } catch (error) {
    const result: ActionResult = {
      success: false,
      error: error instanceof Error ? error.message : '执行指令失败',
    }
    showResultMessage(result, params)
    return result
  }
}
