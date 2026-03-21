---
name: airiot-client
description: "AIRIOT React TypeScript Client - Complete toolkit with API client (createAPI, CRUD), Authentication (useLogin, useLogout, useUser), Form Hooks (useForm, Controller, useFieldArray), Jotai State Management (Model, TableModel, useModel hooks), Page Hooks (usePageVar, useDatasourceValue, useDataVarValue), Real-time Data Subscription (Subscribe, useTag, useTableData), Event System (useEvents, useEvent), and Config Management (setConfig, useMessage)."
version: "1.1.0"
author: "AIRIOT Team"
---

# AIRIOT Client - Quick Reference

## Overview
Complete React TypeScript library for AIRIOT platform development with API client, authentication, form hooks, state management, real-time subscriptions, and event system.

## Quick Start

```bash
# Install
npm i @airiot/client

# Basic Usage
import { createAPI, useLogin, useForm, Model, Subscribe, useEvents } from '@airiot/client'
```

## Module Quick Index

| Module | Key Functions | Use Case |
|--------|--------------|----------|
| **API** | `createAPI`, `query`, `get`, `save`, `delete`, `count` | REST API calls |
| **Auth** | `useLogin`, `useLogout`, `useUser`, `useUserReg` | Authentication |
| **Form** | `useForm`, `useFieldArray`, `Controller`, `useFieldUIState` | React Hook Form |
| **Model** | `Model`, `TableModel`, `useModel*` hooks (20+ hooks) | State management |
| **Page Hooks** | `usePageVar`, `useDatasourceValue`, `useDataVarValue` | Page-level state |
| **Subscribe** | `Subscribe`, `useTag`, `useTableData`, `useSubscribeContext` | WebSocket subscriptions |
| **Event** | `useEvents`, `useEvent`, `useEventsWithSpread` | Event-driven actions |
| **Config** | `setConfig`, `getConfig`, `useMessage`, `getSettings` | App configuration |

---

## API Module

### Create API Instance

```typescript
const api = createAPI({
  name: 'core/user',           // Required
  resource: 'user',            // Required
  headers: {},
  idProp: 'id',                // or ['field1', 'field2'] for composite
  convertItem: (item) => ({ ...item, fullName: `${item.firstName} ${item.lastName}` }),
  apiMessage: true,
  properties: {}               // Schema properties for query conversion
})
```

### API Methods

| Method | Signature | Description |
|--------|-----------|-------------|
| `query()` | `query(filter?, wheres?, withCount?)` | Query with pagination |
| `get()` | `get(id, options?)` | Get single item |
| `save()` | `save(data, partial?)` | Create/update |
| `delete()` | `delete(id\|ids)` | Delete item(s) |
| `count()` | `count(wheres?)` | Count items |
| `fetch()` | `fetch(uri, options?)` | Custom request |

### Query Examples

```typescript
// Pagination & sorting
const { items, total } = await api.query(
  { skip: 0, limit: 10, order: { createdAt: 'DESC' } }
)

// Where conditions
const { items } = await api.query(
  { skip: 0, limit: 20 },
  { status: { $eq: 'active' }, age: { $gte: 18 } }
)

// Field projection
const { items } = await api.query({
  skip: 0, limit: 10,
  fields: ['id', 'name', 'email']
})

// Operators: $eq, $ne, $gt, $gte, $lt, $lte, $regex, $in, $nin, $and, $or
```

---

## Auth Module

### useLogin()

```typescript
const { onLogin, showCode, showExtra, resetVerifyCode } = useLogin()

await onLogin({
  username: 'admin',
  password: 'password123',
  verifyCode: '123456',  // Required if showCode is true
  remember: true         // Use localStorage instead of sessionStorage
})
```

### useUser()

```typescript
const { user, setUser, loadUser, storageKey } = useUser()

// user: { id, username, name, email, token, isSuper, permissions, isFirstLogin }
loadUser()  // Load from localStorage/sessionStorage
```

