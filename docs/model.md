# 模型模块

模型模块提供完整的数据模型管理和状态管理功能，基于 Jotai 实现响应式状态。

## 组件

### `Model`

模型组件，提供模型上下文。

```typescript
import { Model } from '@airiot/client'

const userModel = {
  name: 'user',
  title: '用户',
  api: { name: 'core/user' },
  properties: {
    username: { type: 'string', title: '用户名' },
    email: { type: 'string', title: '邮箱' }
  }
}

function App() {
  return (
    <Model schema={userModel}>
      <UserList />
    </Model>
  )
}
```

**Props：**

- `model` - 模型配置对象（必填）或模型名称（使用内置模型）
- `name` - 模型名称（可选，用于引用内置模型）
- `modelKey` - 模型唯一标识（可选，用于区分同名的不同模型实例）
- `initialValues` - 初始值（可选）

### `TableModel`

动态模型组件，从服务器获取表结构并创建模型上下文。

```typescript
import { TableModel } from '@airiot/client'

function DynamicTablePage({ tableId }) {
  return (
    <TableModel
      tableId={tableId}
      loadingComponent={<Spinner />}
    >
      <UserList />
    </TableModel>
  )
}
```

**Props：**

- `tableId` - 表结构 ID，来自 `core/t/schema`（必填）
- `loadingComponent` - 加载表结构时显示的组件（可选）
- 其他所有 props 会传递给底层的 `Model` 组件

**行为：**

1. 从 `core/t/schema/{tableId}` 获取表结构
2. 从 `core/t/schema/tag/{tableId}` 获取表标签
3. 使用获取的结构创建 `Model` 上下文
4. 在表结构加载完成前显示加载组件

**使用场景：**

- 动态表管理，从服务器配置
- 多租户应用，每个租户有不同的表结构
- 管理后台，管理动态数据模型
- 需要运行时更改结构的应用

### `ModelContext`

模型上下文，用于在组件树中访问模型状态。

```typescript
import { useModel } from '@airiot/client'

function ChildComponent() {
  const { model, api, atoms } = useModel()

  return <div>{model.title}</div>
}
```

## Hooks

### 基础 Hooks

### `useModel()`

获取模型上下文。

```typescript
import { useModel } from '@airiot/client'

function MyComponent() {
  const { model, api, atoms } = useModel()
  // model - 模型配置
  // api - API 实例
  // atoms - Jotai 原子集合

  return <div>{model.title}</div>
}
```

### `useModelValue()`

读取模型原子值。

```typescript
import { useModelValue } from '@airiot/client'

function ItemCount() {
  const items = useModelValue('items')
  const count = useModelValue('count')

  return <div>共 {count} 项</div>
}
```

### `useModelState()`

读取和写入模型原子值。

```typescript
import { useModelState } from '@airiot/client'

function FilterControl() {
  const [wheres, setWheres] = useModelState('wheres')

  const handleFilterChange = (status) => {
    setWheres({ status: { $eq: status } })
  }

  return <Select onChange={handleFilterChange} />
}
```

### `useSetModelState()`

只写入模型原子值。

```typescript
import { useSetModelState } from '@airiot/client'

function ResetButton() {
  const setSelected = useSetModelState('selected')

  const handleReset = () => {
    setSelected([])
  }

  return <button onClick={handleReset}>重置选择</button>
}
```

### `useModelCallback()`

创建模型回调函数。

```typescript
import { useModelCallback } from '@airiot/client'

function DataLoader() {
  const loadItems = useModelCallback(
    (get, set) => {
      const items = get(atoms.items)
      const limit = get(atoms.limit)
      // 执行加载逻辑
    },
    [atoms.items, atoms.limit]
  )

  return <button onClick={loadItems}>加载</button>
}
```

### 数据操作 Hooks

### `useModelGet()`

获取模型数据。

```typescript
import { useModelGet } from '@airiot/client'

function UserEdit({ userId }) {
  const { data, loading } = useModelGet({ id: userId })

  if (loading) return <Spinner />
  return <UserForm initialValues={data} />
}
```

### `useModelSave()`

保存模型数据。

```typescript
import { useModelSave } from '@airiot/client'

function UserForm({ initialValues }) {
  const { saveItem } = useModelSave()

  const handleSubmit = async (values) => {
    try {
      await saveItem(values)
      // 保存成功
    } catch (error) {
      // 保存失败
      console.error(error)
    }
  }

  return <Form onSubmit={handleSubmit} initialValues={initialValues} />
}
```

