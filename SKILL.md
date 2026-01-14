# @airiot/client 库使用指南

本文档提供 AI Agent 使用 @airiot/client 库的完整指南。

## 库概述

@airiot/client 是一个为 React 应用提供完整功能的 TypeScript 客户端库，包括：

- **API 客户端** - RESTful API 封装
- **身份认证** - 登录/登出/用户管理
- **表单处理** - JSON Schema 表单构建和验证
- **模型管理** - 基于 Jotai 的状态管理
- **全局配置** - 应用级配置管理

## 核心依赖

```json
{
  "peerDependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-router": "^7.12.0",
    "react-router-dom": "^7.12.0",
    "jotai": "^2.7.0"
  }
}
```

## 模块详解

### 1. API 模块 (`src/api/`)

#### 核心函数：`createAPI`

创建 API 实例的工厂函数。

```typescript
import { createAPI } from '@airiot/client'

const api = createAPI({
  name: 'core/user',        // API 名称
  resource: 'user',         // 资源路径
  headers: {},              // 自定义请求头
  idProp: 'id',             // ID 字段名
  convertItem: (item) => ({ ...item, fullName: `${item.firstName} ${item.lastName}` }),
  queryParams: {},          // 默认查询参数
  projectAll: false,        // 是否返回所有字段
  projectFields: [],        // 要返回的字段列表
  customQuery: async (api, filter, wheres, convertItem) => { /* 自定义查询逻辑 */ },
  apiMessage: true,         // 是否显示 API 消息
  properties: {}            // 字段属性定义
})
```

#### API 实例方法

```typescript
// 查询数据
const { items, total } = await api.query(
  { skip: 0, limit: 10, order: { createdAt: 'DESC' } },  // 查询选项
  { status: { $eq: 'active' } },                          // where 条件
  true                                                     // 是否返回总数
)

// 获取单条数据
const user = await api.get('user123')

// 获取原始响应
const { json, headers } = await api.getOrigin('user123')

// 删除数据
await api.delete('user123')

// 保存数据（新建或更新）
const saved = await api.save({ username: 'john', email: 'john@example.com' })
const updated = await api.save({ id: 'user123', username: 'John' }, true) // true = partial update

// 计数
const count = await api.count({ status: 'active' })

// 原始 fetch 请求
const { json, headers } = await api.fetch('/custom-endpoint', {
  method: 'POST',
  body: JSON.stringify({ data: 'value' }),
  headers: { 'Custom-Header': 'value' }
})
```

#### 查询选项 (QueryOptions)

```typescript
interface QueryOptions {
  order?: { [field: string]: 'ASC' | 'DESC' }  // 排序
  skip?: number                                 // 跳过数量
  limit?: number                                // 限制数量
  groupBy?: string                              // 分组字段
  fields?: string[]                             // 返回字段
  [key: string]: any
}
```

#### Where 条件操作符

```typescript
// 比较
{ age: { $gte: 18, $lte: 65 } }
{ price: { $gt: 100 } }

// 逻辑
{ $and: [{ status: 'active' }, { age: { $gte: 18 } }] }
{ $or: [{ type: 'A' }, { type: 'B' }] }

// 包含
{ tags: { $in: ['tag1', 'tag2'] } }
{ category: { $nin: ['archived'] } }

// 正则
{ name: { $regex: '^John' } }

# 空/非空
{ deletedAt: { $ne: null } }
```

### 2. 认证模块 (`src/auth/`)

#### useUser Hook

```typescript
import { useUser } from '@airiot/client'

function UserProfile() {
  const { user, setUser, storageKey, loadUser } = useUser()

  // user - 当前用户对象
  // setUser - 设置用户信息
  // storageKey - localStorage 键名
  // loadUser - 从 localStorage 加载用户信息（7天有效期）

  useEffect(() => {
    loadUser() // 应用启动时加载用户
  }, [])

  return <div>Welcome, {user?.username}</div>
}
```

#### useLogin Hook

