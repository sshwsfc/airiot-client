# 文档更新日志

## 2025-01-24

### 新增：数据订阅模块 (subscribe.md)

**完整的数据订阅文档**
- 模块概述和核心概念
- Subscribe Provider 使用说明
- 完整的 Hooks API 文档：
  - `useDataTag` - 订阅并获取数据点值
  - `useDataTagValue` - 获取数据点值（不自动订阅）
  - `useTableData` - 订阅并获取表数据
  - `useReferenceValue` - 获取计算记录值
  - `useSubscribeContext` - 获取订阅上下文
- WebSocket 管理文档（useWS, useCommWS）
- 数据查询函数（queryLastData, queryTableData, queryHistoryData, queryMeta）
- 完整的使用示例和最佳实践
- 常见问题解答

### 新增：Subscribe Demo 页面

**完整的功能演示**
- 订阅管理演示（动态订阅/取消订阅）
- 多设备监控演示
- WebSocket 连接状态演示
- API 使用示例
- 性能特性展示

### 更新：现有文档

**index.md**
- 添加数据订阅模块链接

**README.md**
- 添加数据订阅功能特性说明

**page-hooks.md**
- 在订阅管理章节添加对数据订阅模块的引用

**demo/src/App.tsx**
- 添加数据订阅路由和导航

## 2025-01-18

### 模型模块 (model.md)

**新增 TableModel 组件文档**
- 添加完整的 TableModel 组件使用说明
- Props 参数详解（tableId, loadingComponent）
- 组件行为说明（从服务器获取表结构）
- 使用场景（动态表管理、多租户应用、管理后台）

**新增基础 Hooks 文档**
- `useModelValue` - 读取模型原子值
- `useModelState` - 读写模型原子值
- `useSetModelState` - 写入模型原子值
- `useModelCallback` - 创建模型回调函数

**新增数据操作 Hooks 文档**
- `useModelItem` - 组合 Hook（获取+保存+删除功能）
- `useModelEffect` - 模型副作用 Hook
- `useModelCount` - 获取数据总数

**新增列表 Hooks 文档**
- `useModelListRow` - 列表行操作（选中、展开）
- `useModelListHeader` - 列表表头操作（排序）
- `useModelListOrder` - 列表排序控制
- `useModelListItem` - 列表项操作

**Model Props 更新**
- 添加 `name` 参数说明（使用内置模型）
- 添加 `modelKey` 参数说明（区分同名模型实例）
- 添加 `initialValues` 参数说明

### 文档摘要 (DOCS_SUMMARY.md)

**更新 model.md 条目**
- 大小更新：10 KB → 22 KB
- 按类别组织 Hooks 文档：
  - 基础 Hooks（5 个）
  - 数据操作 Hooks（6 个）
  - 列表 Hooks（10 个）
  - 其他 Hooks（3 个）
- 标记 TableModel 组件
- 标记 Model Registry（46 个内置模型）

## 2025-01-14

### 认证模块 (auth.md)

**useUser Hook**
- 新增返回值 `loadUser` - 从 localStorage 加载用户信息的函数

**useLogin Hook**
- 新增返回值 `resetVerifyCode` - 验证码重置标记

### 表单模块 (form.md)

**新增导出列表**
- 添加了完整的导出列表章节，包括：
  - 组件：Form, SchemaForm, BaseForm, FieldArray
  - Hooks：useForm
  - 工具函数：fieldBuilder, objectBuilder, schemaConvert
  - 配置函数：setFormFields, setSchemaConverters

**现有内容确认**
- BaseForm 组件文档 ✅
- FieldArray 使用示例 ✅
- setFormFields 自定义字段渲染器 ✅
- setSchemaConverters 自定义 Schema 转换器 ✅

### 全局钩子 (hooks.md)

**useMessage Hook**
- 新增 `warning` 方法 - 显示警告信息

### 主页 (index.md)

**表单处理章节**
- 更新表单示例代码
- 添加 setFormFields 和 setSchemaConverters 的使用示例

### README (README.md)

**表单使用示例**
- 更新示例代码，添加 setFormFields 导入

### 文档摘要 (DOCS_SUMMARY.md)

**更新内容**
- auth.md 标记新增的 loadUser 和 resetVerifyCode
- form.md 更新为 8 KB，添加导出列表说明
- hooks.md 更新为 4.7 KB，标记 warning 方法

## 源码变更对应的文档更新

所有文档更新都基于最新的 `src/index.ts` 导出内容：

```typescript
// Form 模块新增导出
export {
  Form, SchemaForm, useForm,
  fieldBuilder, objectBuilder, schemaConvert, FieldArray,
  setFormFields, setSchemaConverters  // 新增
} from './form'

// Auth 模块 hooks 返回值更新
// useUser -> 新增 loadUser
// useLogin -> 新增 resetVerifyCode

// Hooks 模块 useMessage 更新
// 新增 warning 方法
```
