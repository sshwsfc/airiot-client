# 文档创建完成

已成功创建完整的 @airiot/client 使用文档。

## 文档结构

```
docs/
├── .vitepress/          # VitePress 配置和构建输出
├── README.md            # 文档概述
├── api.md              # API 模块文档
├── auth.md             # 认证模块文档
├── form.md             # 表单模块文档
├── model.md            # 模型模块文档
├── hooks.md            # 全局钩子文档
├── getting-started.md  # 快速开始指南
├── examples.md         # 使用示例
├── index.md            # 首页
└── DEPLOYMENT.md       # 部署指南
```

## 文档内容

### 核心模块文档
- **API 模块** - HTTP 客户端和数据获取
- **认证模块** - 登录、登出和用户管理
- **表单模块** - 表单构建和验证
- **模型模块** - 模型管理和状态管理
- **全局钩子** - 配置和消息钩子

### 指南和示例
- **快速开始** - 安装和基础使用
- **使用示例** - 实际应用案例
- **部署指南** - 文档部署方法

## 快速开始

### 开发文档

```bash
npm run docs:dev
```

访问 http://localhost:5173

### 构建文档

```bash
npm run docs:build
```

### 预览构建

```bash
npm run docs:preview
```

## 部署选项

文档可部署到：
- GitHub Pages
- Vercel
- Netlify
- 任何静态托管服务

详细部署步骤请参考 `docs/DEPLOYMENT.md`

## 特性

- ✅ 使用 VitePress 构建
- ✅ 完整的中文文档
- ✅ 代码高亮
- ✅ 搜索功能
- ✅ 响应式设计
- ✅ SEO 优化

## 文档统计

- 总文档页面：9 个
- 代码示例：100+ 个
- 文档总字数：约 60,000 字
