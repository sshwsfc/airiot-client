# AIRIOT 平台 Skill 文档

本文档为 AI Agent 提供完整的 AIRIOT 平台开发指南，涵盖项目初始化、开发规范和客户端使用三个核心部分。

---

## 第一部分：AIRIOT 项目初始化与安装

### 1.1 项目创建命令

基于 shadcn/ui 框架的 AIRIOT 项目初始化命令如下：

```bash
npx shadcn@latest create --preset "radix-mira" --template vite airiot-project
```

**核心配置参数：**
- `--preset "radix-mira"`：使用 Radix Mira 设计风格的预设配置
- `--template vite`：基于 Vite 构建工具的模板
- `airiot-project`：项目名称（可根据实际需求修改）

### 1.2 核心依赖与服务

#### 1.2.1 安装与配置 AIRIOT MCP 服务

AIRIOT MCP (Model-Context-Protocol) 服务是项目与 AIRIOT 平台通信的核心后端组件，遵循模型-控制器-提供者（MCP）架构，负责所有平台接口的调用。

**启动 MCP 服务：**

```bash
npx @airiot/mcp-server
```

**环境变量配置：**

MCP 服务启动时需配置以下环境变量。如果未配置，系统会提示用户填写：

```bash
# AIRIOT 服务器配置
AIRIOT_BASE_URL=https://your-airiot-server.com
AIRIOT_PROJECT_ID=your-project-id

# 认证配置（二选一）
AIRIOT_TOKEN=your-api-token
# 或者使用用户名密码认证
# AIRIOT_USERNAME=your-username
# AIRIOT_PASSWORD=your-password
```

**配置说明：**
- **AIRIOT_BASE_URL**：AIRIOT 平台服务器地址
- **AIRIOT_PROJECT_ID**：项目唯一标识符
- **认证方式二选一**：
  - 使用 `AIRIOT_TOKEN` 进行 API 令牌认证
  - 或使用 `AIRIOT_USERNAME` 和 `AIRIOT_PASSWORD` 进行用户名密码认证

**MCP Server 安装到 AI Agent：**

请根据以上 MCP 运行信息安装到自己的 AI Agent MCP server 配置中。

#### 1.2.2 安装 AIRIOT Client SDK

在项目中安装 AIRIOT 客户端工具包，为前端代码提供类型安全、封装良好的平台功能调用方法：

```bash
npm i -s @airiot/client@latest
```

---

## 第二部分：AIRIOT 项目结构与开发规范

### 2.1 源码目录结构

项目所有源代码均位于 **`src`** 目录下，其结构严格遵守以下约定：

| 目录路径 | 用途与文件类型说明 |
| :--- | :--- |
| `src/pages/` | 存放所有**页面级**组件与路由文件 |
| `src/blocks/` | 存放**区块级**可复用组件（大型功能模块） |
| `src/components/` | 存放**业务级**通用组件 |
| `src/components/ui/` | 存放**基础 UI 组件**（基于 shadcn/ui 的组件及业务无关的纯展示组件） |
| 其他目录 | 与 **shadcn/ui** 项目的标准目录结构保持一致 |

### 2.2 开发规范

#### 2.2.1 组件命名规范

- **页面组件**：使用 PascalCase，文件名与组件名一致，例如：`UserManagementPage.tsx`
- **区块组件**：使用 PascalCase，例如：`DataTable.tsx`
- **业务组件**：使用 PascalCase，例如：`UserCard.tsx`
- **UI 组件**：使用 kebab-case，例如：`button.tsx`、`input.tsx`

#### 2.2.2 文件组织规范

- **按功能模块组织**：相关组件放在同一目录下
- **共享组件提升**：多处使用的组件应放在 `components/` 目录
- **UI 组件隔离**：纯展示组件放在 `components/ui/` 目录

#### 2.2.3 代码风格规范

- **使用 TypeScript**：所有组件和工具函数必须使用 TypeScript
- **函数式组件**：优先使用函数式组件和 Hooks
- **Props 类型定义**：使用 interface 或 type 定义 Props
- **导入顺序**：第三方库 → 项目内部模块 → 类型导入 → 相对路径导入

---

## 第三部分：AIRIOT 客户端使用指南

> **编写说明**：本部分所有内容，包括 API 说明、代码示例、配置参数等，均严格依据项目 **`docs`** 目录下的官方技术文档编写，确保信息的权威性、准确性和时效性。

### 3.1 核心模块概览

`@airiot/client` 提供以下核心模块：