```typescript
import { useLogin } from '@airiot/client'

function LoginForm() {
  const { showCode, resetVerifyCode, onLogin } = useLogin()

  const handleLogin = async (values) => {
    try {
      const result = await onLogin({
        username: values.username,
        password: values.password,       // 会自动 SHA1 加密
        verifyCode: values.verifyCode,   // 当 showCode=true 时需要
        remember: values.remember        // true=localStorage, false=sessionStorage
      })
      // result: { needChangePwd, password, id, username }
      console.log('Login success:', result)
    } catch (error) {
      // error.json 包含表单验证错误
      // error.status: 400=验证失败, 451=需要验证码
      console.error('Login failed:', error)
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <input name="username" />
      <input name="password" type="password" />
      {showCode && <input name="verifyCode" />}
      <label><input name="remember" type="checkbox" />记住我</label>
    </form>
  )
}
```

#### useLogout Hook

```typescript
import { useLogout } from '@airiot/client'

function LogoutButton() {
  const { onLogout } = useLogout()

  const handleLogout = () => {
    onLogout() // 会清除 localStorage/sessionStorage 中的用户信息
  }

  return <button onClick={handleLogout}>登出</button>
}
```

#### useUserReg Hook

```typescript
import { useUserReg } from '@airiot/client'

function RegisterForm() {
  const { onUserReg } = useUserReg()

  const handleRegister = async (values) => {
    try {
      await onUserReg(values)
      // 密码会自动 SHA1 加密
      // 成功后会自动跳转到登录页
    } catch (error) {
      console.error('Registration failed:', error)
    }
  }

  return <form onSubmit={handleRegister}>...</form>
}
```

### 3. 表单模块 (`src/form/`)

#### SchemaForm 组件

基于 JSON Schema 的表单组件，自动处理验证。

```typescript
import { SchemaForm } from '@airiot/client'

const userSchema = {
  type: 'object',
  properties: {
    username: {
      type: 'string',
      title: '用户名',
      minLength: 3,
      maxLength: 20
    },
    email: {
      type: 'string',
      title: '邮箱',
      format: 'email'
    },
    age: {
      type: 'integer',
      title: '年龄',
      minimum: 0,
      maximum: 120
    },
    status: {
      type: 'string',
      title: '状态',
      enum: ['active', 'inactive', 'pending'],
      enumNames: ['激活', '未激活', '待定']
    }
  },
  required: ['username', 'email']
}

function UserForm() {
  const handleSubmit = async (values, form) => {
    console.log('Form values:', values)
    // values 已经验证通过
  }

  return (
    <SchemaForm
      schema={userSchema}
      onSubmit={handleSubmit}
      initialValues={{ status: 'active' }}
      validate={(values) => {
        // 自定义验证
        const errors = {}
        if (values.password !== values.confirmPassword) {
          errors.confirmPassword = '密码不一致'
        }
        return errors
      }}
    />
  )
}
```

#### Form 组件

通用表单组件，需要手动定义字段。

```typescript
import { Form } from '@airiot/client'

const userFormFields = [
  { name: 'username', label: '用户名', type: 'text', required: true },
  { name: 'email', label: '邮箱', type: 'text', required: true },
  { name: 'age', label: '年龄', type: 'number' }
]

function MyForm() {
  return (
    <Form
      fields={userFormFields}
      onSubmit={handleSubmit}
      initialValues={{}}
      group={FieldGroup}  // 自定义字段分组组件
    >
      {({ children, invalid, handleSubmit, submitting }) => (
        <form onSubmit={handleSubmit}>
          {children}
          <button type="submit" disabled={invalid || submitting}>
            保存
          </button>
        </form>
      )}
    </Form>
  )
}
```

#### 自定义字段渲染器

```typescript
import { setFormFields } from '@airiot/client'

// 全局注册自定义字段组件
setFormFields({
  text: {
    component: CustomInput,
    parse: (value) => value === '' ? null : value,
    attrs: { className: 'custom-input' }
  },
  number: {
    component: CustomNumberInput,
    parse: (value) => value === '' ? null : parseFloat(value),
    attrs: { type: 'number', style: { maxWidth: 200 } }
  },
  select: {
    component: CustomSelect,
    parse: (value) => value
  }
})
```

