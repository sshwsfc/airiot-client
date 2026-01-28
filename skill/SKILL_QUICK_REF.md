---
name: airiot-client
description: "AIRIOT React TypeScript Client - Complete toolkit with API client (createAPI, CRUD), Authentication (useLogin, useLogout, useUser), JSON Schema Forms (SchemaForm, useForm), Jotai State Management (Model, TableModel, useModel hooks), Page Hooks (usePageVar, useDatasourceValue), Real-time Data Subscription (Subscribe, useDataTag, useTableData), and Config Management (setConfig, useMessage)."
version: "1.0.0"
author: "AIRIOT Team"
---

# AIRIOT Client - Quick Reference

## Overview
Complete React TypeScript library for AIRIOT platform development with API client, authentication, forms, state management, and real-time subscriptions.

## Quick Start

```bash
# Install
npm i @airiot/client

# Basic Usage
import { createAPI, useLogin, SchemaForm, Model, Subscribe } from '@airiot/client'
```

## Module Quick Index

| Module | Key Functions | Use Case |
|--------|--------------|----------|
| **API** | `createAPI`, `query`, `get`, `save`, `delete` | REST API calls |
| **Auth** | `useLogin`, `useLogout`, `useUser` | Authentication |
| **Form** | `SchemaForm`, `Form`, `useForm` | Dynamic forms |
| **Model** | `Model`, `TableModel`, `useModel*` hooks | State management |
| **Page Hooks** | `usePageVar`, `useDatasourceValue` | Page-level state |
| **Subscribe** | `Subscribe`, `useDataTag`, `useTableData` | WebSocket subscriptions |
| **Config** | `setConfig`, `getConfig`, `useMessage` | App configuration |

---

## API Module

### Create API Instance

```typescript
const api = createAPI({
  name: 'core/user',
  resource: 'user',
  convertItem: (item) => ({ ...item, fullName: `${item.firstName} ${item.lastName}` })
})

// Query
const { items, total } = await api.query({ skip: 0, limit: 10 })

// CRUD
const item = await api.get('id')
await api.save({ name: 'John' })
await api.delete('id')
const count = await api.count({ status: { $eq: 'active' } })
```

---

## Auth Module

```typescript
import { useLogin, useUser, useLogout } from '@airiot/client'

function LoginForm() {
  const { onLogin, loading, error } = useLogin()

  const handleLogin = () => onLogin({ username, password, remember: true })

  return <button onClick={handleLogin} disabled={loading}>Login</button>
}

function UserProfile() {
  const { user, logout } = useUser()
  return <div>Welcome {user?.username} <button onClick={logout}>Logout</button></div>
}
```

---

## Form Module

### SchemaForm (JSON Schema)

```typescript
const schema = {
  type: 'object',
  properties: {
    name: { type: 'string', title: 'Name' },
    email: { type: 'string', format: 'email' }
  },
  required: ['name', 'email']
}

<SchemaForm schema={schema} onSubmit={handleSubmit} />
```

### Custom Fields

```typescript
import { setFormFields } from '@airiot/client'
setFormFields({ custom: CustomComponent })
```

---

## Model Module (Jotai State)

### Model Component

```typescript
const model = {
  name: 'user',
  state: { list: [], selected: null },
  operations: {
    query: async () => (await api.query({ skip: 0, limit: 100 })).items
  }
}

<Model model={model}>
  <UserList />
</Model>
```

### Model Hooks

```typescript
import {
  useModelList,
  useModelGet,
  useModelSave,
  useModelDelete,
  useModelCount
} from '@airiot/client'

function UserManagement() {
  const { items, query } = useModelList()
  const { save } = useModelSave()
  const { remove } = useModelDelete()

  useEffect(() => { query() }, [])

  return <UserTable data={items} onSave={save} onDelete={remove} />
}
```

### TableModel (Dynamic Schema)

```typescript
<TableModel tableId="device-table">
  <DataGrid />
</TableModel>
```

---

## Page Hooks

### Page Variables

```typescript
import { usePageVar, usePageVarValue, useSetPageVar } from '@airiot/client'

const [theme, setTheme] = usePageVar('theme')
const language = usePageVarValue('language')

<button onClick={() => setTheme('dark')}>Toggle Theme</button>
```

### Data Source

```typescript
import { useDatasourceValue, useDatasetSet } from '@airiot/client'

const users = useDatasourceValue('users')
const setUsers = useDatasetSet('users')

useEffect(() => {
  fetchUsers().then(setUsers)
}, [])
```

