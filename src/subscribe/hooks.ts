import { useAtomValue, useSetAtom } from 'jotai'
import { useAtomCallback } from 'jotai/utils'
import React from 'react'
import _ from 'lodash'
import type { TagOptions, DataPropOptions, SubTag, SubData, TagValue } from './types'
import { dataPropSelector, tagsState, dataState, referenceState, tagsTimeoutSelector } from './atoms'
import { SubscribeContext } from './Store'
import { useCellDataValue } from '../page/hooks/context'
import { usePageStore } from '../page/hooks/util'

// ============================================================================
// Context Hooks
// ============================================================================

export function useSubscribeContext() {
  const context = React.useContext(SubscribeContext)
  if (!context) {
    throw new Error('useSubscribeContext must be used within Subscribe provider')
  }
  return context
}

// ============================================================================
// Tag Hooks
// ============================================================================
export function useTagValue(options: TagOptions) {
  const { tableId, dataId, tagId } = options
  return useAtomValue(tagsState(`${tableId}|${dataId}|${tagId}`), { store: usePageStore() })
}

export function useTag(options: TagOptions) {
  const { subscribeTags } = useSubscribeContext()
  const tableDataContext = useCellDataValue()?.tableData

  let dataId, tableId, tagId = options.tagId

  if (options.dataId) {
    dataId = options.dataId
    tableId = options.tableId
  } else {
    dataId = tableDataContext?.id
    tableId = tableDataContext?.table?.id || tableDataContext?._table
  }

  React.useEffect(() => {
    if (dataId && tableId && tagId) {
      const subTags: SubTag[] = [{ tableId, dataId, tagId }]
      subscribeTags(subTags)
    }
  }, [dataId, tableId, tagId, subscribeTags])

  return useTagValue({ tableId, dataId, tagId })
}

export function useUpdateTags() {
  return useAtomCallback(React.useCallback((get, set, newValue: Record<string, TagValue> | null | undefined) => {
      if (newValue && _.isPlainObject(newValue)) {
        Object.keys(newValue).forEach((id: string) => {
          const value = newValue[id]
          const prevValue = get(tagsState(id))
          set(tagsState(id), { ...(prevValue || {}), ...value })
        })
      }
    }, []), { store: usePageStore() })
}

export function useUpdateMeta() {
  return useAtomCallback(React.useCallback((get, set, newValue: Record<string, any> | null | undefined) => {
      if (newValue && _.isPlainObject(newValue)) {
        Object.keys(newValue).forEach((id: string) => {
          const value = newValue[id]
          const prevValue = get(tagsState(id))
          set(tagsState(id), { ...(prevValue || {}), meta: value })
        })
      }
    }, []), { store: usePageStore() })
}

// ============================================================================
// Data Hooks
// ============================================================================
export function useTableData(options: DataPropOptions) {
  const { subscribeData } = useSubscribeContext()
  const tableDataContext = useCellDataValue()?.tableData

  let dataId, tableId

  if (options.dataId) {
    dataId = options.dataId
    tableId = options.tableId
  } else {
    dataId = tableDataContext?.id
    tableId = tableDataContext?.table?.id || tableDataContext?._table
  }

  const newOptions: DataPropOptions = {
    ...options,
    dataId,
    tableId
  }

  React.useEffect(() => {
    if (dataId && tableId && options.field) {
      const subDataIds: SubData[] = [{ tableId, dataId, fields: [options.field] }]
      subscribeData(subDataIds)
    }
  }, [dataId, tableId, options.field, subscribeData])

  return useTableDataValue(newOptions)
}

export function useTableDataValue(options: DataPropOptions) {
  return useAtomValue(dataPropSelector(options), { store: usePageStore() })
}

export function useUpdateData() {
  return useAtomCallback(React.useCallback((get, set, newValue: Record<string, any> | null | undefined) => {
      if (newValue && _.isPlainObject(newValue)) {
        Object.keys(newValue).forEach((dataId: string) => {
          const value = newValue[dataId]
          const prevValue = get(dataState(dataId))
          set(dataState(dataId), { ...(prevValue || {}), ...value })
        })
      }
    }, []), { store: usePageStore() })
}

// ============================================================================
// Tag Timeout Hooks
// ============================================================================

export function useUpdateTagsTimeout() {
  return useSetAtom(tagsTimeoutSelector, { store: usePageStore() })
}

// ============================================================================
// Reference/Compute Hooks
// ============================================================================

export function useReferenceValue(tableId: string, tableDataId: string, field: string) {
  return useAtomValue(referenceState(`${tableId}#%${tableDataId}#%${field}`), { store: usePageStore() })
}

export function useUpdateReference() {
  return useAtomCallback(React.useCallback((_get, set, newValue: any) => {
      if (newValue?.tableId && newValue?.tableDataId && newValue?.field) {
        const id = newValue.tableId + '#%' + newValue.tableDataId + '#%' + newValue.field
        set(referenceState(id), newValue.value || 'computing')
      }
    }, []), { store: usePageStore() })
}

