// Re-export ajv-i18n localizations
export * from 'ajv-i18n'

import en from './en'
import zh_Hans from './zh_Hans'

interface AJVError {
  keyword: string
  dataPath: string
  schemaPath?: string
  params?: any
  message?: string
  data?: any
  schema?: any
}

type LocalizeFunction = (errors: AJVError[] | null | undefined) => void

// Export our custom localizations
export { en, zh_Hans }

// Default export combining all localizations
const locales: Record<string, LocalizeFunction> = {
  en,
  zh_Hans
}

export default locales
