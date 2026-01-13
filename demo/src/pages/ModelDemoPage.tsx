import { useState } from 'react'
import { Model, useModelList, useModelGetItems, useModelSave, useModelDelete, useModelPermission } from '@airiot/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Alert, AlertDescription } from '@/components/ui/alert'

const customModel = {
  name: 'demo',
  title: '演示模型',
  resource: 'core/t/task_def/d',
  properties: {
    id: { type: 'string', title: 'ID' },
    name: { type: 'string', title: '名称' },
    email: { type: 'string', format: 'email', title: '邮箱' },
    age: { type: 'integer', title: '年龄', minimum: 0 },
    status: { type: 'string', title: '状态' },
    createdAt: { type: 'string', title: '创建时间', format: 'date-time' }
  },
  listFields: ['id', 'name', 'email', 'age', 'status', 'createdAt'],
  permission: {
    view: true,
    add: true,
    edit: true,
    delete: true
  },
  defaultPageSize: 5
}

function ModelContent() {
  const { items, loading } = useModelList()
  const { canAdd, canEdit, canDelete } = useModelPermission()
  const { getItems } = useModelGetItems()
  const { saveItem } = useModelSave()
  const { deleteItem } = useModelDelete()
  const [keyword, setKeyword] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [editingItem, setEditingItem] = useState<any>(null)
  const [dialogOpen, setDialogOpen] = useState(false)

  const handleFilter = () => {
    getItems({
      filter: { limit: 10, skip: 0 },
      wheres: {
        filter: {
          ...(keyword ? { name: { $regex: keyword } } : {}),
          ...(statusFilter ? { status: { $eq: statusFilter } } : {})
        }
      }
    })
  }

  const handleReset = () => {
    setKeyword('')
    setStatusFilter('')
    getItems({
      filter: { limit: 10, skip: 0 }
    })
  }

  const handleSave = (item: any) => {
    saveItem(item, {})
    setEditingItem(null)
    setDialogOpen(false)
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

  return (
    <Card>
      <CardHeader>
        <CardTitle>模型模块演示</CardTitle>
        <CardDescription>演示 Model 组件和所有 Model Hooks 的功能</CardDescription>
      </CardHeader>
      <CardContent>
        {/* 筛选栏 */}
        <div className="flex items-center justify-between mb-4 gap-2">
          <Input
            type="text"
            placeholder="搜索名称..."
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            className="w-48"
          />
          <Select
            value={statusFilter}
            onValueChange={(value) => setStatusFilter(value)}
            className="w-32"
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="选择状态" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectItem value={null}>全部状态</SelectItem>
                <SelectItem value="active">激活</SelectItem>
                <SelectItem value="inactive">未激活</SelectItem>
                <SelectItem value="pending">待定</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
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
          共 {items.length} 条数据，加载中：{loading ? '是' : '否'}
        </div>

        {/* 列表 */}
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-10">
                  <Checkbox disabled={!canDelete} />
                </TableHead>
                <TableHead>ID</TableHead>
                <TableHead>名称</TableHead>
                <TableHead>邮箱</TableHead>
                <TableHead>年龄</TableHead>
                <TableHead>状态</TableHead>
                <TableHead>创建时间</TableHead>
                <TableHead>操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="w-10">
                    {canDelete && (
                      <Checkbox
                        checked={false}
                        disabled
                      />
                    )}
                  </TableCell>
                  <TableCell>{item.id}</TableCell>
                  <TableCell>{item.name}</TableCell>
                  <TableCell>{item.email || '-'}</TableCell>
                  <TableCell>{item.age || '-'}</TableCell>
                  <TableCell>
                    <Badge variant={item.status === 'active' ? 'default' : item.status === 'inactive' ? 'secondary' : 'destructive'}>
                      {item.status || '-'}
                    </Badge>
                  </TableCell>
                  <TableCell>{new Date(item.createdAt).toLocaleString('zh-CN')}</TableCell>
                  <TableCell>
                    {canEdit && (
                      <Button variant="ghost" size="sm" onClick={() => setEditingItem(item)}>
                        编辑
                      </Button>
                    )}
                    {canDelete && (
                      <Button variant="destructive" size="sm" onClick={() => handleDelete(item.id)}>
                        删除
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
              {items.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                    {loading ? '加载中...' : '暂无数据'}
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
                width: '400px',
                maxWidth: '90%'
              }}>
                <h3 className="text-lg font-semibold mb-4">
                  {editingItem.id ? '编辑' : '新增'}数据
                </h3>
                <form onSubmit={(e) => { e.preventDefault(); handleSave(editingItem) }}>
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium mb-2">名称 *</label>
                      <Input
                        value={editingItem.name || ''}
                        onChange={(e) => setEditingItem({ ...editingItem, name: e.target.value })}
                        required
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-2">邮箱 *</label>
                      <Input
                        type="email"
                        value={editingItem.email || ''}
                        onChange={(e) => setEditingItem({ ...editingItem, email: e.target.value })}
                        required
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-2">年龄</label>
                      <Input
                        type="number"
                        min="0"
                        value={editingItem.age || ''}
                        onChange={(e) => setEditingItem({ ...editingItem, age: Number(e.target.value) })}
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-2">状态</label>
                      <Select
                        value={editingItem.status || ''}
                        onChange={(e) => setEditingItem({ ...editingItem, status: e.target.value })}
                        >
                        <option value="">请选择</option>
                        <option value="active">激活</option>
                        <option value="inactive">未激活</option>
                        <option value="pending">待定</option>
                      </Select>
                    </div>
                    <div className="flex gap-2 justify-end">
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
            <strong>说明：</strong>
            <br />
            <strong>Model:</strong> - 模型组件，提供上下文
            <br />
            <strong>useModelList:</strong> - 获取列表数据，返回 items, loading
            <br />
            <strong>useModelGetItems:</strong> - 触发列表查询，支持 filter 和 wheres 参数
            <br />
            <strong>useModelSave:</strong> - 保存数据
            <br />
            <strong>useModelDelete:</strong> - 删除数据
            <br />
            <strong>useModelPermission:</strong> - 权限检查
            <br />
            所有请求会通过 Vite proxy 转发到 http://localhost:8080
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  )
}

export default function ModelDemoPage() {
  return (<Model schema={customModel}>
    <ModelContent />
  </Model>)
}