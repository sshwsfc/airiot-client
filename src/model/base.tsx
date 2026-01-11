import React from 'react'
import isEmpty from 'lodash/isEmpty'
import isFunction from 'lodash/isFunction'
import modelAtoms, { ModelAtoms } from './atoms'
import { createAPI, type APIOptions, type API } from '../api'
import { useAtomCallback } from 'jotai/utils'

interface QueryObject {
  [key: string]: any
}

interface ModelPermission {
  view?: boolean
  add?: boolean
  edit?: boolean
  delete?: boolean
}

interface ModelSchema {
  name?: string
  key?: string
  title?: string
  icon?: string
  permission?: ModelPermission
  initialValues?: any | (() => any)
  listFields?: string[]
  defaultOrder?: any
  orders?: any
  defaultPageSize?: number
  properties?: Record<string, any>
  displayField?: string
  components?: Record<string, React.ComponentType<any>>
  atoms?: ModelAtoms
  blocks?: Record<string, (...args: any[]) => any>
  events?: Record<string, (...args: any[]) => any>
  [key: string]: any
}

interface ModelContextType {
  model: ModelSchema
  atoms: ModelAtoms
  api: API
  [key: string]: any
}

const ModelContext = React.createContext<ModelContextType | null>(null)

const modelAtomsMap: Record<string, ModelAtoms> = {}

// Registry for models and extensions
const modelRegistry = {
  models: {} as Record<string, ModelSchema>,
  modelAtoms: [] as Array<(k: (id: string) => string, model: ModelSchema) => ModelAtoms>,
  getModels: () => modelRegistry.models,
  getModel: (name: string) => modelRegistry.models[name],
  registerModel: (name: string, model: ModelSchema) => {
    modelRegistry.models[name] = model
  },
  getModelAtoms: () => modelRegistry.modelAtoms,
  addModelAtoms: (getAtoms: (k: (id: string) => string, model: ModelSchema) => ModelAtoms) => {
    modelRegistry.modelAtoms.push(getAtoms)
  }
}

const getModel = (name: string, key: string | undefined, props: any): ModelSchema => {
  const model = modelRegistry.getModels()[name]
  if(!model) {
    throw Error(`Model '${name}' not found!`)
  }
  return {
    ...model,
    name: model.name || name,
    key: key || model.name || name,
    ...props
  }
}

interface ModelInitialProps {
  model: ModelSchema
  initialValues?: any
  children: React.ReactNode
  query?: QueryObject
}

const ModelInitial = ({ model, initialValues, children, query }: ModelInitialProps) => {
  const [ loading, setLoading ] = React.useState(true)

  const initializeState = useAtomCallback(React.useCallback((_get, set) => {
    let initial = initialValues || {}
    if(model.initialValues) {
      let modelInitial = isFunction(model.initialValues) ? model.initialValues() : model.initialValues
      initial = { ...modelInitial, ...initial }
    }
    const { wheres={}, ...option } = initial as any

    const defaultOpt = {
      fields: [ ...(model.listFields || []) ],
      order: model.defaultOrder || model.orders || {},
      limit: model.defaultPageSize || 15,
      skip: 0
    }
    if(query && !isEmpty(query)) {
      const filterQuery = Object.keys(query).reduce((p: any, key) => {
        if(key.startsWith('f_')) {
          p[key.substring(2)] = query[key]
        }
        return p
      }, {})
      if(!isEmpty(filterQuery)) {
        wheres.param_filter = filterQuery
      }
    }

    set(model.atoms!.option, { ...defaultOpt, ...option })
    set(model.atoms!.wheres, wheres)
  }, [initialValues, model, query]))

  React.useEffect(() => {
    initializeState()
    setLoading(false)
  }, [])

  return !loading ? <>{children}</> : null
}

interface ModelProps {
  name?: string
  schema?: ModelSchema
  modelKey?: string
  initialValues?: any
  children: React.ReactNode
  atoms?: ModelAtoms
  forceNewAtoms?: boolean
  props?: any
}

const Model = ({ name, schema, modelKey, initialValues, children, atoms: outterAtoms, forceNewAtoms, props: modelProps }: ModelProps) => {
  const model = React.useMemo(() => {
    const md =  name ? getModel(name, modelKey, modelProps) : {
      ...schema,
      key: modelKey || schema?.name,
      ...modelProps
    } as ModelSchema
    let atoms: ModelAtoms
    if(outterAtoms) {
      atoms = outterAtoms
    } else if(forceNewAtoms){
      atoms = [ modelAtoms, ...modelRegistry.getModelAtoms() ].reduce((p, getAtoms) => {
        return { ...p, ...getAtoms(id => `model.${md.key}.${id}`, md)}
      }, {} as ModelAtoms)
    } else {
      if(!modelAtomsMap[md.key || '']) {
        modelAtomsMap[md.key || ''] = [ modelAtoms, ...modelRegistry.getModelAtoms() ].reduce((p, getAtoms) => {
          return { ...p, ...getAtoms(id => `model.${md.key}.${id}`, md)}
        }, {} as ModelAtoms)
      }
      atoms = modelAtomsMap[md.key || '']
    }
    return { ...md, atoms }
  }, [ name, schema, modelKey, outterAtoms, forceNewAtoms, modelProps ])

  const api = createAPI(model as APIOptions)

  return model && (
    <ModelContext.Provider value={{ model, atoms: model.atoms!, api }}>
      <ModelInitial initialValues={initialValues} model={model} >
        {children}
      </ModelInitial>
    </ModelContext.Provider>
  )
}

export {
  ModelContext,
  Model,
  modelRegistry
}
export type { ModelSchema, ModelAtoms, ModelContextType }
