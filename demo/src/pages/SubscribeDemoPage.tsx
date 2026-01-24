import React, { useState, useEffect, createContext, useContext } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Activity, Database, WifiOff, AlertTriangle, CheckCircle } from 'lucide-react'

// 注意：在实际项目中，这些应该从 '@airiot/client' 导入
// 由于demo环境可能没有真实的WebSocket后端，这里提供模拟实现用于演示

// ============================================================================
// 类型定义
// ============================================================================

interface SubTag {
  tableId: string
  dataId?: string
  tagId?: string
}

interface TagValue {
  value?: any
  time?: any
  warningState?: any
  timeoutState?: any
  [key: string]: any
}

// ============================================================================
// 模拟 Subscribe Context
// ============================================================================

interface SubscribeContextValue {
  subscribeTags: (tags: SubTag[], clear?: boolean) => void
  subscribeData: (dataIds: any[], clear?: boolean) => void
}

const SubscribeContext = createContext<SubscribeContextValue | null>(null)

// ============================================================================
// 模拟的 Hooks（实际项目中从 @airiot/client 导入）
// ============================================================================

function useSubscribeContext(): SubscribeContextValue {
  const context = useContext(SubscribeContext)
  if (!context) {
    throw new Error('useSubscribeContext must be used within Subscribe Provider')
  }
  return context
}

// 模拟的数据存储（实际项目中由Jotai store管理）
const mockDataStore = new Map<string, TagValue>()

// 初始化一些模拟数据
mockDataStore.set('device-001-temperature', {
  value: 25.6,
  time: new Date().toISOString(),
  timeoutState: { isTimeout: false, isOffline: false, level: 0 },
  warningState: null
})

mockDataStore.set('device-001-humidity', {
  value: 65.2,
  time: new Date().toISOString(),
  timeoutState: { isTimeout: false, isOffline: false, level: 0 },
  warningState: null
})

mockDataStore.set('device-001-pressure', {
  value: 101325,
  time: new Date().toISOString(),
  timeoutState: { isTimeout: false, isOffline: false, level: 0 },
  warningState: null
})

mockDataStore.set('device-002-temperature', {
  value: 28.3,
  time: new Date().toISOString(),
  timeoutState: { isTimeout: true, isOffline: false, level: 2 },
  warningState: null
})

mockDataStore.set('device-002-pressure', {
  value: 98000,
  time: new Date().toISOString(),
  timeoutState: { isTimeout: false, isOffline: false, level: 0 },
  warningState: { level: 'warning', message: '压力偏低' }
})

// 模拟 useDataTag hook
function useDataTag(options: { tableId?: string; dataId?: string; tagId: string }): TagValue | undefined {
  const { dataId, tagId } = options
  const key = `${dataId}-${tagId}`

  // 模拟实时更新
  const [, setValue] = useState<TagValue | undefined>(mockDataStore.get(key))

  useEffect(() => {
    // 在实际项目中，这里会通过WebSocket接收数据并自动更新
    const interval = setInterval(() => {
      const current = mockDataStore.get(key)
      if (current) {
        // 模拟数据变化
        const newValue = {
          ...current,
          value: typeof current.value === 'number'
            ? current.value + (Math.random() - 0.5) * 2
            : current.value,
          time: new Date().toISOString()
        }
        mockDataStore.set(key, newValue)
        setValue(newValue)
      }
    }, 3000)

    return () => clearInterval(interval)
  }, [key])

  return mockDataStore.get(key)
}

// ============================================================================
// 演示组件
// ============================================================================

// 数据点显示组件
function DataPointDisplay({ tagId, tableId, dataId }: { tagId: string; tableId: string; dataId: string }) {
  // 使用实际的hook（这里是模拟实现）
  const tagValue = useDataTag({ tableId, dataId, tagId })

  if (!tagValue) {
    return (
      <div className="p-4 bg-muted rounded-md">
        <p className="text-sm text-muted-foreground">等待数据...</p>
      </div>
    )
  }

  const { value, time, timeoutState, warningState } = tagValue

  return (
    <div className="p-4 bg-card border rounded-md space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium">{tagId}</span>
        <div className="flex items-center gap-2">
          {timeoutState?.isOffline ? (
            <Badge variant="destructive" className="flex items-center gap-1">
              <WifiOff className="h-3 w-3" /> 离线
            </Badge>
          ) : timeoutState?.isTimeout ? (
            <Badge variant="secondary" className="flex items-center gap-1">
              <AlertTriangle className="h-3 w-3" /> 超时
            </Badge>
          ) : (
            <Badge variant="default" className="flex items-center gap-1">
              <CheckCircle className="h-3 w-3" /> 在线
            </Badge>
          )}
          {warningState && (
            <Badge variant="outline" className="flex items-center gap-1">
              <Activity className="h-3 w-3" /> 报警
            </Badge>
          )}
        </div>
      </div>
      <div className="text-2xl font-bold">
        {typeof value === 'number' ? value.toFixed(1) : value}
      </div>
      <div className="text-xs text-muted-foreground">
        {new Date(time).toLocaleString('zh-CN')}
      </div>
      {warningState && (
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{warningState.message}</AlertDescription>
        </Alert>
      )}
    </div>
  )
}

