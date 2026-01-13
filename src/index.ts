import createApi, { setContext, getContext } from './api'

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

export {  useConfig, useSetConfig, useConfigValue,
  useSettings, useMessage
} from './hooks'

export const api = createApi

export {
  createApi,
  setContext,
  getContext
}

export type {
  ModelSchema, ModelAtoms
} from './model'

export type {
  FormField, ConvertOptions
} from './form'