### `useModelDelete()`

删除模型数据。

```typescript
import { useModelDelete } from '@airiot/client'

function UserItem({ userId }) {
  const { deleteItem } = useModelDelete()

  const handleDelete = async () => {
    await deleteItem(userId)
  }

  return <button onClick={handleDelete}>删除</button>
}
```

### `useModelItem()`

组合 Hook，提供获取、保存和删除功能。

```typescript
import { useModelItem } from '@airiot/client'

function UserEdit({ userId }) {
  const { data, loading, saveItem, deleteItem } = useModelItem({ id: userId })

  if (loading) return <Spinner />

  return (
    <div>
      <UserForm initialValues={data} onSave={saveItem} />
      <button onClick={() => deleteItem(userId)}>删除</button>
    </div>
  )
}
```

### `useModelEffect()`

模型副作用 Hook。

```typescript
import { useModelEffect } from '@airiot/client'

function DataSync() {
  useModelEffect(() => {
    // 当模型状态变化时执行
    const fetchData = async () => {
      // 同步数据逻辑
    }
    fetchData()
  }, ['items', 'selected']) // 监听的原子

  return <div>数据同步中...</div>
}
```

### `useModelGetItems()`

获取数据列表。

```typescript
import { useModelGetItems, useModelValue } from '@airiot/client'

function UserList() {
  const { model } = useModel()
  const { getItems } = useModelGetItems()
  const items = useModelValue('items')
  const loading = useModelValue('loading', 'items')

  useEffect(() => {
    getItems({ limit: 10 })
  }, [])

  return (
    <div>
      {loading ? <Spinner /> : <Table data={items} />}
    </div>
  )
}
```

### `useModelList()`

获取列表数据（带自动刷新）。

```typescript
import { useModelList } from '@airiot/client'

function UserTable() {
  const { loading, items, fields, selected } = useModelList()

  return (
    <div>
      {loading ? <Spinner /> : <Table data={items} columns={fields} />}
    </div>
  )
}
```

### `useModelPagination()`

分页功能。

```typescript
import { useModelPagination } from '@airiot/client'

function Pagination() {
  const { items, activePage, changePage } = useModelPagination()

  return (
    <PaginationComponent
      total={items}
      current={activePage}
      onChange={changePage}
    />
  )
}
```

### `useModelCount()`

获取数据总数。

```typescript
import { useModelCount } from '@airiot/client'

function TotalCount() {
  const { count, loading } = useModelCount()

  return (
    <div>
      {loading ? '加载中...' : `共 ${count} 条数据`}
    </div>
  )
}
```

### `useModelPageSize()`

页面大小控制。

```typescript
import { useModelPageSize } from '@airiot/client'

function PageSizeControl() {
  const { sizes, setPageSize, size } = useModelPageSize()

  return (
    <Select value={size} onChange={setPageSize}>
      {sizes.map(s => <option key={s} value={s}>{s}</option>)}
    </Select>
  )
}
```

### `useModelSelect()`

选择功能。

```typescript
import { useModelSelect } from '@airiot/client'

function SelectionTable() {
  const { count, selected, onSelect, onSelectAll } = useModelSelect()

  return (
    <Table
      data={items}
      selected={selected}
      onSelect={onSelect}
      onSelectAll={onSelectAll}
    />
  )
}
```

### `useModelListRow()`

列表行操作。

```typescript
import { useModelListRow } from '@airiot/client'

function TableRow({ item }) {
  const { selected, onSelect, onExpand } = useModelListRow(item)

  return (
    <tr>
      <td>
        <input
          type="checkbox"
          checked={selected}
          onChange={() => onSelect(item)}
        />
      </td>
      <td>{item.name}</td>
      <td>
        <button onClick={() => onExpand(item)}>展开</button>
      </td>
    </tr>
  )
}
```

### `useModelListHeader()`

列表表头操作。

```typescript
import { useModelListHeader } from '@airiot/client'

function TableHeader({ field }) {
  const { order, onOrder } = useModelListHeader(field)

  return (
    <th onClick={() => onOrder(field)}>
      {field.title}
      {order && <span>{order === 'ASC' ? '↑' : '↓'}</span>}
    </th>
  )
}
```

