import React from 'react'
import { useFormContext, Controller, RegisterOptions } from 'react-hook-form'
import { FormField } from './schema'

// ============================================================================
// Types
// ============================================================================

interface FieldOption {
  fieldsDefined?: Record<string, FormField>
  fieldValidate?: any
  group?: React.ComponentType<any>
  form?: any
  invalid?: boolean
  [key: string]: any
}

interface FormFieldDefinition extends Omit<FormField, 'name'> {
  name?: string
}

// ============================================================================
// Global Form Fields Registry
// ============================================================================

let globalFormFields: Record<string, FormFieldDefinition> = {}

export const setFormFields = (fields: Record<string, FormFieldDefinition>) => {
  globalFormFields = { ...globalFormFields, ...fields }
}

export const getFormFields = () => globalFormFields

// ============================================================================
// Field Wrap Component
// ============================================================================

interface FieldWrapComponentProps {
  fieldComponent: React.ComponentType<any>
  group: React.ComponentType<any> | string
  field: FormField
  form: any
  option: FieldOption
  [key: string]: any
}

const FieldWrapComponent: React.FC<FieldWrapComponentProps> = ({
  fieldComponent: FieldComponent,
  group: FieldGroup,
  field,
  form,
  option,
  ...props
}) => {
  const { control } = useFormContext()
  const { name } = field
  const { effect, formEffect } = field

  // Get field data (for display, required, etc.)
  const fieldDataKey = `__fieldData_${name}`
  const fieldData = useFormContext().watch(fieldDataKey as any) || {}

  // Handle effect hooks
  React.useEffect(() => {
    if (formEffect && form) {
      formEffect(form, { field, form, option })
    }
    if (effect && form) {
      form.useField(name, (state: any) => effect(state, form, field))
    }
  }, [form, effect, formEffect, name])

  if (fieldData.display === false) {
    return null
  }

  const newField = fieldData.field ? { ...field, ...fieldData.field } : field
  if (fieldData.required === true) {
    newField.required = true
  }

  const rules: RegisterOptions = {}

  // Add custom validation
  if (option.fieldValidate || field.validate) {
    rules.validate = React.useCallback(
      (value: any, values: any) => {
        if (option.fieldValidate) {
          const result = option.fieldValidate(value, values, {
            name,
            data: fieldData,
            field
          })
          if (result) return result
        }
        if (field.validate) {
          return field.validate(value, values, {
            name,
            data: fieldData,
            field
          })
        }
        return undefined
      },
      [field, fieldData, option.fieldValidate, name]
    )
  }

  // Add required validation
  if (newField.required) {
    rules.required = fieldData.validationMessage || `${newField.label || name} is required`
  }

  // Add field type validations
  if (newField.type === 'number' || newField.type === 'integer') {
    if (newField.minimum !== undefined) {
      rules.min = { value: newField.minimum, message: newField.validationMessage || `Must be at least ${newField.minimum}` }
    }
    if (newField.maximum !== undefined) {
      rules.max = { value: newField.maximum, message: newField.validationMessage || `Must be at most ${newField.maximum}` }
    }
  }

  if (newField.type === 'text' || newField.type === 'textarea') {
    if (newField.minlength !== undefined) {
      rules.minLength = { value: newField.minlength, message: newField.validationMessage || `Minimum ${newField.minlength} characters` }
    }
    if (newField.maxlength !== undefined) {
      rules.maxLength = { value: newField.maxlength, message: newField.validationMessage || `Maximum ${newField.maxlength} characters` }
    }
    if (newField.pattern) {
      rules.pattern = { value: new RegExp(newField.pattern), message: newField.validationMessage || 'Invalid format' }
    }
  }

  // If FieldComponent doesn't use useGroup, render directly
  if ((FieldComponent as any).useGroup === false) {
    return (
      <Controller
        name={name as any}
        control={control}
        rules={rules}
        render={({ field: controllerField, fieldState: { error } }) => (
          <FieldComponent
            {...props}
            {...controllerField}
            field={newField}
            form={form}
            option={option}
            meta={{
              value: controllerField.value,
              name: controllerField.name,
              onChange: controllerField.onChange,
              onBlur: controllerField.onBlur,
              data: fieldData,
              error: error?.message,
              touched: false,
              valid: !error
            }}
          />
        )}
      />
    )
  }

  // Otherwise wrap in FieldGroup
  return (
    <FieldGroup {...props} field={newField}>
      <Controller
        name={name as any}
        control={control}
        rules={rules}
        render={({ field: controllerField, fieldState: { error } }) => (
          <FieldComponent
            {...props}
            {...controllerField}
            field={newField}
            form={form}
            option={option}
            group={FieldGroup}
            meta={{
              value: controllerField.value,
              name: controllerField.name,
              onChange: controllerField.onChange,
              onBlur: controllerField.onBlur,
              data: fieldData,
              error: error?.message,
              touched: false,
              valid: !error
            }}
          />
        )}
      />
    </FieldGroup>
  )
}

// ============================================================================
// Default UI Render
// ============================================================================

const defaultUIRender = (fields: FormField[], option: FieldOption) => {
  return fields.map((field, index) => (
    <React.Fragment key={field.name || field.key || index}>
      {fieldBuilder(field, option)}
    </React.Fragment>
  ))
}

// ============================================================================
// Object Builder
// ============================================================================

export const objectBuilder = (fields: FormField[], render: any, option: FieldOption): React.ReactNode => {
  const fields_defined = option.fieldsDefined
    ? { ...globalFormFields, ...option.fieldsDefined }
    : globalFormFields

  const fields_wraped = fields
    .filter((field) => field.type === undefined || fields_defined[field.type] !== undefined)
    .map((field) => {
      return { ...fields_defined[field.type || 'text'], ...field, option }
    })
    .map((field) =>
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

// ============================================================================
// Field Builder
// ============================================================================

export const fieldBuilder = (field: FormField, option: FieldOption, ...props: any[]): React.ReactNode => {
  if (field.render) {
    return field.render(field, option, fieldBuilder, objectBuilder, ...props)
  } else {
    const { name, component: FieldComponent, group, type, ...fieldProps } = field
    const FieldGroup = group || (option?.group ? option.group : 'div')

    if (!name) {
      console.warn('Field is missing name property:', field)
      return null
    }

    if (!FieldComponent) {
      console.warn(`Field "${name}" is missing component property`)
      return null
    }

    return (
      <FieldWrapComponent
        key={name}
        name={name}
        field={field}
        form={option.form}
        option={option}
        fieldComponent={FieldComponent}
        group={FieldGroup}
        {...fieldProps}
        {...props}
      />
    )
  }
}

// ============================================================================
// Prefix Field Key
// ============================================================================

export const prefixFieldKey = (field: FormField, prefix: string): FormField => {
  const f: FormField = { ...field, key: prefix + field.key, name: prefix + field.name }
  if (field.fields && field.fields.length > 0) {
    f.fields = field.fields.map((cf) => prefixFieldKey(cf, prefix))
  }
  return f
}

// ============================================================================
// Exports
// ============================================================================

export { defaultUIRender }
export type { FormField, FieldOption, FieldWrapComponentProps }
