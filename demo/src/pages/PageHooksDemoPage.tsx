import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  usePageVar,
  usePageVarValue,
  useSetPageVar,
  useFunctions,
  useFunctionsSet,
  useCellDataValue,
  useScale,
  useViewValue,
  useIteration,
  useIterationValue,
  Page
} from '@airiot/client'

// 模拟 PageStoreContext Provider
const mockPageStore = {
  // 这里应该是一个实际的 jotai store
  // 为了演示，我们使用模拟数据
}

// 模拟数据
const mockUsers = [
  { id: 1, name: 'Alice', age: 25, email: 'alice@example.com' },
  { id: 2, name: 'Bob', age: 30, email: 'bob@example.com' },
  { id: 3, name: 'Charlie', age: 35, email: 'charlie@example.com' }
]

// PageVar 演示组件
function PageVarDemo() {
  const [theme, setTheme] = usePageVar('theme')
  const title = usePageVarValue('title')
  const counter = usePageVarValue('counter')
  const setCounter = useSetPageVar('counter')

  const handleIncrement = () => {
    setCounter((counter || 0) + 1)
  }

  const handleToggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light')
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>页面变量 (PageVar)</CardTitle>
        <CardDescription>管理页面级别的变量和状态</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <p className="text-sm font-medium">标题: {title || '未设置'}</p>
        </div>

        <div>
          <p className="text-sm font-medium">当前主题: <Badge>{theme || 'light'}</Badge></p>
          <Button onClick={handleToggleTheme} className="mt-2">
            切换主题
          </Button>
        </div>

        <div>
          <p className="text-sm font-medium">计数器: <Badge variant="secondary">{counter || 0}</Badge></p>
          <Button onClick={handleIncrement} className="mt-2" variant="outline">
            增加
          </Button>
        </div>

        <div className="p-4 bg-muted rounded-md">
          <p className="text-xs font-mono">
            usePageVar: 获取 state 和 setter<br/>
            usePageVarValue: 只读获取值<br/>
            useSetPageVar: 只写设置值
          </p>
        </div>
      </CardContent>
    </Card>
  )
}

// Datasource 演示组件
function DatasourceDemo() {
  const [datasetId, setDatasetId] = useState('users')
  const [path, setPath] = useState('')

  // 模拟数据源
  const mockData = {
    users: mockUsers,
    products: [
      { id: 1, name: 'Product A', price: 100 },
      { id: 2, name: 'Product B', price: 200 }
    ]
  }

  const data = path ? mockData[datasetId]?.[path] : mockData[datasetId]

  return (
    <Card>
      <CardHeader>
        <CardTitle>数据源 (Datasource)</CardTitle>
        <CardDescription>管理数据集和数据源</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <Input
            placeholder="数据集ID (如: users)"
            value={datasetId}
            onChange={(e) => setDatasetId(e.target.value)}
          />
          <Input
            placeholder="路径 (可选，如: 0.name)"
            value={path}
            onChange={(e) => setPath(e.target.value)}
          />
        </div>

        <div className="p-4 bg-muted rounded-md">
          <p className="text-sm font-medium mb-2">查询路径:</p>
          <p className="text-xs font-mono">
            {datasetId}{path ? `.${path}` : ''}
          </p>
        </div>

        <div>
          <p className="text-sm font-medium mb-2">结果:</p>
          <pre className="p-4 bg-muted rounded-md text-xs overflow-auto max-h-64">
            {JSON.stringify(data, null, 2)}
          </pre>
        </div>

        <div className="p-4 bg-muted rounded-md">
          <p className="text-xs font-mono">
            useDatasourceValue(path): 通过路径获取数据源值<br/>
            路径格式: "datasetId.path.to.value"<br/>
            例如: "users.0.name" 获取第一个用户的 name
          </p>
        </div>
      </CardContent>
    </Card>
  )
}

