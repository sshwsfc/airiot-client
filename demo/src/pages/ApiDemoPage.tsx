import { useState, useEffect } from 'react'
import { createAPI } from '@airiot/client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'

// 创建 API 实例
const api = createAPI({
  name: 'demo-api',
  resource: 'demo',
  idProp: 'id'
})

export default function ApiDemoPage() {
  const [data, setData] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // 加载数据
  const loadItems = async () => {
    setLoading(true)
    setError(null)
    try {
      const result = await api.query({
        skip: 0,
        limit: 10
      })
      setData(result.items || [])
    } catch (err: any) {
      console.error('加载失败:', err)
      setError(err.message || err.json?._error || '加载失败')
    } finally {
      setLoading(false)
    }
  }

  // 获取单项
  const getItem = async (id: string) => {
    try {
      const item = await api.get(id)
      alert(`获取到数据: ${JSON.stringify(item, null, 2)}`)
    } catch (err: any) {
      console.error('获取失败:', err)
      alert(`获取失败: ${err.message}`)
    }
  }

  // 保存数据
  const saveItem = async (item: any) => {
    try {
      const saved = await api.save(item)
      const index = data.findIndex(d => d.id === item.id)
      if (index >= 0) {
        const newDataArray = [...data]
        newDataArray[index] = saved
        setData(newDataArray)
      } else {
        setData([...data, saved])
      }
      alert('保存成功！')
    } catch (err: any) {
      console.error('保存失败:', err)
      alert(`保存失败: ${err.message || err.json?._error}`)
    }
  }

  // 删除数据
  const deleteItem = async (id: string) => {
    if (!confirm('确定要删除吗？')) return
    try {
      await api.delete(id)
      setData(data.filter(item => item.id !== id))
      alert('删除成功！')
    } catch (err: any) {
      console.error('删除失败:', err)
      alert(`删除失败: ${err.message}`)
    }
  }

  // 计数
  const countItems = async () => {
    try {
      const count = await api.count()
      alert(`总共有 ${count} 条数据`)
    } catch (err: any) {
      console.error('计数失败:', err)
      alert(`计数失败: ${err.message}`)
    }
  }

  // 页面加载时自动加载数据
  useEffect(() => {
    loadItems()
  }, [])

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
            {data.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                  暂无数据
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>

        <Alert variant="default" className="mt-6">
          <AlertDescription>
            <strong>说明：</strong> 此页面演示 API 模块的所有方法，真正使用 @airiot/client 的 createAPI 创建 API 实例。
            <br />
            所有 API 请求会通过 Vite proxy 转发到 http://localhost:8080
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  )
}