| 模块 | 功能描述 | 主要 API |
|------|---------|----------|
| **API 模块** | RESTful API 客户端 | `createAPI`, `query`, `get`, `save`, `delete` |
| **认证模块** | 用户认证和会话管理 | `useLogin`, `useLogout`, `useUser`, `useUserReg` |
| **表单模块** | JSON Schema 动态表单 | `SchemaForm`, `Form`, `FieldArray`, `useForm` |
| **模型模块** | 基于 Jotai 的状态管理 | `Model`, `TableModel`, `useModelList`, `useModelGet` |
| **Page Hooks** | 页面级状态管理 | `usePageVar`, `useDatasourceValue`, `useDataVarValue` |
| **数据订阅** | WebSocket 实时数据订阅 | `Subscribe`, `useDataTag`, `useTableData` |
| **配置模块** | 全局配置管理 | `setConfig`, `getConfig`, `getSettings` |

---

### 3.2 API 模块

#### 3.2.1 创建 API 实例

使用 `createAPI` 创建 API 客户端实例：

```typescript
import { createAPI } from '@airiot/client'

const userApi = createAPI({
  name: 'core/user',           // API 名称
  resource: 'user',            // 资源路径
  headers: {},                 // 自定义请求头
  idProp: 'id',                // ID 字段名
  convertItem: (item) => ({    // 数据转换函数
    ...item,
    fullName: `${item.firstName} ${item.lastName}`
  })
})
```

#### 3.2.2 查询数据

```typescript
// 分页查询
const { items, total } = await userApi.query(
  { skip: 0, limit: 10 },                    // 查询选项
  { status: { $eq: 'active' } }              // Where 条件
)

// 排序查询
const { items } = await userApi.query({
  skip: 0,
  limit: 20,
  order: { createdAt: 'DESC' }              // 按创建时间降序
})

// 自定义查询
const { items } = await userApi.query(
  { skip: 0, limit: 10 },
  null,                                     // 不使用 where 条件
  true,                                     // 返回总数
  (api) => api.fetch('/custom/endpoint')   // 自定义查询
)
```

#### 3.2.3 CRUD 操作

```typescript
// 获取单条数据
const user = await userApi.get('user123')

// 创建数据
const newUser = await userApi.save({
  name: 'John Doe',
  email: 'john@example.com'
})

// 更新数据
const updatedUser = await userApi.save('user123', {
  name: 'Jane Doe'
})

// 删除数据
await userApi.delete('user123')

// 批量删除
await userApi.delete(['id1', 'id2', 'id3'])

// 统计数量
const count = await userApi.count({ status: { $eq: 'active' } })
```

---

### 3.3 认证模块

#### 3.3.1 用户登录

```typescript
import { useLogin } from '@airiot/client'

function LoginForm() {
  const { onLogin, loading, error } = useLogin()

  const handleLogin = async () => {
    try {
      await onLogin({
        username: 'admin',
        password: 'password123',
        remember: true                    // 记住我
      })
      console.log('登录成功')
    } catch (err) {
      console.error('登录失败:', err)
    }
  }

  return <button onClick={handleLogin} disabled={loading}>
    {loading ? '登录中...' : '登录'}
  </button>
}
```

#### 3.3.2 获取用户信息

```typescript
import { useUser } from '@airiot/client'

function UserProfile() {
  const { user, loading, loadUser, logout } = useUser()

  useEffect(() => {
    loadUser()  // 从 localStorage 加载用户信息
  }, [])

  if (loading) return <div>加载中...</div>

  return (
    <div>
      <p>用户名: {user?.username}</p>
      <p>邮箱: {user?.email}</p>
      <button onClick={logout}>退出登录</button>
    </div>
  )
}
```

#### 3.3.3 用户注册

```typescript
import { useUserReg } from '@airiot/client'

function RegisterForm() {
  const { onReg, loading } = useUserReg()

  const handleRegister = async () => {
    await onReg({
      username: 'newuser',
      password: 'password123',
      email: 'newuser@example.com'
    })
  }

  return <button onClick={handleRegister}>注册</button>
}
```

---

### 3.4 表单模块

#### 3.4.1 SchemaForm 组件

使用 JSON Schema 定义表单：