### useLogout()

```typescript
const { onLogout } = useLogout()
await onLogout()  // Logout and clear storage
```

### useUserReg()

```typescript
const { onUserReg } = useUserReg()

await onUserReg({
  username: 'newuser',
  password: 'password123',
  email: 'user@example.com'
})
```

---

## Form Module (React Hook Form)

### useForm()

```typescript
const { register, handleSubmit, control, formState: { errors } } = useForm({
  defaultValues: { name: '', email: '' }
})

<form onSubmit={handleSubmit(data => console.log(data))}>
  <input {...register('name', { required: 'Name required' })} />
  {errors.name && <span>{errors.name.message}</span>}
</form>
```

### useFieldArray()

```typescript
const { fields, append, remove } = useFieldArray({
  control,
  name: 'phoneNumbers'
})

{fields.map((field, i) => (
  <div key={field.id}>
    <input {...register(`phoneNumbers.${i}.number`)} />
    <button onClick={() => remove(i)}>Remove</button>
  </div>
))}
<button onClick={() => append({ number: '' })}>Add</button>
```

### Controller

```typescript
<Controller
  name="fieldName"
  control={control}
  render={({ field }) => <CustomInput {...field} />}
/>
```

### Field State

```typescript
import { useFieldUIState, setFieldVisibility, setFieldDisabled, setFieldLoading } from '@airiot/client'

const { visible, disabled, loading } = useFieldUIState('fieldName')
setFieldVisibility('fieldName', false)
setFieldDisabled('fieldName', true)
setFieldLoading('fieldName', true)
```

---

## Model Module (Jotai State)

### Components

```typescript
// Static Model
<Model name="user" initialValues={{ archived: true }}>
  <YourComponent />
</Model>

// Dynamic Table Model
<TableModel
  tableId="device-table"
  loadingComponent={<div>Loading...</div>}
  initQuery={{ skip: 0, limit: 20 }}
>
  <YourComponent />
</TableModel>
```

### Essential Hooks

| Hook | Returns | Use For |
|------|---------|---------|
| `useModelList()` | `{items, loading, fields, selected}` | List with auto-load |
| `useModelGet({id})` | `{data, loading, model, title}` | Get single item |
| `useModelSave()` | `{saveItem}` | Save item |
| `useModelDelete({id})` | `{deleteItem}` | Delete item |
| `useModelGetItems()` | `{getItems}` | Manual query |
| `useModelPermission()` | `{canAdd, canEdit, canDelete}` | Permissions |
| `useModelPagination()` | `{items, activePage, changePage}` | Pagination |
| `useModelCount()` | `{count}` | Total count |

### Advanced Hooks

| Hook | Description |
|------|-------------|
| `useModelValue(atom)` | Get atom value |
| `useModelState(atom)` | Get/set atom state |
| `useSetModelState(atom)` | Set atom value |
| `useModelCallback(fn)` | Atom callback |
| `useModelItem({id})` | Combined get/save/delete |
| `useModelQuery()` | Simple query |
| `useModelEvent()` | Model events |
| `useModelPageSize()` | Page size controls |
| `useModelFields()` | Field display controls |
| `useModelSelect()` | Selection management |
| `useModelListRow({id})` | Row state |
| `useModelListHeader({field})` | Header title |
| `useModelListOrder({field})` | Column sorting |
| `useModelListItem({field, item})` | Cell data |

### CRUD Pattern

```typescript
function UserCrud() {
  const { items, loading } = useModelList()
  const { saveItem } = useModelSave()
  const { deleteItem } = useModelDelete()

  const handleSave = async (data) => {
    await saveItem(data)  // Auto-updates list
  }

  const handleDelete = async (id) => {
    await deleteItem(id)  // Auto-refreshes list
  }

  return (
    <>
      <UserForm onSave={handleSave} />
      <UserTable data={items} onDelete={handleDelete} loading={loading} />
    </>
  )
}
```

