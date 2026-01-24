import { atom } from 'jotai'
import { atomFamily } from 'jotai/utils'
import _ from 'lodash'
import type { DataPropOptions, TagValue } from './types'

// ============================================================================
// Store Atoms
// ============================================================================

// Tags subscription atoms
export const tagsState = atomFamily(() => atom<TagValue>({}))
export const tagsMetaState = atomFamily(() => atom<any>({}))
// Reference/Compute atoms
export const referenceState = atomFamily(() => atom<Record<string, any>>({}))
export const dataState = atomFamily(() => atom<any>({}))

export const tagsTimeoutSelector = atom(null,
  (get, set, data: { key: string; level: number }[]) => {
    data.forEach(({ key, level }) => {
      const prevState = get(tagsState(key))
      if (prevState?.timeoutState?.level == level) return
      let timeoutState = {}
      if (level == 0 || level == 1) {
        timeoutState = { isTimeout: false, isOffline: false, level }
      } else if (level == 2) {
        timeoutState = { isTimeout: true, isOffline: false, level }
      } else if (level == 3) {
        timeoutState = { isTimeout: true, isOffline: true, level }
      }
      set(tagsState(key), prev => ({ ...prev, timeoutState }))
    })
  }
)

export const dataPropSelector = atomFamily((op: DataPropOptions) => atom(
  (get) => {
    const data = get(dataState(op.dataId))
    const field = op.field

    let value: any

    if (op.type == 'schema') {
      value = field == '' ? data : (field ? _.get(data, field) : undefined)
      if (op.config == '关联字段') {
        const relateShowField = op.relateShowField
        if (_.isPlainObject(value)) {
          value = relateShowField ? value?.[relateShowField] : value
        } else if (_.isArray(value)) {
          value = relateShowField ? value.map((v: any) => v?.[relateShowField]).join(',') : value
        }
      }
      if (op.config == '选择器') {
        const enumObj = op.enumObj
        if (_.isArray(value)) {
          value = enumObj ? value.map((v: any) => enumObj[v]).join(',') : value.join(',')
        } else {
          value = enumObj ? enumObj[value] : value
        }
      }
    } else {
      value = _.get(data, `_settings.${op.type}.${field}`)
    }

    return value
  }
), (a, b) => a.dataId == b.dataId && a.field == b.field && a.tableId == b.tableId && a.type == b.type)