// 订阅管理演示
function SubscriptionManagementDemo() {
  const { subscribeTags } = useSubscribeContext()
  const [subscriptions, setSubscriptions] = useState<string[]>([])
  const availableTags = ['temperature', 'humidity', 'pressure', 'flow', 'voltage']

  const handleToggleSubscription = (tagId: string) => {
    if (subscriptions.includes(tagId)) {
      setSubscriptions(prev => prev.filter(t => t !== tagId))
    } else {
      setSubscriptions(prev => [...prev, tagId])
    }
  }

  // 当订阅列表变化时，调用subscribeTags
  useEffect(() => {
    if (subscriptions.length > 0) {
      const tags: SubTag[] = subscriptions.map(tagId => ({
        tableId: 'device-table',
        dataId: 'device-001',
        tagId
      }))
      subscribeTags(tags, true) // clear=true 清除之前的订阅
    }
  }, [subscriptions, subscribeTags])

  const handleSubscribeAll = () => {
    setSubscriptions(availableTags)
  }

  const handleClearAll = () => {
    setSubscriptions([])
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>订阅管理</CardTitle>
        <CardDescription>动态管理数据点订阅</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-wrap gap-2">
          {availableTags.map(tagId => (
            <Button
              key={tagId}
              variant={subscriptions.includes(tagId) ? 'default' : 'outline'}
              size="sm"
              onClick={() => handleToggleSubscription(tagId)}
            >
              {tagId}
            </Button>
          ))}
        </div>

        <div className="flex gap-2">
          <Button onClick={handleSubscribeAll} size="sm">全部订阅</Button>
          <Button onClick={handleClearAll} size="sm" variant="secondary">清除全部</Button>
        </div>

        <div className="p-4 bg-muted rounded-md">
          <p className="text-sm font-medium mb-2">当前订阅 ({subscriptions.length}):</p>
          {subscriptions.length === 0 ? (
            <p className="text-sm text-muted-foreground">暂无订阅</p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {subscriptions.map(tagId => (
                <Badge key={tagId} variant="secondary">{tagId}</Badge>
              ))}
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {subscriptions.map(tagId => (
            <DataPointDisplay key={tagId} tagId={tagId} tableId="device-table" dataId="device-001" />
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

// 多设备监控演示
function MultiDeviceMonitorDemo() {
  const { subscribeTags } = useSubscribeContext()
  const devices = [
    { id: 'device-001', name: '温度传感器 1', location: '车间 A' },
    { id: 'device-002', name: '压力传感器 2', location: '车间 B' },
    { id: 'device-003', name: '流量计 3', location: '管道 C' }
  ]

  // 初始化订阅所有设备
  useEffect(() => {
    const tags: SubTag[] = devices.flatMap(device =>
      ['temperature'].map(tagId => ({
        tableId: 'device-table',
        dataId: device.id,
        tagId
      }))
    )
    subscribeTags(tags, true)
  }, [devices, subscribeTags])

  return (
    <Card>
      <CardHeader>
        <CardTitle>多设备监控</CardTitle>
        <CardDescription>同时监控多个设备的数据点</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {devices.map(device => (
            <div key={device.id} className="p-4 bg-card border rounded-md space-y-3">
              <div>
                <h3 className="font-semibold">{device.name}</h3>
                <p className="text-sm text-muted-foreground">{device.location}</p>
              </div>
              <div className="space-y-2">
                <DataPointDisplay tagId="temperature" tableId="device-table" dataId={device.id} />
              </div>
            </div>
          ))}
        </div>

        <Alert>
          <Database className="h-4 w-4" />
          <AlertDescription>
            所有设备的数据点都通过单个 WebSocket 连接实时推送，自动批量更新，性能优化。
            <br />
            <strong>代码示例：</strong>
            <pre className="mt-2 text-xs bg-muted p-2 rounded">
{`const { subscribeTags } = useSubscribeContext()

useEffect(() => {
  const tags = devices.flatMap(device =>
    ['temperature', 'pressure'].map(tagId => ({
      tableId: 'device-table',
      dataId: device.id,
      tagId
    }))
  )
  subscribeTags(tags, true) // true = 清除之前的订阅
}, [devices, subscribeTags])`}
            </pre>
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  )
}

// API 使用演示
function ApiUsageDemo() {
  const [activeTab, setActiveTab] = useState('hook')

  return (
    <Card>
      <CardHeader>
        <CardTitle>API 使用示例</CardTitle>
        <CardDescription>查看各种 Hook 的使用方法</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="hook">useDataTag</TabsTrigger>
            <TabsTrigger value="context">useSubscribeContext</TabsTrigger>
            <TabsTrigger value="provider">Provider</TabsTrigger>
          </TabsList>

          <TabsContent value="hook" className="mt-4">
            <div className="space-y-4">
              <div>
                <h4 className="font-semibold mb-2">useDataTag</h4>
                <p className="text-sm text-muted-foreground mb-2">订阅并获取数据点的值</p>
                <pre className="p-4 bg-muted rounded-md text-xs overflow-x-auto">
{`import { useDataTag } from '@airiot/client'

function TemperatureDisplay() {
  const tagValue = useDataTag({
    tableId: 'device-table',
    dataId: 'device-001',
    tagId: 'temperature'
  })

  return (
    <div>
      <p>温度: {tagValue?.value}°C</p>
      <p>时间: {tagValue?.time}</p>
      <p>状态: {
        tagValue?.timeoutState?.isOffline
          ? '离线'
          : '在线'
      }</p>
    </div>
  )
}`}
                </pre>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="context" className="mt-4">
            <div className="space-y-4">
              <div>
                <h4 className="font-semibold mb-2">useSubscribeContext</h4>
                <p className="text-sm text-muted-foreground mb-2">获取订阅管理方法</p>
                <pre className="p-4 bg-muted rounded-md text-xs overflow-x-auto">
{`import { useSubscribeContext } from '@airiot/client'

function SubscribeButton() {
  const { subscribeTags } = useSubscribeContext()

  const handleSubscribe = () => {
    subscribeTags([
      { tableId: 'table1', dataId: 'data1', tagId: 'tag1' },
      { tableId: 'table1', dataId: 'data1', tagId: 'tag2' }
    ])
  }

  return (
    <button onClick={handleSubscribe}>
      订阅数据点
    </button>
  )
}`}
                </pre>
              </div>

              <div>
                <h4 className="font-semibold mb-2">批量订阅</h4>
                <pre className="p-4 bg-muted rounded-md text-xs overflow-x-auto">
{`useEffect(() => {
  const tags = [
    { tableId: 'table1', dataId: 'data1', tagId: 'tag1' },
    { tableId: 'table1', dataId: 'data2', tagId: 'tag1' }
  ]
  subscribeTags(tags, true) // true = 清除之前的订阅
}, [subscribeTags])`}
                </pre>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="provider" className="mt-4">
            <div className="space-y-4">
              <div>
                <h4 className="font-semibold mb-2">Subscribe Provider</h4>
                <p className="text-sm text-muted-foreground mb-2">在应用根部包裹Provider</p>
                <pre className="p-4 bg-muted rounded-md text-xs overflow-x-auto">
{`import { Subscribe } from '@airiot/client'

function App() {
  return (
    <Subscribe>
      <YourComponents />
    </Subscribe>
  )
}`}
                </pre>
              </div>

              <Alert>
                <AlertDescription>
                  <strong>注意：</strong>Subscribe Provider 会自动处理：
                  <ul className="list-disc list-inside mt-2 space-y-1">
                    <li>WebSocket 连接管理</li>
                    <li>订阅列表管理（使用 useRef）</li>
                    <li>防抖优化（500ms）</li>
                    <li>超时检测（Web Worker）</li>
                    <li>报警订阅</li>
                    <li>计算记录订阅</li>
                  </ul>
                </AlertDescription>
              </Alert>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}

// 实际使用示例
function RealUsageExample() {
  const { subscribeTags } = useSubscribeContext()

  useEffect(() => {
    // 订阅数据点
    subscribeTags([
      { tableId: 'device-table', dataId: 'device-001', tagId: 'temperature' },
      { tableId: 'device-table', dataId: 'device-001', tagId: 'pressure' }
    ], true)
  }, [subscribeTags])

  return (
    <Card>
      <CardHeader>
        <CardTitle>实际使用示例</CardTitle>
        <CardDescription>展示如何在实际项目中使用Subscribe</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 bg-card border rounded-md">
            <h4 className="font-semibold mb-2">温度监控</h4>
            <DataPointDisplay tagId="temperature" tableId="device-table" dataId="device-001" />
          </div>
          <div className="p-4 bg-card border rounded-md">
            <h4 className="font-semibold mb-2">压力监控</h4>
            <DataPointDisplay tagId="pressure" tableId="device-table" dataId="device-001" />
          </div>
        </div>

        <Alert>
          <AlertDescription>
            <strong>实现要点：</strong>
            <ul className="list-disc list-inside mt-2 space-y-1 text-sm">
              <li>使用 <code>useSubscribeContext</code> 获取订阅管理方法</li>
              <li>使用 <code>useDataTag</code> 订阅并获取数据点值</li>
              <li>在 useEffect 中调用 <code>subscribeTags</code> 建立订阅</li>
              <li>数据会通过 WebSocket 自动更新，组件自动重渲染</li>
            </ul>
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  )
}

// ============================================================================
// 模拟的 Subscribe Provider
// ============================================================================

interface MockSubscribeProviderProps {
  children: React.ReactNode
}

function MockSubscribeProvider({ children }: MockSubscribeProviderProps) {
  const subscribeTags = React.useCallback((tags: SubTag[], clear?: boolean) => {
    console.log('订阅标签:', tags, '清除之前:', clear)
  }, [])

  const subscribeData = React.useCallback((dataIds: any[], clear?: boolean) => {
    console.log('订阅数据:', dataIds, '清除之前:', clear)
  }, [])

  const contextValue: SubscribeContextValue = React.useMemo(() => ({
    subscribeTags,
    subscribeData
  }), [subscribeTags, subscribeData])

  return (
    <SubscribeContext.Provider value={contextValue}>
      {children}
    </SubscribeContext.Provider>
  )
}

// ============================================================================
// 主演示组件
// ============================================================================

function SubscribeDemoPage() {
  return (
    <MockSubscribeProvider>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Subscribe 模块演示</h1>
          <p className="text-muted-foreground mt-2">
            Subscribe 模块提供了实时数据订阅功能，通过 WebSocket 实现数据点、表数据、报警信息和计算记录的实时推送。
          </p>
        </div>

        <Alert>
          <AlertDescription>
            <strong>提示：</strong> 此演示使用模拟实现展示 Subscribe 模块的用法。
            在实际项目中，您需要：
            <ol className="list-decimal list-inside mt-2 space-y-1">
              <li>从 <code>@airiot/client</code> 导入 <code>Subscribe</code> 组件和 hooks</li>
              <li>使用真实的后端 WebSocket 服务</li>
              <li>确保已配置正确的 API 地址和认证信息</li>
            </ol>
          </AlertDescription>
        </Alert>

        <Tabs defaultValue="real-usage" className="w-full">
          <TabsList className="grid w-full grid-cols-2 lg:grid-cols-4">
            <TabsTrigger value="real-usage">实际示例</TabsTrigger>
            <TabsTrigger value="subscription">订阅管理</TabsTrigger>
            <TabsTrigger value="multi-device">多设备监控</TabsTrigger>
            <TabsTrigger value="api">API 使用</TabsTrigger>
          </TabsList>

          <TabsContent value="real-usage" className="mt-6">
            <RealUsageExample />
          </TabsContent>

          <TabsContent value="subscription" className="mt-6">
            <SubscriptionManagementDemo />
          </TabsContent>

          <TabsContent value="multi-device" className="mt-6">
            <MultiDeviceMonitorDemo />
          </TabsContent>

          <TabsContent value="api" className="mt-6">
            <ApiUsageDemo />
          </TabsContent>
        </Tabs>

        <Card>
          <CardHeader>
            <CardTitle>文档链接</CardTitle>
            <CardDescription>查看详细的 API 文档和更多示例</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm">
              详细的文档请参考: <code className="bg-muted px-2 py-1 rounded">docs/subscribe.md</code>
            </p>
          </CardContent>
        </Card>
      </div>
    </MockSubscribeProvider>
  )
}

export default SubscribeDemoPage
