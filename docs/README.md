# @airiot/client

Airiot TypeScript 客户端库，为 React 应用提供完整的 API、认证、表单处理和模型管理功能。

## 功能特性

- **API 客户端** - 简化 REST API 调用，支持查询、过滤、分页
- **身份认证** - 完整的登录/登出流程，支持记住我功能
- **表单处理** - 基于 JSON Schema 的表单构建和验证
- **模型管理** - 集成的状态管理和数据操作
- **类型安全** - 完整的 TypeScript 类型定义

## 安装

```bash
npm install @airiot/client
# 或
yarn add @airiot/client
# 或
pnpm add @airiot/client
```

## 快速开始

### 基础配置

```typescript
import { setConfig } from '@airiot/client'

// 配置全局上下文
setConfig({
  language: 'zh-CN',
  module: 'admin'
})
```

### API 使用示例

```typescript
import { createAPI } from '@airiot/client'

// 创建 API 实例
const userAPI = createAPI({
  name: 'core/user',
  resource: 'user'
})

// 查询数据
const { items, total } = await userAPI.query({
  skip: 0,
  limit: 10,
  order: { createdAt: 'DESC' }
})

// 获取单条数据
const user = await userAPI.get('user123')

// 保存数据
const newUser = await userAPI.save({
  username: 'john',
  email: 'john@example.com'
})
```

### 认证使用示例

```typescript
import { useLogin, useLogout, useUser } from '@airiot/client'

function LoginForm() {
  const { onLogin } = useLogin()

  const handleSubmit = (values: any) => {
    return onLogin(values)
  }

  return <Form onSubmit={handleSubmit}>...</Form>
}
```

### 表单使用示例

```typescript
import { SchemaForm, setFormFields, Form, FieldArray } from '@airiot/client'

// 自定义字段渲染器
setFormFields({
  text: CustomInput,
  number: CustomNumberInput
})

const userSchema = {
  type: 'object',
  properties: {
    username: {
      type: 'string',
      title: '用户名',
      minLength: 3
    },
    email: {
      type: 'string',
      format: 'email',
      title: '邮箱'
    }
  },
  required: ['username']
}

function UserForm() {
  return <SchemaForm schema={userSchema} onSubmit={handleSubmit} />
}
```

### 模型使用示例

```typescript
import { Model, useModelList } from '@airiot/client'

const userModel = {
  name: 'user',
  title: '用户',
  api: { name: 'core/user' },
  properties: {
    username: { type: 'string', title: '用户名' },
    email: { type: 'string', title: '邮箱' }
  }
}

function UserList() {
  const { items, loading } = useModelList()

  return (
    <Model model={userModel}>
      {loading ? <Spinner /> : <Table data={items} columns={userModel.properties} />}
    </Model>
  )
}
```

## 模块文档

- [API 模块](./api.md) - HTTP 客户端和数据获取
- [认证模块](./auth.md) - 登录、登出和用户管理
- [表单模块](./form.md) - 表单构建和验证
- [模型模块](./model.md) - 模型管理和状态管理
- [全局钩子](./hooks.md) - 配置和消息钩子
- [使用示例](./examples.md) - 更多实际使用案例

## 开发命令

```bash
# 构建
npm run build

# 开发模式（监听文件变化）
npm run dev

# 类型检查
npm run type-check

# 运行测试
npm test

# 运行测试覆盖率
npm run test:coverage
```

## 依赖项

### 运行时依赖

- `react` - React 18+ (peer dependency)
- `react-dom` - React DOM (peer dependency)
- `react-router` - React Router (peer dependency)

### 开发依赖

- `typescript` - TypeScript 编译器
- `vite` - 构建工具
- `vitest` - 测试框架

## 许可证

MIT License
