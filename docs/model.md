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
    <Model model={userModel}>
      <UserList />
    </Model>
  )
}
```

**Props：**

- `model` - 模型配置对象（必填）

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

### `hooks['model.get']()`

获取模型数据。

```typescript
import { hooks } from '@airiot/client'

function UserEdit({ userId }) {
  const { data, loading } = hooks['model.get']({ id: userId })

  if (loading) return <Spinner />
  return <UserForm initialValues={data} />
}
```

### `hooks['model.save']()`

保存模型数据。

```typescript
import { hooks } from '@airiot/client'

function UserForm({ initialValues }) {
  const { saveItem } = hooks['model.save']()

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

### `hooks['model.delete']()`

删除模型数据。

```typescript
import { hooks } from '@airiot/client'

function UserItem({ userId }) {
  const { deleteItem } = hooks['model.delete']()

  const handleDelete = async () => {
    await deleteItem(userId)
  }

  return <button onClick={handleDelete}>删除</button>
}
```

### `hooks['model.getItems']()`

获取数据列表。

```typescript
import { hooks } from '@airiot/client'

function UserList() {
  const { model } = useModel()
  const { getItems } = hooks['model.getItems']()
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

### `hooks['model.list']()`

获取列表数据（带自动刷新）。

```typescript
import { hooks } from '@airiot/client'

function UserTable() {
  const { loading, items, fields, selected } = hooks['model.list']()

  return (
    <div>
      {loading ? <Spinner /> : <Table data={items} columns={fields} />}
    </div>
  )
}
```

### `hooks['model.pagination']()`

分页功能。

```typescript
import { hooks } from '@airiot/client'

function Pagination() {
  const { items, activePage, changePage } = hooks['model.pagination']()

  return (
    <PaginationComponent
      total={items}
      current={activePage}
      onChange={changePage}
    />
  )
}
```

### `hooks['model.pagesize']()`

页面大小控制。

```typescript
import { hooks } from '@airiot/client'

function PageSizeControl() {
  const { sizes, setPageSize, size } = hooks['model.pagesize']()

  return (
    <Select value={size} onChange={setPageSize}>
      {sizes.map(s => <option key={s} value={s}>{s}</option>)}
    </Select>
  )
}
```

### `hooks['model.select']()`

选择功能。

```typescript
import { hooks } from '@airiot/client'

function SelectionTable() {
  const { count, selected, onSelect, onSelectAll } = hooks['model.select']()

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

### `hooks['model.query']()`

自定义查询。

```typescript
import { hooks } from '@airiot/client'

function CustomQuery() {
  const { items, loading, model } = hooks['model.query']()

  if (loading) return <Spinner />
  return <CustomList data={items} />
}
```

### `hooks['model.permission']()`

权限检查。

```typescript
import { hooks } from '@airiot/client'

function UserActions() {
  const { canAdd, canEdit, canDelete } = hooks['model.permission']()

  return (
    <div>
      {canAdd && <Button>新增</Button>}
      {canEdit && <Button>编辑</Button>}
      {canDelete && <Button>删除</Button>}
    </div>
  )
}
```

### `hooks['model.event']()`

事件处理。

```typescript
import { hooks } from '@airiot/client'

function EventExample() {
  const { onLoad, onSave, onDelete } = hooks['model.event']()

  useEffect(() => {
    if (onLoad) onLoad()
  }, [])

  const handleSave = async (data) => {
    if (onSave) await onSave(data)
  }

  return <Form onSubmit={handleSave} />
}
```

### `hooks['model.fields']()`

字段控制。

```typescript
import { hooks } from '@airiot/client'

function FieldControl() {
  const { fields, changeFieldDisplay, selected } = hooks['model.fields']()

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
import { Model, hooks, useModel } from '@airiot/client'
import { useAtomValue } from 'jotai'

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
  const { loading, items } = hooks['model.list']()
  const { changePage } = hooks['model.pagination']()
  const { canAdd, canDelete } = hooks['model.permission']()
  const { deleteItem } = hooks['model.delete']()

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
import { Model, hooks, useModel } from '@airiot/client'

function FilteredList() {
  const { atoms } = useModel()
  const setWheres = useSetAtom(atoms.wheres)
  const setOption = useSetAtom(atoms.option)
  const { items, loading } = hooks['model.list']()

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
