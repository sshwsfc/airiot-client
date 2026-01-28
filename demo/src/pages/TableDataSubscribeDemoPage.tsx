import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { User, Mail, Phone, Calendar, Clock, Shield, FileText, Paperclip, Info, Zap, Database } from 'lucide-react'
import { Subscribe, useTableData, useTableDataValue, useSubscribeContext } from '@airiot/client'

// ============================================================================
// 常量定义 - 使用真实数据
// ============================================================================

const TABLE_ID = 'data'
const DATA_ID = '6979f9f35183bf8f86512b9c'

// 字段配置 - 基于真实的表结构
const FIELD_CONFIG = {
  username: { label: '用户名', icon: User },
  email: { label: '邮箱', icon: Mail },
  phone_number: { label: '手机号', icon: Phone },
  gender: { label: '性别', icon: User },
  birth_date: { label: '出生日期', icon: Calendar },
  status: { label: '用户状态', icon: Shield },
  registration_time: { label: '注册时间', icon: Calendar },
  createTime: { label: '创建时间', icon: Clock },
  modifyTime: { label: '最后登录时间', icon: Clock },
  creator: { label: '创建人', icon: User },
  'text-B352': { label: '记录名称', icon: FileText },
  'text-CA6B': { label: '记录编号', icon: FileText },
  'upload-single-AE62': { label: '记录附件', icon: Paperclip }
} as const

const AVAILABLE_FIELDS = Object.entries(FIELD_CONFIG).map(([id, config]) => ({
  id,
  label: config.label
}))

// ============================================================================
// 类型定义
// ============================================================================

interface SubData {
  tableId: string
  dataId?: string
  fields?: string[]
}

// ============================================================================
// 表数据显示组件
// ============================================================================

// 单个表数据字段显示组件
function TableDataFieldDisplay({
  field,
  label,
  icon: Icon,
  enumTitles
}: {
  field: string
  label: string
  icon?: React.ComponentType<{ className?: string }>
  enumTitles?: Record<string, string>
}) {
  const value = useTableData({ field, dataId: DATA_ID, tableId: TABLE_ID })

  // 格式化显示值
  const formatValue = (val: any) => {
    if (val === null || val === undefined) return '-'
    if (enumTitles && enumTitles[val]) return enumTitles[val]
    if (typeof val === 'object' && val?.username) return val.username
    return String(val)
  }

  return (
    <div className="flex items-center justify-between p-3 bg-card border rounded-md">
      <div className="flex items-center gap-2">
        {Icon && <Icon className="h-4 w-4 text-muted-foreground" />}
        <span className="text-sm font-medium">{label}:</span>
      </div>
      <span className="text-sm font-semibold">{formatValue(value)}</span>
    </div>
  )
}

// 完整用户信息卡片
function UserInfoCard() {
  const username = useTableData({ field: 'username', dataId: DATA_ID, tableId: TABLE_ID })
  const status = useTableData({ field: 'status', dataId: DATA_ID, tableId: TABLE_ID })

  // 性别枚举映射
  const genderTitles: Record<string, string> = {
    male: '男',
    female: '女',
    other: '其他'
  }

  // 状态枚举映射
  const statusTitles: Record<string, string> = {
    active: '激活',
    disabled: '禁用'
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Database className="h-5 w-5" />
          {username || '未知用户'}
        </CardTitle>
        <CardDescription>
          数据ID: {DATA_ID} | 表ID: {TABLE_ID}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center gap-2">
          <Badge variant={status === 'active' ? 'default' : 'secondary'}>
            {statusTitles[status] || status}
          </Badge>
        </div>
        <TableDataFieldDisplay field="username" label="用户名" icon={User} />
        <TableDataFieldDisplay field="email" label="邮箱" icon={Mail} />
        <TableDataFieldDisplay field="phone_number" label="手机号" icon={Phone} />
        <TableDataFieldDisplay field="gender" label="性别" icon={User} enumTitles={genderTitles} />
        <TableDataFieldDisplay field="birth_date" label="出生日期" icon={Calendar} />
        <TableDataFieldDisplay field="registration_time" label="注册时间" icon={Calendar} />
        <TableDataFieldDisplay field="createTime" label="创建时间" icon={Clock} />
        <TableDataFieldDisplay field="modifyTime" label="最后登录时间" icon={Clock} />
        <TableDataFieldDisplay field="creator" label="创建人" icon={User} />
        <TableDataFieldDisplay field="text-B352" label="记录名称" icon={FileText} />
        <TableDataFieldDisplay field="text-CA6B" label="记录编号" icon={FileText} />
      </CardContent>
    </Card>
  )
}

