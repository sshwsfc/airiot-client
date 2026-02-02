import React, { useEffect, useState, useCallback } from 'react'
import {Model, type ModelSchema} from './base'
import api from '../api'
import _ from 'lodash'

interface State {
  schema: ModelSchema | undefined
  tags: any[]
  loading: boolean
}

const TableModel = ({ tableId, loadingComponent, initQuery, initialValues: initValues, children }: { tableId: string, loadingComponent?: React.ReactNode, initQuery?: any, initialValues?: any, children?: React.ReactNode }) => {

  const [{ schema, tags, loading }, setState] = useState<State>(() => ({ schema: undefined, tags: [], loading: true }))
  // Fetch table schema and tags
  const fetchTableSchemaAndTags = useCallback(async () => {
    setState({ schema: undefined, tags: [], loading: true })
    try {
      const [table, tagResponse] = await Promise.all([
        api({ name: 'core/t/schema' }).get(tableId).then((payload: any) => payload),
        api({ name: `/core/t/schema/tag/${tableId}` }).fetch('')
      ])
      const { json } = tagResponse

      if(table == null || table.schema == null) {
        throw new Error('Table schema not found')
      }

      const display = (d: any) => {
        let name = ''
        if (d.name && _.isString(d.name)) {
          name = d.name
        } else if (table.schema?.listFields && table.schema?.listFields?.length > 0) {
          table.schema.listFields.some((fieldKey: string) => {
            const field = table.schema?.properties[fieldKey]
            if (field?.type == 'string' && !_.isNil(d[fieldKey])) {
              name = d[fieldKey]
              return true
            }
          })
        }
        return name
      }
      const orders = table?.schema?.orders || {}
      const ps = table?.schema?.properties || {}
      const keyList = table?.schema?.form || []
      const tableMajorType = table?.tableMajorType
      const dpTree = table?.dataAuth?.dpTree
      const isTreeTable = tableMajorType == 'dataAuth' && dpTree
      const schema = {
        ...table.schema,
        table,
        initQuery: initQuery,
        userPageFields: true,
        isCustomTable: true,
        type: 'object',
        key: table.id,
        // 如果是部门表并且树形接口，则默认每页显示999条数据
        defaultPageSize: isTreeTable ? 999 : null,
        name: table.name || table.id,
        title: table.title,
        resource: `core/t/${table.id}/d`,
        partialSave: true,
        permission: { view: true, add: true, edit: true, delete: true },
        // 字段编辑的属性放到schema中
        editableFields: keyList.filter((key: string) => Boolean(ps[key]?.editableFields)),
        batchChangeFields: keyList.filter((key: string) => Boolean(ps[key]?.batchChangeFields)),
        filters: {
          submenu: keyList.filter((key: string) => Boolean(ps[key]?.filterFields))
        },
        required: table.fieldRules ? [] : table?.schema?.required || [], // 字段规则中动态控制字段必填
        display,
        orders: orders,
        initValues: { archive: true },
        initialValues: () => {
          let initialValues = { ...table?.schema?.initialValues || {}, ...initValues }

          const previousLocation = sessionStorage.getItem(`previousLocation`)
          const option = sessionStorage.getItem(`model_table_${table?.id}_option`)
          const wheres = sessionStorage.getItem(`model_table_${table?.id}_wheres`)
          try {

            if (previousLocation) {
              const _wheres = wheres && JSON.parse(wheres)
              // 从编辑页面返回保留 当前页、每页条数、filters
              if (previousLocation.endsWith("/edit") && _.includes(previousLocation, '/app/table')) {
                initialValues = option && _.omit(JSON.parse(option), 'fields')
                if (_wheres) {
                  initialValues = { ...initialValues, wheres: _wheres }
                }
              }
              // 从添加页面返回只保留filters
              if (previousLocation.endsWith("/add") && _.includes(previousLocation, '/app/table')) {
                if (_wheres) {
                  initialValues = { ...initialValues, wheres: _wheres }
                }
              }
            }

            return initialValues
          } catch (err) {
            return {}
          }
        },
      }
      
      setState({ schema, tags: json?.tags || [], loading: false })
    } catch (error) {
      console.error('Failed to fetch table schema:', error)
      setState({ schema: undefined, tags: [], loading: false })
    }
  }, [tableId, initQuery, initValues])

  useEffect(() => {
    if (tableId) {
      fetchTableSchemaAndTags()
    }
  }, [tableId, initQuery, initValues])

  return (loading || schema == null) ? <>{loadingComponent || null}</> : <Model schema={schema}>{children}</Model>
}

export {
  TableModel
}

export default TableModel