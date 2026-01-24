# Subscribe - 数据订阅模块

Subscribe 模块提供了实时数据订阅功能，通过 WebSocket 实现数据点、表数据、报警信息和计算记录的实时推送。

## 目录

- [概述](#概述)
- [核心概念](#核心概念)
- [安装与配置](#安装与配置)
- [Subscribe Provider](#subscribe-provider)
- [Hooks API](#hooks-api)
- [WebSocket 管理](#websocket-管理)
- [数据查询](#数据查询)
- [完整示例](#完整示例)
- [最佳实践](#最佳实践)
- [常见问题](#常见问题)

---

## 概述

Subscribe 模块是一个基于 WebSocket 的实时数据订阅系统，提供了：

- **数据点订阅** - 实时获取数据点的最新值
- **表数据订阅** - 实时获取表数据的变化
- **报警订阅** - 实时接收报警信息
- **计算记录订阅** - 实时获取计算字段的结果
- **超时检测** - 自动检测数据点的超时状态
- **性能优化** - 使用防抖和批量更新优化性能

所有状态管理基于 Jotai，使用独立的 Store 确保状态隔离。

---

## 核心概念

### 订阅标签 (SubTag)

```typescript
interface SubTag {
  tableId: string    // 表ID
  dataId?: string    // 数据ID（可选，不填则订阅整个表）
  tagId?: string     // 标签ID（可选，不填则订阅所有标签）
}
```

### 订阅数据 (SubData)

```typescript
interface SubData {
  tableId: string    // 表ID
  dataId?: string    // 数据ID
  fields?: string[]  // 要订阅的字段列表
}
```

### 标签值 (TagValue)

```typescript
interface TagValue {
  value?: any              // 标签值
  time?: any               // 时间戳
  warningState?: any       // 报警状态
  timeoutState?: any       // 超时状态
  [key: string]: any
}
```

---

## 安装与配置

### 基本使用

```typescript
import { Subscribe } from '@airiot/client'

function App() {
  return (
    <Subscribe>
      <YourComponent />
    </Subscribe>
  )
}
```

### 依赖项

Subscribe 模块依赖以下框架 hooks（需要在应用中实现）：

- `use('table.tag.warning')` - 报警状态管理
- `use('warning.ws', options)` - 报警 WebSocket 订阅

---

## Subscribe Provider

`Subscribe` 组件是订阅系统的根组件，提供了以下功能：

1. **自动 WebSocket 连接管理**
2. **订阅列表管理**（使用 useRef 而非 atom）
3. **防抖优化**（500ms）
4. **超时检测**（通过 Web Worker）
5. **计算记录订阅**

### Provider 结构

```typescript
interface SubscribeContextValue {
  store: ReturnType<typeof createStore>  // Jotai store

  subscribeTags: (tags: SubTag[], clear?: boolean) => void
  subscribeData: (dataIds: SubData[], clear?: boolean) => void
}
```

### 使用示例

```typescript
import { Subscribe, useSubscribeContext } from '@airiot/client'

function MyComponent() {
  const { subscribeTags, subscribeData } = useSubscribeContext()

  useEffect(() => {
    // 订阅数据点
    subscribeTags([
      { tableId: 'device-table', dataId: 'device-1', tagId: 'temperature' },
      { tableId: 'device-table', dataId: 'device-1', tagId: 'humidity' }
    ])

    // 订阅表数据
    subscribeData([
      { tableId: 'device-table', dataId: 'device-1', fields: ['name', 'status'] }
    ])
  }, [])

  return <div>...</div>
}

function App() {
  return (
    <Subscribe>
      <MyComponent />
    </Subscribe>
  )
}
```

---

## Hooks API

### useDataTag

订阅并获取数据点的值。

```typescript
function useDataTag(options: TagOptions): TagValue | undefined
```

**参数：**

```typescript
interface TagOptions {
  tableId?: string
  dataId?: string
  tagId: string
}
```

**示例：**

```typescript
import { useDataTag } from '@airiot/client'

function TemperatureDisplay() {
  const tagValue = useDataTag({
    tableId: 'device-table',
    dataId: 'device-1',
    tagId: 'temperature'
  })

  return (
    <div>
      <p>温度: {tagValue?.value}°C</p>
      <p>时间: {tagValue?.time}</p>
      <p>状态: {tagValue?.timeoutState?.isOffline ? '离线' : '在线'}</p>
    </div>
  )
}
```

### useDataTagValue

只获取数据点的值（不自动订阅）。

```typescript
function useDataTagValue(options: TagOptions): TagValue | undefined
```

**示例：**

```typescript
import { useDataTagValue } from '@airiot/client'

function CurrentValue() {
  const value = useDataTagValue({
    tableId: 'device-table',
    dataId: 'device-1',
    tagId: 'pressure'
  })

  return <span>{value?.value}</span>
}
```

### useTableData

订阅并获取表数据的字段值。

```typescript
function useTableData(options: DataPropOptions): any
```

**参数：**

```typescript
interface DataPropOptions {
  field: string              // 字段名（支持嵌套路径，如 'user.profile.name'）
  dataId?: string            // 数据ID
  tableId?: string           // 表ID
  type?: string              // 类型（如 'schema'）
  config?: string            // 配置
  relateShowField?: string   // 关联显示字段
  enumObj?: Record<string, string>  // 枚举对象
}
```

**示例：**

```typescript
import { useTableData } from '@airiot/client'

function DeviceInfo() {
  const name = useTableData({ field: 'name', dataId: 'device-1', tableId: 'device-table' })
  const status = useTableData({ field: 'status', dataId: 'device-1', tableId: 'device-table' })

  return (
    <div>
      <p>设备名称: {name}</p>
      <p>运行状态: {status}</p>
    </div>
  )
}
```

### useReferenceValue

获取计算记录的值。

```typescript
function useReferenceValue(tableId: string, tableDataId: string, field: string): any
```

**示例：**

```typescript
import { useReferenceValue } from '@airiot/client'

function ComputedValue() {
  const value = useReferenceValue('compute-table', 'data-1', 'totalPower')

  return <div>总功率: {value} kW</div>
}
```

### useSubscribeContext

获取 Subscribe Context。

```typescript
function useSubscribeContext(): SubscribeContextValue
```

**示例：**

```typescript
import { useSubscribeContext } from '@airiot/client'

function SubscribeButton() {
  const { subscribeTags } = useSubscribeContext()

  const handleSubscribe = () => {
    subscribeTags([
      { tableId: 'table1', dataId: 'data1', tagId: 'tag1' }
    ])
  }

  return <button onClick={handleSubscribe}>订阅</button>
}
```

---

## WebSocket 管理

### useWS

底层 WebSocket Hook。

```typescript
function useWS(): UseWSResult

interface UseWSResult {
  subscribe: (subType: string, query: any) => () => void  // 返回取消订阅函数
  onData: (fn: OnDataFunc) => void
  onMessage: (fn: OnMessageFunc) => void
  onStatus: (fn: OnStatusFunc) => void
}
```

**订阅类型 (subType)：**

- `'data'` - 数据点订阅
- `'tabledata'` - 表数据订阅
- `'computerecord'` - 计算记录订阅
- `'warning'` - 报警订阅

**示例：**

```typescript
import { useWS } from '@airiot/client'

function MyComponent() {
  const { subscribe, onData, onStatus } = useWS()

  useEffect(() => {
    const unsubscribe = subscribe('data', [
      { tableId: 'table1', dataId: 'data1', tagId: 'tag1' }
    ])

    onData((data) => {
      console.log('收到数据:', data)
    })

    onStatus((status) => {
      console.log('连接状态:', status)
    })

    return () => unsubscribe()
  }, [])

  return <div>...</div>
}
```

### 连接状态

- `'connecting'` - 连接中
- `'connected'` - 已连接
- `'close'` - 连接关闭
- `'error'` - 连接错误

### 自动重连

WebSocket 连接断开时会自动重连：

- 前 10 次：3 秒间隔
- 第 11-20 次：10 秒间隔
- 20 次后：停止重连

### 心跳保活

每 30 秒发送一次心跳消息保持连接。

---

## 数据查询

Subscribe 模块提供了多个查询函数：

### queryLastData

查询数据点的最新值。

```typescript
import { queryLastData } from '@airiot/client'

queryLastData(
  [
    { tableId: 'table1', dataId: 'data1', tagId: 'tag1' },
    { tableId: 'table1', dataId: 'data1', tagId: 'tag2' }
  ],
  (data) => {
    console.log('最新数据:', data)
    // data: { 'table1|data1|tag1': { value: 100, time: '...' }, ... }
  }
)
```

### queryTableData

查询表数据。

```typescript
import { queryTableData } from '@airiot/client'

queryTableData(
  [
    { tableId: 'table1', dataId: 'data1', fields: ['name', 'status'] },
    { tableId: 'table1', dataId: 'data2', fields: ['name', 'status'] }
  ],
  (data) => {
    console.log('表数据:', data)
  }
)
```

### queryHistoryData

查询历史数据。

```typescript
import { queryHistoryData } from '@airiot/client'

queryHistoryData(
  [
    { tableId: 'table1', dataId: 'data1', tagId: 'tag1' }
  ],
  '2024-01-01T00:00:00Z',
  (data) => {
    console.log('历史数据:', data)
  }
)
```

### queryMeta

查询数据点配置信息。

```typescript
import { queryMeta } from '@airiot/client'

queryMeta(
  [
    { tableId: 'table1', dataId: 'data1', tagId: 'tag1' }
  ],
  (meta) => {
    console.log('数据点配置:', meta)
  }
)
```

---

## 完整示例

### 示例 1：实时监控设备数据

```typescript
import React, { useEffect } from 'react'
import { Subscribe, useDataTag, useTableData, useSubscribeContext } from '@airiot/client'

function DeviceMonitor() {
  const { subscribeTags } = useSubscribeContext()

  const temperature = useDataTag({
    tableId: 'device-table',
    dataId: 'device-001',
    tagId: 'temperature'
  })

  const pressure = useDataTag({
    tableId: 'device-table',
    dataId: 'device-001',
    tagId: 'pressure'
  })

  const deviceName = useTableData({
    field: 'name',
    dataId: 'device-001',
    tableId: 'device-table'
  })

  useEffect(() => {
    // 订阅设备数据点
    subscribeTags([
      { tableId: 'device-table', dataId: 'device-001', tagId: 'temperature' },
      { tableId: 'device-table', dataId: 'device-001', tagId: 'pressure' }
    ])
  }, [subscribeTags])

  return (
    <div className="device-monitor">
      <h2>{deviceName}</h2>
      <div className="data-points">
        <div className="data-point">
          <label>温度</label>
          <span className="value">{temperature?.value}°C</span>
          <span className={`status ${temperature?.timeoutState?.isTimeout ? 'timeout' : ''}`}>
            {temperature?.timeoutState?.isOffline ? '离线' : '在线'}
          </span>
        </div>
        <div className="data-point">
          <label>压力</label>
          <span className="value">{pressure?.value} Pa</span>
        </div>
      </div>
    </div>
  )
}

function App() {
  return (
    <Subscribe>
      <DeviceMonitor />
    </Subscribe>
  )
}
```

### 示例 2：多设备数据订阅

```typescript
import React, { useEffect, useState } from 'react'
import { Subscribe, useDataTag, useSubscribeContext } from '@airiot/client'

function DeviceList() {
  const { subscribeTags } = useSubscribeContext()
  const [devices] = useState([
    { id: 'device-001', name: '设备 1' },
    { id: 'device-002', name: '设备 2' },
    { id: 'device-003', name: '设备 3' }
  ])

  useEffect(() => {
    // 批量订阅所有设备的数据点
    const tags = devices.flatMap(device =>
      ['temperature', 'humidity', 'pressure'].map(tagId => ({
        tableId: 'device-table',
        dataId: device.id,
        tagId
      }))
    )
    subscribeTags(tags)
  }, [devices, subscribeTags])

  return (
    <div>
      {devices.map(device => (
        <DeviceCard key={device.id} deviceId={device.id} name={device.name} />
      ))}
    </div>
  )
}

function DeviceCard({ deviceId, name }: { deviceId: string; name: string }) {
  const temperature = useDataTag({ tableId: 'device-table', dataId: deviceId, tagId: 'temperature' })
  const humidity = useDataTag({ tableId: 'device-table', dataId: deviceId, tagId: 'humidity' })

  return (
    <div className="device-card">
      <h3>{name}</h3>
      <p>温度: {temperature?.value}°C</p>
      <p>湿度: {humidity?.value}%</p>
    </div>
  )
}

function App() {
  return (
    <Subscribe>
      <DeviceList />
    </Subscribe>
  )
}
```

### 示例 3：动态订阅管理

```typescript
import React, { useState, useEffect } from 'react'
import { Subscribe, useDataTag, useSubscribeContext } from '@airiot/client'

function DynamicSubscription() {
  const { subscribeTags } = useSubscribeContext()
  const [subscribedTags, setSubscribedTags] = useState<string[]>([])

  const availableTags = ['temperature', 'humidity', 'pressure', 'flow', 'voltage']

  const toggleTag = (tagId: string) => {
    if (subscribedTags.includes(tagId)) {
      // 取消订阅（clear=true 会清除之前的订阅）
      setSubscribedTags(prev => {
        const newTags = prev.filter(t => t !== tagId)
        subscribeTags(
          newTags.map(t => ({ tableId: 'device-table', dataId: 'device-001', tagId: t })),
          true
        )
        return newTags
      })
    } else {
      // 添加订阅
      setSubscribedTags(prev => {
        const newTags = [...prev, tagId]
        subscribeTags(
          newTags.map(t => ({ tableId: 'device-table', dataId: 'device-001', tagId: t })),
          true
        )
        return newTags
      })
    }
  }

  return (
    <div>
      <h2>选择要订阅的数据点</h2>
      <div>
        {availableTags.map(tagId => (
          <label key={tagId}>
            <input
              type="checkbox"
              checked={subscribedTags.includes(tagId)}
              onChange={() => toggleTag(tagId)}
            />
            {tagId}
          </label>
        ))}
      </div>

      <div>
        {subscribedTags.map(tagId => (
          <DataPointDisplay key={tagId} tagId={tagId} />
        ))}
      </div>
    </div>
  )
}

function DataPointDisplay({ tagId }: { tagId: string }) {
  const value = useDataTag({ tableId: 'device-table', dataId: 'device-001', tagId })

  return (
    <div>
      <strong>{tagId}:</strong> {value?.value}
    </div>
  )
}

function App() {
  return (
    <Subscribe>
      <DynamicSubscription />
    </Subscribe>
  )
}
```

---

## 最佳实践

### 1. 批量订阅

尽量使用批量订阅而非单个订阅：

```typescript
// 推荐
useEffect(() => {
  subscribeTags([
    { tableId: 'table1', dataId: 'data1', tagId: 'tag1' },
    { tableId: 'table1', dataId: 'data1', tagId: 'tag2' },
    { tableId: 'table1', dataId: 'data1', tagId: 'tag3' }
  ])
}, [])

// 不推荐
useEffect(() => {
  subscribeTags([{ tableId: 'table1', dataId: 'data1', tagId: 'tag1' }])
  subscribeTags([{ tableId: 'table1', dataId: 'data1', tagId: 'tag2' }])
  subscribeTags([{ tableId: 'table1', dataId: 'data1', tagId: 'tag3' }])
}, [])
```

### 2. 清理订阅

组件卸载时取消订阅：

```typescript
useEffect(() => {
  const tags = [{ tableId: 'table1', dataId: 'data1', tagId: 'tag1' }]
  subscribeTags(tags)

  return () => {
    // Subscribe 模块会自动清理订阅
  }
}, [subscribeTags])
```

### 3. 使用 clear 参数

`clear` 参数控制是否清除之前的订阅：

```typescript
// 添加订阅（保留之前的订阅）
subscribeTags(newTags, false)

// 替换订阅（清除之前的订阅）
subscribeTags(newTags, true)
```

### 4. 性能优化

Subscribe 模块内置了性能优化：

- **防抖更新**：500ms 防抖，最大等待 1000ms
- **批量更新**：多个数据点合并更新
- **使用 useRef**：订阅列表使用 ref 而非 state，减少重渲染

### 5. 错误处理

```typescript
function SafeDataDisplay({ tableId, dataId, tagId }) {
  const value = useDataTag({ tableId, dataId, tagId })

  if (!value) {
    return <div>加载中...</div>
  }

  if (value.timeoutState?.isOffline) {
    return <div className="error">设备离线</div>
  }

  if (value.timeoutState?.isTimeout) {
    return <div className="warning">数据超时</div>
  }

  return <div>{value.value}</div>
}
```

---

## 常见问题

### Q: 如何知道数据是否超时？

A: 检查 `timeoutState` 属性：

```typescript
const value = useDataTag({ ... })

if (value?.timeoutState?.isTimeout) {
  // 数据超时
}

if (value?.timeoutState?.isOffline) {
  // 设备离线
}

// 超时级别：0=正常, 1=警告, 2=超时, 3=离线
const level = value?.timeoutState?.level
```

### Q: 如何订阅报警信息？

A: 报警信息通过 `useTagWarningSubscribe` 自动订阅：

```typescript
// Subscribe 组件内部会自动处理报警订阅
// 报警状态会更新到 TagValue 的 warningState 属性

const value = useDataTag({ ... })
if (value?.warningState) {
  console.log('有报警:', value.warningState)
}
```

### Q: WebSocket 连接断开怎么办？

A: Subscribe 模块会自动重连：

- 前 10 次：3 秒间隔
- 第 11-20 次：10 秒间隔
- 20 次后：停止重连

可以通过 `onStatus` 监听连接状态：

```typescript
const { onStatus } = useWS()

onStatus((status) => {
  console.log('连接状态:', status)
})
```

### Q: 如何订阅整个表的所有数据点？

A: 不指定 `dataId` 和 `tagId`：

```typescript
subscribeTags([
  { tableId: 'device-table' }  // 订阅整个表
])
```

### Q: 如何取消订阅？

A: 使用 `clear=true` 传入新的订阅列表：

```typescript
// 取消所有订阅
subscribeTags([], true)

// 取消特定订阅
subscribeTags([
  { tableId: 'table1', dataId: 'data1', tagId: 'tag1' }
], true)
```

### Q: useDataTag 和 useDataTagValue 有什么区别？

A: `useDataTag` 会自动订阅，而 `useDataTagValue` 只读取已订阅的数据：

```typescript
// 自动订阅并获取值
const value = useDataTag({ tableId: '...', dataId: '...', tagId: '...' })

// 只读取值（不会自动订阅）
const value = useDataTagValue({ tableId: '...', dataId: '...', tagId: '...' })
```

---

## API 参考

### 导出内容

```typescript
import {
  Subscribe,              // Provider 组件
  useSubscribeContext,    // 获取 Context

  useDataTag,             // 订阅并获取数据点值
  useDataTagValue,        // 获取数据点值（不自动订阅）
  useTableData,           // 订阅并获取表数据
  useTableDataValue,      // 获取表数据（不自动订阅）
  useReferenceValue,      // 获取计算记录值

  queryLastData,          // 查询最新数据
  queryTableData,         // 查询表数据
  queryHistoryData,       // 查询历史数据
  queryMeta,              // 查询数据点配置

  useWS,                  // WebSocket Hook
  useCommWS,              // 通用 WebSocket Hook
  useWSData               // WebSocket 数据 Hook
} from '@airiot/client'

// 类型导出
import type {
  SubTag,
  SubData,
  TagValue,
  TagOptions,
  DataPropOptions,
  SubscribeContextValue
} from '@airiot/client'
```

---

## 相关文档

- [Page Hooks](./page-hooks.md) - 页面级状态管理
- [API 模块](./api.md) - HTTP 请求
- [Model 模块](./model.md) - 模型和状态管理