### `useModelListOrder()`

列表排序控制。

```typescript
import { useModelListOrder } from '@airiot/client'

function SortControl() {
  const { orders, setOrder, toggleOrder } = useModelListOrder()

  return (
    <div>
      <button onClick={() => setOrder('name', 'ASC')}>按名称升序</button>
      <button onClick={() => toggleOrder('createdAt')}>切换创建时间排序</button>
      <div>当前排序：{JSON.stringify(orders)}</div>
    </div>
  )
}
```

### `useModelListItem()`

列表项操作。

```typescript
import { useModelListItem } from '@airiot/client'

function ListItem({ item }) {
  const { selected, loading, onSelect } = useModelListItem(item.id)

  return (
    <div
      className={selected ? 'selected' : ''}
      onClick={() => onSelect(item)}
    >
      {loading ? <Spinner /> : <span>{item.name}</span>}
    </div>
  )
}
```

### `useModelQuery()`

自定义查询。

```typescript
import { useModelQuery } from '@airiot/client'

function CustomQuery() {
  const { items, loading, model } = useModelQuery()

  if (loading) return <Spinner />
  return <CustomList data={items} />
}
```

### `useModelPermission()`

权限检查。

```typescript
import { useModelPermission } from '@airiot/client'

function UserActions() {
  const { canAdd, canEdit, canDelete } = useModelPermission()

  return (
    <div>
      {canAdd && <Button>新增</Button>}
      {canEdit && <Button>编辑</Button>}
      {canDelete && <Button>删除</Button>}
    </div>
  )
}
```

### `useModelEvent()`

事件处理。

```typescript
import { useModelEvent } from '@airiot/client'

function EventExample() {
  const { onLoad, onSave, onDelete } = useModelEvent()

  useEffect(() => {
    if (onLoad) onLoad()
  }, [])

  const handleSave = async (data) => {
    if (onSave) await onSave(data)
  }

  return <Form onSubmit={handleSave} />
}
```

### `useModelFields()`

字段控制。

```typescript
import { useModelFields } from '@airiot/client'

function FieldControl() {
  const { fields, changeFieldDisplay, selected } = useModelFields()

  return (
    <div>
      {Object.entries(fields).map(([key, field]) => (
        <label key={key}>
          <input
            type="checkbox"
            checked={selected.includes(key)}
            onChange={(e) => changeFieldDisplay([key, e.target.checked])}
          />
          {field.title}
        </label>
      ))}
    </div>
  )
}
```

## 模型配置

### ModelSchema

```typescript
interface ModelSchema {
  name: string                              // 模型名称
  title: string                             // 模型标题
  api: APIOptions                           // API 配置
  properties?: Record<string, Property>    // 属性定义
  listFields?: string[]                     // 列表字段
  defaultValue?: any | (() => any)          // 默认值
  permission?: {                            // 权限配置
    add?: boolean
    edit?: boolean
    delete?: boolean
  }
  events?: {                                // 事件处理
    onLoad?: () => void
    onSave?: (data: any) => void
    onDelete?: (id: string) => void
  }
  itemActions?: string[]                    // 项目操作
  fieldRender?: Record<string, any>         // 字段渲染器
  editableFields?: string[]                 // 可编辑字段
  partialSave?: boolean                     // 是否允许部分保存
  initQuery?: boolean                       // 是否初始化查询
}
```

### Property

```typescript
interface Property {
  type: string                              // 类型
  title: string                             // 标题
  header?: string                           // 表头
  canOrder?: boolean                        // 是否可排序
  orderField?: string                       // 排序字段
  [key: string]: any
}
```

## 状态管理

### 原子类型

模型使用 Jotai 原子管理状态，主要原子类型：

- `items` - 列表数据
- `count` - 总数
- `item(id)` - 单个项目数据
- `selected` - 已选项
- `allSelected` - 是否全选
- `itemSelected(id)` - 项目选中状态
- `wheres` - 查询条件
- `option` - 查询选项
- `loading(type)` - 加载状态
- `skip` - 跳过数量
- `limit` - 限制数量
- `fields` - 字段列表
- `itemOrder(field)` - 排序

### 使用原子

