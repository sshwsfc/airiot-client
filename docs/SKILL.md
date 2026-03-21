---
name: airiot
description: "Complete AIRIOT Platform Development Guide - React TypeScript client with shadcn/ui framework, Vite build tool, and AIRIOT CLI tools. Covers project initialization, development standards, and comprehensive client library usage including API client (createAPI, CRUD operations), Authentication (useLogin, useLogout, useUser), Form Hooks (useForm, Controller, useFieldArray), Jotai-based State Management (Model, TableModel, useModel hooks), Page Hooks (usePageVar, useDatasourceValue, useDataVarValue), Real-time Data Subscription (Subscribe, useTag, useTableData), Event System (useEvents, useEvent), and Configuration (setConfig, useMessage)."
version: "1.1.0"
---

# AIRIOT Platform Development Guide

Complete guide for AI Agents to correctly and efficiently develop with the AIRIOT platform capabilities and framework.

## Table of Contents

- [Part 1: AIRIOT Project Initialization & Installation](#part-1-ariot-project-initialization--installation)
- [Part 2: AIRIOT Project Structure & Development Standards](#part-2-ariot-project-structure--development-standards)
- [Part 3: AIRIOT Client Usage Guide](#part-3-ariot-client-usage-guide)

---

## Part 1: AIRIOT Project Initialization & Installation

### 1.1 Technology Stack

AIRIOT frontend projects are built on **shadcn/ui framework** with **Vite** build tool.

### 1.2 Project Creation

创建一个Airiot项目请严格遵照 [./vite.md](./vite.md) 这个文档创建。

### 1.3 Core Dependencies & Services

#### 1.3.1 AIRIOT CLI Installation

The AIRIOT CLI provides tools for project development, code generation, and platform integration.

**Install CLI:**

```bash
npx @airiot/tools
```

**Configuration:**

```bash
# AIRIOT Server Configuration
AIRIOT_BASE_URL=https://your-airiot-server.com
AIRIOT_PROJECT_ID=your-project-id

# Authentication Configuration (choose one)
AIRIOT_TOKEN=your-api-token
# OR use username/password authentication
# AIRIOT_USERNAME=your-username
# AIRIOT_PASSWORD=your-password
```

#### 1.3.2 Install AIRIOT Client SDK

```bash
npm i -s @airiot/client@latest
```

---

## Part 2: AIRIOT Project Structure & Development Standards

### 2.1 Source Code Directory Structure

All source code is located in the **`src`** directory:

| Directory Path | Purpose |
| :--- | :--- |
| `src/pages/` | Page-level components and routing files |
| `src/blocks/` | Block-level reusable components |
| `src/components/` | Business-level common components |
| `src/components/ui/` | Basic UI components (shadcn/ui based) |

### 2.2 Development Standards

- **Page Components**: PascalCase, e.g., `UserManagementPage.tsx`
- **Block Components**: PascalCase, e.g., `DataTable.tsx`
- **Business Components**: PascalCase, e.g., `UserCard.tsx`
- **UI Components**: kebab-case, e.g., `button.tsx`

---

## Part 3: AIRIOT Client Usage Guide

### 3.1 Core Modules Overview

| Module | Description | Main APIs |
|--------|-------------|-----------|
| **API Module** | RESTful API client | `createAPI`, `query`, `get`, `save`, `delete`, `count` |
| **Auth Module** | User authentication | `useLogin`, `useLogout`, `useUser`, `useUserReg` |
| **Form Module** | React Hook Form | `useForm`, `useFieldArray`, `Controller`, `useFieldUIState` |
| **Model Module** | Jotai state management | `Model`, `TableModel`, `useModel*` hooks (20+) |
| **Page Hooks** | Page-level state | `usePageVar`, `useDatasourceValue`, `useDataVarValue` |
| **Subscribe Module** | WebSocket subscriptions | `Subscribe`, `useTag`, `useTableData`, `useSubscribeContext` |
| **Event System** | Event-driven actions | `useEvents`, `useEvent`, `useEventsWithSpread` |
| **Config Module** | Global configuration | `setConfig`, `getConfig`, `getSettings`, `useMessage` |

---

### 3.2 API Module

```typescript
import { createAPI } from '@airiot/client'

const api = createAPI({
  name: 'core/user',        // Required
  resource: 'user',         // Required
  idProp: 'id',
  convertItem: (item) => ({ ...item, fullName: `${item.firstName} ${item.lastName}` }),
  apiMessage: true
})

// Query
const { items, total } = await api.query({ skip: 0, limit: 10 }, { status: { $eq: 'active' } })

// CRUD
const item = await api.get('id')
await api.save({ name: 'John' })
await api.delete('id')
const count = await api.count({ status: { $eq: 'active' } })
```

---

### 3.3 Authentication Module

```typescript
import { useLogin, useUser, useLogout, useUserReg } from '@airiot/client'

// Login
const { onLogin, showCode, showExtra, resetVerifyCode } = useLogin()
await onLogin({ username, password, verifyCode: '123456', remember: true })

// User
const { user, setUser, loadUser, storageKey } = useUser()

// Logout
const { onLogout } = useLogout()

// Register
const { onUserReg } = useUserReg()
await onUserReg({ username, password, email })
```

---

### 3.4 Form Module (React Hook Form)

```typescript
import { useForm, useFieldArray, Controller, useFieldUIState, setFieldVisibility } from '@airiot/client'

const { register, handleSubmit, control, formState: { errors } } = useForm()

const { fields, append, remove } = useFieldArray({ control, name: 'phones' })

<Controller name="field" control={control} render={({ field }) => <input {...field} />} />

const { visible, disabled, loading } = useFieldUIState('fieldName')
setFieldVisibility('fieldName', false)
```

---

### 3.5 Model Module (Jotai State)

```typescript
import { Model, TableModel, useModelList, useModelGet, useModelSave, useModelDelete } from '@airiot/client'

// Static Model
<Model name="user" initialValues={{ archived: true }}>
  <YourComponent />
</Model>

// Dynamic Table Model
<TableModel tableId="device-table" loadingComponent={<div>Loading...</div>}>
  <YourComponent />
</TableModel>

// Hooks
function UserCrud() {
  const { items, loading } = useModelList()
  const { saveItem } = useModelSave()
  const { deleteItem } = useModelDelete()

  return <UserTable data={items} onSave={saveItem} onDelete={deleteItem} />
}
```

---

### 3.6 Page Hooks

```typescript
import {
  usePageVar, usePageVarValue, useSetPageVar,
  useDatasourceValue, useDatasetSet,
  useDataVarValue, useSetDataVar,
  useCellDataValue
} from '@airiot/client'

const [theme, setTheme] = usePageVar('theme')
const data = useDatasourceValue('users')
const nested = useDatasourceValue('users.0.name')
const setDataset = useDatasetSet('users')
const cellValue = useCellDataValue()
```

---

### 3.7 Data Subscription Module

```typescript
import {
  Subscribe,
  useTag, useTagValue, useUpdateTags,
  useTableData, useTableDataValue, useUpdateData,
  useSubscribeContext
} from '@airiot/client'

<Subscribe>
  <YourComponents />
</Subscribe>

// Auto-subscribe
const temperature = useTag({ tableId, dataId, tagId })

// Read-only
const value = useTagValue({ tableId, dataId, tagId })

// Update
const updateTags = useUpdateTags()
updateTags({ 'table|data|tag': { value: 100 } })

// Manual subscription
const { subscribeTags } = useSubscribeContext()
subscribeTags([{ tableId, dataId, tagId }], true)
```

---

### 3.8 Event System

```typescript
import { useEvents, useEvent, useEventsWithSpread } from '@airiot/client'

// Multiple events
const events = useEvents({
  click: [{ type: 'changeVar', params: { var: { count: 1 } } }],
  doubleClick: [{ type: 'pageJump', params: { url: '/detail' } }]
})

<button onClick={events.click}>Click</button>

// Single event
const { handler, loading, error } = useEvent('click', [
  { type: 'changeVar', params: { var: { status: 'active' } } }
])

<button onClick={handler} disabled={loading}>Execute</button>

// Spread events
const events = useEventsWithSpread({
  click: [{ type: 'changeVar', params: { var: { x: 1 } } }]
})

<div {...events}>Spread me</div>
```

---

### 3.9 Configuration Module

```typescript
import { setConfig, getConfig, getSettings, useMessage } from '@airiot/client'

setConfig({ language: 'zh-CN', module: 'admin' })
const config = getConfig()

const message = useMessage()
message.success('Success!')

const settings = await getSettings()  // Requires user context
```

---

## Common Patterns

### Protected Route

```typescript
function ProtectedRoute({ children }) {
  const { user, loading } = useUser()
  if (loading) return <div>Loading...</div>
  if (!user) return <Navigate to="/login" />
  return children
}
```

### CRUD with Model

```typescript
function UserCrud() {
  const { items, loading } = useModelList()
  const { saveItem } = useModelSave()
  const { deleteItem } = useModelDelete()

  return (
    <>
      <UserForm onSave={saveItem} />
      <UserTable data={items} onDelete={deleteItem} />
    </>
  )
}
```

---

## Related Documentation

- [API Module](./api.md) - API module details
- [Auth Module](./auth.md) - Authentication guide
- [Form Module](./form.md) - Form module
- [Model Module](./model.md) - State management
- [Page Hooks](./page-hooks.md) - Page-level hooks
- [Subscribe](./subscribe.md) - Real-time subscriptions
- [Getting Started](./getting-started.md) - Quick start guide
- [Vite Setup](./vite.md) - Project creation guide

---

**Document Version**: v1.2.0
**Last Updated**: 2025-03-21
**Maintained By**: AIRIOT Development Team
