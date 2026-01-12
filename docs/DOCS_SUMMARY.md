# 文档目录结构

已成功创建完整的 @airiot/client 使用文档，采用 VitePress 构建。

## 文档文件结构

```
docs/
├── .vitepress/
│   ├── config.ts          # VitePress 配置文件
│   └── dist/               # 构建输出目录
├── README.md               # 文档首页
├── api.md                  # API 模块文档
├── auth.md                 # 认证模块文档
├── form.md                 # 表单模块文档
├── model.md                # 模型模块文档
├── hooks.md                # 全局钩子文档
├── getting-started.md      # 快速开始指南
├── examples.md             # 使用示例
├── index.md                # VitePress 首页
└── DEPLOYMENT.md           # 文档部署指南
```

## 文档内容

### 1. README.md
- 功能特性介绍
- 安装方法
- 快速开始示例
- 模块文档导航
- 开发命令说明
- 依赖项说明

### 2. api.md (5 KB)
- `createAPI` 创建 API 实例
- APIOptions 配置说明
- `fetch` 通用请求方法
- `query` 查询方法
- `get` 获取单条数据
- `delete` 删除方法
- `save` 保存方法
- `count` 计数方法
- 数据转换功能
- 条件查询操作符
- 全局上下文设置

### 3. auth.md (4.5 KB)
- `useUser` 用户信息管理
- `useLogin` 登录功能
- `useLogout` 登出功能
- `useUserReg` 注册功能
- 认证流程说明
- 用户信息结构

### 4. form.md (7.9 KB)
- `SchemaForm` 组件
- `Form` 组件
- `BaseForm` 组件
- `useForm` Hook
- JSON Schema 格式
- 基础字段类型
- 枚举字段
- 对象字段
- 数组字段
- 表单配置
- 验证规则
- 工具函数
- 高级功能

### 5. model.md (10 KB)
- `Model` 组件
- `ModelContext` 上下文
- `useModel` Hook
- 模型 Hooks 列表
- ModelSchema 配置
- Property 配置
- 状态管理
- 原子类型说明
- 完整示例

### 6. hooks.md (4.6 KB)
- `useConfig` 全局配置
- `useConfigValue` 只读配置
- `useSetConfig` 设置配置
- `useSettings` 服务器设置
- `useMessage` 消息提示
- 配置结构说明
- 使用示例

### 7. getting-started.md (8.3 KB)
- 安装指南
- 基础设置
- 第一个 API 示例
- 实现登录功能
- 创建数据列表
- 创建表单
- 受保护的路由
- 完整示例应用
- 常见问题

### 8. examples.md (12 KB)
- 用户管理系统示例
- 登录系统示例
- 数据筛选示例
- 自定义 API 调用
- 错误处理

### 9. index.md (3 KB)
- 首页布局
- 功能特性列表
- 快速开始示例
- 核心功能介绍

### 10. DEPLOYMENT.md (5.8 KB)
- 本地预览
- 部署到 GitHub Pages
- 部署到 Vercel
- 部署到 Netlify
- 自定义域名
- 自动化部署
- 监控和分析
- CDN 配置
- SEO 优化
- 故障排除
- 最佳实践

## 构建命令

在 `package.json` 中添加的文档命令：

```json
{
  "scripts": {
    "docs:dev": "vitepress dev docs",
    "docs:build": "vitepress build docs",
    "docs:preview": "vitepress preview docs"
  }
}
```

## 使用方法

### 开发文档

```bash
npm run docs:dev
```

文档将在 http://localhost:5173 启动。

### 构建文档

```bash
npm run docs:build
```

构建产物将输出到 `docs/.vitepress/dist/`。

### 预览构建

```bash
npm run docs:preview
```

## 部署

文档已构建成功，可以部署到以下平台：

- **GitHub Pages** - 使用 GitHub Actions 自动部署
- **Vercel** - 连接 GitHub 仓库自动部署
- **Netlify** - 连接 GitHub 仓库自动部署
- **其他静态托管** - 使用 `docs/.vitepress/dist/` 目录

详细的部署步骤请参考 `docs/DEPLOYMENT.md`。

## 特性

- ✅ 使用 VitePress 构建
- ✅ 完整的中文文档
- ✅ 代码高亮
- ✅ 导航栏和侧边栏
- ✅ 搜索功能（本地搜索）
- ✅ 响应式设计
- ✅ 可配置主题
- ✅ SEO 优化
- ✅ 支持自定义域名
