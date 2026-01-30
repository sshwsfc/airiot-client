import React, { createContext, useContext, Context } from "react"
import type { Store } from 'jotai/vanilla/store'
import type { UseFormReturn } from 'react-hook-form'

// ============================================================================
// Form Context Types
// ============================================================================

export interface FormContextValue extends UseFormReturn {
  store?: Store
  setFieldUIState?: (fieldName: string, update: any) => void
}

// ============================================================================
// Form Context
// ============================================================================

/**
 * Create a typed Form context
 * @param context - Optional context to use (for testing or multiple forms)
 * @returns Form context object
 */
export function createFormContext(
  context?: Context<FormContextValue | null>
): Context<FormContextValue | null> {
  return (context || createContext<FormContextValue | null>(null)) as Context<FormContextValue | null>
}

/**
 * Default Form context
 */
const FormContext = createFormContext()

/**
 * Form Provider Component
 * Provides form context to all children components
 *
 * @example
 * <FormProvider store={store} methods={methods}>
 *   <YourForm />
 * </FormProvider>
 */
export const FormProvider = ({
  children,
  value,
  ...props
}: any) => {
  const contextValue: FormContextValue = value || props

  return (
    <FormContext.Provider value={contextValue}>
      {children}
    </FormContext.Provider>
  )
}

// ============================================================================
// use Form Context Hook
// ============================================================================

/**
 * Hook to access Form context
 * Must be used within a FormProvider
 *
 * @returns Form context value
 * @throws Error if used outside of FormProvider
 *
 * @example
 * const { store, methods, setFieldUIState } = useFormContext()
 */
export const useFormContext = (): FormContextValue => {
  const value = useContext(FormContext as Context<FormContextValue | null>)

  if (!value) {
    throw new Error("useFormContext must be used within a FormProvider")
  }

  return value
}
