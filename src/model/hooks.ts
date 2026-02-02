import { useState, useEffect, useContext, useCallback, useMemo } from 'react'
import get from 'lodash/get'
import indexOf from 'lodash/indexOf'
import isEmpty from 'lodash/isEmpty'
import isFunction from 'lodash/isFunction'
import isNil from 'lodash/isNil'
import isString from 'lodash/isString'
import remove from 'lodash/remove'
import startCase from 'lodash/startCase'
import { getFieldProp } from './utils'
import { ModelContext, ModelAtoms, ModelContextType, ModelSchema } from './base'

import { useAtom, useAtomValue, useSetAtom } from 'jotai'
import { useAtomCallback } from 'jotai/utils'
import { Getter, Setter, Atom, WritableAtom } from 'jotai'
import type { API } from '../api'

// 提取的 useModel hook
export const useModel = (): ModelContextType => {
  const context = useContext(ModelContext)
  if (!context) {
    throw new Error('Need Model Context when use model hooks.')
  }
  return context
}

type AtomProp<T = any> = Atom<T> | string | ((atoms: ModelAtoms | string) => Atom<T>)

const useModelAtom = <T = any>(atom: AtomProp<T>, fkey?: string): WritableAtom<T, unknown[], any> => {
  const context = useModel()
  let state = atom
  if(isFunction(atom)) {
    state = atom(context.atoms)
  } else if(isString(atom)) {
    state = (context.atoms as any)[atom]
    if(isNil(state)) {
      throw Error(`Model atom ${atom} undefined.`)
    }
    if(fkey) {
      state = (state as (atoms: ModelAtoms | string) => Atom<any>)(fkey)
    }
  }
  return state as WritableAtom<any, unknown[], any>
}

export const useModelValue = <T = any>(atom: AtomProp<T>, fkey?: string): T => {
  return useAtomValue(useModelAtom(atom, fkey))
}

export const useModelState = <T = any>(atom: AtomProp<T>, fkey?: string): [T, (value: T) => void] => {
  return useAtom(useModelAtom(atom, fkey))
}

export const useSetModelState = <T = any>(atom: AtomProp<T>, fkey?: string): (value: T) => void => {
  return useSetAtom(useModelAtom(atom, fkey))
}

export const useModelCallback = <Args extends unknown[], T = any>(cb: (get: Getter, set: Setter, atoms: ModelAtoms, ...args: Args) => T, deps: any[] = []): (...args: Args) => T => {
  const context = useModel()
  const { model, atoms } = context
  return useAtomCallback(
    useCallback((get: Getter, set: Setter, ...args: Args) => {
      return cb(get, set, atoms, ...args)
    }, [ ...deps, model ])
  )
}

// Get Model Item
export const useModelGet = <T extends { id?: string } = any>({ id, query, item }: { id?: string; query?: any; item?: T }): { model: ModelSchema; title: string; data: T | undefined; loading: boolean } => {
  const { model, api } = useModel()
  const defaultData = useMemo(() => {
    let data = item
    if(!data) {
      if(model.defaultValue) {
        data = isFunction(model.defaultValue) ? model.defaultValue() : model.defaultValue
      }
      if(!isEmpty(query)) {
        data = { ...data, ...query }
      }
    }
    return data
  }, [ item, model.defaultValue, query ])

  const [ state, setState ] = useState(() => ({ data: defaultData, loading: Boolean(!defaultData && id) }))

  useEffect(() => {
    const { data } = state
    if(id && data?.id != id ) {
      setState({ data, loading: true })
      api.get(id).then((payload: any) => {
        setState({ data: payload, loading: false })
      })
    } else {
      setState({ data: defaultData, loading: false })
    }
  }, [ id ])

  const title = id ? `Edit ${model.title}` : `Create ${model.title}`

  return { model, title, ...state }
}

// Save Model Item
export const useModelSave = <T extends { id?: string } & Record<string, any> = any>(): { model: ModelSchema; saveItem: (item: T, partial?: boolean) => Promise<T> } => {
  const { model, api } = useModel()

  const saveItem = useModelCallback(async (get, set, atoms, item: T, partial?: boolean): Promise<T> => {
    set(atoms.loading('save'), true)
    try {
      if(model.partialSave || (item as any)['__partial__']) {
        partial = true
      }
      const data = await api.save(item, partial) as T
      const id = data.id || item.id
      if (!id) {
        throw new Error('Item must have an id')
      }
      let newData = data || item
      if(partial) {
        const oldItem = get(atoms.item(id))
        newData = { ...oldItem, ...newData }
      }
      set(atoms.item(id), newData)

      // change selected item
      const selected = get(atoms.selected)
      set(atoms.selected, selected.map(i => i.id !== id ? i : newData))

      return data
    } catch (err: any) {
      throw err?.formError || err?.json || err
    } finally {
      set(atoms.loading('save'), false)
    }
  }, [ ])

  return { model, saveItem }
}

