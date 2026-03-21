# AIRIOT Skill 文档说明

本目录包含 AIRIOT 平台的 Skill 文档，旨在帮助 AI Agent 正确、高效、可靠地调用 AIRIOT 平台能力与开发框架。

## 文档列表

### 1. SKILL.md（完整版 - 推荐）

**用途**：完整的 Skill 文档，涵盖项目初始化、开发规范和客户端使用三个方面。

**结构**：
- 第一部分：AIRIOT 项目初始化与安装
- 第二部分：AIRIOT 项目结构与开发规范
- 第三部分：AIRIOT 客户端使用指南（基于最新源码）

**包含模块**：
- API 模块：RESTful API 客户端
- 认证模块：用户认证和会话管理
- 表单模块：React Hook Form 集成
- 模型模块：基于 Jotai 的状态管理
- Page Hooks：页面级状态管理
- 数据订阅：WebSocket 实时数据订阅
- 事件系统：事件驱动的动作执行
- 配置模块：全局配置管理

**适用场景**：
- ✅ **AI Agent 首选文档**
- 需要完整了解 AIRIOT 平台开发流程
- 深入学习各个模块的使用方法
- 解决复杂的技术问题

### 2. SKILL_QUICK_REF.md（快速参考）

**用途**：精简的快速参考文档，提供 API 概览和常用代码片段。

**结构**：
- 模块快速索引表
- 各模块核心功能速查
- 常见模式和最佳实践
- 故障排查指南

**适用场景**：
- AI Agent 需要快速查找 API 用法
- 日常开发中的代码参考
- 快速解决常见问题

---

## 使用建议

### 对于 AI Agent

1. **初次使用**：先阅读 `SKILL.md` 的第一部分和第二部分，了解项目结构和规范
2. **开发时**：使用 `SKILL_QUICK_REF.md` 快速查找需要的 API 和代码示例
3. **深入问题**：参考 `SKILL.md` 的第三部分，该部分基于最新源码编写
4. **代码生成**：根据文档中的模式和最佳实践生成代码

### 对于开发者

1. **项目初始化**：按照第一部分的命令创建项目
2. **代码规范**：遵循第二部分的目录结构和命名规范
3. **API 参考**：使用快速参考文档查找需要的 API
4. **深入学习**：阅读 `docs/` 目录下的完整文档

---

## 文档特点

### ✅ 权威性
- 所有内容基于最新源码 (`src/` 目录) 分析
- API 签名与实际导出完全一致
- 类型定义准确，支持 TypeScript

### ✅ 完整性
- 覆盖所有核心模块（API、Auth、Form、Model、Page Hooks、Subscribe、Events、Config）
- 包含完整的使用示例
- 提供常见模式和最佳实践

### ✅ 实用性
- 结构清晰，易于查找
- 代码片段可直接复制使用
- 包含故障排查指南

### ✅ 时效性
- 版本：v1.2.0
- 更新日期：2025-03-21
- 基于 `@airiot/client` 最新源码

---

## 核心模块速查

| 模块 | 主要 API | 用途 |
|------|----------|------|
| **API** | `createAPI`, `query`, `get`, `save`, `delete` | REST API 调用 |
| **Auth** | `useLogin`, `useLogout`, `useUser`, `useUserReg` | 用户认证 |
| **Form** | `useForm`, `useFieldArray`, `Controller` | React Hook Form |
| **Model** | `Model`, `TableModel`, `useModel*` | Jotai 状态管理 |
| **Page Hooks** | `usePageVar`, `useDatasourceValue`, `useDataVarValue` | 页面状态 |
| **Subscribe** | `Subscribe`, `useTag`, `useTableData` | WebSocket 订阅 |
| **Events** | `useEvents`, `useEvent`, `useEventsWithSpread` | 事件系统 |
| **Config** | `setConfig`, `getConfig`, `useMessage` | 全局配置 |

---

## 主要更新内容（v1.2.0）

### 工具安装方式变更
- ✅ 将 MCP 服务改为 AIRIOT CLI 工具
- ✅ 安装命令改为 `npx @airiot/tools`

---

## 历史更新内容（v1.1.0）

### API 模块
- ✅ 补充完整的 APIOptions 类型定义
- ✅ 添加 `count()` 方法说明
- ✅ 完善查询过滤语法文档

### 认证模块
- ✅ 修正 `useUserReg` 返回值为 `onUserReg`
- ✅ 补充 `showCode`, `showExtra`, `resetVerifyCode` 返回值
- ✅ 添加验证码相关说明

### 表单模块
- ✅ 说明基于 React Hook Form（非独立 SchemaForm 组件）
- ✅ 添加 `useFieldUIState`, `setFieldVisibility` 等字段状态 API
- ✅ 补充 `Controller` 和 `useFieldArray` 用法

### 模型模块
- ✅ 添加完整的 Model Hooks 列表（20+ hooks）
- ✅ 补充 `useModelGetItems`, `useModelItem` 等高级 hooks
- ✅ 完善 TableModel 组件参数说明

### Page Hooks
- ✅ 添加 `useCellDataValue` hook
- ✅ 补充 `useDatasetsValue` hook
- ✅ 完善嵌套路径访问说明

### 订阅模块
- ✅ 修正 API 名称：`useTag` 替代 `useDataTag`
- ✅ 添加 `useUpdateTags`, `useUpdateData`, `useUpdateReference` hooks
- ✅ 补充 `useTagValue`, `useTableDataValue` 只读 hooks

### 事件系统（新增）
- ✅ 完整的 Event System 文档
- ✅ `useEvents`, `useEvent`, `useEventsWithSpread` 三个 hooks
- ✅ 9 种事件类型和 10 种动作类型说明

### 配置模块
- ✅ 补充完整的类型定义（Config, UserInfo, AppSettings）
- ✅ 说明 `getSettings` 需要用户上下文

---

## 维护说明

### 文档更新原则

1. **跟随代码更新**：当 `src/` 目录的代码更新时，同步更新文档
2. **保持一致性**：确保与源码导出完全一致
3. **示例验证**：所有代码示例必须经过验证
4. **版本标记**：每次更新时更新文档版本号

### 更新流程

1. 分析源码变更（`src/` 目录）
2. 更新相关模块文档
3. 更新版本号和日期
4. 提交 PR 时包含文档更新

---

## 相关资源

### 项目文档
- [项目主文档](../docs/)
- [API 模块](../docs/api.md)
- [认证模块](../docs/auth.md)
- [表单模块](../docs/form.md)
- [模型模块](../docs/model.md)
- [Page Hooks](../docs/page-hooks.md)
- [数据订阅](../docs/subscribe.md)
- [快速开始](../docs/getting-started.md)

### Demo 项目
- [Demo 源码](../demo/src/)
- [Page Hooks Demo](../demo/src/pages/PageHooksDemoPage.tsx)
- [Subscribe Demo](../demo/src/pages/SubscribeDemoPage.tsx)

### 源代码
- [API 模块](../src/api/index.ts)
- [认证模块](../src/auth/index.ts)
- [表单模块](../src/form/index.ts)
- [模型模块](../src/model/index.ts)
- [Page Hooks](../src/page/index.ts)
- [数据订阅](../src/subscribe/index.ts)
- [事件系统](../src/events/index.ts)

---

## 技术支持

如有问题或建议，请联系 AIRIOT 开发团队或提交 Issue。

---

**文档版本：** v1.2.0
**最后更新：** 2025-03-21
**维护团队：** AIRIOT 开发团队
