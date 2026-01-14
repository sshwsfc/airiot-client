interface Field {
  name?: string
  key?: string
  label?: string
  type?: string
  fields?: Field[]
  items?: {
    fields?: Field[]
  }
  [key: string]: any
}

function findFieldByName(name: string, fields: Field[]): Field | null {
  function searchFields(name: string, fields: Field[]): Field | null {
    for (let field of fields) {
      if (field.name === name) {
        return field
      }
    }
    return null
  }

  function parsePath(path: string) {
    let parts = path.split('.')
    let result: Array<{ key: string; index: number | null; prefixs: any[] }> = []
    for (let part of parts) {
      if (part.includes('[')) {
        let parts = part.split('[')
        let key = parts[0]
        let indexStr = parts[1]?.replace(']', '')
        let index = indexStr ? parseInt(indexStr, 10) : -1
        result.push({ key, index, prefixs: [...result] })
      } else {
        result.push({ key: part, index: null, prefixs: [...result] })
      }
    }
    return result
  }

   let pathParts = parsePath(name)
  let currentFields = fields
  let field: Field | null = null
  for (let { key, index, prefixs } of pathParts) {
    let trueKey: string[] = [key]
    for (let index2 = prefixs.length - 1; index2 >= 0; index2--) {
      const p = prefixs[index2]
      if (p && p.index == null && p.key) {
        trueKey = [p.key, ...trueKey]
      } else {
        break
      }
    }
    field = searchFields(trueKey.join('.'), currentFields)
    if (!field) return null
    if (field) {
      if (index !== null && field.items && field.items.fields) {
        currentFields = field.items.fields
        field = currentFields[index]
      } else if (index !== null && field.fields) {
        currentFields = field.fields
        field = currentFields[index]
      } else {
        currentFields = field.fields || []
      }
    } else {
      return null
    }
  }

  return field || null
}

export { findFieldByName }
export type { Field }