```typescript
import { SchemaForm } from '@airiot/client'

const userSchema = {
  type: 'object',
  properties: {
    name: {
      type: 'string',
      title: '姓名'
    },
    email: {
      type: 'string',
      title: '邮箱',
      format: 'email'
    },
    age: {
      type: 'number',
      title: '年龄',
      minimum: 0,
      maximum: 150
    }
  },
  required: ['name', 'email']
}

function UserForm() {
  const handleSubmit = (data: any) => {
    console.log('表单数据:', data)
  }

  return (
    <SchemaForm
      schema={userSchema}
      onSubmit={handleSubmit}
    />
  )
}
```

#### 3.4.2 自定义字段渲染器

```typescript
import { setFormFields } from '@airiot/client'
import { CustomInput } from './CustomInput'

// 注册自定义字段
setFormFields({
  custom: CustomInput
})

// 在 Schema 中使用
const schema = {
  type: 'object',
  properties: {
    customField: {
      type: 'custom',      // 使用自定义字段
      title: '自定义字段'
    }
  }
}
```

#### 3.4.3 数组字段

```typescript
import { FieldArray } from '@airiot/client'

function PhoneNumbersForm() {
  return (
    <FieldArray
      name="phoneNumbers"
      schema={{
        type: 'object',
        properties: {
          type: { type: 'string', enum: ['home', 'work', 'mobile'] },
          number: { type: 'string', title: '号码' }
        }
      }}
    />
  )
}
```

---

### 3.5 模型模块

#### 3.5.1 Model 组件

使用 Model 组件管理状态：

```typescript
import { Model } from '@airiot/client'

const userModel = {
  name: 'user',
  state: {
    list: [],
    selected: null
  },
  operations: {
    query: async () => {
      const { items } = await userApi.query({ skip: 0, limit: 100 })
      return items
    }
  }
}

function UserList() {
  const { list, query } = useModel()

  useEffect(() => {
    query()
  }, [])

  return (
    <ul>
      {list.map(user => (
        <li key={user.id}>{user.name}</li>
      ))}
    </ul>
  )
}

function App() {
  return (
    <Model model={userModel}>
      <UserList />
    </Model>
  )
}
```

#### 3.5.2 TableModel 组件

动态表模型，从服务器获取表结构：

```typescript
import { TableModel } from '@airiot/client'

function DynamicTable() {
  return (
    <TableModel
      tableId="device-table"
      loadingComponent={<div>加载中...</div>}
    >
      <DataGrid />
    </TableModel>
  )
}
```

#### 3.5.3 Model Hooks

```typescript
import {
  useModelList,
  useModelGet,
  useModelSave,
  useModelDelete,
  useModelCount
} from '@airiot/client'

function UserManagement() {
  // 获取列表数据
  const { items, loading, query } = useModelList()

  // 获取单条数据
  const { data, get } = useModelGet()

  // 保存数据
  const { save, saving } = useModelSave()

  // 删除数据
  const { remove } = useModelDelete()

  // 统计数量
  const { count } = useModelCount()

  return <div>...</div>
}
```

---

### 3.6 Page Hooks

#### 3.6.1 页面变量管理

```typescript
import {
  usePageVar,
  usePageVarValue,
  useSetPageVar
} from '@airiot/client'

function SettingsPage() {
  const [theme, setTheme] = usePageVar('theme')
  const language = usePageVarValue('language')

  return (
    <div>
      <p>当前主题: {theme}</p>
      <p>当前语言: {language}</p>
      <button onClick={() => setTheme('dark')}>
        切换深色主题
      </button>
    </div>
  )
}
```

#### 3.6.2 数据源管理

```typescript
import { useDatasourceValue, useDatasetSet } from '@airiot/client'

function DataView() {
  const users = useDatasourceValue('users')
  const setDataset = useDatasetSet('users')

  useEffect(() => {
    // 加载数据
    fetchUsers().then(data => setDataset(data))
  }, [])

  return (
    <ul>
      {users?.map(user => (
        <li key={user.id}>{user.name}</li>
      ))}
    </ul>
  )
}
```

#### 3.6.3 组件上下文

```typescript
import { useDataVarValue, useSetDataVar } from '@airiot/client'

function ComponentWrapper({ children }) {
  const setData = useSetDataVar('chart1')

  useEffect(() => {
    setData({ status: 'ready', data: [] })
  }, [])

  return <Page>{children}</Page>
}

function Chart() {
  const data = useDataVarValue('chart1')
  return <div>{JSON.stringify(data)}</div>
}
```

---

### 3.7 数据订阅模块

#### 3.7.1 Subscribe Provider

在应用根部包裹 Provider：

```typescript
import { Subscribe } from '@airiot/client'

function App() {
  return (
    <Subscribe>
      <YourComponents />
    </Subscribe>
  )
}
```

