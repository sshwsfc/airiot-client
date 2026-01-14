// Re-export ajv-i18n localizations
export * from 'ajv-i18n'

import en from './en'
import zh_Hans from './zh_Hans'

type LocalizeFunction = (errors: any) => void

// Export our custom localizations
export { en, zh_Hans }

// Default export combining all localizations
const locales: Record<string, LocalizeFunction> = {
  en,
  zh_Hans
}

export default locales
