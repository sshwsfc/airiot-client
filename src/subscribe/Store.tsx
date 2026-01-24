import _ from 'lodash'
import React from 'react'
import { createStore } from 'jotai'
import api from '../api'

import { queryLastData } from './queries'
import worker from './worker'
import type { SubTag, SubData } from './types'

import { useUpdateTagsTimeout, useUpdateTags, useUpdateReference, useUpdateData } from './hooks'
import { useWS } from './ws'

// ============================================================================
// Context Types
// ============================================================================

interface SubscribeContextValue {
  store: ReturnType<typeof createStore>

  subscribeTags: (tags: SubTag[], clear?: boolean) => void
  subscribeData: (dataIds: SubData[], clear?: boolean) => void
}

const SubscribeContext = React.createContext<SubscribeContextValue | null>(null)

// Export type for external use
export type { SubscribeContextValue }

// ============================================================================
// Hooks (framework dependencies)
// ============================================================================

declare function use(key: string, ...args: any[]): any

function useTableTagWarning() {
  return use('table.tag.warning')
}

function useWarningWs(options?: { recoveryStatus: string }) {
  return use('warning.ws', options)
}

// ============================================================================
// Internal Components
// ============================================================================

const performance = true

const useDataTagSubscribe = () => {
  const unsubscribe = React.useRef<() => void>(() => {})
  const warehouse = React.useRef<Record<string, any>>({})

  const updateTags = useUpdateTags()

  const { subscribe, onData } = useWS()

  const update = React.useCallback(
    _.debounce((data: Record<string, any>) => {
      updateTags(data)
      warehouse.current = {}
    }, 500, { 'maxWait': 1000 }),
    [updateTags]
  )

  onData((data: any) => {
    if (data && _.isPlainObject(data)) {
      const dataId = data.tableDataId || data.id
      const tableId = data.tableId
      const tags = data.fields
      const time = data.time
      const payload: Record<string, any> = {}
      Object.keys(tags).forEach((tagId: string) => {
        payload[`${tableId}|${dataId}|${tagId}`] = { value: tags[tagId], time: time }
      })
      if (performance) {
        warehouse.current = {
          ...warehouse.current,
          ...payload
        }
        update(warehouse.current)
      } else {
        updateTags(payload)
      }
    }
  })

  // Subscribe to WebSocket
  const debouncedSubscribe = React.useCallback(
    _.debounce((subTags: SubTag[]) => {
      if (unsubscribe.current) {
        unsubscribe.current()
      }
      if (subTags.length > 0) {
        unsubscribe.current = subscribe('data', subTags)
      }
    }, 500),
    []
  )

  // Query initial data and subscribe
  const subscribeTags = React.useCallback((subTags: SubTag[]) => {
    if (subTags && subTags.length > 0) {
      queryLastData(subTags, updateTags)
      debouncedSubscribe(subTags)
    }
  }, [])

  // Cleanup
  React.useEffect(() => {
    return () => {
      update.cancel()
      debouncedSubscribe.cancel()
      if (unsubscribe.current) {
        unsubscribe.current()
      }
    }
  }, [])

  return { subscribe: subscribeTags }
}

const useTableDataSubscribe = () => {
  const unsubscribe = React.useRef<() => void>(() => {})
  const warehouseNode = React.useRef<Record<string, any>>({})
  const updateData = useUpdateData()

  const { onData: onDataNode, subscribe: subscribeNode } = useWS()

  const updateNode = React.useCallback(
    _.debounce((data: Record<string, any>) => {
      updateData(data)
      warehouseNode.current = {}
    }, 500, { 'maxWait': 1000 }),
    [updateData]
  )

  // Handle incoming data
  onDataNode((data: any) => {
    if (performance) {
      warehouseNode.current = {
        ...warehouseNode.current,
        [data.tableDataId]: { ...(warehouseNode.current[data.tableDataId] || {}), ...data }
      }
      updateNode(warehouseNode.current)
    } else {
      updateData({ [data?.tableDataId]: data })
    }
  })

  // Subscribe to WebSocket
  const debouncedSubscribeNode = React.useCallback(
    _.debounce((subDataIds: SubData[]) => {
      if (unsubscribe.current) {
        unsubscribe.current()
      }
      if (subDataIds.length > 0) {
        unsubscribe.current = subscribeNode('tabledata', subDataIds)
      }
    }, 500),
    []
  )

  // Cleanup
  React.useEffect(() => {
    return () => {
      updateNode.cancel()
      debouncedSubscribeNode.cancel()
      if (unsubscribe.current) {
        unsubscribe.current()
      }
    }
  }, [])

  return { subscribe: debouncedSubscribeNode}
}

