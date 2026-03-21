/**
 * Handler 工具函数
 */

import type {
  ActionResult,
  ResultMessage,
} from '../events.types'
import { useMessage } from '../../hooks'

/**
 * 显示执行结果消息
 */
export function showResultMessage(
  result: ActionResult,
  resultConfig?: ResultMessage
) {
  const toast = useMessage()
  if (!resultConfig) return

  if (result.success) {
    if (resultConfig.successMess !== false) {
      toast.success(resultConfig.successContent || '操作成功')
    }
  } else {
    if (resultConfig.errorMess !== false) {
      toast.error(resultConfig.errorContent || result.error || '操作失败')
    }
  }
}
