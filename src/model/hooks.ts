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
import { ModelContext, ModelAtoms } from './base'

import { useAtom, useAtomValue, useSetAtom } from 'jotai'
import { useAtomCallback } from 'jotai/utils'
import { Getter, Setter, Atom, WritableAtom } from 'jotai'

// 提取的 useModel hook
export const useModel = () => {
  const context = useContext(ModelContext)
  if (!context) {
    throw new Error('Need Model Context when use model hooks.')
  }
  return context
}

type AtomProp = Atom<any> | string | ((atoms: ModelAtoms | string) => Atom<any>)

const useModelAtom = (atom: AtomProp, fkey?: string): WritableAtom<any, unknown[], any> => {
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

export const useModelValue = (atom: AtomProp, fkey?: string) => {
  return useAtomValue(useModelAtom(atom, fkey))
}

export const useModelState = (atom: AtomProp, fkey?: string) => {
  return useAtom(useModelAtom(atom, fkey))
}

export const useSetModelState = (atom: AtomProp, fkey?: string) => {
  return useSetAtom(useModelAtom(atom, fkey))
}

export const useModelCallback = <Args extends unknown[]>(cb: (get: Getter, set: Setter, atoms: ModelAtoms, ...args: Args) => any, deps: any[] = []) => {
  const context = useModel()
  const { model, atoms } = context
  return useAtomCallback(
    useCallback((get: Getter, set: Setter, ...args: Args) => {
      return cb(get, set, atoms, ...args)
    }, [ ...deps, model ])
  )
}

// Get Model Item
export const useModelGet = ({ id, query, item }: { id?: string; query?: any; item?: any }) => {
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
      setState({ data: defaultData, loading: false })
    } else {
      setState({ data: defaultData, loading: false })
    }
  }, [ id ])

  const title = id ? `Edit ${model.title}` : `Create ${model.title}`

  return { model, title, ...state }
}

// Save Model Item
export const useModelSave = () => {
  const { model, api } = useModel()

  const saveItem = useModelCallback(async (get, set, atoms, item: any, partial?: boolean) => {
    set(atoms.loading('save'), true)
    try {
      if(model.partialSave || item['__partial__']) {
        partial = true
      }
      const data = await api.save(item, partial)
      const id = data.id || item.id
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
export const useModelDelete = (props?: any) => {
  const { model, api } = useModel()
  const deleteItemId = props?.id

  const deleteItem = useModelCallback(async (get, set, atoms, id?: string) => {
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

export const useModelGetItems = () => {
  const { model, api } = useModel()

  const getItems = useModelCallback(async (get, set, atoms, query?: any ) => {
    let { wheres: newWheres, ...newOption } = query || {}
    const wheres = newWheres || get(atoms.wheres)
    const option = { ...get(atoms.option), ...newOption }

    set(atoms.loading('items'), true)
    try {
      let { items, total } = await api.query(option, wheres)

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
export const useModelItem = (props?: any) => {
  return {
    ...useModelGet(props),
    ...useModelSave(),
    ...useModelDelete(props)
  }
}

export const useModelQuery = () => {
  const { model, api } = useModel()

  const [ data, setData ] = useState<any[]>([])
  const [ loading, setLoading ] = useState(false)

  useEffect(() => {
    setLoading(true)
    api.query().then(({ items }: any) => {
      setData(items)
      setLoading(false)
    })
  }, [ ])

  return { items: data, loading, model }
}

export const useModelPermission = () => {
  const { model } = useModel()
  return {
    canAdd: !!model.permission && !!model.permission.add,
    canDelete: !!model.permission && !!model.permission.delete,
    canEdit: !!model.permission && !!model.permission.edit
  }
}

export const useModelEvent = () => {
  const { model } = useModel()
  return {
    ...model.events
  }
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

export const useModelPagination = () => {
  useModel()
  const count = useModelValue('count')
  const limit = useModelValue('limit')
  const [ skip, setSkip ] = useModelState('skip')

  const items = Math.ceil(count / limit)
  const activePage = Math.floor(skip / limit) + 1

  const changePage = useCallback((page: number) => {
    const skip = limit * (page - 1)
    setSkip(skip)
  }, [ setSkip, limit ])

  return { items, activePage, changePage }
}

export const useModelCount = () => ({ count: useModelValue('count') })

export const useModelPageSize = () => {
  const [limit, setLimit] = useModelState('limit')
  const setSkip = useSetModelState('skip')

  const sizes = [ 15, 30, 50, 100 ]

  const setPageSize = useCallback((size: number) => {
    setLimit(size)
    setSkip(0)
  }, [ setLimit, setSkip ])

  return { sizes, setPageSize, size: limit }
}

export const useModelFields = () => {
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

export const useModelList = () => {
  useModelEffect()

  const items = useModelValue('items')
  const selected = useModelValue('selected')
  const fields = useModelValue('fields')
  const loading = useModelValue('loading', 'items')

  return { loading, items, fields, selected }
}

export const useModelSelect = () => {
  useModel()
  const selected = useModelValue('selected')
  const [isSelectedAll, onSelectAll] = useModelState('allSelected')

  const onSelect = useModelCallback((_get, set, atoms, item: any, isSelect: boolean) => {
    set(atoms.itemSelected(item.id), isSelect)
  }, [ ])

  return { count: selected.length, selected, isSelectedAll, onSelect, onSelectAll }
}

export const useModelListRow = ({ id }: { id: string }) => {
  const { model } = useModel()
  const item = useModelValue('item', id)
  const [ itemSelected, changeSelect ] = useModelState('itemSelected', id)

  return { selected: itemSelected, item, changeSelect, actions: model.itemActions || [ 'edit', 'delete' ] }
}

export const useModelListHeader = ({ field }: { field: string }) => {
  const { model } = useModel()
  const property = getFieldProp(model, field) || {}
  const title = property.header || property.title || startCase(field)

  return { title }
}

export const useModelListOrder = ({ field }: { field: string }) => {
  const { model } = useModel()
  const property = getFieldProp(model, field) || {}
  const canOrder = (property.canOrder !== undefined ? property.canOrder :
    ( property.orderField !== undefined || (property.type != 'object' && property.type != 'array')))
  const [itemOrder, changeOrder] = useModelState('itemOrder', property.orderField || field)

  return { changeOrder, canOrder, order: itemOrder }
}

export const useModelListItem = ({ schema, field, item, nest }: { schema?: any; field: string; item?: any; nest?: boolean }) => {
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