const useTagWarningSubscribe = () => {
  const updataTagWarning = useTableTagWarning()
  const { data } = useWarningWs({ recoveryStatus: '已恢复' })

  const newWarning = data?.[data?.length - 1]

  const getTableWarning = React.useCallback(async (subTags: SubTag[]) => {
    if (!_.isArray(subTags) || !subTags) return

    const subKeys: Record<string, boolean> = {}
    const t: Record<string, string[]> = {}

    subTags.forEach((tag: SubTag) => {
      subKeys[`${tag.tableId}-${tag.dataId}-${tag.tagId}`] = true
      t[tag.tableId] = [...(t[tag.tableId] || []), tag.dataId!]
    })

    const data: { tableId: string; data: string[] }[] = []
    Object.keys(t).forEach((ele: string) => {
      data.push({ tableId: ele, data: [...new Set(t[ele])].filter(Boolean) as string[] })
    })

    const f = encodeURIComponent(JSON.stringify(data))
    api({ name: 'warning/warning/stats/latest' })
      .fetch(`?tableData=${f}`, {})
      .then((res) => {
        const w = res?.json
        if (w && w.length > 0) {
          w.forEach((warningInfo: any) => {
            const fields = warningInfo?.fields
            const table = warningInfo?.table
            const tableData = warningInfo?.tableData
            table?.id && tableData?.id && fields?.forEach((field: any) => {
              const key = `${table.id}-${tableData.id}-${field.id}`
              if (subKeys[key]) {
                updataTagWarning(warningInfo)
              }
            })
          })
        }
      })
      .catch((error: any) => {
        console.error('获取记录报警信息失败!', error?.detail || error?.json?.detail)
      })
  }, [updataTagWarning])

  const debouncedGetTableWarning = React.useCallback(
    _.debounce(getTableWarning, 500),
    [getTableWarning]
  )

  React.useEffect(() => {
    if (newWarning) {
      updataTagWarning(newWarning)
    }
  }, [newWarning?.id, updataTagWarning])

  return { subscribe: debouncedGetTableWarning}
}

const TagsTimeoutStatus: React.FC = () => {
  const timeoutSetter = useUpdateTagsTimeout()

  React.useEffect(() => {
    worker.onmessage = (event) => {
      timeoutSetter(event.data)
    }
  }, [timeoutSetter])

  return null
}

const ComputeManager: React.FC = () => {
  const updateReference = useUpdateReference()
  const { onData: onDataCompute, subscribe: subscribeCompute } = useWS()

  onDataCompute((data: any) => {
    updateReference(data)
  })

  React.useEffect(() => {
    const projectId = location.pathname.split('/').find(p => p.startsWith('_p_'))?.substring(3)
    subscribeCompute('computerecord', { projectId })
  }, [])

  return null
}

// ============================================================================
// Provider Component
// ============================================================================

interface StoreProps {
  children: React.ReactNode
}

const Subscribe: React.FC<StoreProps> = ({ children }) => {
  const [store] = React.useState(() => createStore())
  // Use refs to track subscriptions
  const subscribedTagsRef = React.useRef<SubTag[]>([])
  const subscribedDataRef = React.useRef<SubData[]>([])

  const { subscribe: tagsSubscribe } = useDataTagSubscribe()
  const { subscribe: tagsWarningSubscribe } = useTagWarningSubscribe()
  const { subscribe: dataSubscribe } = useTableDataSubscribe()

  // Subscribe tags method
  const subscribeTags = React.useCallback((tags: SubTag[], clearBefore: boolean | undefined) => {
    const current = subscribedTagsRef.current
    const newTags = clearBefore ? tags : tags.filter(tag =>
      !current.some(ct =>
        ct.tableId === tag.tableId &&
        ct.dataId === tag.dataId &&
        ct.tagId === tag.tagId
      )
    )
    if (newTags.length > 0) {
      subscribedTagsRef.current = clearBefore ? newTags : [...current, ...newTags]
    }
    tagsSubscribe(subscribedTagsRef.current)
    tagsWarningSubscribe(subscribedTagsRef.current)
  }, [tagsSubscribe, tagsWarningSubscribe])

  // Subscribe data method
  const subscribeData = React.useCallback((dataIds: SubData[], clearBefore: boolean | undefined) => {
    const current = subscribedDataRef.current
    const newDataIds = clearBefore ? dataIds : dataIds.filter(dataId =>
      !current.some(cd =>
        cd.tableId === dataId.tableId &&
        cd.dataId === dataId.dataId &&
        _.isEqual(cd.fields, dataId.fields)
      )
    )
    if (newDataIds.length > 0) {
      subscribedDataRef.current = clearBefore ? newDataIds : [...current, ...newDataIds]
    }
    dataSubscribe(subscribedDataRef.current)
  }, [dataSubscribe])

  const contextValue: SubscribeContextValue = React.useMemo(() => ({
    store,
    subscribeTags,
    subscribeData
  }), [
    store,
    subscribeTags,
    subscribeData
  ])

  return (
    <SubscribeContext.Provider value={contextValue}>
      <ComputeManager />
      <TagsTimeoutStatus />
      {children}
    </SubscribeContext.Provider>
  )
}

export default Subscribe
export { SubscribeContext, worker, Subscribe }