```typescript
import { useAtom, useAtomValue, useSetAtom } from 'jotai'
import { useModel } from '@airiot/client'

function MyComponent() {
  const { atoms } = useModel()

  // 获取值
  const items = useAtomValue(atoms.items)
  const count = useAtomValue(atoms.count)

  // 获取和设置值
  const [selected, setSelected] = useAtom(atoms.selected)

  // 只设置值
  const setLoading = useSetAtom(atoms.loading('items'))

  return <div>{items.length} items</div>
}
```

## 完整示例

### 用户管理页面

```typescript
import { Model, useModelList, useModelPagination, useModelPermission, useModelDelete } from '@airiot/client'
import { useAtomValue, useSetAtom } from 'jotai'

const userModel = {
  name: 'user',
  title: '用户',
  api: { name: 'core/user' },
  properties: {
    username: { type: 'string', title: '用户名' },
    email: { type: 'string', title: '邮箱' },
    role: { type: 'string', title: '角色' }
  },
  listFields: ['username', 'email', 'role'],
  permission: {
    add: true,
    edit: true,
    delete: true
  }
}

function UserTable() {
  const { loading, items } = useModelList()
  const { changePage } = useModelPagination()
  const { canAdd, canDelete } = useModelPermission()
  const { deleteItem } = useModelDelete()

  if (loading) return <Spinner />

  return (
    <div>
      {canAdd && <Button>新增用户</Button>}
      <table>
        <thead>
          <tr>
            <th>用户名</th>
            <th>邮箱</th>
            <th>角色</th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody>
          {items.map(item => (
            <tr key={item.id}>
              <td>{item.username}</td>
              <td>{item.email}</td>
              <td>{item.role}</td>
              <td>
                {canDelete && (
                  <button onClick={() => deleteItem(item.id)}>
                    删除
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <Pagination />
    </div>
  )
}

function UserManagement() {
  return (
    <Model model={userModel}>
      <UserTable />
    </Model>
  )
}
```

### 带筛选的列表

```typescript
import { Model, useModelList, useModel } from '@airiot/client'
import { useSetAtom } from 'jotai'

function FilteredList() {
  const { atoms } = useModel()
  const setWheres = useSetAtom(atoms.wheres)
  const setOption = useSetAtom(atoms.option)
  const { items, loading } = useModelList()

  const handleFilter = (filter) => {
    setWheres({ status: { $eq: filter.status } })
    setOption({ limit: 20 })
  }

  return (
    <div>
      <FilterForm onFilter={handleFilter} />
      {loading ? <Spinner /> : <Table data={items} />}
    </div>
  )
}
```

## Model Registry

模型注册中心（Model Registry）提供系统内置的 Airiot 模型，并支持动态注册自定义模型。

### 内置模型

库内置了 46 个 Airiot 系统模型，定义在 `src/model/models.json` 中，自动注册到 `modelRegistry`。

| 模型名称 | 中文名称 | API 资源路径 |
|---------|---------|-------------|
| Table | 数据表 | `core/t/schema` |
| Device | 单设备 | `core/t/schema` |
| systemvariable | 数据字典 | `core/systemVariable` |
| DriverInstance | 驱动管理 | `driver/driverInstance` |
| ProtocolProxy | 代理管理 | `driver/protocolProxy` |
| Instruct | 指令状态管理 | `driver/instruct` |
| DeviceArchive | 归档信息 | `driver/archivedlog` |
| NetworkGraph | 网络通信异常统计 | `core/t/record` |
| TaskManager | 后台任务管理 | `core/taskmanager` |
| DeviceEvent | 驱动事件信息 | `driver/event` |
| ArchiveEvent | 驱动事件归档信息 | `driver/archiveEvent` |
| System | 系统设置 | `setting` |
| backup | 备份与还原 | `core/backup` |
| dbBackup | 数据库备份 | `db-backup` |
| dbBackupFTP | 数据库备份 FTP | - |
| tsdbBackup | 历史数据备份 | `tsdb-backup` |
| tsdbBackupFTP | 历史数据备份 FTP | - |
| backupcycle | 周期备份 | `core/backupCycle` |
| Flow | 流程 | `flow/flow` |
| FlowTask | 我的任务 | `flow/flowTask/currentUser` |
| AllFlowTask | 任务管理 | `flow/flowTask` |
| FlowJob | 我发起的流程 | `engine/job` |
| JobInstance | 流程实例 | `engine/jobInstance` |
| ArchivedInstance | 流程实例归档 | `engine/archivedInstance` |
| Theme | 系统主题 | `core/theme` |
| Log | 操作日志 | `core/log` |
| Archivedlog | 日志归档信息 | `core/archivedlog` |
| Apipermission | 越权访问日志 | `core/apipermission` |
| SystemLog | 系统日志 | `syslog/log` |
| Dashboard | 画面 | `core/dashboard` |
| Site | 前台 | `core/site` |
| Warning | 告警管理 | - |
| Rule | 规则管理 | - |
| WarningArchive | 告警归档 | - |
| tRecord | 时序记录 | - |
| Report | 报表管理 | - |
| reportcopy | 报表复制 | - |
| algorithm | 算法管理 | - |
| OauthApp | OAuth 应用 | - |
| app | 应用管理 | - |
| Role | 角色管理 | - |
| User | 用户管理 | - |
| Licenseinfo | 许可证信息 | - |
| SafeZone | 安全区管理 | - |
| ExamineUser | 用户审批 | - |
| ExamineRole | 角色审批 | - |
| Datasource | 数据源管理 | - |
| Operation | 运算管理 | - |
| Service | 服务管理 | - |
| Dataset | 数据集管理 | - |
| DataView | 数据视图管理 | - |
| sync | 数据同步 | - |
| Media | 媒体管理 | - |
| Message | 消息管理 | - |
| Plan | 计划管理 | - |
| Review | 审查管理 | - |
| Playback | 回放管理 | - |
| warningPlayback | 告警回放 | - |
| warningCapture | 告警抓拍 | - |