#### 自定义 Schema 转换器

```typescript
import { setSchemaConverters } from '@airiot/client'

setSchemaConverters([
  // 自定义转换器会按顺序执行
  (field, schema, options) => {
    if (schema.custom) {
      field.type = 'custom-component'
      field.customProp = schema.customValue
    }
    return field
  }
])
```

#### FieldArray

动态数组字段组件。

```typescript
import { SchemaForm, FieldArray } from '@airiot/client'

const schema = {
  type: 'object',
  properties: {
    items: {
      type: 'array',
      title: '项目列表',
      items: {
        type: 'object',
        properties: {
          name: { type: 'string', title: '名称' },
          price: { type: 'number', title: '价格' }
        }
      }
    }
  }
}

function DynamicForm() {
  return (
    <SchemaForm schema={schema} onSubmit={handleSubmit}>
      {({ form }) => (
        <FieldArray name="items">
          {({ fields }) => (
            <div>
              {fields.map((field, index) => (
                <div key={field.key}>
                  <input name={`items.${index}.name`} />
                  <input name={`items.${index}.price`} type="number" />
                  <button onClick={() => fields.remove(index)}>删除</button>
                </div>
              ))}
              <button onClick={() => fields.push({})}>添加项目</button>
            </div>
          )}
        </FieldArray>
      )}
    </SchemaForm>
  )
}
```

### 4. 模型模块 (`src/model/`)

#### Model 组件

模型上下文提供者，管理数据和状态。

```typescript
import { Model } from '@airiot/client'

const userModel = {
  name: 'user',
  title: '用户',
  key: 'user-list',
  permission: {
    view: true,
    add: true,
    edit: true,
    delete: true
  },
  defaultValue: () => ({ status: 'active' }),
  initialValues: {
    option: { skip: 0, limit: 15 }
  },
  listFields: ['username', 'email', 'status'],
  defaultOrder: { createdAt: 'DESC' },
  defaultPageSize: 15,
  properties: {
    username: { type: 'string', title: '用户名' },
    email: { type: 'string', title: '邮箱' },
    status: { type: 'string', title: '状态' }
  },
  atoms: modelAtoms  // 可选的自定义 atoms
}

function UserApp() {
  return (
    <Model name="user" modelKey="user-list" initialValues={initialValues}>
      <UserList />
    </Model>
  )
}
```

#### 核心 Model Hooks

```typescript
// 基础 hooks
import {
  useModel,              // 获取模型上下文
  useModelValue,         // 读取 atom 值
  useModelState,         // 读写 atom 值
  useSetModelState,      // 写 atom 值
  useModelCallback       // atom 回调
} from '@airiot/client'

// 数据操作 hooks
import {
  useModelGet,           // 获取单条数据
  useModelSave,          // 保存数据
  useModelDelete,        // 删除数据
  useModelGetItems,      // 获取列表数据
  useModelItem           // 组合 hook (get + save + delete)
} from '@airiot/client'

// UI hooks
import {
  useModelList,          // 列表数据
  useModelPagination,    // 分页
  useModelPageSize,      // 每页数量
  useModelFields,        // 字段显示
  useModelSelect         // 选择功能
} from '@airiot/client'
```

#### Hook 使用示例

