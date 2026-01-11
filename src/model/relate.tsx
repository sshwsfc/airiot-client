import React from 'react'
import { Model, modelRegistry, ModelSchema } from './base'

export interface CheckboxesProps {
  input: {
    value: any[]
    onChange: (value: any[]) => void
  }
  field: any
}

export interface RelateContextType {
  item: any
  model: ModelSchema
}

const Checkboxes = (props: CheckboxesProps) => {
  const { input: { value, onChange }, field } = props

  const [ loading, setLoading ] = React.useState(false)
  const [ options, setOptions ] = React.useState<Array<{ value: any; label: string; item: any }>>([])

  const onCheckChange = React.useCallback((checked: boolean, option: any) => {
    if(checked) {
      onChange([ ...value, option ])
    } else {
      onChange(value.filter(item => item.id != option.id))
    }
  }, [ value, onChange ])

  const renderOptions = () => {
    const checkedIds = value ? value.map((item: any) => item.id) : []

    return options.map(({ value, label, item })=>{
      const checked = checkedIds.indexOf(value) >= 0
      return React.createElement('label', { key: value },
        React.createElement('input', {
          type: 'checkbox',
          checked,
          onChange: () => onCheckChange(!checked, item),
          ...field.attrs
        }),
        label
      )
    })
  }

  return loading ? React.createElement('div', {}, 'Loading...') :
    (options ? renderOptions() : React.createElement('span', {}, 'Empty'))
}

const schemaConverter = [
  (f: any, schema: any) => {
    if(schema.type == 'array' && schema.items.type == 'object' && schema.items.relateTo) {
      const models = modelRegistry.getModels()
      const name = schema.items.relateTo
      if(models[name]) {
        const model = models[name]
        f.type = 'multi_select'
        f.schema = model
        f.displayField = model.displayField || 'name'
      }
    }
    return f
  },
  (f: any, schema: any) => {
    if(schema.type == 'object' && schema.relateTo) {
      const models = modelRegistry.getModels()
      const relateName = schema.relateTo
      if(models[relateName]) {
        const model = models[relateName]
        f.type = 'fkselect'
        f.schema = model
        f.displayField = model.displayField || 'name'
      }
    }
    return f
  }
]

const filterConverter = [
  (f: any, schema: any) => {
    if(schema.type == 'object' && schema.relateTo) {
      const models = modelRegistry.getModels()
      const relateName = schema.relateTo
      if(models[relateName]) {
        const model = models[relateName]
        f.type = 'filter_relate'
        f.schema = model
        f.displayField = model.displayField || 'name'
      }
    }
    return f
  }
]

export const RelateContext = React.createContext<RelateContextType | null>(null)

export interface RelateContainerProps {
  id: string
  children: React.ReactNode
}

const RelateContainer = ({ id, children }: RelateContainerProps) => {
  const [ loading, setLoading ] = React.useState(true)
  const [ data, setData ] = React.useState<any>(null)

  // TODO: Get model from context and load data
  React.useEffect(() => {
    // Load data by id
    setLoading(false)
  }, [ id ])

  return loading || data == undefined ? React.createElement('div', {}, 'Loading...') :
    React.createElement('div', { className: 'relate-container' },
      React.createElement(RelateContext.Provider, { value: { item: data, model: {} as ModelSchema } },
        children
      )
    )
}

const RelateAction = ({ item }: { item: any }) => {
  const actions: ModelSchema[] = []

  const models = modelRegistry.getModels()
  Object.keys(models).forEach(key => {
    const m = models[key]
    for(let pname of Object.keys(m.properties || {})) {
      const prop = (m.properties || {})[pname]
      if(prop.type == 'object' && (prop.relateTo == (item as any).key || prop.relateTo == (item as any).name)) {
        actions.push(m)
        continue
      }
    }
  })

  return actions.length ? React.createElement('div', { className: 'relate-actions' },
    actions.map((action, i) => React.createElement('div', { key: i }, action.title))
  ) : null
}

const relateModule = {
  name: 'xadmin.model.relate',
  components: {
    'Model.RelateAction': RelateAction,
  },
  schema_converter: schemaConverter,
  filter_converter: filterConverter,
  hooks: {
    'model.relate.select': ({ field }: { field: any }) => {
      const [ loading, setLoading ] = React.useState(false)
      const [ options, setOptions ] = React.useState<Array<{ value: any; label: string; item: any }>>([])

      const loadOptions = React.useCallback((inputValue?: string) => {
        const displayField = field.displayField || 'name'
        setLoading(true)
        // TODO: Implement API call
        // return api(field.schema)
        //   .query({ limit: 1000, fields: [ 'id', displayField ] },
        //     inputValue ? { search: { [displayField]: { like: inputValue } } } : {})
        //   .then(({ items }) => {
        //     setLoading(false)
        //     setOptions(items.map(item =>
        //       ({ value: item.id, label: item[displayField], item })
        //     ))
        //   })
        setLoading(false)
        setOptions([])
        return Promise.resolve()
      }, [ field ])

      React.useEffect(() => {
        loadOptions()
      }, [])

      return { loadOptions, loading, options }
    }
  }
}

export default relateModule
export { Checkboxes, RelateAction, RelateContainer }
