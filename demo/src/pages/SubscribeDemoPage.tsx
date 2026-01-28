import React, { useState, useEffect, createContext, useContext } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Activity, Database, WifiOff, AlertTriangle, CheckCircle, Zap } from 'lucide-react'
import { Subscribe, useDataTag } from '@airiot/client' // 假设从 @airiot/client 导入实际的 Subscribe 组件和 hooks

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

interface SubscribeContextValue {
  subscribeTags: (tags: SubTag[], clear?: boolean) => void
  subscribeData: (dataIds: any[], clear?: boolean) => void
}

// ============================================================================
// 模拟 Subscribe Context
// ============================================================================

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

// 数据点显示组件
function DataPointDisplay({ tagId, tableId, dataId }: { tagId: string; tableId: string; dataId: string }) {
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

// 自动订阅演示
function AutoSubscribeDemo() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>自动订阅演示</CardTitle>
        <CardDescription>使用 useDataTag 自动订阅数据点</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Alert>
          <Zap className="h-4 w-4" />
          <AlertDescription>
            <strong>useDataTag</strong> 会自动订阅数据点，无需手动管理订阅。
            只需传入 <code>tableId</code>、<code>dataId</code> 和 <code>tagId</code> 即可。
          </AlertDescription>
        </Alert>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <DataPointDisplay tagId="temperature" tableId="device-table" dataId="device-001" />
          <DataPointDisplay tagId="humidity" tableId="device-table" dataId="device-001" />
          <DataPointDisplay tagId="pressure" tableId="device-table" dataId="device-001" />
        </div>

        <div className="p-4 bg-muted rounded-md">
          <p className="text-sm font-medium mb-2">代码示例：</p>
          <pre className="text-xs bg-background p-2 rounded overflow-x-auto">
{`import { useDataTag } from '@airiot/client'

function DeviceMonitor() {
  const temperature = useDataTag({
    tableId: 'device-table',
    dataId: 'device-001',
    tagId: 'temperature'
  })

  return <div>温度: {temperature?.value}°C</div>
}`}
          </pre>
        </div>
      </CardContent>
    </Card>
  )
}

// 手动订阅管理演示
function ManualSubscribeDemo() {
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
      subscribeTags(tags, true)
    }
  }, [subscriptions, subscribeTags])

  const handleSubscribeAll = () => setSubscriptions(availableTags)
  const handleClearAll = () => setSubscriptions([])

  return (
    <Card>
      <CardHeader>
        <CardTitle>手动订阅管理</CardTitle>
        <CardDescription>使用 useSubscribeContext 手动管理订阅</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Alert>
          <Database className="h-4 w-4" />
          <AlertDescription>
            使用 <strong>useSubscribeContext</strong> 获取订阅管理方法，
            配合 <strong>useDataTagValue</strong>（只读，不自动订阅）实现精细控制。
          </AlertDescription>
        </Alert>

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

        <div className="p-4 bg-muted rounded-md">
          <p className="text-sm font-medium mb-2">代码示例：</p>
          <pre className="text-xs bg-background p-2 rounded overflow-x-auto">
{`import { useSubscribeContext } from '@airiot/client'

function CustomMonitor() {
  const { subscribeTags } = useSubscribeContext()

  useEffect(() => {
    const tags = [
      { tableId: 'table1', dataId: 'data1', tagId: 'temp' },
      { tableId: 'table1', dataId: 'data1', tagId: 'pressure' }
    ]
    subscribeTags(tags, true) // true = 清除之前的订阅
  }, [subscribeTags])
}`}
          </pre>
        </div>
      </CardContent>
    </Card>
  )
}

// 多设备监控演示
function MultiDeviceMonitorDemo() {
  const devices = [
    { id: 'device-001', name: '温度传感器 1', location: '车间 A' },
    { id: 'device-002', name: '压力传感器 2', location: '车间 B' },
    { id: 'device-003', name: '流量计 3', location: '管道 C' }
  ]

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
            每个设备使用独立的 <code>useDataTag</code> hook，自动管理各自的订阅。
            所有订阅共享同一个 WebSocket 连接，自动批量更新，性能优化。
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  )
}

