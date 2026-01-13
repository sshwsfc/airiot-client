import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Alert, AlertDescription } from '@/components/ui/alert'

export default function ModelDemoPage() {
  const [items, setItems] = useState<any[]>([
    { id: '1', name: '张三', email: 'zhangsan@example.com', age: 25, status: 'active', createdAt: new Date().toISOString() },
    { id: '2', name: '李四', email: 'lisi@example.com', age: 30, status: 'inactive', createdAt: new Date(Date.now() - 86400000).toISOString() },
    { id: '3', name: '王五', email: 'wangwu@example.com', age: 28, status: 'active', createdAt: new Date(Date.now() - 172800000).toISOString() },
    { id: '4', name: '赵六', email: 'zhaoliu@example.com', age: 35, status: 'pending', createdAt: new Date(Date.now() - 259200000).toISOString() },
    { id: '5', name: '钱七', email: 'qianqi@example.com', age: 22, status: 'active', createdAt: new Date(Date.now() - 345600000).toISOString() }
  ])
  const [selected, setSelected] = useState<string[]>([])
  const [keyword, setKeyword] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [editingItem, setEditingItem] = useState<any>(null)
  const [dialogOpen, setDialogOpen] = useState(false)

  const handleFilter = () => {
    const filtered = items.filter(item => {
      let match = true
      if (keyword && !item.name.includes(keyword)) match = false
      if (statusFilter && item.status !== statusFilter) match = false
      return match
    })
    setItems(filtered)
  }

  const handleReset = () => {
    setKeyword('')
    setStatusFilter('')
    setItems([
      { id: '1', name: '张三', email: 'zhangsan@example.com', age: 25, status: 'active', createdAt: new Date().toISOString() },
      { id: '2', name: '李四', email: 'lisi@example.com', age: 30, status: 'inactive', createdAt: new Date(Date.now() - 86400000).toISOString() },
      { id: '3', name: '王五', email: 'wangwu@example.com', age: 28, status: 'active', createdAt: new Date(Date.now() - 172800000).toISOString() },
      { id: '4', name: '赵六', email: 'zhaoliu@example.com', age: 35, status: 'pending', createdAt: new Date(Date.now() - 259200000).toISOString() },
      { id: '5', name: '钱七', email: 'qianqi@example.com', age: 22, status: 'active', createdAt: new Date(Date.now() - 345600000).toISOString() }
    ])
  }

  const handleSelectItem = (id: string, isSelected: boolean) => {
    if (isSelected) {
      setSelected([...selected, id])
    } else {
      setSelected(selected.filter(s => s !== id))
    }
  }

  const handleSelectAll = () => {
    if (selected.length === items.length) {
      setSelected([])
    } else {
      setSelected(items.map(item => item.id))
    }
  }

  const handleSave = (item: any) => {
    const index = items.findIndex(d => d.id === item.id)
    if (index >= 0) {
      const newDataArray = [...items]
      newDataArray[index] = item
      setItems(newDataArray)
    }
    setEditingItem(null)
    setDialogOpen(false)
    alert('保存成功！')
  }

  const handleDelete = (id: string) => {
    if (!confirm('确定要删除吗？')) return
    setItems(items.filter(item => item.id !== id))
    setSelected(selected.filter(s => s !== id))
    alert('删除成功！')
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
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-32"
          >
            <option value="">全部状态</option>
            <option value="active">激活</option>
            <option value="inactive">未激活</option>
            <option value="pending">待定</option>
          </Select>
          <Button variant="outline" onClick={handleFilter}>
            筛选
          </Button>
          <Button variant="outline" onClick={handleReset}>
            重置
          </Button>
          <Button onClick={() => setEditingItem({})}>
            新增
          </Button>
        </div>

        <div className="mb-4 text-sm text-muted-foreground">
          共 {items.length} 条数据，已选择 {selected.length} 条
        </div>

        {/* 列表 */}
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-10">
                <Checkbox
                  checked={selected.length === items.length}
                  onChange={handleSelectAll}
                />
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
                  <Checkbox
                    checked={selected.includes(item.id)}
                    onChange={(e) => handleSelectItem(item.id, e.target.checked)}
                  />
                </TableCell>
                <TableCell>{item.id}</TableCell>
                <TableCell>{item.name}</TableCell>
                <TableCell>{item.email}</TableCell>
                <TableCell>{item.age}</TableCell>
                <TableCell>
                  <Badge variant={item.status === 'active' ? 'default' : item.status === 'inactive' ? 'secondary' : 'destructive'}>
                    {item.status}
                  </Badge>
                </TableCell>
                <TableCell>{new Date(item.createdAt).toLocaleString('zh-CN')}</TableCell>
                <TableCell>
                  <Button variant="ghost" size="sm" onClick={() => setEditingItem(item)}>
                    编辑
                  </Button>
                  <Button variant="destructive" size="sm" onClick={() => handleDelete(item.id)}>
                    删除
                  </Button>
                </TableCell>
              </TableRow>
            ))}
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
                      onClick={() => { setEditingItem(null); }}
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
            <strong>useModelList:</strong> - 获取列表数据
            <br />
            <strong>useModelGet:</strong> - 获取单项数据
            <br />
            <strong>useModelSave:</strong> - 保存数据
            <br />
            <strong>useModelDelete:</strong> - 删除数据
            <br />
            <strong>useModelPagination:</strong> - 分页功能
            <br />
            <strong>useModelPageSize:</strong> - 页面大小控制
            <br />
            <strong>useModelSelect:</strong> - 选择功能
            <br />
            <strong>useModelPermission:</strong> - 权限检查
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  )
}
