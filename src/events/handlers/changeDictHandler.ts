/**
 * 修改数据字典处理器
 */

import type {
  ActionHandler,
  ActionResult,
  EventContext,
  ChangeDictParams,
} from '../events.types'
import { createAPI } from '../../api'
import _ from 'lodash'
import { showResultMessage } from './utils'

/**
 * 类型转换函数
 * 根据系统变量的类型将值转换为相应的格式
 */
function convertValueByType(value: any, systemVarType: string): any {
  try {
    if (systemVarType === 'number') {
      const numValue = parseInt(value, 10)
      if (_.isNaN(numValue)) {
        throw new Error('转数字失败')
      }
      return numValue
    } else if (systemVarType === 'object') {
      if (!_.isObject(value)) {
        const parsed = JSON.parse(value)
        if (!_.isObject(parsed)) {
          throw new Error('值不是有效的对象')
        }
        return parsed
      }
      return value
    } else if (systemVarType === 'array') {
      if (!_.isArray(value)) {
        const parsed = JSON.parse(value)
        if (!_.isArray(parsed)) {
          throw new Error('值不是有效的数组')
        }
        return parsed
      }
      return value
    } else if (systemVarType === 'boolean') {
      return !!(value && value !== 'false')
    }
    return value
  } catch (e) {
    // 转换失败时返回原始值
    return value
  }
}

export const changeDictHandler: ActionHandler = async (
  params: ChangeDictParams,
  _context: EventContext
): Promise<ActionResult> => {
  try {
    const { systemVar, value } = params

    if (!systemVar?.path) {
      throw new Error('缺少 systemVar.path 参数')
    }

    // 解析路径：第一个点是变量名，后面的是属性路径
    const path = systemVar.path
    const pathArray = path.split('.')
    const name = pathArray[0]
    const prop = pathArray.length > 1 ? pathArray.slice(1).join('.') : null

    // 构建查询系统变量的 API
    const queryApi = createAPI({ name: 'core/systemVariable' })

    // 查询系统变量
    const queryResult = await queryApi.query(
      { fields: ['value', 'type'] },
      { where: { name } }
    )

    const currentSystemVar = queryResult.items?.[0]
    if (!currentSystemVar?.id) {
      throw new Error(`找不到名为 "${name}" 的系统变量`)
    }

    // 类型转换
    let convertedValue = convertValueByType(value, currentSystemVar.type)

    // 计算新值：如果有属性路径则使用 lodash.set 更新嵌套属性
    let resultValue: any
    if (prop) {
      resultValue = _.set(currentSystemVar.value, prop, convertedValue)
    } else {
      resultValue = convertedValue
    }

    // 调用 API 更新系统变量
    const updateApi = createAPI({ name: 'core/systemVariable' })
    await updateApi.fetch(`/${currentSystemVar.id}`, {
      method: 'PATCH',
      noMessage: true,
      body: JSON.stringify({ value: resultValue }),
    })

    showResultMessage({ success: true }, params)

    return { success: true, data: { systemVar, value: resultValue } }
  } catch (error) {
    const result: ActionResult = {
      success: false,
      error: error instanceof Error ? error.message : '修改数据字典失败',
    }
    showResultMessage(result, params)
    return result
  }
}
