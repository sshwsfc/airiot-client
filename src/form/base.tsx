import React, { useEffect } from 'react'
import { Form as RForm, useForm as rUseForm } from 'react-final-form'
import arrayMutators from 'final-form-arrays'
import Ajv from 'ajv'

import cloneDeep from 'lodash/cloneDeep'
import isArray from 'lodash/isArray'
import isEmpty from 'lodash/isEmpty'
import isFunction from 'lodash/isFunction'
import isNil from 'lodash/isNil'
import isNumber from 'lodash/isNumber'
import isPlainObject from 'lodash/isPlainObject'
import set from 'lodash/set'
import some from 'lodash/some'

import ajvLocalize from './locales/index'
import { convert as schemaConvert, FormField } from './schema'
import { findFieldByName } from './utils'
import { fieldBuilder, objectBuilder } from './builder'

const datetimeRegex = /^[1-9]\d{3}-(0[1-9]|1[0-2])-(0[1-9]|[1-2][0-9]|3[0-1])\s+(20|21|22|23|[0-1]\d):[0-5]\d:[0-5]\d$/
const ajv = new Ajv({ allErrors: true, verbose: true, nullable: true, formats: { datetime: datetimeRegex } })

// i18n support - removed xadmin-i18n dependency
const t = (key: string, params?: Record<string, any>): string => {
  // Simple placeholder replacement
  return key.replace(/\{\{(\w+)\}\}/g, (match, paramKey) => {
    return params?.[paramKey] !== undefined ? String(params[paramKey]) : match
  })
}

const _t = (key: string, params?: Record<string, any>): string => {
  // Wrapper for compatibility
  return t(key, params)
}

interface BaseFormProps {
  key?: string
  fields?: FormField[]
  render?: any
  option?: any
  component?: React.ComponentType<any>
  children?: (props: any) => React.ReactNode
  handleSubmit?: any
  errors?: any
  effect?: (form: any) => void
  invalid?: boolean
  [key: string]: any
}

const BaseForm = ({ key, ...props }: BaseFormProps) => {
  const { effect, fields, render, option, component, children, handleSubmit, errors, ...formProps } = props
  const form = useForm().form
  const invalid = !(isNil(errors) || isEmpty(errors))

  const fieldValidate = React.useCallback(
    (value: any, values: any, meta: any) => {
      if (meta.data?.required) {
        if (!isNumber(value) && isEmpty(value)) {
          return _t(`{{label}} is required`, {
            label: findFieldByName(meta.name, fields || [])?.label || meta.name
          })
        }
      }
    },
    [fields]
  )

  const build_fields = objectBuilder(fields || [], render, {
    form,
    ...option,
    invalid,
    ...formProps,
    fieldValidate
  })

  useEffect(() => {
    if (effect && form) {
      effect(form)
    }
  }, [form, effect])

  if (component) {
    const FormComponent = component
    return (
      <FormComponent key={key} {...props} invalid={invalid}>
        {build_fields}
      </FormComponent>
    )
  } else if (children) {
    return children({ ...props, invalid, children: build_fields })
  } else {
    // Removed: C('Form.Layout') - xadmin-ui dependency
    // Use default div or require Form.Layout to be passed
    const FormComponent = (option?.FormLayout as any) || 'div'
    return (
      <FormComponent key={key} {...props} invalid={invalid}>
        {build_fields}
      </FormComponent>
    )
  }
}

const isPromise = (obj: any): boolean =>
  !!obj && (typeof obj === 'object' || typeof obj === 'function') && typeof obj.then === 'function'

interface FormProps {
  formKey?: string
  validate?: any
  effect?: (form: any) => void
  fields?: FormField[]
  render?: any
  option?: any
  component?: React.ComponentType<any>
  children?: (props: any) => React.ReactNode
  wrapProps?: any
  onChange?: (values: any) => void
  onSubmitSuccess?: (values: any, form: any) => void
  onSubmit: (values: any, form: any, callback?: any) => any
  data?: any
  formRef?: React.RefObject<any>
  [key: string]: any
}

