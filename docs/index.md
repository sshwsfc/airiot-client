---
layout: home

hero:
  name: "@airiot/client"
  text: "Airiot TypeScript 客户端库"
  tagline: "为 React 应用提供完整的 API、认证、表单处理和模型管理功能"
  image:
    src: /logo.svg
    alt: Airiot Client
  actions:
    - theme: brand
      text: 快速开始
      link: /getting-started
    - theme: alt
      text: 查看 GitHub
      link: https://github.com/sshwsfc/airiot-client

features:
  - title: 简单易用
    details: 直观的 API 设计，简化常见的开发任务
  - title: 类型安全
    details: 完整的 TypeScript 类型定义，提供更好的开发体验
  - title: 功能完整
    details: 包含 API 客户端、认证、表单、模型管理等完整功能
  - title: 高度可定制
    details: 支持自定义扩展，满足各种业务需求
  - title: 开箱即用
    details: 内置最佳实践，快速构建应用
  - title: 国际化支持
    details: 支持多语言，轻松构建国际化应用

---

## 安装

```bash
npm install @airiot/client
```

## 快速开始

```typescript
import { createAPI, setConfig } from '@airiot/client'

// 配置全局上下文
setConfig({
  language: 'zh-CN',
  module: 'admin'
})

// 创建 API 实例
const api = createAPI({
  name: 'core/user',
  resource: 'user'
})

// 查询数据
const { items, total } = await api.query({
  skip: 0,
  limit: 10
})
```

## 核心功能

### API 客户端

简化 REST API 调用，支持查询、过滤、分页等常用操作。

```typescript
const { items, total } = await api.query({
  skip: 0,
  limit: 10,
  order: { createdAt: 'DESC' }
})
```

### 身份认证

完整的登录/登出流程，支持记住我功能。

```typescript
const { onLogin } = useLogin()

await onLogin({
  username: 'admin',
  password: 'password',
  remember: true
})
```

### 表单处理

基于 JSON Schema 的表单构建和验证，支持自定义字段渲染器和验证规则。

```typescript
import { SchemaForm, setFormFields, setSchemaConverters } from '@airiot/client'

// 自定义字段渲染器
setFormFields({
  custom: CustomComponent
})

// 自定义 Schema 转换器
setSchemaConverters([
  (field, schema) => {
    if (schema.custom) {
      field.type = 'custom'
    }
    return field
  }
])

<SchemaForm
  schema={userSchema}
  onSubmit={handleSubmit}
/>
```

### 模型管理

集成的状态管理和数据操作。

```typescript
<Model model={userModel}>
  <UserList />
</Model>
```

## 为什么选择 @airiot/client？

- **开发效率** - 内置常用功能，减少重复代码
- **类型安全** - TypeScript 类型定义，减少运行时错误
- **最佳实践** - 遵循 React 和 TypeScript 最佳实践
- **文档完善** - 详细的文档和示例
- **活跃维护** - 持续更新和改进
- **社区支持** - 丰富的社区资源和案例

## 了解更多

探索以下资源来更好地使用 @airiot/client：

- [快速开始](./getting-started.md) - 立即开始使用
- [API 文档](./api.md) - 查看 API 参考
- [使用示例](./examples.md) - 学习实际应用案例
- [贡献指南](https://github.com/airiot/client/blob/main/CONTRIBUTING.md) - 参与项目贡献

## 浏览器支持

支持所有现代浏览器。

| Chrome | Firefox | Safari | Edge |
| ------ | ------- | ------ | ---- |
| Latest | Latest  | Latest | Latest |

## 许可证

MIT License
