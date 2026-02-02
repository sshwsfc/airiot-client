import cloneDeep from 'lodash/cloneDeep'
import isArray from 'lodash/isArray'
import merge from 'lodash/merge'
import startCase from 'lodash/startCase'

interface SchemaField {
  type?: string | string[]
  format?: string
  title?: string
  description?: string
  maxLength?: number
  minLength?: number
  minimum?: number
  maximum?: number
  exclusiveMinimum?: boolean
  exclusiveMaximum?: boolean
  validationMessage?: string
  enum?: any[]
  enumNames?: any
  enum_title?: any
  properties?: Record<string, SchemaField>
  required?: string[]
  readonly?: string[]
  ignore?: string[]
  form?: Array<string | { key: string; [key: string]: any }>
  formRender?: any
  field?: { [key: string]: any }
  items?: SchemaField
  itemsRender?: any
  [key: string]: any
}

interface FormField {
  name: string
  key?: string
  label?: string
  type?: string
  fields?: FormField[]
  component?: React.ComponentType<any>
  group?: React.ComponentType<any>
  validate?: any
  effect?: any
  items?: FormField
  itemsRender?: any
  render?: any
  options?: Array<{ name: string; value: any }>
  description?: string
  maxlength?: number
  minlength?: number
  minimum?: number
  maximum?: number
  validationMessage?: string
  readonly?: boolean
  required?: boolean
  schema?: SchemaField
  [key: string]: any
}
interface ConvertOptions {
  path?: string[]
  lookup?: Record<string, FormField>
  readonly?: string[]
  required?: string[]
  ignore?: string[]
  formSchema?: FormField[]
  converters?: Array<ConverterArgs>
  global?: {
    formDefaults?: FormField
  }
}

type ConverterArgs = (f: FormField, schema: SchemaField, options: ConvertOptions) => FormField

const stripNullType = (type: string | string[] | undefined): string | undefined => {
  if (Array.isArray(type) && type.length == 2) {
    if (type[0] === 'null') return type[1]
    if (type[1] === 'null') return type[0]
  }
  return type as string | undefined
}

const enumToTitleMap = (enm: any[], title?: any): Array<{ name: string; value: any }> => {
  let options: Array<{ name: string; value: any }> = []
  enm.forEach((name, index) => {
    options.push({
      name: title != undefined ? (isArray(title) ? title[index] : title[name]) || name : name,
      value: name
    })
  })
  return options
}

const canonicalTitleMap = (options: any, originalEnum?: any[]): Array<{ name: string; value: any }> => {
  if (!isArray(options)) {
    let canonical: Array<{ name: string; value: any }> = []
    if (originalEnum) {
      originalEnum.forEach(value => {
        canonical.push({ name: options[value], value: value })
      })
    } else {
      for (let k in options) {
        if (options.hasOwnProperty(k)) {
          canonical.push({ name: k, value: options[k] })
        }
      }
    }
    return canonical
  }
  return options
}