#### 3.7.2 自动订阅数据点

```typescript
import { useDataTag } from '@airiot/client'

function DeviceMonitor() {
  const temperature = useDataTag({
    tableId: 'device-table',
    dataId: 'device-001',
    tagId: 'temperature'
  })

  return (
    <div>
      <p>温度: {temperature?.value}°C</p>
      <p>状态: {temperature?.timeoutState?.isOffline ? '离线' : '在线'}</p>
    </div>
  )
}
```

#### 3.7.3 手动订阅管理

```typescript
import { useSubscribeContext, useDataTagValue } from '@airiot/client'

function CustomMonitor() {
  const { subscribeTags } = useSubscribeContext()
  const temperature = useDataTagValue({
    tableId: 'device-table',
    dataId: 'device-001',
    tagId: 'temperature'
  })

  useEffect(() => {
    // 手动订阅
    subscribeTags([
      { tableId: 'device-table', dataId: 'device-001', tagId: 'temperature' }
    ], true)  // true = 清除之前的订阅
  }, [subscribeTags])

  return <div>温度: {temperature?.value}°C</div>
}
```

#### 3.7.4 订阅表数据

```typescript
import { useTableData } from '@airiot/client'

function DeviceInfo() {
  const name = useTableData({
    field: 'name',
    dataId: 'device-001',
    tableId: 'device-table'
  })

  return <div>设备名称: {name}</div>
}
```

---

### 3.8 配置模块

#### 3.8.1 全局配置

```typescript
import { setConfig, getConfig } from '@airiot/client'

// 设置全局配置
setConfig({
  language: 'zh-CN',
  module: 'admin'
})

// 获取配置
const config = getConfig()
console.log(config.language)  // 'zh-CN'
```

#### 3.8.2 服务器设置

```typescript
import { getSettings } from '@airiot/client'

function SettingsLoader() {
  const [settings, setSettings] = useState(null)

  useEffect(() => {
    getSettings().then(data => {
      setSettings(data)
    })
  }, [])

  return <div>{JSON.stringify(settings)}</div>
}
```

#### 3.8.3 消息提示

```typescript
import { useMessage } from '@airiot/client'

function MessageExample() {
  const message = useMessage()

  return (
    <>
      <button onClick={() => message.success('操作成功')}>
        成功消息
      </button>
      <button onClick={() => message.error('操作失败')}>
        错误消息
      </button>
      <button onClick={() => message.warning('警告信息')}>
        警告消息
      </button>
      <button onClick={() => message.info('提示信息')}>
        信息消息
      </button>
    </>
  )
}
```

---

### 3.9 常见使用模式

#### 3.9.1 认证路由保护

```typescript
import { useUser } from '@airiot/client'

function ProtectedRoute({ children }) {
  const { user, loading } = useUser()

  if (loading) return <div>加载中...</div>
  if (!user) return <Navigate to="/login" />

  return children
}

// 使用
function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <DashboardPage />
          </ProtectedRoute>
        }
      />
    </Routes>
  )
}
```

#### 3.9.2 CRUD 完整示例

```typescript
import { createAPI } from '@airiot/client'
import { Model, useModelList, useModelSave, useModelDelete } from '@airiot/client'

const userApi = createAPI({
  name: 'core/user',
  resource: 'user'
})

function UserManagement() {
  const { items, loading, query } = useModelList()
  const { save, saving } = useModelSave()
  const { remove } = useModelDelete()

  // 查询用户列表
  useEffect(() => {
    query()
  }, [])

  // 创建用户
  const handleCreate = async (data: any) => {
    await save(data)
    query()  // 刷新列表
  }

  // 删除用户
  const handleDelete = async (id: string) => {
    await remove(id)
    query()  // 刷新列表
  }

  if (loading) return <div>加载中...</div>

  return (
    <div>
      <UserForm onSubmit={handleCreate} loading={saving} />
      <UserTable data={items} onDelete={handleDelete} />
    </div>
  )
}
```

#### 3.9.3 无限滚动

```typescript
import { useModelList } from '@airiot/client'

function InfiniteList() {
  const { items, loading, query, hasMore } = useModelList()
  const [page, setPage] = useState(0)

  const loadMore = () => {
    const nextPage = page + 1
    query({ skip: nextPage * 20, limit: 20 })
    setPage(nextPage)
  }

  return (
    <div>
      {items.map(item => (
        <div key={item.id}>{item.name}</div>
      ))}
      {hasMore && (
        <button onClick={loadMore} disabled={loading}>
          {loading ? '加载中...' : '加载更多'}
        </button>
      )}
    </div>
  )
}
```

