import clone from 'lodash/clone'
import has from 'lodash/has'
import isArray from 'lodash/isArray'
import isEmpty from 'lodash/isEmpty'
import isFunction from 'lodash/isFunction'
import isNil from 'lodash/isNil'
import isObject from 'lodash/isObject'
import isPlainObject from 'lodash/isPlainObject'
import isString from 'lodash/isString'
import omit from 'lodash/omit'
import values from 'lodash/values'
import dayjs from 'dayjs'
import axios, { AxiosRequestConfig, AxiosResponse } from 'axios'
import { noToken, noGetToken } from './noToken'
import { getConfig } from '../config'

// 类型定义
interface User {
  token?: string
  [key: string]: any
}

interface AppContext {
  user?: User
  language?: string
  settings?: {
    safeRequest?: boolean
    [key: string]: any
  }
  [key: string]: any
}

interface SchemaProperty {
  type?: string
  format?: string
  items?: SchemaProperty
  properties?: Record<string, SchemaProperty>
  nullFilter?: boolean
  related?: string
  filterQueryConvert?: (params: { key: string; value: any }) => { key: string; value: any }
  [key: string]: any
}

export interface APIOptions {
  name?: string
  resource?: string
  proxyKey?: string
  headers?: Record<string, string>
  idProp?: string | string[]
  convertItem?: (item: any) => any
  queryParams?: Record<string, any>
  projectAll?: boolean
  projectFields?: string[]
  customQuery?: (api: any, filter: any, wheres: any, convertItem: any) => Promise<any>
  apiMessage?: boolean
  properties?: Record<string, SchemaProperty>
  [key: string]: any
}

export interface QueryOptions {
  order?: Record<string, 'ASC' | 'DESC'>
  skip?: number
  limit?: number
  groupBy?: string
  fields?: string[]
  [key: string]: any
}

export interface FetchOptions {
  method?: string
  headers?: Record<string, string>
  body?: string
  noMessage?: boolean
  apiMessage?: boolean
  [key: string]: any
}

export interface APIResponse {
  json: any
  headers: Record<string, string>
}

export interface API {
  model: APIOptions
  host: string
  resource: string
  headers: Record<string, string>

  // 方法
  fetch: (uri: string, options?: FetchOptions) => Promise<APIResponse>
  query: (filter?: any, wheres?: any, withCount?: boolean, ...params: any[]) => Promise<{ items: any[]; total: number }>
  get: (id?: string, option?: FetchOptions) => Promise<any>
  getOrigin: (id?: string) => Promise<APIResponse>
  delete: (id?: string) => Promise<any>
  save: (data?: any, partial?: boolean) => Promise<any>
}

interface APIInstance extends API {
  noToken: string[]
  noGetToken: string[]

  // 方法
  convert_format: (v: any, schema: SchemaProperty) => any
  convert_item: (item: any) => any
  count: (filter?: any) => Promise<number>
  convert: (f: QueryOptions) => any
  convert_value: (value: any, keys: string[]) => any
  convert_where_value: (w: any) => any
  convert_uidToId: (object?: Record<string, any>) => void
  convert_where: (wheres: any) => any
  convert_where_filters: (v: any) => any
  convert_data: (data: any) => any
}

function mergeQueries(...queries: Record<string, any>[]): Record<string, any> {
  const merged: Record<string, any> = {}
  const fieldConditions: Record<string, any[]> = {}

  // 1. 收集所有字段的条件
  for (const query of queries) {
    for (const [field, condition] of Object.entries(query)) {
      if (!fieldConditions[field]) {
        fieldConditions[field] = []
      }
      fieldConditions[field].push({ [field]: condition })
    }
  }

  // 2. 合并条件：相同字段拆解到顶层 $and
  const andConditions: Record<string, any>[] = []
  for (const [field, conditions] of Object.entries(fieldConditions)) {
    if (conditions.length === 1) {
      merged[field] = conditions[0][field]
    } else {
      andConditions.push(...conditions)
    }
  }

  // 3. 如果有 $and 条件，合并到顶层
  if (andConditions.length > 0) {
    if (Object.keys(merged).length > 0) {
      andConditions.push(merged)
    }
    return { $and: andConditions }
  }

  return merged
}

