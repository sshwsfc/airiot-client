# API 模块

API 模块提供了一套简化的 HTTP 客户端，用于与后端 REST API 进行交互。

## 创建 API 实例

### `createAPI(options: APIOptions, context?: AppContext): APIInstance`

创建一个新的 API 实例。

```typescript
import { createAPI, setConfig } from '@airiot/client'

// 配置全局上下文
setConfig({
  user: { token: 'your-token' },
  language: 'zh-CN',
  module: 'admin'
})

// 创建 API 实例
const api = createAPI({
  name: 'user',
  resource: 'core/user',
  idProp: '_id'
})
```

### APIOptions

```typescript
interface APIOptions {
  name?: string           // API 名称
  resource?: string       // 资源路径
  proxyKey?: string       // 代理键
  headers?: Record<string, string>  // 自定义请求头
  idProp?: string | string[]  // ID 属性名
  convertItem?: (item: any) => any  // 数据转换函数
  queryParams?: Record<string, any>  // 默认查询参数
  projectAll?: boolean    // 是否返回所有字段
  projectFields?: string[]  // 要返回的字段列表
  customQuery?: (api: any, filter: any, wheres: any, convertItem: any) => Promise<any>
  apiMessage?: boolean    // 是否显示 API 消息
  properties?: Record<string, SchemaProperty>  // 属性定义
}
```

## API 方法

### `fetch(uri: string, options?: FetchOptions): Promise<APIResponse>`

通用的 HTTP 请求方法。

```typescript
const response = await api.fetch('/detail', {
  method: 'GET',
  headers: { 'X-Custom-Header': 'value' }
})

console.log(response.json)   // 响应数据
console.log(response.headers) // 响应头
```

### `query(filter?: any, wheres?: any, withCount?: boolean, ...params: any[]): Promise<{ items: any[]; total: number }>`

查询数据列表。

```typescript
// 基础查询
const { items, total } = await api.query()

// 带分页和排序
const { items, total } = await api.query({
  skip: 0,
  limit: 20,
  order: { createdAt: 'DESC' }
})

// 带过滤条件
const { items, total } = await api.query(
  { limit: 10 },
  { status: { $eq: 'active' } }
)

// 不返回总数
const { items } = await api.query({}, {}, false)
```

#### QueryOptions

```typescript
interface QueryOptions {
  order?: Record<string, 'ASC' | 'DESC'>  // 排序规则
  skip?: number          // 跳过数量（分页）
  limit?: number         // 限制数量（每页数量）
  groupBy?: string       // 分组字段
  fields?: string[]      // 要返回的字段
}
```

### `get(id?: string, option?: FetchOptions): Promise<any>`

获取单条数据。

```typescript
// 获取指定 ID 的数据
const user = await api.get('user123')

// 带选项获取
const user = await api.get('user123', {
  headers: { 'X-Custom-Header': 'value' }
})
```

### `delete(id?: string): Promise<any>`

删除数据。

```typescript
await api.delete('user123')
```

### `save(data?: any, partial?: boolean): Promise<any>`

保存数据（新增或更新）。

```typescript
// 新增数据
const newUser = await api.save({
  username: 'john',
  email: 'john@example.com'
})

// 更新数据（有 ID）
const updatedUser = await api.save({
  id: 'user123',
  username: 'john_doe'
})

// 部分更新（PATCH）
const updatedUser = await api.save({
  id: 'user123',
  email: 'newemail@example.com'
}, true)
```

### `count(filter?: any): Promise<number>`

获取数据总数。

```typescript
const total = await api.count({ status: 'active' })
```

## 高级功能

### 数据转换

使用 `convertItem` 选项对响应数据进行自定义转换：

```typescript
const api = createAPI({
  name: 'user',
  resource: 'core/user',
  convertItem: (item) => ({
    ...item,
    fullName: `${item.firstName} ${item.lastName}`,
    avatarUrl: item.avatar ? `${API_BASE}${item.avatar}` : null
  })
})
```

### 条件查询

支持丰富的查询条件操作符：

```typescript
// 等于
const result1 = await api.query({}, { status: { $eq: 'active' } })

// 不等于
const result2 = await api.query({}, { status: { $ne: 'inactive' } })

// 大于/大于等于/小于/小于等于
const result3 = await api.query({}, { age: { $gte: 18 } })

// 包含（数组）
const result4 = await api.query({}, { tags: { $in: ['a', 'b', 'c'] } })

// 正则匹配
const result5 = await api.query({}, { username: { $regex: '^john' } })

// 逻辑与
const result6 = await api.query({}, {
  $and: [
    { status: { $eq: 'active' } },
    { age: { $gte: 18 } }
  ]
})

// 逻辑或
const result7 = await api.query({}, {
  $or: [
    { status: 'active' },
    { status: 'pending' }
  ]
})
```

## 全局配置

### `setConfig(config: any)`

设置全局配置。

```typescript
import { setConfig } from '@airiot/client'

setConfig({
  user: { token: 'your-token', id: 'user123' },
  language: 'zh-CN',
  module: 'admin',
  settings: {
    safeRequest: true
  }
})
```

### `getConfig(): any`

获取当前全局配置。

```typescript
import { getConfig } from '@airiot/client'

const config = getConfig()
console.log(config.user)
console.log(config.language)
```