---

### 3.10 最佳实践

#### 3.10.1 错误处理

```typescript
import { useLogin } from '@airiot/client'

function LoginForm() {
  const { onLogin, error } = useLogin()

  const handleSubmit = async () => {
    try {
      await onLogin({ username, password })
      // 成功处理
    } catch (err) {
      console.error('登录失败:', err)
      // 错误处理
    }
  }

  return (
    <>
      {error && <div className="error">{error.message}</div>}
      <form onSubmit={handleSubmit}>...</form>
    </>
  )
}
```

#### 3.10.2 性能优化

```typescript
import { useCallback, useMemo } from 'react'
import { useModelList } from '@airiot/client'

function OptimizedList() {
  const { items } = useModelList()

  // 使用 useMemo 缓存计算结果
  const sortedItems = useMemo(() => {
    return [...items].sort((a, b) =>
      a.name.localeCompare(b.name)
    )
  }, [items])

  // 使用 useCallback 缓存回调函数
  const handleClick = useCallback((id: string) => {
    console.log('点击:', id)
  }, [])

  return (
    <ul>
      {sortedItems.map(item => (
        <li key={item.id} onClick={() => handleClick(item.id)}>
          {item.name}
        </li>
      ))}
    </ul>
  )
}
```

#### 3.10.3 TypeScript 类型安全

```typescript
import { createAPI } from '@airiot/client'

// 定义数据类型
interface User {
  id: string
  name: string
  email: string
  createdAt: string
}

// 定义 API 类型
const userApi = createAPI<User>({
  name: 'core/user',
  resource: 'user',
  convertItem: (item) => ({
    ...item,
    fullName: `${item.firstName} ${item.lastName}`
  })
})

// 使用时获得类型提示
async function getUser() {
  const user = await userApi.get('id')
  console.log(user?.name)  // TypeScript 知道这是 string 类型
}
```

---

### 3.11 故障排查

#### 3.11.1 常见问题

**Q: 如何调试 API 请求？**

A: 使用 `apiMessage: true` 启用 API 消息：

```typescript
const api = createAPI({
  name: 'core/user',
  resource: 'user',
  apiMessage: true  // 显示 API 请求消息
})
```

**Q: 表单验证不工作？**

A: 确保 JSON Schema 正确定义了 `required` 数组和验证规则：

```typescript
const schema = {
  type: 'object',
  required: ['name', 'email'],  // 必填字段
  properties: {
    email: {
      type: 'string',
      format: 'email'  // 邮箱格式验证
    }
  }
}
```

**Q: Model 状态不更新？**

A: 确保在 Model Provider 内部使用 hooks：

```typescript
function MyComponent() {
  return (
    <Model model={userModel}>
      <UserList />  {/* 正确：在 Provider 内部 */}
    </Model>
  )
}

// 错误：不能在 Provider 外部使用 useModel hooks
```

**Q: 数据订阅不更新？**

A: 确保在 Subscribe Provider 内部：

```typescript
function App() {
  return (
    <Subscribe>
      <DeviceMonitor />  {/* 正确 */}
    </Subscribe>
  )
}
```

---

### 3.12 相关文档

完整的 API 文档和示例请参考：

- [API 模块文档](./api.md)
- [认证模块文档](./auth.md)
- [表单模块文档](./form.md)
- [模型模块文档](./model.md)
- [Page Hooks 文档](./page-hooks.md)
- [数据订阅文档](./subscribe.md)
- [快速开始指南](./getting-started.md)
- [使用示例](./examples.md)

---

## 附录

### A. 完整依赖列表

```json
{
  "dependencies": {
    "@airiot/client": "latest",
    "react": "^19.0.0",
    "react-dom": "^19.0.0",
    "react-router-dom": "^7.12.0",
    "jotai": "^2.7.0"
  }
}
```

### B. TypeScript 配置

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true
  },
  "include": ["src"],
  "references": [{ "path": "./tsconfig.node.json" }]
}
```

### C. 环境变量参考

```bash
# .env.local

# AIRIOT API 配置
AIRIOT_API_TARGET=http://localhost:8080/
AIRIOT_API_PORT=3000

# 开发模式
VITE_DEV=true
```

---

**文档版本：** v1.0
**最后更新：** 2025-01-24
**维护者：** AIRIOT 开发团队
