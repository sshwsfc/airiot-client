import React from 'react'
import isEqual from 'lodash/isEqual'
import { atom, useAtom, useSetAtom, useAtomValue, createStore } from 'jotai'
import { atomFamily } from 'jotai/utils'
import { useForm as useRHFForm, type UseFormReturn, type UseFormProps, type FieldValues, Resolver } from 'react-hook-form'
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from 'zod'
import { Store } from 'jotai/vanilla/store'
import { SchemaField, FormField } from './schema'
import { convert as schemaConvert } from './schema'
import { useFormContext } from './context'


// ============================================================================
// Field UI State Types
// ============================================================================

export interface FieldUIState {
  visible?: boolean
  disabled?: boolean
  loading?: boolean
  readonly?: boolean
  required?: boolean
  custom?: Record<string, any>
}

export type FieldUIStateUpdate = Partial<FieldUIState> | ((prev: FieldUIState) => FieldUIState)

export type FieldUIStateSetter = (update: FieldUIStateUpdate) => void

export type FieldUIStateTuple = [
  FieldUIState,
  FieldUIStateSetter,
  () => void
]

// ============================================================================
// Form Hooks Types
// ============================================================================

export interface UseFormPropsExtended extends UseFormProps {
  onEffect?: (values: FieldValues, methods: UseFormReturnExtended) => void
}

export interface UseFormReturnExtended extends UseFormReturn {
  store?: Store
  setFieldUIState?: (fieldName: string, update: any) => void
}

export interface UseFormSchemaProps extends UseFormPropsExtended {
  schema: SchemaField
  formSchema?: FormField[]
}

export interface UseFormSchemaReturn {
  fields: FormField[]
  resolver: Resolver<any, any>
}

// ============================================================================
// Field UI State Atoms
// ============================================================================

// Create a family of atoms for each field's UI state
const fieldUIStates = atomFamily(() => 
  atom<FieldUIState>({
    visible: true,
    disabled: false,
    loading: false,
    readonly: false,
    custom: {}
  })
)

const fieldUIStateFamily = atomFamily((fieldName: string) => atom<FieldUIState, [FieldUIStateUpdate], void>(
  (get) => get(fieldUIStates(fieldName)),
  (get, set, update) => {
    const prev = get(fieldUIStates(fieldName))
    let newState: FieldUIState
    if (typeof update === 'function') {
      newState = (update as (prev: FieldUIState) => FieldUIState)(prev)
    } else {
      newState = {
        ...prev,
        ...update,
      }
    }
    if(isEqual(prev, newState)) return
    set(fieldUIStates(fieldName), newState)
  }
))

// ============================================================================
// Field UI State Hooks
// ============================================================================

/**
 * Hook to access and manage a field's UI state
 * @param fieldName - The name of the field
 * @returns [state, updateState, resetState]
 *
 * @example
 * const [uiState, setUIState, resetUIState] = useFieldUIState('username')
 *
 * // Get state
 * console.log(uiState.visible) // true
 *
 * // Update state
 * setUIState({ visible: false })
 * setUIState({ disabled: true })
 *
 * // Partial update
 * setUIState(prev => ({ ...prev, disabled: true }))
 *
 * // Reset to default
 * resetUIState()
 */
export function useFieldUIState(fieldName: string): FieldUIStateTuple {
  const ctx = useFormContext()
  const fieldStateAtom = fieldUIStateFamily(fieldName)
  const [state, setState] = useAtom(fieldStateAtom, { store: ctx?.store })

  const resetState = React.useCallback(() => {
    setState({
      visible: true,
      disabled: false,
      loading: false,
      readonly: false,
      required: false,
      custom: {}
    })
  }, [setState])

  return [state, setState, resetState]
}

/**
 * Hook to get a field's UI state (read-only)
 * @param fieldName - The name of the field
 * @returns The field's UI state
 *
 * @example
 * const uiState = useFieldUIStateValue('username')
 * console.log(uiState.visible)
 */
export function useFieldUIStateValue(fieldName: string): FieldUIState {
  const ctx = useFormContext()
  const fieldStateAtom = fieldUIStateFamily(fieldName)
  return useAtomValue(fieldStateAtom, { store: ctx?.store })
}

