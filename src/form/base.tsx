import React, { useCallback, useEffect, useMemo } from 'react'
import { FormProvider, useFormContext, useForm as useRHFForm } from 'react-hook-form'

import isEmpty from 'lodash/isEmpty'
import isNil from 'lodash/isNil'
import isNumber from 'lodash/isNumber'
import some from 'lodash/some'

import { fieldBuilder, objectBuilder } from './builder'
import { findFieldByName } from './utils'

// ============================================================================
// Types
// ============================================================================

interface BaseFormProps {
  key?: string
  fields?: FormField[]
  render?: any
  option?: any
  component?: React.ComponentType<any>
  children?: (props: any) => React.ReactNode
  handleSubmit?: any
  errors?: any
  effect?: (form: FormMethods) => void
  invalid?: boolean
  [key: string]: any
}

interface FormProps {
  formKey?: string
  schema?: any
  validate?: (values: any) => any
  effect?: (form: FormMethods) => void
  fields?: FormField[]
  render?: any
  option?: any
  component?: React.ComponentType<any>
  children?: (props: any) => React.ReactNode
  wrapProps?: any
  onChange?: (values: any) => void
  onSubmitSuccess?: (values: any, form: FormMethods) => void
  onSubmit: (values: any, form: FormMethods, callback?: any) => any
  data?: any
  formRef?: React.RefObject<FormMethods>
  [key: string]: any
}

interface SchemaFormProps {
  schema: any
  validate?: (values: any) => any
  effect?: (form: FormMethods) => void
  fields?: FormField[]
  render?: any
  option?: any
  component?: React.ComponentType<any>
  children?: (props: any) => React.ReactNode
  formRef?: React.RefObject<FormMethods>
  onChange?: (values: any) => void
  onSubmitSuccess?: (values: any, form: FormMethods) => void
  onSubmit: (values: any, form: FormMethods, callback?: any) => any
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
  [key: string]: any
}

interface FormState {
  values: any
  dirty: boolean
  pristine: boolean
  submitting: boolean
  submitSucceeded: boolean
  errors: Record<string, any>
  submitErrors: Record<string, any>
  modified: Record<string, boolean>
  touched: Record<string, boolean>
}

// Form methods compatible with the old API
interface FormMethods {
  getState: () => FormState
  change: (field: string, value: any) => void
  reset: (values?: any) => void
  submit: () => void
  getValues: () => any
  setFieldValue: (field: string, value: any) => void
  setFieldData: (field: string, data: any) => void
  useField: (name: string, subscriber: any, effects?: string[]) => void
  useEffect: (subscriber: any, effects?: string[]) => void
  data?: any
  mutators?: {
    setFieldData: (args: [string, any], state: any) => void
  }
  submitReturnValue?: any
}

// ============================================================================
// i18n support
// ============================================================================

const t = (key: string, params?: Record<string, any>): string => {
  return key.replace(/\{\{(\w+)\}\}/g, (match, paramKey) => {
    return params?.[paramKey] !== undefined ? String(params[paramKey]) : match
  })
}

const _t = (key: string, params?: Record<string, any>): string => {
  return t(key, params)
}

// ============================================================================
// Form Methods Adapter
// ============================================================================

class FormMethodsAdapter implements FormMethods {
  private rhfMethods: ReturnType<typeof useRHFForm>
  private fieldSubscribers: Map<string, Set<any>> = new Map()
  private effectSubscribers: Set<any> = new Set()
  private internalData?: any
  public submitReturnValue?: any

  constructor(rhfMethods: ReturnType<typeof useRHFForm>) {
    this.rhfMethods = rhfMethods
  }

  getState = (): FormState => {
    const formState = this.rhfMethods.formState
    const dirtyFields = this.rhfMethods.formState.dirtyFields

    return {
      values: this.rhfMethods.getValues(),
      dirty: formState.isDirty,
      pristine: !formState.isDirty,
      submitting: formState.isSubmitting,
      submitSucceeded: formState.isSubmitSuccessful,
      errors: formState.errors,
      submitErrors: (formState.errors as any) || {},
      modified: dirtyFields as Record<string, boolean>,
      touched: formState.touchedFields as Record<string, boolean>
    }
  }

  change = (field: string, value: any) => {
    this.rhfMethods.setValue(field, value)
  }

  reset = (values?: any) => {
    this.rhfMethods.reset(values)
  }

  submit = () => {
    // Trigger form submission
    this.rhfMethods.handleSubmit(() => {})()
  }

  getValues = (): any => {
    return this.rhfMethods.getValues()
  }

  setFieldValue = (field: string, value: any) => {
    this.rhfMethods.setValue(field, value)
  }

  setFieldData = (field: string, data: any) => {
    // Store field data separately
    const fieldDataKey = `__fieldData_${field}`
    this.rhfMethods.setValue(fieldDataKey, data)
  }

  useField = (name: string, subscriber: any, _effects: string[] = ['value']) => {
    if (!this.fieldSubscribers.has(name)) {
      this.fieldSubscribers.set(name, new Set())
    }
    this.fieldSubscribers.get(name)!.add(subscriber)

    // Subscribe to field changes
    this.rhfMethods.watch((_value, { name: changedField }) => {
      if (changedField === name) {
        subscriber({ value: this.rhfMethods.getValues(name) })
      }
    })
  }