// Delete Model Item
export const useModelDelete = (props?: { id?: string }): { model: ModelSchema; deleteItem: (id?: string) => Promise<void> } => {
  const { model, api } = useModel()
  const deleteItemId = props?.id

  const deleteItem = useModelCallback(async (get, set, atoms, id?: string): Promise<void> => {
    id = id || deleteItemId
    await api.delete(id)
    // unselect
    const selected = get(atoms.selected)
    set(atoms.selected, selected.filter(i => { return i.id !== id }))
    // getItems
    const wheres = get(atoms.wheres)
    const option = get(atoms.option)
    let { items, total } = await api.query(option, wheres)
    set(atoms.items, items)
    set(atoms.count, total)
  }, [ deleteItemId ])

  return { model, deleteItem }
}

export const useModelGetItems = <T = any>(): { model: ModelSchema; getItems: (query?: any) => Promise<{ items: T[]; total: number }> } => {
  const { model, api } = useModel()

  const getItems = useModelCallback(async (get, set, atoms, query?: any): Promise<{ items: T[]; total: number }> => {
    let { wheres: newWheres, ...newOption } = query || {}
    const wheres = newWheres || get(atoms.wheres)
    const option = { ...get(atoms.option), ...newOption }

    set(atoms.loading('items'), true)
    try {
      let { items, total } = await api.query(option, wheres) as { items: T[]; total: number }

      set(atoms.items, items)
      set(atoms.count, total)

      if(!isEmpty(newOption)) set(atoms.option, option)
      if(newWheres) set(atoms.wheres, wheres)

      return { items, total }
    } catch (error) {
      set(atoms.ids, [])
      set(atoms.count, 0)

      throw error
    } finally {
      set(atoms.loading('items'), false)
    }
  }, [ ]);

  return { model, getItems }
}

// Model Item hooks
export const useModelItem = <T extends { id?: string } = any>(props?: { id?: string; query?: any; item?: T }) => {
  return {
    ...useModelGet<T>(props || {}),
    ...useModelSave<T>(),
    ...useModelDelete(props)
  }
}

export const useModelQuery = <T = any>(): { items: T[]; loading: boolean; model: ModelSchema } => {
  const { model, api } = useModel()

  const [ data, setData ] = useState<T[]>([])
  const [ loading, setLoading ] = useState(false)

  useEffect(() => {
    setLoading(true)
    api.query().then(({ items }: { items: T[] }) => {
      setData(items)
      setLoading(false)
    })
  }, [ ])

  return { items: data, loading, model }
}

export const useModelPermission = (): { canAdd: boolean; canDelete: boolean; canEdit: boolean } => {
  const { model } = useModel()
  return {
    canAdd: !!model.permission && !!model.permission.add,
    canDelete: !!model.permission && !!model.permission.delete,
    canEdit: !!model.permission && !!model.permission.edit
  }
}

export const useModelEvent = <T extends Record<string, (...args: any[]) => any> = Record<string, (...args: any[]) => any>>(): T => {
  const { model } = useModel()
  return {
    ...model.events
  } as T
}

// Model effect hook
export const useModelEffect = () => {
  const { model } = useModel()
  const { getItems } = useModelGetItems()
  const option = useModelValue('option')
  const wheres = useModelValue('wheres')

  useEffect(() => {
    if((model as any).initQuery === false) {
      (model as any).initQuery = undefined
      return
    }
    getItems()
  }, [ option, wheres ])

  return null
}

export const useModelPagination = (): { items: number; activePage: number; changePage: (page: number) => void } => {
  useModel()
  const count = useModelValue<number>('count')
  const limit = useModelValue<number>('limit')
  const [ skip, setSkip ] = useModelState<number>('skip')

  const items = Math.ceil(count / limit)
  const activePage = Math.floor(skip / limit) + 1

  const changePage = useCallback((page: number) => {
    const skip = limit * (page - 1)
    setSkip(skip)
  }, [ setSkip, limit ])

  return { items, activePage, changePage }
}

export const useModelCount = (): { count: number } => ({ count: useModelValue<number>('count') })

export const useModelPageSize = (): { sizes: number[]; setPageSize: (size: number) => void; size: number } => {
  const [limit, setLimit] = useModelState<number>('limit')
  const setSkip = useSetModelState<number>('skip')

  const sizes = [ 15, 30, 50, 100 ]

  const setPageSize = useCallback((size: number) => {
    setLimit(size)
    setSkip(0)
  }, [ setLimit, setSkip ])

  return { sizes, setPageSize, size: limit }
}