---

## Page Hooks

### Page Variables

```typescript
import { usePageVar, usePageVarValue, useSetPageVar } from '@airiot/client'

const [theme, setTheme] = usePageVar('theme')
const language = usePageVarValue('language')
const setVar = useSetPageVar('some.path')
```

### Datasource

```typescript
import { useDatasourceValue, useDatasetSet, useDatasetsValue } from '@airiot/client'

const data = useDatasourceValue('users')
const nested = useDatasourceValue('users.0.name')  // Nested path
const setDataset = useDatasetSet('users')
const datasets = useDatasetsValue(['ds1', 'ds2'])
```

### Data Variables (Cell Context)

```typescript
import { useDataVarValue, useSetDataVar, useCellDataValue } from '@airiot/client'

const value = useDataVarValue('varName')
const setValue = useSetDataVar('varName')
const cellData = useCellDataValue()  // Get table cell context
```

---

## Subscribe Module (Real-time)

### Provider Setup

```typescript
<Subscribe>
  <YourComponents />
</Subscribe>
```

### Tag Subscription

```typescript
import { useTag, useTagValue, useUpdateTags } from '@airiot/client'

// Auto-subscribe
const temperature = useTag({
  tableId: 'device-table',
  dataId: 'device-001',
  tagId: 'temperature'
})

// Read-only
const value = useTagValue({ tableId, dataId, tagId })

// Update tags
const updateTags = useUpdateTags()
updateTags({
  'table|data|tag': { value: 100, quality: 'good' }
})
```

### Table Data Subscription

```typescript
import { useTableData, useTableDataValue, useUpdateData } from '@airiot/client'

// Auto-subscribe
const name = useTableData({
  tableId: 'device-table',
  dataId: 'device-001',
  field: 'name'
})

// Read-only
const value = useTableDataValue({ tableId, dataId, field })

// Update data
const updateData = useUpdateData()
updateData({
  'table|data': { name: 'Updated' }
})
```

### Manual Subscription

```typescript
import { useSubscribeContext } from '@airiot/client'

const { subscribeTags, subscribeData } = useSubscribeContext()

useEffect(() => {
  subscribeTags([{ tableId, dataId, tagId }], true)  // true = clear previous
  subscribeData([{ tableId, dataId, fields: ['f1', 'f2'] }], true)
}, [])
```

---

## Event System

### useEvents()

```typescript
import { useEvents } from '@airiot/client'

const events = useEvents({
  click: [
    { type: 'changeVar', params: { var: { counter: 1 } } },
    { type: 'pageJump', params: { url: '/detail' } }
  ],
  doubleClick: [
    { type: 'sendRequest', params: { url: '/api/action' } }
  ]
})

<button onClick={events.click} onDoubleClick={events.doubleClick}>
  Click Me
</button>
```

### useEvent()

```typescript
const { handler, loading, error } = useEvent('click', [
  {
    type: 'changeVar',
    params: { var: { status: 'active' } },
    confirm: { title: 'Confirm', message: 'Are you sure?' }
  }
])

<button onClick={handler} disabled={loading}>
  {loading ? 'Processing...' : 'Execute'}
</button>
```

### useEventsWithSpread()

```typescript
const events = useEventsWithSpread({
  click: [{ type: 'changeVar', params: { var: { x: 1 } } }],
  mouseEnter: [{ type: 'changeVar', params: { var: { hover: true } } }]
})

<div {...events}>Events spread directly</div>
```

### Action Types

| Type | Description |
|------|-------------|
| `pageJump` | Navigate to page |
| `changeVar` | Modify page variables |
| `changeTableData` | Modify table data |
| `changeDict` | Modify dictionary |
| `changeDataPoint` | Modify data point |
| `changeSystemSetting` | Modify settings |
| `changeUser` | Modify user |
| `callFlow` | Call workflow |
| `executeCommand` | Execute command |
| `sendRequest` | Send HTTP request |