### Component Context

```typescript
import { useDataVarValue, useSetDataVar } from '@airiot/client'

const data = useDataVarValue('chart1')
const setData = useSetDataVar('chart1')

setData({ status: 'ready', data: [] })
```

---

## Subscribe Module (Real-time Data)

### Provider Setup

```typescript
<Subscribe>
  <YourComponents />
</Subscribe>
```

### Auto-subscribe Tags

```typescript
import { useDataTag } from '@airiot/client'

const temperature = useDataTag({
  tableId: 'device-table',
  dataId: 'device-001',
  tagId: 'temperature'
})

<div>Temperature: {temperature?.value}°C</div>
```

### Manual Subscription

```typescript
import { useSubscribeContext, useDataTagValue } from '@airiot/client'

const { subscribeTags } = useSubscribeContext()
const value = useDataTagValue({ tableId, dataId, tagId })

useEffect(() => {
  subscribeTags([{ tableId, dataId, tagId }], true)  // true = clear previous
}, [subscribeTags])
```

### Table Data Subscription

```typescript
import { useTableData } from '@airiot/client'

const name = useTableData({
  field: 'name',
  dataId: 'device-001',
  tableId: 'device-table'
})
```

---

## Config Module

```typescript
import { setConfig, getConfig, useMessage } from '@airiot/client'

// Global config
setConfig({ language: 'zh-CN', module: 'admin' })
const config = getConfig()

// Messages
const message = useMessage()
message.success('Success!')
message.error('Error!')
message.warning('Warning!')
message.info('Info!')
```

---

## Common Patterns

### Protected Routes

```typescript
function ProtectedRoute({ children }) {
  const { user, loading } = useUser()
  if (loading) return <div>Loading...</div>
  if (!user) return <Navigate to="/login" />
  return children
}
```

### CRUD Example

```typescript
function UserManagement() {
  const { items, query } = useModelList()
  const { save } = useModelSave()
  const { remove } = useModelDelete()

  const handleCreate = async (data) => {
    await save(data)
    query()  // Refresh
  }

  const handleDelete = async (id) => {
    await remove(id)
    query()
  }

  return <UserTable data={items} onCreate={handleCreate} onDelete={handleDelete} />
}
```

### Infinite Scroll

```typescript
function InfiniteList() {
  const { items, hasMore, query } = useModelList()

  const loadMore = () => {
    query({ skip: items.length, limit: 20 })
  }

  return (
    <>
      {items.map(item => <div key={item.id}>{item.name}</div>)}
      {hasMore && <button onClick={loadMore}>Load More</button>}
    </>
  )
}
```

---

## Best Practices

1. **Type Safety**: Always use TypeScript and define interfaces
2. **Error Handling**: Wrap async calls in try-catch
3. **Performance**: Use useCallback/useMemo for expensive operations
4. **Provider Pattern**: Always use Model/Subscribe providers for their hooks
5. **Clean Code**: Separate concerns (API, state, UI)

---

## Troubleshooting

**Q: API requests failing?**
- Check `apiMessage: true` in createAPI options
- Verify network requests in browser DevTools

**Q: Form validation not working?**
- Ensure `required` array in JSON Schema
- Check validation rules (format, minimum, etc.)

**Q: Model state not updating?**
- Ensure hooks are used inside Provider
- Check operations are properly defined

**Q: Subscription not updating?**
- Verify Subscribe Provider wraps components
- Check WebSocket connection in DevTools

---

## Full Documentation

See `/docs` directory for complete documentation:
- [api.md](./api.md) - API module details
- [auth.md](./auth.md) - Authentication guide
- [form.md](./form.md) - Form module
- [model.md](./model.md) - State management
- [page-hooks.md](./page-hooks.md) - Page-level hooks
- [subscribe.md](./subscribe.md) - Real-time subscriptions
- [getting-started.md](./getting-started.md) - Quick start guide

---

## Dependencies

```json
{
  "@airiot/client": "latest",
  "react": "^19.0.0",
  "react-dom": "^19.0.0",
  "react-router-dom": "^7.12.0",
  "jotai": "^2.7.0"
}
```

## Environment Variables

```bash
# .env.local
AIRIOT_API_TARGET=http://localhost:8080/
AIRIOT_API_PORT=3000
VITE_DEV=true
```

---

**Version**: 1.0.0
**Last Updated**: 2025-01-24
