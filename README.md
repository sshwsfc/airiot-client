# @airiot/client

Airiot TypeScript 客户端库，为 React 应用提供完整的 API、认证、表单处理和模型管理功能。

## 功能特性

- **API 客户端** - 简化 REST API 调用，支持查询、过滤、分页
- **身份认证** - 完整的登录/登出流程，支持记住我功能
- **表单处理** - 基于 JSON Schema 的表单构建和验证
- **模型管理** - 集成的状态管理和数据操作
- **类型安全** - 完整的 TypeScript 类型定义

## 安装

\`\`\`bash
npm install @airiot/client
\`\`\`

## 文档

完整的文档请访问 [docs/README.md](./docs/README.md)

## 快速开始

\`\`\`typescript
import { createAPI, setContext } from '@airiot/client'

// 配置全局上下文
setContext({
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
\`\`\`

## 开发

\`\`\`bash
# 构建
npm run build

# 开发模式（监听文件变化）
npm run dev

# 类型检查
npm run type-check

# 运行测试
npm test

# 构建文档
npm run docs:build

# 启动文档开发服务器
npm run docs:dev
\`\`\`

## 许可证

MIT License