function getTimezoneOffset(): string {
  const offset = new Date().getTimezoneOffset()
  const absOffset = Math.abs(offset)
  const hours = String(Math.floor(absOffset / 60)).padStart(2, '0')
  const minutes = String(absOffset % 60).padStart(2, '0')
  const sign = offset <= 0 ? '+' : '-'
  return `${sign}${hours}:${minutes}`
}

function getHost(options: APIOptions): string {
  if (options?.proxyKey) return options.proxyKey
  return getConfig().rest || '/rest/'
}

function getHeaders(options: FetchOptions, context: AppContext, resource: string, noTokenList: string[], noGetTokenList: string[]): Record<string, string> {
  const user = context.user
  const lang = context.language
  const settings = context.settings
  const methods = ['DELETE', 'PATCH', 'PUT']

  const hs: Record<string, string> = {
    'Content-Type': 'application/json',
    'X-Request-TimeZone': getTimezoneOffset()
  }

  if (user && user.token) {
    let filterToken: string[] = []
    filterToken = noTokenList?.length ? noTokenList.filter(val => val === resource) : []
    filterToken = noGetTokenList?.length ? noGetTokenList.filter(val => {
      if (val === resource && options?.method === 'GET') return val
      return undefined
    }) : []
    if (filterToken?.length === 0) hs['Authorization'] = user.token
  }

  // 手动传了token
  if (options?.headers?.['Authorization']) {
    hs['Authorization'] = options?.headers?.['Authorization']
  }

  const projectId = typeof location !== 'undefined' ? location.pathname.split('/').find(p => p.startsWith('_p_')) : null
  if (projectId) {
    hs['x-request-project'] = projectId.substring(3)
  } else {
    if(getConfig().projectId){
      hs['x-request-project'] = getConfig().projectId
    }
  }

  if (lang) {
    hs['Accept-Language'] = lang
  }

  if (settings?.safeRequest && options?.method && methods.includes(options?.method)) {
    hs['x-request-http-method'] = options?.method
  }

  return hs
}