// Context 演示组件
function ContextDemo() {
  const [componentId, setComponentId] = useState('chart1')
  const data = useCellDataValue()

  const [status, setStatus] = useState<'idle' | 'loading' | 'active'>('idle')

  const mockComponentData = {
    chart1: { status: 'active', value: 75.5, unit: '%' },
    chart2: { status: 'loading', value: null, unit: '%' },
    table1: { status: 'idle', data: mockUsers }
  }

  const currentData = mockComponentData[componentId as keyof typeof mockComponentData]

  return (
    <Card>
      <CardHeader>
        <CardTitle>组件上下文 (Context)</CardTitle>
        <CardDescription>管理组件的数据上下文</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <Button
            variant={componentId === 'chart1' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setComponentId('chart1')}
          >
            图表1
          </Button>
          <Button
            variant={componentId === 'chart2' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setComponentId('chart2')}
          >
            图表2
          </Button>
          <Button
            variant={componentId === 'table1' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setComponentId('table1')}
          >
            表格1
          </Button>
        </div>

        <div>
          <p className="text-sm font-medium">组件数据:</p>
          <pre className="p-4 bg-muted rounded-md text-xs">
            {JSON.stringify(currentData, null, 2)}
          </pre>
        </div>

        <div className="flex gap-2">
          <Button size="sm" onClick={() => setStatus('idle')}>空闲</Button>
          <Button size="sm" onClick={() => setStatus('loading')}>加载中</Button>
          <Button size="sm" onClick={() => setStatus('active')}>激活</Button>
        </div>

        <div className="p-4 bg-muted rounded-md">
          <p className="text-xs font-mono">
            useDataVarValue(cellkey): 获取组件数据变量<br/>
            useSetDataVar(cellkey): 设置组件数据变量
          </p>
        </div>
      </CardContent>
    </Card>
  )
}

