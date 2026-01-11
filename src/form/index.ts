import Ajv from 'ajv'
import { FieldArray } from 'react-final-form-arrays'

import {
  BaseForm,
  Form,
  SchemaForm,
  useForm,
  fieldBuilder,
  objectBuilder,
  schemaConvert
} from './base'
import { setSchemaConverters, converters } from './schema'
import { setFormFields } from './builder'

// Initialize AJV with custom keywords and formats
const ajv = new Ajv({ allErrors: true })

// App module definition (removed xadmin dependency)
const app = {
  name: 'xadmin-form',
  items: {
    form_fields: { type: 'map' },
    schema_converter: { type: 'array' },
    form_reducer: { type: 'map' },
    array_render: { type: 'map' },
    ajv_key: { type: 'array' },
    ajv_format: { type: 'array' }
  },
  start: (app: any) => {
    // Add custom AJV keywords if registered
    const keywords = app.get?.('ajv_key') || []
    keywords.forEach((args: [string, any]) => {
      ajv.addKeyword(args[0], args[1])
    })

    // Add custom AJV formats if registered
    const formats = app.get?.('ajv_format') || []
    formats.forEach((args: [string, any]) => {
      ajv.addFormat(args[0], args[1])
    })

    return () => {
      // Cleanup function
    }
  },
  hooks: {
    form: useForm
  },
  schema_converter: converters
}

// Initialize schema converters
setSchemaConverters(converters)

// Export types
export type { FormField, ConvertOptions } from './schema'

// Export components
export { BaseForm, Form, SchemaForm, useForm }

// Export builders
export { fieldBuilder, objectBuilder, schemaConvert }

// Export utilities
export { setSchemaConverters, setFormFields }

// Export FieldArray for convenience
export { FieldArray }

// Export app module for legacy compatibility
export default app
