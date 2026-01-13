import createAPI, { setContext, getContext } from './api'

export {
  Model,
  ModelContext,
  useModel,
  useModelValue,
  useModelState,
  useSetModelState,
  useModelCallback,
  useModelGet,
  useModelSave,
  useModelDelete,
  useModelGetItems,
  useModelItem,
  useModelQuery,
  useModelPermission,
  useModelEvent,
  useModelEffect,
  useModelPagination,
  useModelCount,
  useModelPageSize,
  useModelFields,
  useModelList,
  useModelSelect,
  useModelListRow,
  useModelListHeader,
  useModelListOrder,
  useModelListItem
} from './model'

export {
  Form, SchemaForm, useForm,
  fieldBuilder, objectBuilder, schemaConvert, FieldArray
} from './form'

export {
  useLogin, useLogout, useUser, useUserReg
} from './auth'

export {  getSettings, useMessage
} from './hooks'

export { getConfig, setConfig
} from './config'

export const api = createAPI

export {
  createAPI,
  setContext,
  getContext
}

export type {
  ModelSchema, ModelAtoms
} from './model'

export type {
  FormField, ConvertOptions
} from './form'