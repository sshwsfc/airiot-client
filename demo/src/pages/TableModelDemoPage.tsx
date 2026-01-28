import { useState } from 'react'
import { TableModel, useModelList, useModelGetItems, useModelSave, useModelDelete, useModelPermission, useModel } from '@airiot/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'

function TableModelContent() {
  const { items, loading } = useModelList()
  const { model, title } = useModel()
  const { canAdd, canEdit, canDelete } = useModelPermission()
  const { getItems } = useModelGetItems()
  const { saveItem } = useModelSave()
  const { deleteItem } = useModelDelete()
  const [keyword, setKeyword] = useState('')
  const [editingItem, setEditingItem] = useState<any>(null)

  console.log('TableModel items:', items, 'model:', model, 'loading:', loading)

  const handleFilter = () => {
    getItems({
      filter: { limit: 10, skip: 0 },
      wheres: keyword ? {
        filter: {
          name: { $regex: keyword }
        }
      } : undefined
    })
  }

  const handleReset = () => {
    setKeyword('')
    getItems({
      filter: { limit: 10, skip: 0 }
    })
  }

  const handleSave = (item: any) => {
    saveItem(item)
    setEditingItem(null)
    alert('保存成功！')
  }

  const handleDelete = async (id: string) => {
    if (!confirm('确定要删除吗？')) return
    try {
      await deleteItem(id)
      alert('删除成功！')
    } catch (err: any) {
      console.error('删除失败:', err)
      alert(`删除失败: ${err.message}`)
    }
  }

  // 获取模型的列表字段
  const listFields = model?.listFields || Object.keys(model?.properties || {})
  const properties = model?.properties || {}

  return (
    <Card>
      <CardHeader>
        <CardTitle>TableModel 模块演示</CardTitle>
        <CardDescription>
          演示 TableModel 组件从服务器动态获取表结构的功能（tableId: task）
        </CardDescription>
      </CardHeader>
      <CardContent>
        {/* 筛选栏 */}
        <div className="flex items-center justify-between mb-4 gap-2">
          <Input
            type="text"
            placeholder="搜索名称..."
            value={keyword}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setKeyword(e.target.value)}
            className="w-48"
          />
          <Button variant="outline" onClick={handleFilter}>
            筛选
          </Button>
          <Button variant="outline" onClick={handleReset}>
            重置
          </Button>
          {canAdd && (
            <Button onClick={() => setEditingItem({})}>
              新增
            </Button>
          )}
        </div>

        <div className="mb-4 text-sm text-muted-foreground">
          <div>模型标题: {title || '加载中...'}</div>
          <div>共 {items.length} 条数据，加载中：{loading ? '是' : '否'}</div>
          <div>表结构 ID: task</div>
        </div>

        {/* 动态列表 */}
        <Table>
          <TableHeader>
            <TableRow>
              {listFields.map((field: string) => (
                <TableHead key={field}>
                  {properties[field]?.title || field}
                </TableHead>
              ))}
              <TableHead>操作</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.map((item: any, index: number) => (
              <TableRow key={item.id || index}>
                {listFields.map((field: string) => {
                  const value = item[field]
                  const property = properties[field]

                  // 根据字段类型渲染
                  if (property?.type === 'boolean') {
                    return (
                      <TableCell key={field}>
                        <Badge variant={value ? 'default' : 'secondary'}>
                          {value ? '是' : '否'}
                        </Badge>
                      </TableCell>
                    )
                  }

                  if (property?.type === 'array') {
                    return (
                      <TableCell key={field}>
                        {Array.isArray(value) ? value.join(', ') : '-'}
                      </TableCell>
                    )
                  }

                  if (property?.format === 'date-time' || property?.format === 'date') {
                    return (
                      <TableCell key={field}>
                        {value ? new Date(value).toLocaleString('zh-CN') : '-'}
                      </TableCell>
                    )
                  }

                  return (
                    <TableCell key={field}>
                      {value !== undefined && value !== null && value !== '' ? String(value) : '-'}
                    </TableCell>
                  )
                })}
                <TableCell>
                  {canEdit && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setEditingItem(item)}
                      className="mr-2"
                    >
                      编辑
                    </Button>
                  )}
                  {canDelete && (
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDelete(item.id)}
                    >
                      删除
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            ))}
            {items.length === 0 && (
              <TableRow>
                <TableCell colSpan={listFields.length + 1} className="text-center text-muted-foreground py-8">
                  {loading ? '加载表结构和数据中...' : '暂无数据'}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>

        {/* 编辑对话框 */}
        {editingItem && (
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000
          }}>
            <div style={{
              backgroundColor: 'white',
              padding: '20px',
              borderRadius: '8px',
              width: '500px',
              maxWidth: '90%',
              maxHeight: '80vh',
              overflow: 'auto'
            }}>
              <h3 className="text-lg font-semibold mb-4">
                {editingItem.id ? '编辑' : '新增'}数据
              </h3>
              <form onSubmit={(e) => { e.preventDefault(); handleSave(editingItem) }}>
                <div className="space-y-4">
                  {Object.entries(properties).map(([fieldKey, property]: [string, any]) => {
                    if (!property || property.fieldType === 'sortField') return null

                    const required = model?.required?.includes(fieldKey)
                    const value = editingItem[fieldKey]

                    return (
                      <div key={fieldKey}>
                        <label className="text-sm font-medium mb-2 block">
                          {property.title}
                          {required && <span className="text-destructive ml-1">*</span>}
                        </label>

                        {property.type === 'boolean' ? (
                          <div className="flex items-center space-x-2">
                            <input
                              type="checkbox"
                              checked={value || false}
                              onChange={(e) => setEditingItem({
                                ...editingItem,
                                [fieldKey]: e.target.checked
                              })}
                              className="w-4 h-4"
                            />
                            <span className="text-sm">{value ? '是' : '否'}</span>
                          </div>
                        ) : property.enum1 || property.type === 'array' ? (
                          <div className="space-y-2">
                            {(property.enum1 || property.enum_title1 || [])?.map((enumValue: any, idx: number) => (
                              <label key={idx} className="flex items-center space-x-2">
                                <input
                                  type="checkbox"
                                  checked={Array.isArray(value) ? value.includes(enumValue) : false}
                                  onChange={(e) => {
                                    const currentValue = Array.isArray(value) ? value : []
                                    if (e.target.checked) {
                                      setEditingItem({
                                        ...editingItem,
                                        [fieldKey]: [...currentValue, enumValue]
                                      })
                                    } else {
                                      setEditingItem({
                                        ...editingItem,
                                        [fieldKey]: currentValue.filter((v: any) => v !== enumValue)
                                      })
                                    }
                                  }}
                                  className="w-4 h-4"
                                />
                                <span className="text-sm">
                                  {property.enum_title1?.[idx] || enumValue}
                                </span>
                              </label>
                            ))}
                          </div>
                        ) : property.textType === 'textArea' ? (
                          <textarea
                            value={value || ''}
                            onChange={(e) => setEditingItem({
                              ...editingItem,
                              [fieldKey]: e.target.value
                            })}
                            placeholder={property.placeholder || ''}
                            required={required}
                            className="w-full px-3 py-2 border border-input rounded-md min-h-[80px]"
                          />
                        ) : property.type === 'number' ? (
                          <Input
                            type="number"
                            value={value || ''}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEditingItem({
                              ...editingItem,
                              [fieldKey]: Number(e.target.value)
                            })}
                            required={required}
                            step={property.bitNum ? `0.${'0'.repeat(Number(property.bitNum) - 1)}1` : '1'}
                          />
                        ) : (
                          <Input
                            type="text"
                            value={value || ''}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEditingItem({
                              ...editingItem,
                              [fieldKey]: e.target.value
                            })}
                            placeholder={property.placeholder || ''}
                            required={required}
                          />
                        )}

                        {property.description && (
                          <p className="text-xs text-muted-foreground mt-1">
                            {property.description}
                          </p>
                        )}
                      </div>
                    )
                  })}
                  <div className="flex gap-2 justify-end pt-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setEditingItem(null)}
                    >
                      取消
                    </Button>
                    <Button type="submit">
                      保存
                    </Button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        )}

        <Alert variant="default" className="mt-6">
          <AlertDescription>
            <strong>TableModel 说明：</strong>
            <br />
            <strong>TableModel:</strong> - 动态模型组件，从服务器获取表结构
            <br />
            <strong>tableId:</strong> - data（表结构 ID）
            <br />
            <strong>API 端点:</strong> - core/t/schema/{'{tableId}'} 获取表结构
            <br />
            <strong>useModel:</strong> - 获取模型上下文，包括 model 和 title
            <br />
            <strong>动态表单:</strong> - 根据服务器返回的 properties 动态生成表单字段
            <br />
            <strong>适用场景:</strong> - 多租户应用、动态表管理、管理后台等需要运行时更改表结构的场景
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  )
}

export default function TableModelDemoPage() {
  return (
    <TableModel
      tableId="data"
      loadingComponent={
        <Card>
          <CardContent className="py-12">
            <div className="text-center text-muted-foreground">
              正在加载表结构...
            </div>
          </CardContent>
        </Card>
      }
    >
      <TableModelContent />
    </TableModel>
  )
}
