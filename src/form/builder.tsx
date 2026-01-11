import React from 'react'
import { Field } from 'react-final-form'

// Types for form fields and components
interface FormField {
  name: string
  key: string
  label?: string
  type?: string
  component?: React.ComponentType<any>
  group?: React.ComponentType<any>
  render?: any
  fields?: FormField[]
  validate?: any
  required?: boolean
  effect?: any
  [key: string]: any
}

interface FieldOption {
  fieldsDefined?: Record<string, FormField>
  fieldValidate?: any
  group?: React.ComponentType<any>
  form?: any
  invalid?: boolean
  [key: string]: any
}

// Global form fields registry
let globalFormFields: Record<string, FormField> = {}

export const setFormFields = (fields: Record<string, FormField>) => {
  globalFormFields = { ...globalFormFields, ...fields }
}

export const getFormFields = () => globalFormFields

const FieldWrapComponent = ({ fieldComponent: FieldComponent, group: FieldGroup, ...props }: any) => {
  const { data } = props.meta
  const { effect, formEffect, name } = props.field

  // Removed: use('form') - xadmin dependency
  // Form instance should be passed via props if needed
  const form = props.form

  React.useEffect(() => {
    if (formEffect && form) {
      formEffect(form, props)
    }
    if (effect && form) {
      // Hook into form field lifecycle if needed
      if (form.useField) {
        form.useField(name, (state: any) => effect(state, form, props.field))
      }
    }
  }, [form])

  if (data.display === false) {
    return null
  }
  const newField = data.field ? { ...props.field, ...data.field } : props.field
  if (data.required === true) {
    newField.required = true
  }

  return FieldComponent.useGroup === false ? (
    <FieldComponent {...props} field={newField} group={FieldGroup} />
  ) : (
    <FieldGroup {...props} field={newField}>
      <FieldComponent {...props} field={newField} group={FieldGroup} />
    </FieldGroup>
  )
}

const defaultUIRender = (fields: FormField[], option: FieldOption) => {
  return fields.map(field => fieldBuilder(field, option))
}

const objectBuilder = (fields: FormField[], render: any, option: FieldOption): React.ReactNode => {
  const fields_defined = option.fieldsDefined
    ? { ...globalFormFields, ...option.fieldsDefined }
    : globalFormFields
  const fields_wraped = fields
    .filter(field => field.type === undefined || fields_defined[field.type] !== undefined)
    .map(field => {
      return { ...fields_defined[field.type || 'text'], ...field, option }
    })
    .map(field =>
      option.fieldValidate
        ? {
            ...field,
            validate: field.validate
              ? (...args: any[]) => field.validate!(...args) || option.fieldValidate!(...args)
              : option.fieldValidate
          }
        : field
    )

  return (render || defaultUIRender)(fields_wraped, option)
}

const fieldBuilder = (field: FormField, option: FieldOption, ...props: any[]): React.ReactNode => {
  if (field.render) {
    return field.render(field, option, fieldBuilder, objectBuilder, ...props)
  } else {
    const { name, component: FieldComponent, group, type, ...fieldProps } = field
    // Removed: C('Form.FieldGroup') - xadmin-ui dependency
    // Use default group from option or require it to be passed
    const FieldGroup = group || (option && option.group ? option.group : 'div')

    return (
      <Field
        name={name}
        {...fieldProps}
        component={FieldWrapComponent}
        field={field}
        option={option}
        group={FieldGroup}
        fieldComponent={FieldComponent}
        {...props}
      />
    )
  }
}

const prefixFieldKey = (field: FormField, prefix: string): FormField => {
  const f: FormField = { ...field, key: prefix + field.key, name: prefix + field.name }
  if (field.fields && field.fields.length > 0) {
    f.fields = field.fields.map(cf => prefixFieldKey(cf, prefix))
  }
  return f
}

export { defaultUIRender, objectBuilder, fieldBuilder, prefixFieldKey }
export type { FormField, FieldOption }