const Form = (props: FormProps) => {
  const {
    formKey,
    validate,
    effect,
    fields,
    render,
    option,
    component,
    children,
    wrapProps,
    onChange,
    onSubmitSuccess,
    onSubmit,
    data,
    formRef,
    ...formProps
  } = props
  // Removed: config('form-config') - xadmin dependency
  const formConfig = {} // Default empty config

  const mutators = {
    setFieldData: ([name, data]: [string, any], state: any) => {
      const field = state.fields[name]
      if (field) {
        field.data = { ...field.data, ...data }
      }
    }
  }

  const formEffect = (form: any) => {
    if (onChange != undefined && typeof onChange === 'function') {
      form.useEffect(({ values }: { values: any }) => {
        const { dirty, modified } = form.getState()
        if (dirty || some(Object.values(modified))) {
          onChange(values)
        }
      }, ['values'])
    }

    if (onSubmitSuccess != undefined && typeof onSubmitSuccess === 'function') {
      form.useEffect(({ submitSucceeded }: { submitSucceeded: boolean }) => {
        submitSucceeded && onSubmitSuccess(form.submitReturnValue || form.getState().values, form)
      }, ['submitSucceeded'])
    }

    form.data = data
    if (formRef) {
      formRef.current = form
    }
    effect && effect(form)
  }

  const onSubmitHandler = React.useCallback(
    (values: any, form: any, callback?: any) => {
      const result = onSubmit(values, form, callback)

      if (result && isPromise(result)) {
        return new Promise((resolve, reject) => {
          result
            .then((retValue: any) => {
              form.submitReturnValue = retValue
              resolve(retValue)
            })
            .catch((err: any) => {
              resolve(err)
            })
        })
      } else if (onSubmit.length < 3) {
        callback && callback(result)
      }
    },
    [onSubmit]
  )

  return (
    <RForm
      key={formKey}
      validate={validate}
      mutators={{
        ...arrayMutators,
        ...mutators
      }}
      onSubmit={onSubmitHandler}
      subscription={{ submitting: true, pristine: true, errors: true, submitErrors: true }}
      {...formConfig}
      {...formProps}
      {...wrapProps}
    >
      {(props) => (
        <BaseForm
          {...props}
          effect={formEffect}
          fields={fields}
          render={render}
          option={option}
          component={component}
          children={children}
        />
      )}
    </RForm>
  )
}

const omitNull = (value: any): any => {
  if (isPlainObject(value)) {
    Object.keys(value).forEach((k) => {
      let ret = omitNull(value[k])
      if (ret == null) {
        delete value[k]
      } else {
        value[k] = ret
      }
    })
  } else if (isArray(value)) {
    value.forEach(omitNull)
  }
  return value
}

interface SchemaFormProps {
  schema: any
  validate?: (values: any) => any
  effect?: (form: any) => void
  fields?: FormField[]
  render?: any
  option?: any
  component?: React.ComponentType<any>
  children?: (props: any) => React.ReactNode
  formRef?: React.RefObject<any>
  onChange?: (values: any) => void
  onSubmitSuccess?: (values: any, form: any) => void
  onSubmit: (values: any, form: any, callback?: any) => any
  [key: string]: any
}

const SchemaForm = (props: SchemaFormProps) => {
  const { schema } = props
  const formRef = React.useRef<any>(null)

  if (!isPlainObject(schema)) {
    return null
  }

  const { fields } = schemaConvert(schema)

  const validate = (vs: any) => {
    const values = cloneDeep(vs)

    const ajValidate = ajv.compile(schema)
    const valid = ajValidate(omitNull(values))

    if (!valid) {
      // Removed: app.context.i18n - xadmin dependency
      // Default to English localization
      if (ajvLocalize['en']) {
        ajvLocalize['en'](ajValidate.errors)
      }
    }
    let errors = props.validate && isFunction(props.validate) ? props.validate(values) : {}

    errors = valid
      ? errors
      : ajValidate.errors?.reduce((prev: any, err: any) => {
          let p = err.dataPath
          if (err.keyword == 'required' && err.params.missingProperty) {
            if (err.params.missingProperty.indexOf('-') >= 0) {
              p += `['${err.params.missingProperty}']`
            } else {
              p += '.' + err.params.missingProperty
            }
          }
          if (p.startsWith('.')) p = p.substring(1)
          set(prev, p, err.message)
          return prev
        }, errors)

    return errors
  }

  return <Form {...props} onSubmit={props.onSubmit} validate={validate} fields={fields} effect={schema.formEffect} formRef={formRef} />
}

const useForm = () => {
  const form = rUseForm()

  const useField = (name: string, subscriber: any, effects: string[] = ['value']) => {
    form.registerField(
      name,
      subscriber,
      effects && effects.reduce((prev: any, ef: string) => {
        prev[ef] = true
        return prev
      }, {})
    )
  }

  const setFieldData = form.mutators.setFieldData

  const useEffect = (subscriber: any, effects: string[] = ['values']) => {
    form.subscribe(
      subscriber,
      effects && effects.reduce((prev: any, ef: string) => {
        prev[ef] = true
        return prev
      }, {})
    )
  }

  return { form, useField, setFieldData, useEffect }
}

export { BaseForm, Form, SchemaForm, useForm, fieldBuilder, objectBuilder, schemaConvert }
export type { BaseFormProps, FormProps, SchemaFormProps, FormField }
