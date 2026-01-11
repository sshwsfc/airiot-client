import { ModelSchema } from './base'

export const getFieldProp = (model: ModelSchema | null | undefined, field: string): any => {
  if (!model) return undefined
  return field.split('.').reduce((obj: any, f: string) => {
    return obj && obj.properties && obj.properties[f]
  }, model)
}
