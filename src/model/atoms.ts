import differenceWith from 'lodash/differenceWith'
import isNil from 'lodash/isNil'
import isEmpty from 'lodash/isEmpty'
import omit from 'lodash/omit'
import unionWith from 'lodash/unionWith'
import { atom, WritableAtom } from 'jotai'
import { atomFamily } from 'jotai/utils'

export interface ModelAtoms {
  ids: WritableAtom<string[], any, void>
  item: (id: string) => WritableAtom<any, any, void>
  items: WritableAtom<any[], any, void>
  count: WritableAtom<number, any, void>
  selected: WritableAtom<any[], any, void>
  option: WritableAtom<any, any, void>
  optionSelector: (key: string) => WritableAtom<any, any, void>
  fields: WritableAtom<any, any, void>
  order: WritableAtom<any, any, void>
  limit: WritableAtom<number, any, void>
  skip: WritableAtom<number, any, void>
  wheres: WritableAtom<any, any, void>
  where: (id: string) => WritableAtom<any, any, void>
  loading: (key: string) => WritableAtom<boolean, any, void>
  itemSelected: (id: string) => WritableAtom<boolean, any, void>
  allSelected: WritableAtom<boolean, any, void>
  itemOrder: (field: string) => WritableAtom<string, any, void>
}

const modelAtoms = (): ModelAtoms => {

  const ids = atom<string[]>([])

  const item = atomFamily(() => atom<any>({}))

  const items = atom(
    (get) => get(ids).map(id => get(item(id))).filter(item => !isNil(item)),
    (_get, set, newItems: any[]) => {
      const newIds = newItems.map(record => {
        if(isNil(record.id)) {
          // record without id field should throw warnning.
          return null
        }
        set(item(record.id), record)
        return record.id
      }).filter(Boolean) as string[]
      set(ids, newIds)
    }
  )

  const count = atom(0)

  const selected = atom<any[]>([])

  const option = atom<any>({})

  const optionSelector = (key: string) => atom(
    (get) => get(option)[key],
    (get, set, value) => {
      set(option, {
        ...get(option),
        [key]: value
      })
    }
  )

  const fields = optionSelector('fields')

  const order = optionSelector('order')

  const limit = optionSelector('limit')

  const skip = optionSelector('skip')

  const wheres = atom<any>({})

  const where = atomFamily((id: string) => atom(
    (get) => {
      return get(wheres)[id]
    },
    (get, set, whereValue: any) => {
      set(wheres, { ...omit(get(wheres), id), ...(!isEmpty(whereValue) ? { [id]: whereValue } : {}) })
      set(skip, 0)
    }
  ))

  const loading = atomFamily(() => atom(false))

  const itemSelected = atomFamily((id: string) => atom(
    (get) => {
      return get(selected).find(item => item.id == id) !== undefined
    },
    (get, set, isSelect: boolean) => {
      const selectedItems = get(selected).filter(i => { return i.id !== id })
      if (isSelect) {
        selectedItems.push(get(item(id)))
      }
      set(selected, selectedItems)
    }
  ))

  const allSelected = atom(
    (get) => {
      const selects = get(selected).map(item => item.id)
      return get(ids).every(id => selects.indexOf(id) >= 0)
    },
    (get, set, selectAll: boolean) => {
      if(selectAll) {
        set(selected, unionWith(get(selected), get(items), (a, b) => a.id == b.id))
      } else {
        set(selected, differenceWith(get(selected), get(items), (a, b) => a.id == b.id))
      }
    }
  )

  const itemOrder = atomFamily((field: string) => atom(
    (get) => {
      const orders = get(order)
      return orders !== undefined ? (orders[field] || '') : ''
    },
    (get, set, newOrder: string) => {
      const orders = get(order)
      set(order, { ...orders, [field]: newOrder })
    }
  ))

  return {
    ids, item, items, selected, count, option, optionSelector, fields, order, limit, skip, wheres, where, loading, itemSelected, allSelected, itemOrder
  }
}

export default modelAtoms
