import { en as ajvEn } from 'ajv-i18n'

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

const en: LocalizeFunction = (errors) => {
  ajvEn(errors)

  if (!(errors && errors.length)) return
  for (let i = 0; i < errors.length; i++) {
    let e = errors[i]
    let out: string | undefined
    let schema = e.schema
    switch (e.keyword) {
      case 'required': {
        const pname = e.params.missingProperty
        out = (e.schema?.[pname]?.title || pname) + ' should required'
        break
      }
      default:
        continue
    }
    if (out !== undefined) {
      e.message = out
    }
  }
}

export default en