```typescript
// 1. useModelList - 列表数据
function UserList() {
  const { items, loading, fields, selected } = useModelList()
  return <Table data={items} columns={fields} />
}

// 2. useModelPagination - 分页
function Pagination() {
  const { items, activePage, changePage } = useModelPagination()
  return (
    <Pagination>
      <PaginationContent>
        {Array.from({ length: items }).map((_, i) => (
          <PaginationItem key={i} active={activePage === i + 1}>
            <PaginationLink onClick={() => changePage(i + 1)}>
              {i + 1}
            </PaginationLink>
          </PaginationItem>
        ))}
      </PaginationContent>
    </Pagination>
  )
}

// 3. useModelGet + useModelSave - 获取和保存
function UserEdit({ id }) {
  const { model, title, data, loading } = useModelGet({ id })
  const { saveItem } = useModelSave()

  const handleSubmit = async (values) => {
    await saveItem(values)
    // 保存后会自动更新列表和选中项
  }

  if (loading) return <Spinner />
  return <UserForm data={data} title={title} onSubmit={handleSubmit} />
}

// 4. useModelDelete - 删除
function UserDeleteButton({ id }) {
  const { deleteItem } = useModelDelete({ id })

  const handleDelete = async () => {
    if (confirm('确定删除？')) {
      await deleteItem(id)
      // 删除后会自动刷新列表
    }
  }

  return <button onClick={handleDelete}>删除</button>
}
```

#### Model Atoms 类型

```typescript
interface ModelAtoms {
  ids: Atom<string[]>                          // 所有数据 ID
  item: (id: string) => Atom<any>             // 单条数据 atom
  items: Atom<any[]>                           // 数据列表 atom
  count: Atom<number>                          // 总数 atom
  selected: Atom<any[]>                        // 选中的数据
  option: Atom<any>                            // 查询选项
  optionSelector: (key: string) => Atom<any>  // 选项选择器
  fields: Atom<string[]>                       // 显示字段
  order: Atom<any>                             // 排序
  limit: Atom<number>                          // 每页数量
  skip: Atom<number>                           // 跳过数量
  wheres: Atom<any>                            // where 条件
  where: (id: string) => Atom<any>             // 单个 where 条件
  loading: (key: string) => Atom<boolean>      // 加载状态
  itemSelected: (id: string) => Atom<boolean> // 单项选中状态
  allSelected: Atom<boolean>                   // 全选状态
  itemOrder: (field: string) => Atom<string>  // 字段排序
}
```

### 5. 配置模块 (`src/config/`, `src/hooks/`)

```typescript
import { getConfig, setConfig } from '@airiot/client'
import { getSettings, useMessage } from '@airiot/client'

// 设置全局配置
setConfig({
  user: { token: 'xxx', id: 'user123' },
  language: 'zh-CN',
  rest: 'http://api.example.com/',
  projectId: 'project-123',
  toast: {
    info: (msg) => toast.info(msg),
    success: (msg) => toast.success(msg),
    error: (msg) => toast.error(msg),
    warning: (msg) => toast.warning(msg)
  }
})

// 获取配置
const config = getConfig()

// 获取服务器设置
const settings = await getSettings()

// 使用消息提示
function MyComponent() {
  const message = useMessage()
  message.info('信息')
  message.success('成功')
  message.error('错误')
  message.warning('警告')
}
```

## 常见使用模式

### 模式 1: CRUD 完整流程

```typescript
import {
  Model,
  useModelList,
  useModelGet,
  useModelSave,
  useModelDelete,
  useModelPagination
} from '@airiot/client'

// 1. 定义模型
const userModel = {
  name: 'user',
  title: '用户',
  properties: {
    username: { type: 'string', title: '用户名' },
    email: { type: 'string', title: '邮箱' }
  }
}

// 2. 创建应用
function UserApp() {
  return (
    <Model name="user">
      <UserList />
    </Model>
  )
}

// 3. 列表页面
function UserList() {
  const { items, loading } = useModelList()
  const { items: pageCount, activePage, changePage } = useModelPagination()

  return (
    <div>
      <Table data={items} loading={loading} />
      <Pagination items={pageCount} activePage={activePage} onChange={changePage} />
    </div>
  )
}

// 4. 新建/编辑页面
function UserFormPage({ id }) {
  const { model, data, loading } = useModelGet({ id })
  const { saveItem } = useModelSave()

  if (loading) return <Spinner />

  return (
    <Form
      initialValues={data}
      onSubmit={async (values) => {
        await saveItem(values)
        navigate('/users')
      }}
    />
  )
}

// 5. 删除操作
function DeleteButton({ id }) {
  const { deleteItem } = useModelDelete({ id })

  return (
    <button onClick={async () => {
      if (confirm('确定删除？')) {
        await deleteItem()
      }
    }}>
      删除
    </button>
  )
}
```