// ============================================================================
// 自动订阅演示
// ============================================================================

function AutoTableDataDemo() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>自动订阅表数据</CardTitle>
        <CardDescription>使用 useTableData 自动订阅用户数据字段</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Alert>
          <Zap className="h-4 w-4" />
          <AlertDescription>
            <strong>useTableData</strong> 会自动订阅表数据字段，无需手动管理订阅。
            只需传入 <code>tableId</code>、<code>dataId</code> 和 <code>field</code> 即可。
          </AlertDescription>
        </Alert>

        <UserInfoCard />

        <div className="p-4 bg-muted rounded-md">
          <p className="text-sm font-medium mb-2">代码示例：</p>
          <pre className="text-xs bg-background p-2 rounded overflow-x-auto">
{`import { useTableData } from '@airiot/client'

function UserInfo() {
  const username = useTableData({
    field: 'username',
    dataId: '6979f9f35183bf8f86512b9c',
    tableId: 'data'
  })
  const email = useTableData({
    field: 'email',
    dataId: '6979f9f35183bf8f86512b9c',
    tableId: 'data'
  })

  return (
    <div>
      <p>用户名: {username}</p>
      <p>邮箱: {email}</p>
    </div>
  )
}`}
          </pre>
        </div>
      </CardContent>
    </Card>
  )
}

// ============================================================================
// 手动订阅管理演示
// ============================================================================