export const useModelFields = (): { fields: any; changeFieldDisplay: (args: [string, boolean]) => void; selected: any } => {
  const { model } = useModel()
  const [ selectedFields, setFields ] = useModelState('fields')

  const changeFieldDisplay = useCallback(([ field, selected ]: [string, boolean]) => {
    const fs = [ ...selectedFields ]
    const index = indexOf(fs, field)

    if (selected) {
      if (index === -1) fs.push(field)
    } else {
      remove(fs, (i) => { return i === field })
    }
    const list = Array.from(new Set([ ...(model.listFields || []), ...Object.keys(model.properties || {}) ]))
    setFields(list.filter(f => fs.indexOf(f) >= 0))
  }, [ selectedFields, model, setFields ])

  return { fields: model.properties, changeFieldDisplay, selected: selectedFields }

}

export const useModelList = <T = any>(): { loading: boolean; items: T[]; fields: string[]; selected: T[] } => {
  useModelEffect()

  const items = useModelValue<T[]>('items')
  const selected = useModelValue<T[]>('selected')
  const fields = useModelValue<string[]>('fields')
  const loading = useModelValue<boolean>('loading', 'items')

  return { loading, items, fields, selected }
}

export const useModelSelect = <T extends { id: string } = any>(): { count: number; selected: T[]; isSelectedAll: boolean; onSelect: (item: T, isSelect: boolean) => void; onSelectAll: (value: boolean) => void } => {
  useModel()
  const selected = useModelValue<T[]>('selected')
  const [isSelectedAll, onSelectAll] = useModelState<boolean>('allSelected')

  const onSelect = useModelCallback((_get, set, atoms, item: T, isSelect: boolean) => {
    set(atoms.itemSelected(item.id), isSelect)
  }, [ ])

  return { count: selected.length, selected, isSelectedAll, onSelect, onSelectAll }
}

export const useModelListRow = <T extends { id: string } = any>({ id }: { id: string }): { selected: boolean; item: T; changeSelect: (value: boolean) => void; actions: string[] } => {
  const { model } = useModel()
  const item = useModelValue<T>('item', id)
  const [ itemSelected, changeSelect ] = useModelState<boolean>('itemSelected', id)

  return { selected: itemSelected, item, changeSelect, actions: model.itemActions || [ 'edit', 'delete' ] }
}

export const useModelListHeader = ({ field }: { field: string }): { title: string } => {
  const { model } = useModel()
  const property = getFieldProp(model, field) || {}
  const title = property.header || property.title || startCase(field)

  return { title }
}

export const useModelListOrder = ({ field }: { field: string }): { changeOrder: (value: string) => void; canOrder: boolean; order: string } => {
  const { model } = useModel()
  const property = getFieldProp(model, field) || {}
  const canOrder = (property.canOrder !== undefined ? property.canOrder :
    ( property.orderField !== undefined || (property.type != 'object' && property.type != 'array')))
  const [itemOrder, changeOrder] = useModelState<string>('itemOrder', property.orderField || field)

  return { changeOrder, canOrder, order: itemOrder }
}

export const useModelListItem = <T = any>({ schema, field, item, nest }: { schema?: any; field: string; item?: T; nest?: boolean }): any => {
  const { model } = useModel()
  const property = schema || getFieldProp(model, field)
  const data: any = schema ? {} : { schema: property }
  const key = schema ? `${schema.name}.${field}` : field
  if((model as any).fieldRender == undefined) {
    (model as any).fieldRender = {}
  }
  if((model as any).fieldRender[key] == undefined) {
    (model as any).fieldRender[key] = property != undefined ? null : null
  }
  if((model as any).fieldRender[key]) {
    data['componentClass'] = (model as any).fieldRender[key]
  }
  data['value'] = get(item, field)
  data['editable'] = nest == true || (model as any).editableFields == undefined || (model as any).editableFields.indexOf(field) < 0

  return data
}

// Define all hooks for backward compatibility
const hooks = {
  'model': useModel,
  'model.value': useModelValue,
  'model.setter': useSetModelState,
  'model.state': useModelState,
  'model.callback': useModelCallback,
  'model.get': useModelGet,
  'model.save': useModelSave,
  'model.delete': useModelDelete,
  'model.getItems': useModelGetItems,
  'model.item': useModelItem,
  'model.query': useModelQuery,
  'model.permission': useModelPermission,
  'model.event': useModelEvent,
  'model.effect': useModelEffect,
  'model.pagination': useModelPagination,
  'model.count': useModelCount,
  'model.pagesize': useModelPageSize,
  'model.fields': useModelFields,
  'model.list': useModelList,
  'model.select': useModelSelect,
  'model.list.row': useModelListRow,
  'model.list.header': useModelListHeader,
  'model.list.order': useModelListOrder,
  'model.list.item': useModelListItem
}

export default hooks