### 模式 2: 表单验证

```typescript
import { SchemaForm, setSchemaConverters } from '@airiot/client'

// 自定义验证规则
setSchemaConverters([
  (field, schema) => {
    // 添加自定义验证
    if (schema.unique) {
      field.validate = async (value, allValues) => {
        const exists = await checkUnique(field.name, value)
        return exists ? '该值已存在' : undefined
      }
    }
    return field
  }
])

// 使用 SchemaForm
function MyForm() {
  const schema = {
    type: 'object',
    properties: {
      email: {
        type: 'string',
        format: 'email',
        title: '邮箱',
        unique: true  // 自定义属性
      }
    },
    required: ['email']
  }

  return (
    <SchemaForm
      schema={schema}
      onSubmit={handleSubmit}
      validate={(values) => {
        // 额外的跨字段验证
        const errors = {}
        if (values.password !== values.confirmPassword) {
          errors.confirmPassword = '密码不一致'
        }
        return errors
      }}
    />
  )
}
```

### 模式 3: 带认证的请求

```typescript
import { createAPI, useUser, getConfig } from '@airiot/client'

// API 会自动从 config 中获取 token
const api = createAPI({
  name: 'core/user',
  resource: 'user'
})

function UserProfile() {
  const { user, loadUser } = useUser()

  useEffect(() => {
    loadUser() // 加载已登录用户
  }, [])

  const fetchProfile = async () => {
    // 请求会自动带上 Authorization header
    const data = await api.get(user.id)
    return data
  }

  return <div>{user?.username}</div>
}
```

## 最佳实践

### 1. 类型定义

```typescript
import type { ModelSchema, FormField } from '@airiot/client'

interface User {
  id: string
  username: string
  email: string
  createdAt: string
}

const userModel: ModelSchema = {
  name: 'user',
  properties: {
    username: { type: 'string', title: '用户名' },
    email: { type: 'string', title: '邮箱' }
  }
}
```

### 2. 错误处理

```typescript
async function handleSubmit(values) {
  try {
    await api.save(values)
    message.success('保存成功')
  } catch (error) {
    // API 错误包含 json 和 status
    if (error.json) {
      // 表单验证错误
      console.error('Validation error:', error.json)
    } else if (error.status) {
      // HTTP 错误
      message.error(`请求失败: ${error.status}`)
    } else {
      // 其他错误
      message.error('未知错误')
    }
  }
}
```

### 3. 加载状态

```typescript
function DataLoader() {
  const { loading } = useModelList()
  const { loading: saving } = useModelSave()

  return (
    <div>
      {loading && <Spinner />}
      <button disabled={saving}>
        {saving ? '保存中...' : '保存'}
      </button>
    </div>
  )
}
```

### 4. 自定义字段组件

```typescript
import { setFormFields } from '@airiot/client'

setFormFields({
  custom: {
    component: ({ input, meta, field }) => (
      <div>
        <label>{field.label}</label>
        <input {...input} />
        {meta.touched && meta.error && <span>{meta.error}</span>}
      </div>
    ),
    parse: (value) => value,
    attrs: { className: 'custom-field' }
  }
})
```

## 注意事项

### AJV 验证配置

AJV 配置了 `strictSchema: false`，允许使用自定义属性：

```typescript
// 在 schema 中可以添加自定义属性
const schema = {
  type: 'object',
  properties: {
    customField: {
      type: 'string',
      title: '自定义字段',
      field: { customProp: 'value' },  // 自定义属性
      formRender: 'custom'             // 自定义渲染器
    }
  }
}
```

### Token 处理

```typescript
// Token 自动从 config.user.token 获取
setConfig({
  user: { token: 'your-token-here' }
})

// 某些资源不需要 token（配置在 noToken 列表中）
// 这些资源不会携带 Authorization header
```

### 数据转换