  useEffect = (subscriber: any, _effects: string[] = ['values']) => {
    this.effectSubscribers.add(subscriber)
    subscriber(this.getState())
  }

  get data() {
    return this.internalData
  }

  set data(value: any) {
    this.internalData = value
  }

  get mutators() {
    return {
      setFieldData: ([name, data]: [string, any], _state: any) => {
        this.setFieldData(name, data)
      }
    }
  }

  notifySubscribers = () => {
    const state = this.getState()
    this.effectSubscribers.forEach(subscriber => subscriber(state))
  }
}

// ============================================================================
// BaseForm Component
// ============================================================================

const BaseForm = ({ key, ...props }: BaseFormProps) => {
  const { effect, fields, render, option, component, children, handleSubmit, errors, ...formProps } = props
  const methods = useFormContext()
  const form = useMemo(() => new FormMethodsAdapter(methods), [methods])

  const invalid = !(isNil(errors) || isEmpty(errors))

  const fieldValidate = useCallback(
    (value: any, _values: any, meta: any) => {
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
    const FormComponent = (option?.FormLayout as any) || 'div'
    return (
      <FormComponent key={key} {...props} invalid={invalid}>
        {build_fields}
      </FormComponent>
    )
  }
}

// ============================================================================
// Form Component
// ============================================================================

const isPromise = (obj: any): boolean =>
  !!obj && (typeof obj === 'object' || typeof obj === 'function') && typeof obj.then === 'function'

const Form = ({
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
}: FormProps) => {
  const formConfig = {} // Default empty config

  // Create resolver
  const resolver = validate
    ? async (values: any) => {
        const errors = validate(values)
        return { values: isEmpty(errors) ? values : {}, errors }
      }
    : undefined

  const methods = useRHFForm({
    resolver,
    mode: 'onSubmit',
    reValidateMode: 'onChange',
    criteriaMode: 'firstError',
    shouldFocusError: true,
    ...formConfig,
    ...formProps
  })

  const form = useMemo(() => new FormMethodsAdapter(methods), [methods])

  // Handle form ref
  useEffect(() => {
    if (formRef) {
      (formRef as any).current = form
    }
    return () => {
      if (formRef) {
        (formRef as any).current = null
      }
    }
  }, [form, formRef])

  // Set data
  useEffect(() => {
    form.data = data
  }, [form, data])

  // Handle onChange
  useEffect(() => {
    if (onChange && typeof onChange === 'function') {
      const subscription = methods.watch((values: any) => {
        const { dirtyFields } = methods.formState
        const dirty = Object.keys(dirtyFields).length > 0
        if (dirty || some(Object.values(dirtyFields))) {
          onChange(values)
          form.notifySubscribers()
        }
      })
      return () => subscription.unsubscribe()
    }
  }, [methods, onChange, form])

  // Handle onSubmitSuccess
  useEffect(() => {
    if (onSubmitSuccess && typeof onSubmitSuccess === 'function') {
      if (methods.formState.isSubmitSuccessful) {
        onSubmitSuccess(form.submitReturnValue || methods.getValues(), form)
      }
    }
  }, [methods.formState.isSubmitSuccessful, onSubmitSuccess, form])

  // Call effect
  useEffect(() => {
    if (effect && form) {
      effect(form)
    }
  }, [form, effect])

  const onSubmitHandler = useCallback(
    async (values: any) => {
      try {
        const result = onSubmit(values, form)

        if (result && isPromise(result)) {
          const retValue = await result
          form.submitReturnValue = retValue
          return retValue
        } else {
          return result
        }
      } catch (err) {
        throw err
      }
    },
    [onSubmit, form]
  )

  return (
    <FormProvider {...methods}>
      <form
        key={formKey}
        onSubmit={methods.handleSubmit(onSubmitHandler)}
        {...wrapProps}
      >
        <BaseForm
          {...formProps}
          effect={effect}
          fields={fields}
          render={render}
          option={option}
          component={component}
          children={children}
          errors={methods.formState.errors}
        />
      </form>
    </FormProvider>
  )
}

// ============================================================================
// useForm Hook
// ============================================================================

const useForm = () => {
  const methods = useFormContext()
  const form = useMemo(() => new FormMethodsAdapter(methods), [methods])

  const useField = (name: string, subscriber: any, effects: string[] = ['value']) => {
    useEffect(() => {
      form.useField(name, subscriber, effects)
    }, [form, name, subscriber, effects])
  }

  const setFieldData = form.mutators?.setFieldData

  const useEffectHook = (subscriber: any, effects: string[] = ['values']) => {
    useEffect(() => {
      form.useEffect(subscriber, effects)
    }, [form, subscriber, effects])
  }

  return { form, useField, setFieldData, useEffect: useEffectHook }
}

// ============================================================================
// Exports
// ============================================================================

export { BaseForm, fieldBuilder, Form, objectBuilder, useForm }
export type { BaseFormProps, FormField, FormMethods, FormProps, FormState, SchemaFormProps }

