# Subscribe - 数据订阅模块

Subscribe 模块提供了实时数据订阅功能，通过 WebSocket 实现数据点和表数据的实时推送。

## 目录

- [概述](#概述)
- [核心概念](#核心概念)
- [Subscribe Provider](#subscribe-provider)
- [Hooks API](#hooks-api)
- [数据查询](#数据查询)
- [完整示例](#完整示例)
- [最佳实践](#最佳实践)

---

## 概述

Subscribe 模块是基于 WebSocket 的实时数据订阅系统，提供了：

- **数据点订阅** - 实时获取数据点的最新值
- **表数据订阅** - 实时获取表数据的变化
- **自动订阅管理** - 智能的订阅列表管理（使用 useRef）
- **性能优化** - 防抖和批量更新优化
- **状态隔离** - 基于 Jotai 的独立 Store

所有 hooks 都使用页面级别的 Store（通过 `SubscribeContext`），确保状态隔离。

---

## 核心概念

### 订阅标签 (SubTag)

```typescript
interface SubTag {
  tableId: string    // 表ID
  dataId?: string    // 数据ID
  tagId?: string     // 标签ID
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

## Subscribe Provider

`Subscribe` 组件是订阅系统的根组件。

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

### Provider 提供的功能

- **WebSocket 连接管理** - 自动管理 WebSocket 连接
- **订阅列表管理** - 使用 useRef 维护订阅列表
- **防抖优化** - 500ms 防抖，最大等待 1000ms
- **独立 Store** - 基于 Jotai 的状态管理

### Context 类型

```typescript
interface SubscribeContextValue {
  store: ReturnType<typeof createStore>  // Jotai store
  subscribeTags: (tags: SubTag[], clear?: boolean) => void
  subscribeData: (dataIds: SubData[], clear?: boolean) => void
}
```

---

## Hooks API

### useDataTag

订阅并获取数据点的值（自动订阅）。

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

**特性：**
- 自动订阅数据点
- 如果不提供 `dataId` 和 `tableId`，会从 `useCellDataValue` 获取
- 返回实时更新的数据点值

**示例：**

```typescript
import { useDataTag } from '@airiot/client'

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
      <p>状态: {tagValue?.timeoutState?.isOffline ? '离线' : '在线'}</p>
    </div>
  )
}
```

### useDataTagValue

获取数据点的值（不自动订阅）。

```typescript
function useDataTagValue(options: TagOptions): TagValue | undefined
```

**使用场景：**
- 只读取已订阅的数据
- 不触发自动订阅
- 用于性能优化

**示例：**

```typescript
import { useDataTagValue } from '@airiot/client'

function CurrentValue() {
  const value = useDataTagValue({
    tableId: 'device-table',
    dataId: 'device-001',
    tagId: 'pressure'
  })

  return <span>{value?.value}</span>
}
```

### useTableData

订阅并获取表数据的字段值（自动订阅）。

```typescript
function useTableData(options: DataPropOptions): any
```

**参数：**

```typescript
interface DataPropOptions {
  field: string              // 字段名（支持嵌套路径）
  dataId?: string            // 数据ID
  tableId?: string           // 表ID
  type?: string              // 类型
  config?: string            // 配置
  relateShowField?: string   // 关联显示字段
  enumObj?: Record<string, string>  // 枚举对象
}
```

**示例：**

```typescript
import { useTableData } from '@airiot/client'

function DeviceInfo() {
  const name = useTableData({
    field: 'name',
    dataId: 'device-001',
    tableId: 'device-table'
  })
  const status = useTableData({
    field: 'status',
    dataId: 'device-001',
    tableId: 'device-table'
  })

  return (
    <div>
      <p>设备名称: {name}</p>
      <p>运行状态: {status}</p>
    </div>
  )
}
```

### useTableDataValue

获取表数据的值（不自动订阅）。

```typescript
function useTableDataValue(options: DataPropOptions): any
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
    { tableId: 'table1', dataId: 'data1', fields: ['name', 'status'] }
  ],
  (data) => {
    console.log('表数据:', data)
  }
)
```

---

## 完整示例

### 示例 1：实时监控设备数据

```typescript
import React from 'react'
import { Subscribe, useDataTag } from '@airiot/client'

function DeviceMonitor() {
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

  return (
    <div className="device-monitor">
      <h2>设备监控</h2>
      <div>
        <p>温度: {temperature?.value}°C</p>
        <p>压力: {pressure?.value} Pa</p>
        <p>状态: {temperature?.timeoutState?.isOffline ? '离线' : '在线'}</p>
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

### 示例 2：使用 Context 手动订阅

```typescript
import React, { useEffect } from 'react'
import { Subscribe, useSubscribeContext, useDataTagValue } from '@airiot/client'

function CustomMonitor() {
  const { subscribeTags } = useSubscribeContext()

  // 使用只读hook
  const temperature = useDataTagValue({
    tableId: 'device-table',
    dataId: 'device-001',
    tagId: 'temperature'
  })

  useEffect(() => {
    // 手动订阅
    subscribeTags([
      { tableId: 'device-table', dataId: 'device-001', tagId: 'temperature' }
    ])
  }, [subscribeTags])

  return <div>温度: {temperature?.value}°C</div>
}

function App() {
  return (
    <Subscribe>
      <CustomMonitor />
    </Subscribe>
  )
}
```

### 示例 3：批量订阅管理

```typescript
import React, { useState, useEffect } from 'react'
import { Subscribe, useSubscribeContext, useDataTagValue } from '@airiot/client'

function BatchSubscription() {
  const { subscribeTags } = useSubscribeContext()
  const [subscribed, setSubscribed] = useState(false)

  useEffect(() => {
    if (subscribed) {
      // 批量订阅多个数据点
      subscribeTags([
        { tableId: 'table1', dataId: 'data1', tagId: 'temp' },
        { tableId: 'table1', dataId: 'data1', tagId: 'pressure' },
        { tableId: 'table1', dataId: 'data1', tagId: 'humidity' }
      ], true) // true = 清除之前的订阅
    }
  }, [subscribed, subscribeTags])

  const temp = useDataTagValue({ tableId: 'table1', dataId: 'data1', tagId: 'temp' })

  return (
    <div>
      <button onClick={() => setSubscribed(!subscribed)}>
        {subscribed ? '取消订阅' : '订阅'}
      </button>
      {subscribed && <p>温度: {temp?.value}</p>}
    </div>
  )
}

function App() {
  return (
    <Subscribe>
      <BatchSubscription />
    </Subscribe>
  )
}
```

---

## 最佳实践

### 1. 使用 useDataTag 自动订阅

大部分情况下，使用 `useDataTag` 即可，它会自动处理订阅：

```typescript
// 推荐 - 自动订阅
const value = useDataTag({ tableId: 't1', dataId: 'd1', tagId: 'tag1' })
```

### 2. 手动管理订阅

如果需要更精细的控制，使用 `useSubscribeContext`：

```typescript
const { subscribeTags } = useSubscribeContext()
const value = useDataTagValue({ tableId: 't1', dataId: 'd1', tagId: 'tag1' })

useEffect(() => {
  subscribeTags([{ tableId: 't1', dataId: 'd1', tagId: 'tag1' }], true)
}, [])
```

### 3. 批量订阅

尽量批量订阅以提高性能：

```typescript
// 推荐 - 批量订阅
subscribeTags([
  { tableId: 't1', dataId: 'd1', tagId: 'tag1' },
  { tableId: 't1', dataId: 'd1', tagId: 'tag2' },
  { tableId: 't1', dataId: 'd1', tagId: 'tag3' }
], true)
```

### 4. 使用 clear 参数

`clear` 参数控制是否清除之前的订阅：

```typescript
// 添加订阅（保留之前的订阅）
subscribeTags(newTags, false)

// 替换订阅（清除之前的订阅）
subscribeTags(newTags, true)
```

### 5. 组件卸载时清理

Subscribe 模块会自动处理清理：

```typescript
useEffect(() => {
  subscribeTags(tags, true)

  // 组件卸载时会自动取消订阅
  // 无需手动清理
}, [subscribeTags])
```

---

## API 参考

### 导出内容

```typescript
import {
  Subscribe,              // Provider 组件
  useDataTag,             // 订阅并获取数据点值
  useTableData,           // 订阅并获取表数据
  useDataTagValue,        // 获取数据点值（不自动订阅）
  useTableDataValue,      // 获取表数据值（不自动订阅）
  useSubscribeContext,    // 获取订阅上下文
  queryLastData,          // 查询最新数据
  queryTableData,         // 查询表数据
  queryHistoryData,       // 查询历史数据
  queryMeta               // 查询数据点配置
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

## 常见问题

### Q: useDataTag 和 useDataTagValue 有什么区别？

A: `useDataTag` 会自动订阅，而 `useDataTagValue` 只读取已订阅的数据：

```typescript
// 自动订阅并获取值
const value = useDataTag({ tableId: '...', dataId: '...', tagId: '...' })

// 只读取值（不会自动订阅）
const value = useDataTagValue({ tableId: '...', dataId: '...', tagId: '...' })
```

### Q: 如何取消订阅？

A: 使用 `clear=true` 传入新的订阅列表：

```typescript
// 取消所有订阅
subscribeTags([], true)

// 替换为新的订阅
subscribeTags(newTags, true)
```

### Q: 如何订阅整个表的数据？

A: 不指定 `dataId` 和 `tagId`：

```typescript
subscribeTags([
  { tableId: 'device-table' }  // 订阅整个表
])
```

### Q: useDataTag 如何从上下文获取 dataId？

A: 如果不提供 `dataId` 和 `tableId`，会从 `useCellDataValue()` 获取：

```typescript
// 从上下文获取
const value = useDataTag({ tagId: 'temperature' })

// 等价于
const context = useCellDataValue()
const value = useDataTag({
  tableId: context?.tableData?.table?.id,
  dataId: context?.tableData?.id,
  tagId: 'temperature'
})
```

---

## 相关文档

- [Page Hooks](./page-hooks.md) - 页面级状态管理
- [API 模块](./api.md) - HTTP 请求