/**
 * Hook to update a field's UI state (write-only)
 * @param fieldName - The name of the field
 * @returns Function to update the field's UI state
 *
 * @example
 * const setUIState = useSetFieldUIState('username')
 * setUIState({ visible: false })
 * setUIState({ disabled: true })
 */
export function useSetFieldUIState(fieldName: string): FieldUIStateSetter {
  const ctx = useFormContext()
  const fieldStateAtom = fieldUIStateFamily(fieldName)
  return useSetAtom(fieldStateAtom, { store: ctx?.store })
}

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Set field visibility
 * @param fieldName - The name of the field
 * @param visible - Visibility state
 *
 * @example
 * setFieldVisibility('username', false)
 */
export function setFieldVisibility(fieldName: string, visible: boolean): void {
  const setUIState = useSetFieldUIState(fieldName)
  setUIState((prev: FieldUIState) => ({ ...prev, visible }))
}

/**
 * Set field disabled state
 * @param fieldName - The name of the field
 * @param disabled - Disabled state
 *
 * @example
 * setFieldDisabled('username', true)
 */
export function setFieldDisabled(fieldName: string, disabled: boolean): void {
  const setUIState = useSetFieldUIState(fieldName)
  setUIState((prev: FieldUIState) => ({ ...prev, disabled }))
}

/**
 * Set field loading state
 * @param fieldName - The name of the field
 * @param loading - Loading state
 *
 * @example
 * setFieldLoading('username', true)
 */
export function setFieldLoading(fieldName: string, loading: boolean): void {
  const setUIState = useSetFieldUIState(fieldName)
  setUIState((prev: FieldUIState) => ({ ...prev, loading }))
}

// ============================================================================
// Form Hooks
// ============================================================================

/**
 * Enhanced useForm hook with field UI state management
 * @param props - Form configuration
 * @returns Extended form methods with setFieldUIState
 *
 * @example
 * const methods = useForm({
 *   defaultValues: { username: '', email: '' },
 *   onEffect: (values, methods) => console.log(values)
 * })
 *
 * // Set field UI state
 * methods.setFieldUIState('username', { disabled: true })
 */
export function useForm(
  props: UseFormPropsExtended = {}
): UseFormReturnExtended {
  const { onEffect, ...restProps } = props
  const store = React.useRef<Store>(createStore())
  const methods = useRHFForm(restProps as any)
  const setFieldUIState = React.useCallback(
    (fieldName: string, update: FieldUIStateUpdate) => {
      const fieldStateAtom = fieldUIStateFamily(fieldName)
      store.current.set(fieldStateAtom, (prev: FieldUIState) => {
        if (typeof update === 'function') {
          return (update as (prev: FieldUIState) => FieldUIState)(prev)
        }
        return {
          ...prev,
          ...update,
        }
      })
    }, [store]);

  const extendedMethods: UseFormReturnExtended = {
    ...methods,
    setFieldUIState,
    store: store.current
  }

  React.useEffect(() => {
    if (!onEffect) return

    const subscription = methods.watch(() => {
      onEffect(methods.getValues(), extendedMethods)
    })

    return () => subscription.unsubscribe()
  }, [onEffect, methods])

  return extendedMethods
}

/**
 * Hook to convert JSON Schema to form fields and Zod resolver
 * @param props - Schema configuration
 * @returns Form fields and Zod resolver
 *
 * @example
 * const { fields, resolver, defaultValues } = useFormSchema({
 *   schema: myJsonSchema
 * })
 *
 * // Use with react-hook-form
 * const methods = useForm({
 *   resolver,
 *   defaultValues
 * })
 */
export function useFormSchema(
  props: UseFormSchemaProps
): UseFormSchemaReturn {
  const { schema, formSchema } = props

  const zodSchema = React.useMemo(() => {
    try {
      return z.fromJSONSchema(schema as any)
    } catch (e) {
      console.error('Failed to convert schema to Zod:', e)
      return z.object({})
    }
  }, [schema])

  const fields = React.useMemo<FormField[]>(() => {
    const result = schemaConvert(schema, { formSchema })
    return result.fields || []
  }, [schema, formSchema])

  const resolver = React.useMemo<Resolver<any, any>>(() => {
    return zodResolver(zodSchema as any)
  }, [zodSchema])

  return {
    fields,
    resolver: resolver as any
  }
}
