import api from '../api'
import _ from 'lodash'
import dayjs from 'dayjs'
import type { SubTag, SubData, TagNode, TagItem } from './types'

const parseTags = (node: any): TagNode => {
  if (node && _.isPlainObject(node)) {
    return Object.keys(node).reduce((prev: TagNode, curr: string) => {
      const k = node[curr] as TagItem[] | any
      if (k && _.isArray(k)) {
        return { ...prev, [k[0]?.id || curr]: parseTags(k) }
      } else {
        return { ...prev, [curr]: k }
      }
    }, {})
  } else if (_.isArray(node)) {
    return node.reduce<TagNode>((p, cur: TagItem) => {
      return { ...p, [cur.id || '']: cur }
    }, {})
  }
  return {}
}

const queryMeta = async (subTags: SubTag[], callback?: (res: any) => void): Promise<void> => {
  if (subTags && _.isArray(subTags)) {
    const tableIds: Record<string, string[]> = {}
    subTags.forEach(sub => {
      const tableId = sub?.tableId
      const dataId = sub?.dataId
      const tagId = sub?.tagId

      if (!tableIds[tableId]) {
        tableIds[tableId] = dataId ? [dataId] : []
      } else {
        const ids = dataId && tagId ? [...(tableIds[tableId] || []), dataId] : tableIds[tableId]
        tableIds[tableId] = Array.from(new Set(ids))
      }
    })
    const data: { tableId: string; ids: string[] }[] = []
    Object.keys(tableIds).forEach(k => {
      const ids = tableIds[k]
      if (ids && ids.length > 0) {
        data.push({ tableId: k, ids })
      }
    })
    if (data.length == 0) { return }
    const tagsdata = await api({ name: `core/t/tags` }).fetch('', {
      headers: { "X-Forwarded-Method-Override": "GET" },
      method: 'POST',
      body: JSON.stringify(data)
    })
      .then(({ json }) => json)
      .catch(error => {
        console.error('获取数据点配置失败', error?.detail || error?.json?.detail)
        return undefined
      })
    const res: Record<string, any> = {}

    if (tagsdata) {
      tagsdata.forEach((node: any, i: number) => {
        const tableid = data[i]?.tableId
        if (!tableid) return
        Object.keys(node).forEach(nodeid => {
          const tags: TagItem[] = node[nodeid]
          res[`${tableid}|${nodeid}`] = tags.reduce<Record<string, TagItem>>((p, c: TagItem) => {
            if (c.id) {
              return { ...p, [c.id]: c }
            }
            return p
          }, {})
        })
      })
    }
    callback?.(res)
  }
}

const queryLastData = (where: any[], callback?: (res: any) => void): void => {
  const filterwhere = where?.filter((f: SubTag) => f?.dataId)
  api({ name: 'core/data' })
    .fetch('/latest', {
      method: 'POST',
      body: JSON.stringify(filterwhere)
    })
    .then(({ json }) => {
      if (json && !_.isEmpty(json)) {
        const payload: Record<string, any> = {}
        json.forEach((item: any) => {
          const tableId = item.tableId
          const id = item.tableDataId || item.id
          const tagId = item.tagId
          payload[`${tableId}|${id}|${tagId}`] = { time: item.time, value: item.value }
        })
        callback?.(payload)
      }
    }).catch(_err => {
      callback?.(null)
    })
}

const queryTableDataFn = (tableId: string, tableData: SubData[]): Promise<any[]> => {
  let project: Record<string, number> = { _settings: 1 }
  const ids = tableData.map((data: SubData) => {
    data?.fields?.forEach((field: string) => { project[field] = 1 })
    return data?.dataId
  }).filter((id): id is string => Boolean(id))
  const where = JSON.stringify({
    limit: 99999,
    project,
    filter: { id: { "$in": Array.from(new Set(ids)) } }
  })
  return api({ name: `core/t/${tableId}/d` })
    .fetch(`?query=${where}`)
    .then(({ json }) => {
      if (json && !_.isEmpty(json)) {
        return json
      }
      return []
    }).catch(_err => {
      return []
    })
}

const getTableDataFn = (tableId: string, dataId: string): Promise<any> => {
  return api({ name: `core/t/${tableId}/d/${dataId}` })
    .fetch('', { method: 'GET' })
    .then(({ json }) => {
      if (json && !_.isEmpty(json)) {
        return json
      }
      return []
    }).catch(_err => {
      return []
    })
}

const queryTableData = (subDataIds: SubData[], callback?: (res: any[]) => void): void => {
  if (subDataIds && _.isArray(subDataIds)) {
    const tableIds: Record<string, SubData[] | string> = {}
    subDataIds.forEach(sub => {
      const tableId = sub?.tableId
      const dataId = sub?.dataId
      const fields = sub?.fields?.map((f: string) => f.indexOf('.') >= 0 ? f.split('.')[0] : f)
      if (!fields || _.isEmpty(fields)) return
      if (fields?.length == 1 && fields[0] == '') {
        if (dataId) {
          tableIds[tableId] = dataId
        }
      }
      if (fields?.indexOf('settings') >= 0) { fields?.push('_settings') }
      if (!tableIds[tableId]) {
        tableIds[tableId] = [{ tableId, dataId: dataId, fields }]
      } else if (_.isArray(tableIds[tableId])) {
        tableIds[tableId] = [...(tableIds[tableId] as SubData[]), { tableId, dataId: dataId, fields }]
      }
    })
    const promiseArray: Promise<any[]>[] = []
    const getPromiseArray: Promise<any>[] = []

    Object.keys(tableIds).forEach(tableId => {
      if (_.isArray(tableIds[tableId])) {
        promiseArray.push(queryTableDataFn(tableId, tableIds[tableId] as SubData[]))
      } else if (_.isString(tableIds[tableId])) {
        getPromiseArray.push(getTableDataFn(tableId, tableIds[tableId] as string))
      }
    })
    Promise.all(promiseArray).then(res => { callback?.(_.flatten(res)) })
    Promise.all(getPromiseArray).then(res => { callback?.(res) })
  }
}

const queryHistoryData = (tags: SubTag[], time: any, callback?: (res: any) => void): void => {
  const where = tags.map((tag: SubTag) => {
    return {
      fields: [`LAST("${tag.tagId}") AS "${tag.tagId}"`, 'id'],
      id: tag.dataId,
      tableId: tag?.tableId,
      where: [`time <= '${dayjs(time).toISOString()}'`]
    }
  })
  api({ name: 'core/data/query' }).fetch(``, {
    method: 'POST',
    body: JSON.stringify(where)
  }).then(({ json }) => {
    const payload: Record<string, any> = {}
    const results = json.results
    if (results && results.length > 0) {
      results.forEach((item: any) => {
        if (!item) return
        const values = item?.series && item?.series[0] && item?.series[0].values && item?.series[0].values[0]
        const columns = item?.series && item?.series[0] && item?.series[0].columns
        const tableId = item?.series && item?.series[0] && item?.series[0].name
        if (!values) return
        const time = values[0]
        const value = values[1]
        const uid = values[2]
        const tagId = columns[1]
        payload[`${tableId}|${uid}|${tagId}`] = { time, value }
      })
      callback?.(payload)
    }
  })
}

export {
  queryMeta,
  queryLastData,
  queryTableData,
  queryHistoryData
}