// API 使用演示
function ApiUsageDemo() {
  const [activeTab, setActiveTab] = useState('auto')

  return (
    <Card>
      <CardHeader>
        <CardTitle>API 使用对比</CardTitle>
        <CardDescription>自动订阅 vs 手动订阅</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="auto">useDataTag (自动)</TabsTrigger>
            <TabsTrigger value="manual">手动管理</TabsTrigger>
          </TabsList>

          <TabsContent value="auto" className="mt-4">
            <div className="space-y-4">
              <div>
                <h4 className="font-semibold mb-2">useDataTag - 推荐使用</h4>
                <p className="text-sm text-muted-foreground mb-2">自动订阅，最简单的方式</p>
                <pre className="p-4 bg-muted rounded-md text-xs overflow-x-auto">
{`import { useDataTag } from '@airiot/client'

function TemperatureDisplay() {
  const temperature = useDataTag({
    tableId: 'device-table',
    dataId: 'device-001',
    tagId: 'temperature'
  })

  return <div>{temperature?.value}°C</div>
}`}
                </pre>
                <div className="mt-2 p-3 bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded-md">
                  <p className="text-sm"><strong>优点：</strong></p>
                  <ul className="text-sm list-disc list-inside space-y-1">
                    <li>✅ 自动订阅，无需手动管理</li>
                    <li>✅ 组件卸载自动取消订阅</li>
                    <li>✅ 代码简洁，易于维护</li>
                  </ul>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="manual" className="mt-4">
            <div className="space-y-4">
              <div>
                <h4 className="font-semibold mb-2">手动订阅 - 高级用法</h4>
                <p className="text-sm text-muted-foreground mb-2">适合需要精细控制的场景</p>
                <pre className="p-4 bg-muted rounded-md text-xs overflow-x-auto">
{`import { useSubscribeContext, useDataTagValue } from '@airiot/client'

function CustomMonitor() {
  const { subscribeTags } = useSubscribeContext()
  const value = useDataTagValue({ tableId: '...', dataId: '...', tagId: '...' })

  useEffect(() => {
    subscribeTags([{ tableId: '...', dataId: '...', tagId: '...' }], true)
  }, [subscribeTags])

  return <div>{value?.value}</div>
}`}
                </pre>
                <div className="mt-2 p-3 bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-md">
                  <p className="text-sm"><strong>适用场景：</strong></p>
                  <ul className="text-sm list-disc list-inside space-y-1">
                    <li>📊 批量订阅多个数据点</li>
                    <li>🎯 需要精确控制订阅时机</li>
                    <li>⚡ 性能优化，避免重复订阅</li>
                  </ul>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}

// 实际应用场景
function RealWorldExample() {
  const [selectedDevice, setSelectedDevice] = useState('device-001')

  return (
    <Card>
      <CardHeader>
        <CardTitle>实际应用场景</CardTitle>
        <CardDescription>设备监控系统示例</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2 mb-4">
          <Button
            variant={selectedDevice === 'device-001' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSelectedDevice('device-001')}
          >
            设备 1
          </Button>
          <Button
            variant={selectedDevice === 'device-002' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSelectedDevice('device-002')}
          >
            设备 2
          </Button>
          <Button
            variant={selectedDevice === 'device-003' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSelectedDevice('device-003')}
          >
            设备 3
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 bg-card border rounded-md">
            <h4 className="font-semibold mb-2">温度监控</h4>
            <DataPointDisplay tagId="temperature" tableId="device-table" dataId={selectedDevice} />
          </div>
          <div className="p-4 bg-card border rounded-md">
            <h4 className="font-semibold mb-2">压力监控</h4>
            <DataPointDisplay tagId="pressure" tableId="device-table" dataId={selectedDevice} />
          </div>
        </div>

        <Alert>
          <Zap className="h-4 w-4" />
          <AlertDescription>
            <strong>关键特性：</strong>
            <ul className="list-disc list-inside mt-2 space-y-1 text-sm">
              <li>切换设备时，useDataTag 会自动订阅新设备的数据点</li>
              <li>旧设备的订阅会自动清理，避免内存泄漏</li>
              <li>所有数据实时更新，每3秒模拟一次数据变化</li>
            </ul>
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  )
}


// ============================================================================
// 主演示组件
// ============================================================================

function SubscribeDemoPage() {
  return (
    <Subscribe>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Subscribe 模块演示</h1>
          <p className="text-muted-foreground mt-2">
            Subscribe 模块提供了实时数据订阅功能，通过 WebSocket 实现数据点和表数据的实时推送。
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

        <Tabs defaultValue="real-world" className="w-full">
          <TabsList className="grid w-full grid-cols-2 lg:grid-cols-4">
            <TabsTrigger value="real-world">实际场景</TabsTrigger>
            <TabsTrigger value="auto">自动订阅</TabsTrigger>
            <TabsTrigger value="manual">手动管理</TabsTrigger>
            <TabsTrigger value="multi-device">多设备</TabsTrigger>
          </TabsList>

          <TabsContent value="real-world" className="mt-6">
            <RealWorldExample />
          </TabsContent>

          <TabsContent value="auto" className="mt-6">
            <AutoSubscribeDemo />
          </TabsContent>

          <TabsContent value="manual" className="mt-6">
            <ManualSubscribeDemo />
          </TabsContent>

          <TabsContent value="multi-device" className="mt-6">
            <MultiDeviceMonitorDemo />
          </TabsContent>
        </Tabs>

        <ApiUsageDemo />

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
    </Subscribe>
  )
}

export default SubscribeDemoPage
