/**
 * 发送请求处理器
 */

import type {
  ActionHandler,
  ActionResult,
  EventContext,
} from '../events.types'
import { createAPI } from '../../api'
import { showResultMessage } from './utils'
import _ from 'lodash'

const arrayToKv = (arr: Array<{ name?: string, value?: any }>) => {
  const ky: Record<string, any> = {}
  arr?.forEach(item => {
    if (item && !_.isEmpty(item) && item.name && item.value !== undefined) {
      ky[item.name] = item.value
    }
  })
  return ky
}

function objToUrlParams(obj: Record<string, any>, url: string) {
  try {
    if (!_.isString(url)) {
      return ''
    }
    let params = "";
    for (let key in obj) {
      if (obj.hasOwnProperty(key)) {
        if (Array.isArray(obj[key])) {
          let arrayParams = "";
          for (let i = 0; i < obj[key].length; i++) {
            arrayParams += key + "=" + obj[key][i].toString() + "&";
          }
          params += arrayParams.slice(0, -1); // remove last "&"
        } else if (typeof obj[key] === "object" && obj[key] !== null) {
          let nestedParams = objToUrlParams(obj[key], url);
          params += key + "=" + nestedParams + "&";
        } else {
          params += key + "=" + obj[key].toString() + "&";
        }
      }
    }
    params = params.slice(0, -1); // remove last "&"
    const separator = url.includes("?") ? "&" : "?";
    return url + separator + params;
  } catch {
    return ''
  }
}

export const sendRequestHandler: ActionHandler = async (
  params: any,
  _context: EventContext
): Promise<ActionResult> => {
  try {
    const { type, method = 'GET', url, headers = [], body = [], table, dataId, appkey, appsecret = {}, params: requestParams, op } = params
    if (type === 'inside') { // 平台接口
      let path = url
      if (table?.id) {
        path = url.replace('{table}', table.id).replace('{dataId}', dataId).replace('#add', '').replace('#del', '')
      } else if (appkey) {
        path = url.replace('{appkey}', appkey).replace('{appsecret}', appsecret)
      }
      if (!path) return { success: false, error: 'Invalid request path' }
      const apiClient = createAPI({ name: method === 'GET' ? objToUrlParams(arrayToKv(body), path) : path })
      await apiClient.fetch('', {
        method,
        noMessage: true,
        headers: arrayToKv(headers),
        body: (method === 'GET' || method === 'DELETE') ? '' : JSON.stringify(arrayToKv(body))
      })
    } else if (type === 'dataApi') { // 数据接口
      const path = op?.key ? `ds/p/${op.key}` : undefined
      if (path) {
        const apiClient = createAPI({ name: path })
        await apiClient.fetch('', {
          method: 'POST',
          noMessage: true,
          body: JSON.stringify(requestParams?.value || {})
        })
      } else {
        return { success: false, error: 'Invalid data API configuration' }
      }
    } else {
      return { success: false, error: `Unsupported request type: ${type}` }
    }

    showResultMessage({ success: true }, params)

    return {
      success: true,
      data: {
        type,
        method,
        url,
        params: requestParams
      },
    }
  } catch (error) {
    const result: ActionResult = {
      success: false,
      error: error instanceof Error ? error.message : '发送请求失败',
    }
    showResultMessage(result, params)
    return result
  }
}
