# 文档更新日志

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
