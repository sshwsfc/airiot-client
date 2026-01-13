import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'

export default function ApiDemoPage() {
  const [data, setData] = useState<any[]>([
    { id: '1', name: '测试数据 1', status: 'active', createdAt: new Date().toISOString() },
    { id: '2', name: '测试数据 2', status: 'inactive', createdAt: new Date(Date.now() - 86400000).toISOString() },
    { id: '3', name: '测试数据 3', status: 'pending', createdAt: new Date(Date.now() - 172800000).toISOString() }
  ])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const loadItems = () => {
    setLoading(true)
    setError(null)
    try {
      setData(data)
    } catch (err: any) {
      setError(err.message || '加载失败')
    } finally {
      setLoading(false)
    }
  }

  const getItem = (id: string) => {
    const item = data.find(item => item.id === id)
    if (item) {
      alert(`获取到数据: ${JSON.stringify(item, null, 2)}`)
    }
  }

  const saveItem = (item: any) => {
    const newData = { ...item, updatedAt: new Date().toISOString() }
    const index = data.findIndex(d => d.id === item.id)
    if (index >= 0) {
      const newDataArray = [...data]
      newDataArray[index] = newData
      setData(newDataArray)
    }
    alert('保存成功！')
  }

  const deleteItem = (id: string) => {
    if (!confirm('确定要删除吗？')) return
    setData(data.filter(item => item.id !== id))
    alert('删除成功！')
  }

  const countItems = () => {
    alert(`总共有 ${data.length} 条数据`)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>API 模块演示</CardTitle>
        <CardDescription>演示 createAPI 的所有方法：query, get, save, delete, count</CardDescription>
      </CardHeader>
      <CardContent>
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="flex gap-2 mb-4">
          <Button onClick={loadItems} disabled={loading}>
            {loading ? '加载中...' : '查询列表'}
          </Button>
          <Button variant="secondary" onClick={countItems}>
            计数
          </Button>
        </div>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>名称</TableHead>
              <TableHead>状态</TableHead>
              <TableHead>创建时间</TableHead>
              <TableHead>操作</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((item) => (
              <TableRow key={item.id}>
                <TableCell>{item.id}</TableCell>
                <TableCell>{item.name}</TableCell>
                <TableCell>
                  <Badge variant={item.status === 'active' ? 'default' : item.status === 'inactive' ? 'secondary' : 'destructive'}>
                    {item.status}
                  </Badge>
                </TableCell>
                <TableCell>{new Date(item.createdAt).toLocaleString('zh-CN')}</TableCell>
                <TableCell>
                  <Button variant="ghost" size="sm" onClick={() => getItem(item.id)}>
                    查看
                  </Button>
                  <Button variant="secondary" size="sm" onClick={() => saveItem(item)}>
                    保存
                  </Button>
                  <Button variant="destructive" size="sm" onClick={() => deleteItem(item.id)}>
                    删除
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        <Alert variant="default" className="mt-6">
          <AlertDescription>
            <strong>说明：</strong> 此页面演示 API 模块的所有方法，实际使用需要后端 API 支持。
            <br />
            实际使用时需要导入 @airiot/client 的 createAPI 函数来创建 API 实例。
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  )
}
