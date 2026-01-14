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
import { setSchemaConverters } from './schema'
import { setFormFields } from './builder'

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