### Action Structure

```typescript
{
  type: ActionType,
  params: any,
  confirm?: { title?, message?, confirmText?, cancelText? },
  delay?: number  // ms
}
```

---

## Config Module

### Global Config

```typescript
import { setConfig, getConfig } from '@airiot/client'

setConfig({
  rest: '/api/',
  projectId: 'project-id',
  language: 'zh-CN',
  module: 'admin'
})

const config = getConfig()
```

### Toast Messages

```typescript
import { useMessage } from '@airiot/client'

const message = useMessage()

message.success('Success!')
message.error('Error!')
message.warning('Warning!')
message.info('Info!')
```

### Server Settings

```typescript
import { getSettings } from '@airiot/client'

const settings = await getSettings()
// Requires user context (call after useUser)
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

### Infinite Scroll

```typescript
function InfiniteList() {
  const { items, loading } = useModelList()
  const { getItems } = useModelGetItems()
  const [page, setPage] = useState(0)

  const loadMore = async () => {
    const nextPage = page + 1
    await getItems({ option: { skip: nextPage * 20, limit: 20 } })
    setPage(nextPage)
  }

  return (
    <>
      {items.map(item => <div key={item.id}>{item.name}</div>)}
      <button onClick={loadMore} disabled={loading}>Load More</button>
    </>
  )
}
```

### Form with Validation

```typescript
function ValidatedForm() {
  const { register, handleSubmit, formState: { errors } } = useForm()

  return (
    <form onSubmit={handleSubmit(data => saveItem(data))}>
      <input
        {...register('email', {
          required: 'Email required',
          pattern: {
            value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
            message: 'Invalid email'
          }
        })}
      />
      {errors.email && <span>{errors.email.message}</span>}
      <button type="submit">Submit</button>
    </form>
  )
}
```

---

## Best Practices

1. **Provider Pattern**: Always wrap components with required providers
   ```typescript
   <Subscribe>
     <Model name="user">
       <YourComponent />
     </Model>
   </Subscribe>
   ```

2. **Type Safety**: Define interfaces for data types
   ```typescript
   interface User { id: string; name: string }
   const api = createAPI<User>({ ... })
   ```

3. **Error Handling**: Wrap async calls
   ```typescript
   try {
     await saveItem(data)
   } catch (err) {
     message.error(err?.formError || 'Save failed')
   }
   ```

4. **Performance**: Use hooks appropriately
   - `useModelList` for auto-loading lists
   - `useModelGetItems` for manual queries
   - `useTag` for auto-subscription

---

## Troubleshooting

**Q: API requests failing?**
- Check user is authenticated: `const { user } = useUser()`
- Enable API messages: `apiMessage: true` in createAPI

**Q: Model hooks error?**
- Ensure component is inside `<Model>` provider

**Q: Subscription not updating?**
- Ensure `<Subscribe>` provider wraps component
- Check WebSocket connection

**Q: Form validation not working?**
- Use proper validation rules in register()
- Check formState errors object

---

## Dependencies

```json
{
  "@airiot/client": "latest",
  "react": "^19.0.0",
  "react-dom": "^19.0.0",
  "react-router-dom": "^7.12.0",
  "jotai": "^2.7.0",
  "react-hook-form": "^7.x"
}
```

---

## Full Documentation

See `/docs` directory for complete documentation:
- [api.md](../docs/api.md) - API module details
- [auth.md](../docs/auth.md) - Authentication guide
- [form.md](../docs/form.md) - Form module
- [model.md](../docs/model.md) - State management
- [page-hooks.md](../docs/page-hooks.md) - Page-level hooks
- [subscribe.md](../docs/subscribe.md) - Real-time subscriptions
- [getting-started.md](../docs/getting-started.md) - Quick start guide

---

**Version**: 1.1.0
**Last Updated**: 2025-03-21