// 工厂函数创建 API 实例
export function createAPI(options: APIOptions, context?: AppContext): APIInstance {
  const ctx = context || getConfig()
  const model = options
  const host = getHost(options)
  let resource = options.resource || options.name

  if (resource === undefined) {
    throw new Error('api option resource is undefined')
  }

  if (resource.indexOf('auth') === 0) {
    resource = 'core/' + resource
  }

  const noTokenList = noToken()
  const noGetTokenList = noGetToken()

  // 实例方法
  const api: APIInstance = {
    model,
    host,
    resource,
    headers: getHeaders(options as FetchOptions, ctx, resource, noTokenList, noGetTokenList),
    noToken: noTokenList,
    noGetToken: noGetTokenList,

    fetch(uri: string, fetchOptions: FetchOptions = {}): Promise<APIResponse> {
      const settings = ctx.settings
      const methods = ['DELETE', 'PATCH', 'PUT']
      let method = fetchOptions?.method

      if (settings?.safeRequest && method && methods.includes(method)) {
        method = method === 'DELETE' ? 'GET' : 'POST'
      }

      const newHeaders = {
        ...(model.headers || {}),
        ...(fetchOptions?.headers || {}),
        ...getHeaders(fetchOptions, ctx, resource, noTokenList, noGetTokenList)
      }

      const isLogin = resource.indexOf('/auth/login') > -1
      const finalHeaders = isLogin ? omit(newHeaders, 'Authorization') : newHeaders

      const axiosConfig: AxiosRequestConfig = {
        method: method || 'GET',
        url: host + resource + uri,
        headers: finalHeaders,
        data: fetchOptions?.body
      }

      return axios(axiosConfig).then((response: AxiosResponse) => ({
        json: response.data,
        headers: response.headers as any
      })).catch((error: any) => {
        const err: any = {
          json: error.response?.data || { _error: error.message },
          status: error.response?.status
        }
        throw err
      })
    },

    convert_format(v: any, schema: SchemaProperty): any {
      const value = clone(v)
      if (value) {
        if (schema.format === 'datetime') {
          return dayjs(value).format('YYYY-MM-DD HH:mm:ss')
        } else if (schema.format === 'date') {
          return dayjs(value).format('YYYY-MM-DD')
        } else if (schema.type === 'array' && isArray(value)) {
          return value.map((i: any) => this.convert_format(i, schema.items!))
        } else if (schema.type === 'object' && isPlainObject(value)) {
          schema?.properties && Object.keys(schema.properties).forEach(k => {
            const p = schema.properties![k]
            value[k] = this.convert_format(value[k], p)
          })
        }
      }
      return value
    },

    convert_item(item: any): any {
      if (model.idProp) {
        if (typeof model.idProp === 'object') {
          let unitId = ''
          for (let i of model.idProp) {
            unitId += item[i]
          }
          item = { ...item, id: unitId }
        } else {
          item = { ...item, id: item[model.idProp] }
        }
      } else if (item._id) {
        item.id = item._id
      }

      if (model.convertItem) {
        item = model.convertItem(item)
      }

      item = this.convert_format(clone(item), model)
      return item
    },

    count(filter: any = {}): Promise<number> {
      const filterString = encodeURIComponent(JSON.stringify({ where: filter['where'] || {} }))
      return this.fetch(`count?query=${filterString}`).then(({ json }) => json['count'])
    },

    convert(f: QueryOptions): any {
      const query: any = {}

      if (f.order && !isEmpty(f.order)) {
        let ks = Object.keys(f.order)
          .filter(k => f.order![k] === 'ASC' || f.order![k] === 'DESC')

        if (ks.length > 0) {
          if (ks.length === 1) {
            const sort = ks.reduce((prev, key) => ({ ...prev, [key]: f.order![key] === 'ASC' ? 1 : -1 }), {})
            if (model?.name === 'tableData') this.convert_uidToId(sort)
            query.sort = sort
          } else {
            const sorts = ks.map(k => {
              const order = f.order![k] === 'ASC' ? 1 : -1
              if (model?.name === 'tableData' && k === 'uid') {
                return { ['id']: order }
              }
              return { [k]: order }
            })
            query.sorts = sorts
          }
        }
      }

      if (!isNil(f.skip)) {
        query.skip = parseInt(String(f.skip))
      }

      if (!isNil(f.limit)) {
        query.limit = parseInt(String(f.limit))
      }

      if (!isNil(f.groupBy)) {
        query.groupBy = f.groupBy
      }

      if (model.projectAll) {
        query.projectAll = true
      } else if (!isEmpty(f.fields) || model.projectFields) {
        const allProject = [...(model.projectFields || []), ...(f.fields || [])]
        const level1 = allProject && allProject.filter(k => k.indexOf('.') === -1)
        const level2 = allProject && allProject.filter(k => k.indexOf('.') > 0)
        const allow: string[] = []

        level2.forEach((item, index) => {
          const p = item.slice(0, item.indexOf('.'))
          if (p === 'table' || p === 'department' || p === 'tableData') {
            allow.push(level2[index])
          } else {
            allow.push(item)
          }
        })

        query.project = [...level1, ...allow].reduce((prev, f) => ({ ...prev, [f]: 1 }), {})
      }

      return query
    },

    convert_value(value: any, keys: string[]): any {
      if (isPlainObject(value)) {
        const isRelateMuti = keys?.[keys.length - 1] === 'filter' &&
          keys?.[keys.length - 2] === '$relate' &&
          keys?.[keys.length - 3] === '$in'

        if (value.id && !isRelateMuti) {
          return value.id
        }

        let vs = omit(value, 'rule')

        return Object.keys(vs).reduce((prve: any, key) => {
          prve[key] = this.convert_value(vs[key], [...keys, key])
          return prve
        }, {})

      } else if (isArray(value)) {
        return value.map(this.convert_where_value.bind(this))
      } else {
        return value && isString(value) ? value.trim() : value
      }
    },

    convert_where_value(w: any): any {
      const where = this.convert_where_filters(w)
      return isPlainObject(where) ? Object.keys(where).reduce((prev: any, key) => {
        let fieldKey = key
        const v = this.convert_value(where[key], [key])
        let cv = this.convert_where_filters(v)

        if (isPlainObject(cv) && Object.keys(cv).length > 0 && Object.keys(cv)[0].indexOf('$') !== 0) {
          prev = Object.keys(cv).reduce((p: any, k) => {
            if (k === 'gte' || k === 'lte') {
              p[fieldKey] = { ...p[fieldKey], [k]: cv[k] }
            } else {
              p[`${fieldKey}.${k}`] = cv[k]
            }
            return p
          }, prev)
        } else {
          const property = model.properties ? model.properties[fieldKey] : null
          const isFilterNull = !v || property?.nullFilter ||
            (['{}', '[]'].indexOf(v) > -1 || (has(v, '$ne') && [null, '', '{}', '[]'].indexOf(v['$ne']) > -1))
          const isArrayIn = property?.type === 'array' && (has(v, '$regex') || has(v, '$not.$regex'))
          const isRelateMuti = v?.['$in']?.['$relate']?.['filter']

          if (property && (property.type === 'object' || property.type === 'array') && !isFilterNull && !isArrayIn && !isRelateMuti) {
            fieldKey = fieldKey + 'Id'
          }

          if (property && (property.type === 'object' || property.type === 'array') && property?.related === 'department') {
            fieldKey = where?.[key]?.table?.id + 'Id'
          }

          if (property && property.filterQueryConvert && isFunction(property.filterQueryConvert)) {
            const customQueryValue = property.filterQueryConvert({ key: fieldKey, value: cv })
            fieldKey = customQueryValue?.key
            cv = customQueryValue?.value
          }

          if (cv && (has(cv, '$or') || has(cv, '$and'))) {
            if ((prev as any)['$or']) {
              if (!(prev as any)['$and']) {
                prev = { ...omit(prev, '$or'), '$and': [{ '$or': (prev as any)['$or'] }, cv] }
              } else {
                ;(prev as any)['$and'].push(cv)
              }
            } else if ((prev as any)['$and']) {
              ;(prev as any)['$and'].push(cv)
            } else {
              prev = { ...prev, ...cv }
            }
          } else {
            prev[fieldKey] = cv
          }
        }

        return prev
      }, {}) : where
    },

    convert_uidToId(object: Record<string, any> = {}): void {
      Object.keys(object).forEach(key => {
        if (key === 'uid') {
          object['id'] = object['uid']
          delete object['uid']
        }
      })
    },

    convert_where(wheres: any): any {
      let where: any = values(wheres).map((w: any) => this.convert_where_value(w))

      if (where.length > 0) {
        if (where.length > 1) {
          where = mergeQueries(...(where as Record<string, any>[]))
        } else {
          where = where[0]
        }
      } else {
        where = {}
      }

      this.convert_uidToId(where)
      return where
    },

    convert_where_filters(v: any): any {
      if (!isPlainObject(v)) return v

      const ban = ['like', 'eq', 'gt', 'gte', 'in', 'inq', 'lt', 'lte', 'ne', 'nin', 'and', 'not', 'nor', 'or']
      const cv = Object.keys(v).map(item => {
        const o = v[item]
        if (isObject(o)) {
          let k = item
          if (ban.indexOf(item) >= 0 && item.indexOf('$') === -1) {
            k = `$${item}`
          }
          return { [k]: this.convert_where_filters(o) }
        } else {
          if (ban.indexOf(item) >= 0 && item.indexOf('$') === -1) {
            return { [`$${item === 'like' ? 'regex' : item}`]: o }
          } else {
            return { [item]: o }
          }
        }
      }).reduce((p, c) => ({ ...p, ...c }), {})

      return cv
    },

    query(filter: any = {}, wheres: any = {}, withCount: boolean = true, ...params: any[]): Promise<{ items: any[]; total: number }> {
      const where = this.convert_where(wheres)
      const f: any = { ...params, ...model.queryParams, ...this.convert(filter) }

      if (Object.keys(where).length > 0) {
        f['filter'] = where
      }

      if (withCount) { f['withCount'] = true }

      let filter_string = encodeURIComponent(JSON.stringify(f))

      if (model?.customQuery && isFunction(model.customQuery)) {
        return model.customQuery(this, filter, wheres, this.convert_item)
      }

      return this.fetch(`?query=${filter_string}`, { noMessage: wheres.noMessage, apiMessage: model.apiMessage })
        .then(({ json, headers }) => ({
          items: json.map(this.convert_item.bind(this)),
          total: withCount ? (headers['count'] || json.length) : json.length
        }))
    },

    get(id: string = '', option?: FetchOptions): Promise<any> {
      return this.fetch(`/${resource === 'core/node' ? '_id/' + id : id}`, option || {})
        .then(({ json }) => {
          if (resource === 'core/user') {
            json = omit(json, 'password', 'password2')
          }
          return this.convert_item({ ...json, id })
        })
    },

    getOrigin(id: string = ''): Promise<APIResponse> {
      return this.fetch(`/${resource === 'core/node' ? '_id/' + id : id}`)
    },

    delete(id: string = ''): Promise<any> {
      return this.fetch(`/${id}`, { method: 'DELETE' }).then(({ json }) => ({ ...json, id }))
    },

    convert_data(data: any): any {
      return omit(data, ['__partial__'])
    },

    save(data: any = {}, partial: boolean = false): Promise<any> {
      if (resource === 'core/auth/logout') {
        return Promise.resolve({})
      }

      if (resource === 'core/auth/login') {
        return new Promise((resolve, reject) => {
          this.fetch('', {
            method: 'POST',
            body: JSON.stringify(data)
          })
            .then(({ json }) => resolve(json))
            .catch((err: any) => {
              const json = err.json
              reject({ json: { password: json ? json._error : '登录出现错误请联系系统管理员' } })
            })
        })
      }

      if (resource === 'core/setting') {
        return this.fetch('', {
          method: 'PATCH',
          body: JSON.stringify(this.convert_data(data))
        }).then(() => data)
      }

      if (data.id) {
        if (resource === 'core/node' || resource === 'core/department' || resource === 'core/t/schema') {
          if (data.uid) {
            delete data['uid']
          }
        }
        return this.fetch(`/${data.id}`, {
          method: !partial ? 'PUT' : 'PATCH',
          body: JSON.stringify(this.convert_data(data))
        }).then(({ json }) => ({
          ...data,
          InsertedID: json?.InsertedID || json?.id
        }))
      } else {
        if (resource === 'core/node' || resource === 'core/department' || resource === 'core/t/schema' || data?.convertUidToId) {
          if (data.uid) {
            data.id = data.uid
            delete data['uid']
          }
          return new Promise((resolve, reject) => {
            return this.fetch('', {
              method: 'POST',
              body: JSON.stringify(this.convert_data(data))
            })
              .then(({ json }) => {
                resolve({
                  ...data,
                  id: json?.InsertedID || json?.id
                })
              })
              .catch((err: any) => {
                const json = err.json
                if (json.id) {
                  reject({ json: { uid: json.id } })
                } else {
                  reject({ json })
                }
              })
          })
        }
        return this.fetch('', {
          method: 'POST',
          body: JSON.stringify(this.convert_data(data))
        }).then(({ json }) => ({
          ...data,
          id: json?.InsertedID || json?.id
        }))
      }
    }
  }

  return api
}

export default createAPI