function ManualTableDataDemo() {
  const { subscribeData } = useSubscribeContext()
  const [selectedFields, setSelectedFields] = useState<string[]>(['username', 'email', 'phone_number', 'status'])

  // 当选择的字段变化时，调用 subscribeData
  useEffect(() => {
    if (selectedFields.length > 0) {
      const subData: SubData[] = [{
        tableId: TABLE_ID,
        dataId: DATA_ID,
        fields: selectedFields
      }]
      subscribeData(subData, true) // true = 清除之前的订阅
    }
  }, [selectedFields, subscribeData])

  const toggleField = (fieldId: string) => {
    setSelectedFields(prev =>
      prev.includes(fieldId)
        ? prev.filter(f => f !== fieldId)
        : [...prev, fieldId]
    )
  }

  const subscribeAll = () => setSelectedFields(AVAILABLE_FIELDS.map(f => f.id))
  const clearAll = () => setSelectedFields([])

  // 性别和状态枚举
  const genderTitles: Record<string, string> = { male: '男', female: '女', other: '其他' }
  const statusTitles: Record<string, string> = { active: '激活', disabled: '禁用' }

  const getEnumTitles = (fieldId: string) => {
    if (fieldId === 'gender') return genderTitles
    if (fieldId === 'status') return statusTitles
    return undefined
  }

  const formatValue = (val: any, fieldId: string) => {
    if (val === null || val === undefined) return '-'
    const enumTitles = getEnumTitles(fieldId)
    if (enumTitles && enumTitles[val]) return enumTitles[val]
    if (typeof val === 'object' && val?.username) return val.username
    return String(val)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>手动订阅表数据</CardTitle>
        <CardDescription>使用 useSubscribeContext 手动管理表数据订阅</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Alert>
          <Database className="h-4 w-4" />
          <AlertDescription>
            使用 <strong>useSubscribeContext</strong> 获取订阅管理方法，
            配合 <strong>useTableDataValue</strong>（只读，不自动订阅）实现精细控制。
          </AlertDescription>
        </Alert>

        <div className="space-y-2">
          <p className="text-sm font-medium">选择要订阅的字段：</p>
          <div className="flex flex-wrap gap-2">
            {AVAILABLE_FIELDS.map(field => (
              <Button
                key={field.id}
                variant={selectedFields.includes(field.id) ? 'default' : 'outline'}
                size="sm"
                onClick={() => toggleField(field.id)}
              >
                {field.label}
              </Button>
            ))}
          </div>
        </div>

        <div className="flex gap-2">
          <Button onClick={subscribeAll} size="sm">全部订阅</Button>
          <Button onClick={clearAll} size="sm" variant="secondary">清除全部</Button>
        </div>

        <div className="p-4 bg-muted rounded-md">
          <p className="text-sm font-medium mb-2">
            当前订阅字段 ({selectedFields.length}):
          </p>
          {selectedFields.length === 0 ? (
            <p className="text-sm text-muted-foreground">暂无订阅</p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {selectedFields.map(fieldId => (
                <Badge key={fieldId} variant="secondary">{FIELD_CONFIG[fieldId as keyof typeof FIELD_CONFIG]?.label || fieldId}</Badge>
              ))}
            </div>
          )}
        </div>

        {/* 显示订阅的字段值 */}
        {selectedFields.length > 0 && (
          <div className="space-y-2">
            <p className="text-sm font-medium">字段值：</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {selectedFields.map(fieldId => {
                const value = useTableDataValue({ field: fieldId, dataId: DATA_ID, tableId: TABLE_ID })
                const fieldLabel = FIELD_CONFIG[fieldId as keyof typeof FIELD_CONFIG]?.label || fieldId
                const Icon = FIELD_CONFIG[fieldId as keyof typeof FIELD_CONFIG]?.icon

                return (
                  <div key={fieldId} className="flex items-center justify-between p-2 bg-card border rounded">
                    <div className="flex items-center gap-2">
                      {Icon && <Icon className="h-4 w-4 text-muted-foreground" />}
                      <span className="text-sm">{fieldLabel}:</span>
                    </div>
                    <span className="text-sm font-semibold">{formatValue(value, fieldId)}</span>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        <div className="p-4 bg-muted rounded-md">
          <p className="text-sm font-medium mb-2">代码示例：</p>
          <pre className="text-xs bg-background p-2 rounded overflow-x-auto">
{`import { useSubscribeContext, useTableDataValue } from '@airiot/client'

function CustomTableData() {
  const { subscribeData } = useSubscribeContext()
  const username = useTableDataValue({
    field: 'username',
    dataId: '6979f9f35183bf8f86512b9c',
    tableId: 'data'
  })

  useEffect(() => {
    const subData = [{
      tableId: 'data',
      dataId: '6979f9f35183bf8f86512b9c',
      fields: ['username', 'email', 'phone_number']
    }]
    subscribeData(subData, true) // true = 清除之前的订阅
  }, [subscribeData])

  return <div>用户名: {username}</div>
}`}
          </pre>
        </div>
      </CardContent>
    </Card>
  )
}

// ============================================================================
// 实际应用场景
// ============================================================================

function RealWorldExample() {
  const [activeTab, setActiveTab] = useState('basic')

  const genderTitles: Record<string, string> = { male: '男', female: '女', other: '其他' }

  return (
    <Card>
      <CardHeader>
        <CardTitle>实际应用场景</CardTitle>
        <CardDescription>用户信息管理系统示例</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="basic">基本信息</TabsTrigger>
            <TabsTrigger value="contact">联系方式</TabsTrigger>
            <TabsTrigger value="record">记录信息</TabsTrigger>
          </TabsList>

          <TabsContent value="basic" className="mt-4">
            <div className="space-y-3">
              <TableDataFieldDisplay field="username" label="用户名" icon={User} />
              <TableDataFieldDisplay field="status" label="用户状态" icon={Shield} />
              <TableDataFieldDisplay field="gender" label="性别" icon={User} enumTitles={genderTitles} />
              <TableDataFieldDisplay field="birth_date" label="出生日期" icon={Calendar} />
            </div>
          </TabsContent>

          <TabsContent value="contact" className="mt-4">
            <div className="space-y-3">
              <TableDataFieldDisplay field="email" label="邮箱" icon={Mail} />
              <TableDataFieldDisplay field="phone_number" label="手机号" icon={Phone} />
            </div>
          </TabsContent>

          <TabsContent value="record" className="mt-4">
            <div className="space-y-3">
              <TableDataFieldDisplay field="registration_time" label="注册时间" icon={Calendar} />
              <TableDataFieldDisplay field="createTime" label="创建时间" icon={Clock} />
              <TableDataFieldDisplay field="modifyTime" label="最后登录时间" icon={Clock} />
              <TableDataFieldDisplay field="creator" label="创建人" icon={User} />
              <TableDataFieldDisplay field="text-B352" label="记录名称" icon={FileText} />
              <TableDataFieldDisplay field="text-CA6B" label="记录编号" icon={FileText} />
            </div>
          </TabsContent>
        </Tabs>

        <Alert>
          <Zap className="h-4 w-4" />
          <AlertDescription>
            <strong>关键特性：</strong>
            <ul className="list-disc list-inside mt-2 space-y-1 text-sm">
              <li>切换标签页时，useTableData 会自动订阅对应的数据字段</li>
              <li>所有数据实时更新，当表数据发生变化时自动推送到前端</li>
              <li>支持枚举字段的自动映射（如性别、用户状态）</li>
              <li>支持关联对象字段（如创建人）的自动解析</li>
            </ul>
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  )
}

// ============================================================================
// API 使用对比
// ============================================================================

function ApiComparisonDemo() {
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
            <TabsTrigger value="auto">useTableData (自动)</TabsTrigger>
            <TabsTrigger value="manual">手动管理</TabsTrigger>
          </TabsList>

          <TabsContent value="auto" className="mt-4">
            <div className="space-y-4">
              <div>
                <h4 className="font-semibold mb-2">useTableData - 推荐使用</h4>
                <p className="text-sm text-muted-foreground mb-2">自动订阅，最简单的方式</p>
                <pre className="p-4 bg-muted rounded-md text-xs overflow-x-auto">
{`import { useTableData } from '@airiot/client'

function UserInfo() {
  const username = useTableData({
    field: 'username',
    dataId: '6979f9f35183bf8f86512b9c',
    tableId: 'data'
  })
  const email = useTableData({
    field: 'email',
    dataId: '6979f9f35183bf8f86512b9c',
    tableId: 'data'
  })

  return (
    <div>
      <p>用户名: {username}</p>
      <p>邮箱: {email}</p>
    </div>
  )
}`}
                </pre>
                <div className="mt-2 p-3 bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded-md">
                  <p className="text-sm"><strong>优点：</strong></p>
                  <ul className="text-sm list-disc list-inside space-y-1">
                    <li>✅ 自动订阅，无需手动管理</li>
                    <li>✅ 组件卸载自动取消订阅</li>
                    <li>✅ 代码简洁，易于维护</li>
                    <li>✅ 支持嵌套字段路径</li>
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
{`import { useSubscribeContext, useTableDataValue } from '@airiot/client'

function CustomUserInfo() {
  const { subscribeData } = useSubscribeContext()
  const username = useTableDataValue({
    field: 'username',
    dataId: '6979f9f35183bf8f86512b9c',
    tableId: 'data'
  })

  useEffect(() => {
    const subData = [{
      tableId: 'data',
      dataId: '6979f9f35183bf8f86512b9c',
      fields: ['username', 'email', 'phone_number']
    }]
    subscribeData(subData, true) // true = 清除之前的订阅
  }, [subscribeData])

  return <div>{username}</div>
}`}
                </pre>
                <div className="mt-2 p-3 bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-md">
                  <p className="text-sm"><strong>适用场景：</strong></p>
                  <ul className="text-sm list-disc list-inside space-y-1">
                    <li>📊 批量订阅多个字段</li>
                    <li>🎯 需要精确控制订阅时机</li>
                    <li>⚡ 性能优化，避免重复订阅</li>
                    <li>🔄 动态调整订阅字段列表</li>
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

// ============================================================================
// 主演示组件
// ============================================================================

function TableDataSubscribeDemoPage() {
  return (
    <Subscribe>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Table Data 订阅演示</h1>
          <p className="text-muted-foreground mt-2">
            useTableData 用于订阅表数据字段，实时获取用户信息、配置数据等。
          </p>
        </div>

        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription>
            <strong>提示：</strong> 表数据订阅与数据点订阅的区别：
            <ul className="list-disc list-inside mt-2 space-y-1 text-sm">
              <li><strong>useTag</strong>: 订阅实时数据点（如温度、压力等传感器数据）</li>
              <li><strong>useTableData</strong>: 订阅表数据字段（如用户信息、设备配置等业务数据）</li>
            </ul>
          </AlertDescription>
        </Alert>

        <Tabs defaultValue="auto" className="w-full">
          <TabsList className="grid w-full grid-cols-2 lg:grid-cols-4">
            <TabsTrigger value="auto">自动订阅</TabsTrigger>
            <TabsTrigger value="manual">手动管理</TabsTrigger>
            <TabsTrigger value="real-world">实际场景</TabsTrigger>
            <TabsTrigger value="api">API对比</TabsTrigger>
          </TabsList>

          <TabsContent value="auto" className="mt-6">
            <AutoTableDataDemo />
          </TabsContent>

          <TabsContent value="manual" className="mt-6">
            <ManualTableDataDemo />
          </TabsContent>

          <TabsContent value="real-world" className="mt-6">
            <RealWorldExample />
          </TabsContent>

          <TabsContent value="api" className="mt-6">
            <ApiComparisonDemo />
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
    </Subscribe>
  )
}

export default TableDataSubscribeDemoPage