### 使用内置模型

通过指定 `name` 属性使用内置模型：

```tsx
import { Model } from '@airiot/client'

function DeviceList() {
  return (
    <Model name="Device">
      <DeviceTable />
    </Model>
  )
}

function DeviceTable() {
  const { model } = useModel()
  const { items } = useModelList()
  
  return (
    <div>
      <h1>{model.title}</h1>
      <Table data={items} />
    </div>
  )
}
```

`Model` 组件会自动从 `modelRegistry` 中查找名为 `Device` 的模型定义。

### 注册自定义模型

可以动态注册自定义模型：

```tsx
import { modelRegistry } from '@airiot/client/model'

modelRegistry.registerModel('MyCustomModel', {
  name: 'myCustomModel',
  resource: 'api/custom',
  title: '我的自定义模型',
  properties: {
    id: { type: 'string', title: 'ID' },
    name: { type: 'string', title: '名称' },
    status: { type: 'string', title: '状态' }
  },
  listFields: ['id', 'name', 'status'],
  permission: { view: true, add: true, edit: true, delete: true },
  orders: { createTime: 'DESC' }
})

// 使用自定义模型
function CustomList() {
  return (
    <Model name="MyCustomModel">
      <CustomTable />
    </Model>
  )
}
```

### Model Registry API

`modelRegistry` 对象提供以下方法：

| 方法 | 说明 |
|-----|------|
| `getModels()` | 获取所有已注册的模型 |
| `getModel(name)` | 根据名称获取特定模型 |
| `registerModel(name, model)` | 注册新模型 |
| `getModelAtoms()` | 获取模型原子生成器 |
| `addModelAtoms(getAtoms)` | 添加模型原子生成器 |

### 模型配置结构

每个模型配置包含：

```typescript
interface ModelSchema {
  name: string                              // 模型名称
  resource: string                           // API 资源路径
  title: string                             // 显示标题
  icon?: string | ReactElement               // 图标标识或 React 元素
  properties?: Record<string, Property>       // 字段定义（JSON Schema 格式）
  listFields?: string[]                     // 列表显示字段
  form?: any[]                             // 表单字段配置
  permission?: {                            // CRUD 权限
    view?: boolean
    add?: boolean
    edit?: boolean
    delete?: boolean
  }
  rolePermission?: Array<{key: string, title: string}> // 角色权限
  orders?: Record<string, string>           // 默认排序
  filters?: any                            // 筛选配置
  components?: Record<string, any>           // 自定义组件
  events?: Record<string, Function>          // 事件处理器
  initialValues?: any | (() => any)        // 初始查询值
  defaultPageSize?: number                  // 默认每页数量
  partialSave?: boolean                     // 是否允许部分保存
  forceGetItem?: boolean                   // 是否强制获取单项
  [key: string]: any                       // 其他自定义配置
}
```