// Functions 演示组件
function FunctionsDemo() {
  const [functions, setFunctions] = useFunctions('demoComponent')
  const [log, setLog] = useState<string[]>([])

  const addLog = (message: string) => {
    setLog(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`])
  }

  useEffect(() => {
    // 注册组件方法
    setFunctions({
      handleClick: () => addLog('按钮被点击'),
      getData: () => ({ foo: 'bar', timestamp: Date.now() }),
      reset: () => addLog('状态已重置')
    })
  }, [setFunctions])

  return (
    <Card>
      <CardHeader>
        <CardTitle>组件函数 (Functions)</CardTitle>
        <CardDescription>管理组件暴露的方法和事件</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <Button onClick={() => functions?.handleClick?.()}>调用 handleClick</Button>
          <Button onClick={() => addLog(`getData: ${JSON.stringify(functions?.getData?.())}`) || 'outline'}>
            调用 getData
          </Button>
          <Button onClick={() => functions?.reset?.()} variant="secondary">
            调用 reset
          </Button>
        </div>

        <div>
          <p className="text-sm font-medium mb-2">事件日志:</p>
          <div className="p-4 bg-muted rounded-md h-48 overflow-y-auto">
            {log.length === 0 ? (
              <p className="text-xs text-muted-foreground">暂无日志</p>
            ) : (
              log.map((entry, index) => (
                <p key={index} className="text-xs font-mono">
                  {entry}
                </p>
              ))
            )}
          </div>
        </div>

        <div className="p-4 bg-muted rounded-md">
          <p className="text-xs font-mono">
            useFunctions(path): 获取函数的 state 和 setter<br/>
            useFunctionsValue(path): 只读获取函数<br/>
            useFunctionsSet(path): 设置函数
          </p>
        </div>
      </CardContent>
    </Card>
  )
}

// View 演示组件
function ViewDemo() {
  const [scale, setScale] = useScale()
  const viewState = useViewValue()

  const handleZoomIn = () => setScale(Math.min(scale + 10, 200))
  const handleZoomOut = () => setScale(Math.max(scale - 10, 50))

  const size = viewState?.size

  return (
    <Card>
      <CardHeader>
        <CardTitle>视图状态 (View)</CardTitle>
        <CardDescription>管理视图相关的状态</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-4">
          <Button onClick={handleZoomOut} variant="outline" size="sm">-</Button>
          <span className="text-sm font-medium">{scale}%</span>
          <Button onClick={handleZoomIn} variant="outline" size="sm">+</Button>
        </div>

        <div>
          <p className="text-sm font-medium mb-2">视图信息:</p>
          <div className="p-4 bg-muted rounded-md space-y-1">
            <p className="text-xs">设备: <Badge>{size?.device || 'PC'}</Badge></p>
            <p className="text-xs">宽度: {size?.width || 1200}px</p>
            <p className="text-xs">高度: {size?.height || 800}px</p>
          </div>
        </div>

        <div className="p-4 bg-muted rounded-md">
          <p className="text-xs font-mono">
            useScale(): 获取缩放比例的 state 和 setter<br/>
            useViewValue(path): 获取视图状态的值
          </p>
        </div>
      </CardContent>
    </Card>
  )
}

// Iteration 演示组件
function IterationDemo() {
  const items = [
    { id: 1, name: 'Item 1', value: 100 },
    { id: 2, name: 'Item 2', value: 200 },
    { id: 3, name: 'Item 3', value: 300 }
  ]

  const [currentIndex, setCurrentIndex] = useState(0)

  // 模拟迭代上下文
  const mockIterationContext = {
    index: currentIndex,
    count: items.length,
    value: items[currentIndex]
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>迭代数据 (Iteration)</CardTitle>
        <CardDescription>访问迭代上下文数据</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <Button
            onClick={() => setCurrentIndex(Math.max(0, currentIndex - 1))}
            disabled={currentIndex === 0}
            size="sm"
          >
            上一个
          </Button>
          <Badge className="h-9 px-4">
            {currentIndex + 1} / {items.length}
          </Badge>
          <Button
            onClick={() => setCurrentIndex(Math.min(items.length - 1, currentIndex + 1))}
            disabled={currentIndex === items.length - 1}
            size="sm"
          >
            下一个
          </Button>
        </div>

        <div>
          <p className="text-sm font-medium mb-2">当前项:</p>
          <pre className="p-4 bg-muted rounded-md text-xs">
            {JSON.stringify(mockIterationContext.value, null, 2)}
          </pre>
        </div>

        <div className="p-4 bg-muted rounded-md">
          <p className="text-xs font-mono">
            useIteration(): 获取迭代上下文<br/>
            useIterationValue(path): 获取迭代上下文中的值<br/>
            例如: useIterationValue('name') 获取当前项的 name 属性
          </p>
        </div>
      </CardContent>
    </Card>
  )
}

// 主演示组件
function PageHooksDemoPage() {
  return (
    <Page>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Page Hooks 演示</h1>
          <p className="text-muted-foreground mt-2">
            Page Hooks 提供了一组用于页面开发的 React Hooks，用于管理页面变量、数据源订阅、组件上下文等。
          </p>
        </div>

        <Tabs defaultValue="pagevar" className="w-full">
          <TabsList className="grid w-full grid-cols-3 lg:grid-cols-6">
            <TabsTrigger value="pagevar">页面变量</TabsTrigger>
            <TabsTrigger value="datasource">数据源</TabsTrigger>
            <TabsTrigger value="context">上下文</TabsTrigger>
            <TabsTrigger value="functions">函数</TabsTrigger>
            <TabsTrigger value="view">视图</TabsTrigger>
            <TabsTrigger value="iteration">迭代</TabsTrigger>
          </TabsList>

          <TabsContent value="pagevar" className="mt-6">
            <PageVarDemo />
          </TabsContent>

          <TabsContent value="datasource" className="mt-6">
            <DatasourceDemo />
          </TabsContent>

          <TabsContent value="context" className="mt-6">
            <ContextDemo />
          </TabsContent>

          <TabsContent value="functions" className="mt-6">
            <FunctionsDemo />
          </TabsContent>

          <TabsContent value="view" className="mt-6">
            <ViewDemo />
          </TabsContent>

          <TabsContent value="iteration" className="mt-6">
            <IterationDemo />
          </TabsContent>
        </Tabs>

        <Card>
          <CardHeader>
            <CardTitle>文档链接</CardTitle>
            <CardDescription>查看详细的 API 文档和更多示例</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm">
              详细的文档请参考: <code className="bg-muted px-2 py-1 rounded">docs/page-hooks.md</code>
            </p>
          </CardContent>
        </Card>
      </div>
    </Page>
  )
}

export default PageHooksDemoPage
