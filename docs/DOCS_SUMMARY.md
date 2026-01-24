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
├── page-hooks.md           # Page Hooks 文档
├── subscribe.md            # 数据订阅模块文档
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

### 4. form.md (8 KB)
- **导出列表** - 所有表单相关的导出
- `SchemaForm` 组件
- `Form` 组件
- `BaseForm` 组件
- `useForm` Hook
- `FieldArray` 数组字段组件
- `setFormFields` 自定义字段渲染器
- `setSchemaConverters` 自定义 Schema 转换器
- JSON Schema 格式
- 基础字段类型
- 枚举字段
- 对象字段
- 数组字段
- 表单配置
- 验证规则
- 工具函数
- 高级功能

### 5. model.md (22 KB)
- **组件**
  - `Model` 组件 - 静态模型组件
  - `TableModel` 组件 - 动态表模型组件
  - `ModelContext` 上下文
- **基础 Hooks**
  - `useModel` - 获取模型上下文
  - `useModelValue` - 读取原子值
  - `useModelState` - 读写原子值
  - `useSetModelState` - 写入原子值
  - `useModelCallback` - 创建回调函数
- **数据操作 Hooks**
  - `useModelGet` - 获取单条数据
  - `useModelSave` - 保存数据
  - `useModelDelete` - 删除数据
  - `useModelItem` - 组合 Hook（获取+保存+删除）
  - `useModelGetItems` - 获取列表数据
  - `useModelEffect` - 模型副作用
- **列表 Hooks**
  - `useModelList` - 列表数据
  - `useModelPagination` - 分页
  - `useModelCount` - 数据总数
  - `useModelPageSize` - 页面大小
  - `useModelFields` - 字段控制
  - `useModelSelect` - 选择功能
  - `useModelListRow` - 列表行操作
  - `useModelListHeader` - 列表表头操作
  - `useModelListOrder` - 列表排序
  - `useModelListItem` - 列表项操作
- **其他 Hooks**
  - `useModelQuery` - 自定义查询
  - `useModelPermission` - 权限检查
  - `useModelEvent` - 事件处理
- ModelSchema 配置
- Property 配置
- Model Registry（内置 46 个 Airiot 系统模型）
- 状态管理
- 原子类型说明
- 完整示例

### 6. page-hooks.md (17.6 KB)
- **概述** - Page Hooks 的基本概念和特性
- **页面变量 (PageVar)**
  - `usePageVar` - 获取页面变量的 state 和 setter
  - `usePageVarValue` - 获取页面变量的值（只读）
  - `useSetPageVar` - 获取页面变量的 setter（只写）
  - `usePageVarCallback` - 获取页面变量的回调函数
- **数据源 (Datasource)**
  - `useDatasetSet` - 获取数据集的 setter
  - `useDatasetsValue` - 获取多个数据集的值
  - `useDatasourceValue` - 通过路径获取数据源值
- **组件上下文 (Context)**
  - `useDataVarValue` - 获取组件数据变量的值
  - `useSetDataVar` - 设置组件数据变量
- **组件函数 (Functions)**
  - `useFunctions` - 获取组件函数的 state 和 setter
  - `useFunctionsValue` - 获取组件函数（只读）
  - `useFunctionsSet` - 设置组件函数（只写）
  - `useFunctionsGet` - 获取组件函数的回调
- **视图状态 (View)**
  - `useScale` - 获取视图缩放比例的 state 和 setter
  - `useViewValue` - 获取视图状态的值
  - `usePlayback` - 获取播放状态的 state 和 setter
- **迭代数据 (Iteration)**
  - `useIteration` - 获取迭代上下文
  - `useIterationValue` - 获取迭代上下文中的值
- **订阅管理 (Subscribe)**
  - `useSubscribeValue` - 获取订阅数据
  - `useSubscribeSet` - 获取订阅管理器的 setter
- **工具函数**
  - `createFamily` - 创建 atomFamily
  - `createCallback` - 创建回调函数
  - `usePageStore` - 获取页面级别的 Store
- **完整示例** - 实际应用案例
- **最佳实践** - 使用建议和技巧
- **常见问题** - FAQ

### 7. subscribe.md (约 20 KB)
- **概述** - 数据订阅模块的核心概念
- **核心概念**
  - SubTag - 订阅标签类型
  - SubData - 订阅数据类型
  - TagValue - 标签值类型
- **Subscribe Provider**
  - Provider 组件使用说明
  - SubscribeContextValue 接口
  - 依赖项说明
- **Hooks API**
  - `useDataTag` - 订阅并获取数据点值
  - `useDataTagValue` - 获取数据点值（不自动订阅）
  - `useTableData` - 订阅并获取表数据
  - `useReferenceValue` - 获取计算记录值
  - `useSubscribeContext` - 获取订阅上下文
- **WebSocket 管理**
  - `useWS` - WebSocket Hook
  - `useCommWS` - 通用 WebSocket Hook
  - 连接状态说明
  - 自动重连机制
  - 心跳保活
- **数据查询**
  - `queryLastData` - 查询最新数据
  - `queryTableData` - 查询表数据
  - `queryHistoryData` - 查询历史数据
  - `queryMeta` - 查询数据点配置
- **完整示例** - 实际应用案例
- **最佳实践** - 使用建议和技巧
- **常见问题** - FAQ

### 8. hooks.md (4.7 KB)
- `getConfig` 全局配置
- `setConfig` 设置配置
- `getSettings` 服务器设置
- `useMessage` 消息提示
- 配置结构说明
- 使用示例

### 9. getting-started.md (8.3 KB)
- 安装指南
- 基础设置
- 第一个 API 示例
- 实现登录功能
- 创建数据列表
- 创建表单
- 受保护的路由
- 完整示例应用
- 常见问题

### 10. examples.md (12 KB)
- 用户管理系统示例
- 登录系统示例
- 数据筛选示例
- 自定义 API 调用
- 错误处理

### 11. index.md (3 KB)
- 首页布局
- 功能特性列表
- 快速开始示例
- 核心功能介绍

### 12. DEPLOYMENT.md (5.8 KB)
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

文档将在本地启动（默认 http://localhost:5173）。

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