const defaultConverters: Array<ConverterArgs> = [
  // all form field
  (f: FormField, schema: SchemaField, options: ConvertOptions) => {
  const { path, readonly, required, lookup } = options

  const fieldKey = path && path.length > 0 ? path[path.length - 1] : undefined
    f.key = path ? path.join('.') : ''

    f.name = f.key
    f.label = schema.title || (fieldKey ? startCase(fieldKey) : '')

    if (fieldKey !== undefined) {
      if (readonly && readonly.indexOf(fieldKey) !== -1) {
        f.readonly = true
      }
      if (required && required.indexOf(fieldKey) !== -1) {
        f.required = true
      }
    }

    if (schema.description) {
      f.description = schema.description
    }
    if (schema.maxLength) {
      f.maxlength = schema.maxLength
    }
    if (schema.minLength) {
      f.minlength = schema.minLength
    }
    if (schema.minimum) {
      f.minimum = schema.minimum + (schema.exclusiveMinimum ? 1 : 0)
    }
    if (schema.maximum) {
      f.maximum = schema.maximum - (schema.exclusiveMaximum ? 1 : 0)
    }

    if (schema.validationMessage) {
      f.validationMessage = schema.validationMessage
    }
    if (schema.enumNames) {
      f.options = canonicalTitleMap(schema.enumNames, schema['enum'])
    }

    f.schema = schema
    lookup![f.key] = f

    return { ...f, ...schema.field }
  },
  // object
  (f: FormField, schema: SchemaField, options: ConvertOptions) => {
    if (stripNullType(schema.type) === 'object') {
      f.type = 'fieldset'

      const props = schema.properties || {}
      const opts: ConvertOptions = { ...options }

      opts.required = schema.required || []
      opts.readonly = schema.readonly || []
      opts.ignore = schema.ignore || []

      let { keys, form } = (schema.form || ['*']).reduce((ret: any, field: string | any) => {
        if (typeof field === 'string') {
          if (field != '*' || ret.keys.indexOf('*') == -1) {
            ret.keys.push(field)
          }
          if (field != '*') {
            ret.form[field] = { key: field }
          }
        } else if (field.key !== undefined) {
          ret.keys.push(field.key)
          ret.form[field.key] = field
        }
        return ret
      }, { keys: [] as string[], form: {} as Record<string, any> })

      const idx = keys.indexOf('*')

      if (idx !== -1) {
        keys = keys
          .slice(0, idx)
          .concat(Object.keys(props).filter(pk => keys.indexOf(pk) == -1))
          .concat(keys.slice(idx + 1))
      }

      const fields = keys.filter((key: string) => opts.ignore!.indexOf(key) === -1).map((key: string) => {
        opts.path = [...options.path!, key]
        return props[key] !== undefined
          ? merge(convert(props[key]!, opts), form[key] || {})
          : form[key]
      })

      f.render = schema.formRender
      f.fields = fields
    }
    return f
  },
  // array
  (f: FormField, schema: SchemaField, options: ConvertOptions) => {
    if (stripNullType(schema.type) === 'array') {
      f.type = 'array'

      if (typeof schema.items !== 'undefined') {
        f.items = convert(schema.items, { ...options, path: [] })
      }
      if (schema.itemsRender) f.itemsRender = schema.itemsRender
    }
    return f
  },
  // all normal type form field
  (f: FormField, schema: SchemaField) => {
    if (f.type !== undefined) {
      return f
    }
    const schema_type = stripNullType(schema.type)
    if (schema_type === 'string') {
      if (!schema['enum']) {
        f.type = 'text'
      } else {
        f.type = 'select'
        if (!f.options) {
          f.options = enumToTitleMap(schema['enum']!, schema['enum_title'] || {})
        }
      }
      switch (schema.format) {
        case 'date':
          f.type = 'date'
          break
        case 'time':
          f.type = 'time'
          break
        case 'datetime':
        case 'date-time':
          f.type = 'datetime'
          break
      }
    } else if (schema_type === 'number') {
      if (!schema['enum']) {
        f.type = 'number'
      } else {
        f.type = 'numselect'
        if (!f.options) {
          f.options = enumToTitleMap(schema['enum']!, schema['enum_title'] || {})
        }
      }
    } else if (schema_type === 'integer') {
      if (!schema['enum']) {
        f.type = 'integer'
      } else {
        f.type = 'numselect'
        if (!f.options) {
          f.options = enumToTitleMap(schema['enum']!, schema['enum_title'] || {})
        }
      }
    } else if (schema_type === 'boolean') {
      f.type = 'checkbox'
    }
    return f
  }
]

const convert = (schema: SchemaField, options?: ConvertOptions): FormField => {
  const opts: ConvertOptions = { ...options }
  const converters = opts.converters || []
  if (opts.path === undefined) {
    opts.path = []
  }
  if (opts.lookup === undefined) {
    opts.lookup = {}
  }
  const initialField: FormField = {
    key: '',
    name: ''
  }
  return [ ...defaultConverters, ...(converters || [])].reduce((prve, converter) => {
    return converter(prve, schema, opts)
  }, opts.global && opts.global.formDefaults ? cloneDeep({ ...initialField, ...opts.global.formDefaults }) : initialField)
}

export { convert }
export type { SchemaField, FormField, ConvertOptions }
