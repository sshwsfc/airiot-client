# 快速开始

本指南将帮助你快速上手 @airiot/client。

## 安装

### npm

```bash
npm install @airiot/client
```

### yarn

```bash
yarn add @airiot/client
```

### pnpm

```bash
pnpm add @airiot/client
```

## 基础设置

### 1. 配置 Peer Dependencies

@airiot/client 需要以下依赖作为 peer dependencies：

```bash
npm install react react-dom react-router
npm install jotai dayjs axios lodash final-form ajv react-final-form react-final-form-arrays
npm install crypto-js localforage
```

### 2. 初始化全局配置

在应用入口文件（如 index.ts 或 main.tsx）中使用 `setConfig` 初始化全局配置：

```typescript
import { setConfig } from '@airiot/client'

// 配置全局上下文
setConfig({
  language: 'zh-CN',
  module: 'admin',
  settings: {
    safeRequest: true
  }
})
```

## 创建你的第一个 API

### 简单的 API 调用

```typescript
import { createAPI } from '@airiot/client'

// 创建 API 实例
const userAPI = createAPI({
  name: 'core/user',
  resource: 'user'
})

// 查询数据
async function fetchUsers() {
  const { items, total } = await userAPI.query({
    skip: 0,
    limit: 10
  })
  console.log(`共有 ${total} 条数据`)
  console.log('数据列表:', items)
}

// 调用函数
fetchUsers()
```

## 实现登录功能

### 1. 创建登录页面

```typescript
// LoginPage.tsx
import { useLogin } from '@airiot/client'

function LoginPage() {
  const { onLogin } = useLogin()

  const handleSubmit = async (values) => {
    try {
      await onLogin({
        username: values.username,
        password: values.password,
        remember: values.remember
      })
      // 登录成功会自动跳转
    } catch (error) {
      console.error('登录失败:', error)
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <input name="username" placeholder="用户名" />
      <input name="password" type="password" placeholder="密码" />
      <label>
        <input name="remember" type="checkbox" />
        记住我
      </label>
      <button type="submit">登录</button>
    </form>
  )
}

export default LoginPage
```

### 2. 配置路由

```typescript
// App.tsx
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import LoginPage from './LoginPage'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/" element={<Dashboard />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
```

## 创建数据列表

### 1. 定义模型

```typescript
// models/user.ts
import { ModelSchema } from '@airiot/client'

export const userModel: ModelSchema = {
  name: 'user',
  title: '用户',
  api: { name: 'core/user' },
  properties: {
    username: { type: 'string', title: '用户名' },
    email: { type: 'string', title: '邮箱' },
    role: { type: 'string', title: '角色' },
    status: { type: 'string', title: '状态' }
  },
  listFields: ['username', 'email', 'role', 'status'],
  permission: {
    add: true,
    edit: true,
    delete: true
  }
}
```

### 2. 创建列表组件

```typescript
// UserList.tsx
import { Model, useModelList } from '@airiot/client'
import { userModel } from './models/user'

function UserList() {
  const { loading, items } = useModelList()

  if (loading) return <div>加载中...</div>

  return (
    <table>
      <thead>
        <tr>
          <th>用户名</th>
          <th>邮箱</th>
          <th>角色</th>
          <th>状态</th>
        </tr>
      </thead>
      <tbody>
        {items.map(item => (
          <tr key={item.id}>
            <td>{item.username}</td>
            <td>{item.email}</td>
            <td>{item.role}</td>
            <td>{item.status}</td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}

export default function UserManagement() {
  return (
    <Model model={userModel}>
      <UserList />
    </Model>
  )
}
```

## 创建表单

### 使用 JSON Schema 创建表单

```typescript
// UserForm.tsx
import { SchemaForm } from '@airiot/client'

const userSchema = {
  type: 'object',
  properties: {
    username: {
      type: 'string',
      title: '用户名',
      minLength: 3,
      field: { placeholder: '请输入用户名' }
    },
    email: {
      type: 'string',
      format: 'email',
      title: '邮箱',
      field: { placeholder: '请输入邮箱' }
    },
    role: {
      type: 'string',
      title: '角色',
      enum: ['admin', 'user', 'guest'],
      enumNames: ['管理员', '用户', '访客']
    }
  },
  required: ['username', 'email']
}

function UserForm() {
  const handleSubmit = (values) => {
    console.log('表单提交:', values)
  }

  return <SchemaForm schema={userSchema} onSubmit={handleSubmit} />
}

export default UserForm
```

## 受保护的路由

### 创建路由守卫

```typescript
// ProtectedRoute.tsx
import { useUser } from '@airiot/client'
import { Navigate } from 'react-router-dom'

function ProtectedRoute({ children }) {
  const { user } = useUser()

  if (!user) {
    return <Navigate to="/login" replace />
  }

  return children
}

export default ProtectedRoute
```

### 在路由中使用

```typescript
// App.tsx
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import ProtectedRoute from './ProtectedRoute'
import LoginPage from './LoginPage'
import UserManagement from './UserManagement'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route
          path="/users"
          element={
            <ProtectedRoute>
              <UserManagement />
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  )
}

export default App
```

## 完整示例应用

### App.tsx

```typescript
import React from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { setConfig } from '@airiot/client'
import LoginPage from './LoginPage'
import UserManagement from './UserManagement'
import ProtectedRoute from './ProtectedRoute'

// 初始化全局配置
setConfig({
  language: 'zh-CN',
  module: 'admin'
})

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route
          path="/users"
          element={
            <ProtectedRoute>
              <UserManagement />
            </ProtectedRoute>
          }
        />
        <Route path="/" element={<div>首页</div>} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
```

### 项目结构

```
src/
├── components/
│   ├── LoginPage.tsx
│   ├── UserList.tsx
│   ├── UserForm.tsx
│   └── ProtectedRoute.tsx
├── models/
│   └── user.ts
└── App.tsx
```

## 下一步

- 阅读详细文档：
  - [API 模块](./api.md)
  - [认证模块](./auth.md)
  - [表单模块](./form.md)
  - [模型模块](./model.md)
  - [全局钩子](./hooks.md)
  - [使用示例](./examples.md)

## 常见问题

### 1. 如何设置 API 基础 URL？

API 模块使用相对路径 `/rest/` 作为默认基础路径。如需修改，可以在 `createAPI` 中使用 `proxyKey` 参数：

```typescript
const api = createAPI({
  name: 'user',
  proxyKey: 'https://api.example.com/'
})
```

### 2. 如何处理登录状态持久化？

登录状态会自动存储在 localStorage 或 sessionStorage 中（取决于"记住我"选项）。应用启动时会自动加载已存储的用户信息。

### 3. 如何自定义表单字段？

可以通过 `schema.field` 属性自定义字段渲染：

```typescript
const schema = {
  type: 'object',
  properties: {
    customField: {
      type: 'string',
      title: '自定义字段',
      field: {
        render: ({ field, form }) => (
          <CustomInput {...field} />
        )
      }
    }
  }
}
```

### 4. 如何实现数据筛选？

使用模型状态管理中的 `wheres` 和 `option`：

```typescript
import { useModel } from '@airiot/client'
import { useSetAtom } from 'jotai'

function FilterComponent() {
  const { atoms } = useModel()
  const setWheres = useSetAtom(atoms.wheres)

  const handleFilter = (keyword) => {
    setWheres({
      username: { $regex: keyword }
    })
  }

  return <input onChange={(e) => handleFilter(e.target.value)} />
}
```