```typescript
const api = createAPI({
  convertItem: (item) => ({
    ...item,
    // 处理 _id 到 id 的转换
    id: item._id || item.id,
    // 自定义字段转换
    fullName: `${item.firstName} ${item.lastName}`
  })
})
```

### 日期时间格式

```typescript
// 库使用 dayjs 处理日期
// datetime 格式: YYYY-MM-DD HH:mm:ss
// date 格式: YYYY-MM-DD
// time 格式: HH:mm:ss

const schema = {
  properties: {
    createdAt: {
      type: 'string',
      format: 'datetime',  // 使用自定义 datetime 格式验证
      title: '创建时间'
    }
  }
}
```

## 环境配置

### Vite 环境变量

```bash
# .env.local
AIRIOT_API_TARGET=http://localhost:8080/
AIRIOT_API_PORT=3000
```

### Vite 配置

```typescript
// vite.config.ts
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')

  return {
    server: env.AIRIOT_API_TARGET ? {
      port: env.AIRIOT_API_PORT || 3000,
      proxy: {
        '/rest': {
          target: env.AIRIOT_API_TARGET,
          changeOrigin: true,
          secure: false
        }
      }
    } : undefined
  }
})
```

## 完整示例项目结构

```
src/
├── models/
│   └── user.ts          # 用户模型定义
├── components/
│   ├── UserList.tsx     # 用户列表
│   ├── UserForm.tsx     # 用户表单
│   └── UserEdit.tsx     # 用户编辑
├── pages/
│   ├── LoginPage.tsx    # 登录页
│   └── UsersPage.tsx    # 用户列表页
├── App.tsx              # 应用入口
└── main.tsx             # 主入口
```

## 调试技巧

### 开启详细日志

```typescript
// 在开发环境启用详细日志
if (import.meta.env.DEV) {
  console.log('Model context:', context)
  console.log('API options:', api.model)
}
```

### 检查 API 响应

```typescript
const api = createAPI({ name: 'core/user' })

api.fetch('', {}).then(({ json, headers }) => {
  console.log('Response:', json)
  console.log('Headers:', headers)
  console.log('Count:', headers['count'])
})
```

### 验证表单数据

```typescript
const { fields } = schemaConvert(schema)
console.log('Converted fields:', fields)

// 在 SchemaForm 中添加日志
<SchemaForm
  schema={schema}
  onSubmit={(values) => {
    console.log('Form values:', values)
  }}
/>
```

## 常见问题

### Q: 如何处理文件上传？

A: 使用原生 fetch 或 FormData：

```typescript
const api = createAPI({ name: 'core/file' })

const uploadFile = async (file: File) => {
  const formData = new FormData()
  formData.append('file', file)

  return api.fetch('/upload', {
    method: 'POST',
    body: formData,
    headers: {}  // 不要设置 Content-Type，让浏览器自动设置
  })
}
```

### Q: 如何实现无限滚动？

A: 结合 useModelGetItems 和 useModelState：

```typescript
function InfiniteList() {
  const { getItems } = useModelGetItems()
  const [skip, setSkip] = useModelState('skip')
  const limit = useModelValue('limit')
  const items = useModelValue('items')

  const loadMore = async () => {
    await getItems({ skip: skip + limit })
    setSkip(skip + limit)
  }

  return (
    <InfiniteScroll loadMore={loadMore}>
      {items.map(item => <UserCard key={item.id} data={item} />)}
    </InfiniteScroll>
  )
}
```

### Q: 如何自定义验证消息？

A: 使用 validationMessage 属性：

```typescript
const schema = {
  properties: {
    username: {
      type: 'string',
      minLength: 3,
      maxLength: 20,
      validationMessage: {
        minLength: '用户名至少 3 个字符',
        maxLength: '用户名最多 20 个字符'
      }
    }
  }
}
```

## 相关资源

- [完整文档](./docs/)
- [API 参考](./docs/api.md)
- [认证指南](./docs/auth.md)
- [表单指南](./docs/form.md)
- [模型指南](./docs/model.md)
