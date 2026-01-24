---
name: airiot
description: "Complete guide for @airiot/client library - React TypeScript client with API, auth, forms, and Jotai-based state management. Actions: implement, create, build, integrate, setup. Modules: API client (createAPI, query, save, delete), Auth (useLogin, useLogout, useUser, useUserReg), Form (SchemaForm, Form, FieldArray), Model (useModel hooks, Jotai atoms, Model, TableModel), Config (setConfig, getConfig). Patterns: CRUD, form validation, authenticated requests, custom fields, infinite scroll, dynamic table models."
---

# AIRIOT Client Library Guide

Complete documentation for the `@airiot/client` React TypeScript library providing API client, authentication, JSON Schema forms, and Jotai-based state management.

## Prerequisites

**Peer Dependencies Check:**

```bash
# Check if required packages are installed
npm list react react-dom react-router-dom jotai
```

If not installed:

```bash
npm install react@^19.0.0 react-dom@^19.0.0 react-router-dom@^7.12.0 jotai@^2.7.0
```

**Environment Variables (optional):**

```bash
# .env.local
AIRIOT_API_TARGET=http://localhost:8080/
AIRIOT_API_PORT=3000
```

---

## How to Use This Skill

When user requests work with @airiot/client (implement, create, integrate, setup), follow this workflow:

### Step 1: Identify the Module

Determine which module the user needs:
- **API Module** - RESTful API operations (query, get, save, delete)
- **Auth Module** - Login, logout, user registration, session management
- **Form Module** - JSON Schema forms with validation
- **Model Module** - Jotai-based state management with hooks
- **Config Module** - Global configuration and settings

### Step 2: Search Reference

Use this document as a searchable reference:

| Module | Key Functions | Use Cases |
|--------|--------------|-----------|
| API | `createAPI`, `query`, `get`, `save`, `delete`, `count` | CRUD operations, custom queries |
| Auth | `useLogin`, `useLogout`, `useUser`, `useUserReg` | Authentication flow |
| Form | `SchemaForm`, `Form`, `FieldArray`, `setFormFields`, `setSchemaConverters` | Dynamic forms, validation, custom fields |
| Model | `Model`, `TableModel`, `useModelList`, `useModelGet`, `useModelSave`, `useModelDelete` | State management, dynamic table schemas |
| Config | `setConfig`, `getConfig`, `getSettings`, `useMessage` | App configuration |

### Step 3: Implement Pattern

Select the appropriate pattern from the "Common Patterns" section below and adapt to user's needs.

---

## API Module

### Core Function: `createAPI`

```typescript
import { createAPI } from '@airiot/client'

const api = createAPI({
  name: 'core/user',        // API name
  resource: 'user',         // Resource path
  headers: {},              // Custom request headers
  idProp: 'id',             // ID field name
  convertItem: (item) => ({ ...item, fullName: `${item.firstName} ${item.lastName}` }),
  queryParams: {},          // Default query params
  projectAll: false,        // Return all fields
  projectFields: [],        // Fields to return
  customQuery: async (api, filter, wheres, convertItem) => { /* Custom query */ },
  apiMessage: true,         // Show API messages
  properties: {}            // Field property definitions
})
```

### API Methods

```typescript
// Query data
const { items, total } = await api.query(
  { skip: 0, limit: 10, order: { createdAt: 'DESC' } },  // Query options
  { status: { $eq: 'active' } },                          // Where conditions
  true                                                     // Return total count
)

// Get single item
const user = await api.get('user123')

// Get raw response
const { json, headers } = await api.getOrigin('user123')

// Delete item
await api.delete('user123')

// Save (create or update)
const saved = await api.save({ username: 'john', email: 'john@example.com' })
const updated = await api.save({ id: 'user123', username: 'John' }, true) // true = partial update

// Count
const count = await api.count({ status: 'active' })

// Raw fetch request
const { json, headers } = await api.fetch('/custom-endpoint', {
  method: 'POST',
  body: JSON.stringify({ data: 'value' }),
  headers: { 'Custom-Header': 'value' }
})
```

### Query Options Interface

```typescript
interface QueryOptions {
  order?: { [field: string]: 'ASC' | 'DESC' }  // Sorting
  skip?: number                                 // Skip count
  limit?: number                                // Limit count
  groupBy?: string                              // Group by field
  fields?: string[]                             // Return fields
  [key: string]: any
}
```

### Where Condition Operators

```typescript
// Comparison
{ age: { $gte: 18, $lte: 65 } }
{ price: { $gt: 100 } }

// Logical
{ $and: [{ status: 'active' }, { age: { $gte: 18 } }] }
{ $or: [{ type: 'A' }, { type: 'B' }] }

// Inclusion
{ tags: { $in: ['tag1', 'tag2'] } }
{ category: { $nin: ['archived'] } }

// Regex
{ name: { $regex: '^John' } }

// Null check
{ deletedAt: { $ne: null } }
```

---

## Auth Module

### useUser Hook

```typescript
import { useUser } from '@airiot/client'

function UserProfile() {
  const { user, setUser, storageKey, loadUser } = useUser()

  // user - Current user object
  // setUser - Set user info
  // storageKey - localStorage key name
  // loadUser - Load user from localStorage (7 day expiry)

  useEffect(() => {
    loadUser() // Load user on app start
  }, [])

  return <div>Welcome, {user?.username}</div>
}
```

### useLogin Hook

```typescript
import { useLogin } from '@airiot/client'

function LoginForm() {
  const { showCode, resetVerifyCode, onLogin } = useLogin()

  const handleLogin = async (values) => {
    try {
      const result = await onLogin({
        username: values.username,
        password: values.password,       // Auto SHA1 encrypted
        verifyCode: values.verifyCode,   // Required when showCode=true
        remember: values.remember        // true=localStorage, false=sessionStorage
      })
      // result: { needChangePwd, password, id, username }
      console.log('Login success:', result)
    } catch (error) {
      // error.json contains form validation errors
      // error.status: 400=validation failed, 451=verify code needed
      console.error('Login failed:', error)
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <input name="username" />
      <input name="password" type="password" />
      {showCode && <input name="verifyCode" />}
      <label><input name="remember" type="checkbox" />Remember me</label>
    </form>
  )
}
```

### useLogout Hook

```typescript
import { useLogout } from '@airiot/client'

function LogoutButton() {
  const { onLogout } = useLogout()

  const handleLogout = () => {
    onLogout() // Clears user info from localStorage/sessionStorage
  }

  return <button onClick={handleLogout}>Logout</button>
}
```

### useUserReg Hook

```typescript
import { useUserReg } from '@airiot/client'

function RegisterForm() {
  const { onUserReg } = useUserReg()

  const handleRegister = async (values) => {
    try {
      await onUserReg(values)
      // Password auto SHA1 encrypted
      // Auto redirect to login page on success
    } catch (error) {
      console.error('Registration failed:', error)
    }
  }

  return <form onSubmit={handleRegister}>...</form>
}
```

---

## Form Module

### SchemaForm Component

JSON Schema based form component with automatic validation.

```typescript
import { SchemaForm } from '@airiot/client'

const userSchema = {
  type: 'object',
  properties: {
    username: {
      type: 'string',
      title: 'Username',
      minLength: 3,
      maxLength: 20
    },
    email: {
      type: 'string',
      title: 'Email',
      format: 'email'
    },
    age: {
      type: 'integer',
      title: 'Age',
      minimum: 0,
      maximum: 120
    },
    status: {
      type: 'string',
      title: 'Status',
      enum: ['active', 'inactive', 'pending'],
      enumNames: ['Active', 'Inactive', 'Pending']
    }
  },
  required: ['username', 'email']
}

function UserForm() {
  const handleSubmit = async (values, form) => {
    console.log('Form values:', values)
    // Values are validated
  }

  return (
    <SchemaForm
      schema={userSchema}
      onSubmit={handleSubmit}
      initialValues={{ status: 'active' }}
      validate={(values) => {
        // Custom validation
        const errors = {}
        if (values.password !== values.confirmPassword) {
          errors.confirmPassword = 'Passwords do not match'
        }
        return errors
      }}
    />
  )
}
```

### Form Component

Generic form component requiring manual field definition.

```typescript
import { Form } from '@airiot/client'

const userFormFields = [
  { name: 'username', label: 'Username', type: 'text', required: true },
  { name: 'email', label: 'Email', type: 'text', required: true },
  { name: 'age', label: 'Age', type: 'number' }
]

function MyForm() {
  return (
    <Form
      fields={userFormFields}
      onSubmit={handleSubmit}
      initialValues={{}}
      group={FieldGroup}  // Custom field grouping component
    >
      {({ children, invalid, handleSubmit, submitting }) => (
        <form onSubmit={handleSubmit}>
          {children}
          <button type="submit" disabled={invalid || submitting}>
            Save
          </button>
        </form>
      )}
    </Form>
  )
}
```

### Custom Field Renderer

```typescript
import { setFormFields } from '@airiot/client'

// Globally register custom field components
setFormFields({
  text: {
    component: CustomInput,
    parse: (value) => value === '' ? null : value,
    attrs: { className: 'custom-input' }
  },
  number: {
    component: CustomNumberInput,
    parse: (value) => value === '' ? null : parseFloat(value),
    attrs: { type: 'number', style: { maxWidth: 200 } }
  },
  select: {
    component: CustomSelect,
    parse: (value) => value
  }
})
```

### Custom Schema Converter

```typescript
import { setSchemaConverters } from '@airiot/client'

setSchemaConverters([
  // Custom converters execute in order
  (field, schema, options) => {
    if (schema.custom) {
      field.type = 'custom-component'
      field.customProp = schema.customValue
    }
    return field
  }
])
```

### FieldArray

Dynamic array field component.

```typescript
import { SchemaForm, FieldArray } from '@airiot/client'

const schema = {
  type: 'object',
  properties: {
    items: {
      type: 'array',
      title: 'Items',
      items: {
        type: 'object',
        properties: {
          name: { type: 'string', title: 'Name' },
          price: { type: 'number', title: 'Price' }
        }
      }
    }
  }
}

function DynamicForm() {
  return (
    <SchemaForm schema={schema} onSubmit={handleSubmit}>
      {({ form }) => (
        <FieldArray name="items">
          {({ fields }) => (
            <div>
              {fields.map((field, index) => (
                <div key={field.key}>
                  <input name={`items.${index}.name`} />
                  <input name={`items.${index}.price`} type="number" />
                  <button onClick={() => fields.remove(index)}>Remove</button>
                </div>
              ))}
              <button onClick={() => fields.push({})}>Add Item</button>
            </div>
          )}
        </FieldArray>
      )}
    </SchemaForm>
  )
}
```

---

## Model Module

### Model Component

Model context provider for data and state management.

```typescript
import { Model } from '@airiot/client'

const userModel = {
  name: 'user',
  title: 'User',
  key: 'user-list',
  permission: {
    view: true,
    add: true,
    edit: true,
    delete: true
  },
  defaultValue: () => ({ status: 'active' }),
  initialValues: {
    option: { skip: 0, limit: 15 }
  },
  listFields: ['username', 'email', 'status'],
  defaultOrder: { createdAt: 'DESC' },
  defaultPageSize: 15,
  properties: {
    username: { type: 'string', title: 'Username' },
    email: { type: 'string', title: 'Email' },
    status: { type: 'string', title: 'Status' }
  },
  atoms: modelAtoms  // Optional custom atoms
}

function UserApp() {
  return (
    <Model name="user" modelKey="user-list" initialValues={initialValues}>
      <UserList />
    </Model>
  )
}
```

### TableModel Component

Dynamic model component that fetches table schema from the server and creates a Model context.

```typescript
import { TableModel } from '@airiot/client'

function DynamicTablePage({ tableId }) {
  return (
    <TableModel
      tableId={tableId}
      loadingComponent={<Spinner />}
    >
      <UserList />
    </TableModel>
  )
}
```

**Props:**

- `tableId` (required) - Table schema ID from `core/t/schema`
- `loadingComponent` - Custom loading component while fetching schema
- All other props are passed through to the underlying `Model` component

**Behavior:**

1. Fetches table schema from `core/t/schema/{tableId}`
2. Fetches table tags from `core/t/schema/tag/{tableId}`
3. Creates a `Model` context with the fetched schema
4. Shows loading component until schema is loaded

**Use Cases:**

- Dynamic table management from server configuration
- Multi-tenant applications with per-tenant table schemas
- Admin panels for managing dynamic data models
- Applications requiring runtime schema changes

**Example with full CRUD:**

```typescript
function DynamicTableApp({ tableId }) {
  return (
    <TableModel tableId={tableId} loadingComponent={<LoadingSpinner />}>
      <DynamicTableList />
    </TableModel>
  )
}

function DynamicTableList() {
  const { items, loading } = useModelList()
  const { model } = useModel()

  return (
    <div>
      <h1>{model.title}</h1>
      {loading ? (
        <Spinner />
      ) : (
        <Table data={items} />
      )}
    </div>
  )
}
```

### Core Model Hooks

```typescript
// Basic hooks
import {
  useModel,              // Get model context
  useModelValue,         // Read atom value
  useModelState,         // Read/write atom value
  useSetModelState,      // Write atom value
  useModelCallback       // Atom callback
} from '@airiot/client'

// Data operation hooks
import {
  useModelGet,           // Get single item
  useModelSave,          // Save item
  useModelDelete,        // Delete item
  useModelGetItems,      // Get list items
  useModelItem           // Combined hook (get + save + delete)
} from '@airiot/client'

// UI hooks
import {
  useModelList,          // List data
  useModelPagination,    // Pagination
  useModelPageSize,      // Page size
  useModelFields,        // Display fields
  useModelSelect         // Selection
} from '@airiot/client'
```

### Hook Usage Examples

```typescript
// 1. useModelList - List data
function UserList() {
  const { items, loading, fields, selected } = useModelList()
  return <Table data={items} columns={fields} />
}

// 2. useModelPagination - Pagination
function Pagination() {
  const { items, activePage, changePage } = useModelPagination()
  return (
    <Pagination>
      <PaginationContent>
        {Array.from({ length: items }).map((_, i) => (
          <PaginationItem key={i} active={activePage === i + 1}>
            <PaginationLink onClick={() => changePage(i + 1)}>
              {i + 1}
            </PaginationLink>
          </PaginationItem>
        ))}
      </PaginationContent>
    </Pagination>
  )
}

// 3. useModelGet + useModelSave - Get and save
function UserEdit({ id }) {
  const { model, title, data, loading } = useModelGet({ id })
  const { saveItem } = useModelSave()

  const handleSubmit = async (values) => {
    await saveItem(values)
    // Auto updates list and selected item
  }

  if (loading) return <Spinner />
  return <UserForm data={data} title={title} onSubmit={handleSubmit} />
}

// 4. useModelDelete - Delete
function UserDeleteButton({ id }) {
  const { deleteItem } = useModelDelete({ id })

  const handleDelete = async () => {
    if (confirm('Confirm delete?')) {
      await deleteItem(id)
      // Auto refreshes list
    }
  }

  return <button onClick={handleDelete}>Delete</button>
}
```

### Model Atoms Type

```typescript
interface ModelAtoms {
  ids: Atom<string[]>                          // All data IDs
  item: (id: string) => Atom<any>             // Single item atom
  items: Atom<any[]>                           // Data list atom
  count: Atom<number>                          // Total count atom
  selected: Atom<any[]>                        // Selected items
  option: Atom<any>                            // Query options
  optionSelector: (key: string) => Atom<any>  // Option selector
  fields: Atom<string[]>                       // Display fields
  order: Atom<any>                             // Sort order
  limit: Atom<number>                          // Items per page
  skip: Atom<number>                           // Skip count
  wheres: Atom<any>                            // Where conditions
  where: (id: string) => Atom<any>             // Single where condition
  loading: (key: string) => Atom<boolean>      // Loading state
  itemSelected: (id: string) => Atom<boolean> // Item selected state
  allSelected: Atom<boolean>                   // Select all state
  itemOrder: (field: string) => Atom<string>  // Field sort order
}
```

---

## Config Module

```typescript
import { getConfig, setConfig } from '@airiot/client'
import { getSettings, useMessage } from '@airiot/client'

// Set global config
setConfig({
  user: { token: 'xxx', id: 'user123' },
  language: 'zh-CN',
  rest: 'http://api.example.com/',
  projectId: 'project-123',
  toast: {
    info: (msg) => toast.info(msg),
    success: (msg) => toast.success(msg),
    error: (msg) => toast.error(msg),
    warning: (msg) => toast.warning(msg)
  }
})

// Get config
const config = getConfig()

// Get server settings
const settings = await getSettings()

// Use message notifications
function MyComponent() {
  const message = useMessage()
  message.info('Info')
  message.success('Success')
  message.error('Error')
  message.warning('Warning')
}
```

---

## Common Patterns

### Pattern 1: Full CRUD Flow

```typescript
import {
  Model,
  useModelList,
  useModelGet,
  useModelSave,
  useModelDelete,
  useModelPagination
} from '@airiot/client'

// 1. Define model
const userModel = {
  name: 'user',
  title: 'User',
  properties: {
    username: { type: 'string', title: 'Username' },
    email: { type: 'string', title: 'Email' }
  }
}

// 2. Create app
function UserApp() {
  return (
    <Model name="user">
      <UserList />
    </Model>
  )
}

// 3. List page
function UserList() {
  const { items, loading } = useModelList()
  const { items: pageCount, activePage, changePage } = useModelPagination()

  return (
    <div>
      <Table data={items} loading={loading} />
      <Pagination items={pageCount} activePage={activePage} onChange={changePage} />
    </div>
  )
}

// 4. Create/Edit page
function UserFormPage({ id }) {
  const { model, data, loading } = useModelGet({ id })
  const { saveItem } = useModelSave()

  if (loading) return <Spinner />

  return (
    <Form
      initialValues={data}
      onSubmit={async (values) => {
        await saveItem(values)
        navigate('/users')
      }}
    />
  )
}

// 5. Delete operation
function DeleteButton({ id }) {
  const { deleteItem } = useModelDelete({ id })

  return (
    <button onClick={async () => {
      if (confirm('Confirm delete?')) {
        await deleteItem()
      }
    }}>
      Delete
    </button>
  )
}
```

### Pattern 2: Form Validation

```typescript
import { SchemaForm, setSchemaConverters } from '@airiot/client'

// Custom validation rules
setSchemaConverters([
  (field, schema) => {
    // Add custom validation
    if (schema.unique) {
      field.validate = async (value, allValues) => {
        const exists = await checkUnique(field.name, value)
        return exists ? 'Value already exists' : undefined
      }
    }
    return field
  }
])

// Use SchemaForm
function MyForm() {
  const schema = {
    type: 'object',
    properties: {
      email: {
        type: 'string',
        format: 'email',
        title: 'Email',
        unique: true  // Custom property
      }
    },
    required: ['email']
  }

  return (
    <SchemaForm
      schema={schema}
      onSubmit={handleSubmit}
      validate={(values) => {
        // Additional cross-field validation
        const errors = {}
        if (values.password !== values.confirmPassword) {
          errors.confirmPassword = 'Passwords do not match'
        }
        return errors
      }}
    />
  )
}
```

### Pattern 3: Authenticated Requests

```typescript
import { createAPI, useUser, getConfig } from '@airiot/client'

// API auto gets token from config
const api = createAPI({
  name: 'core/user',
  resource: 'user'
})

function UserProfile() {
  const { user, loadUser } = useUser()

  useEffect(() => {
    loadUser() // Load logged in user
  }, [])

  const fetchProfile = async () => {
    // Request auto includes Authorization header
    const data = await api.get(user.id)
    return data
  }

  return <div>{user?.username}</div>
}
```

### Pattern 4: Infinite Scroll

```typescript
function InfiniteList() {
  const { getItems } = useModelGetItems()
  const [skip, setSkip] = useModelState('skip')
  const limit = useModelValue('limit')
  const items = useModelValue('items')

  const loadMore = async () => {
    await getItems({ skip: skip + limit })
    setSkip(skip + limit)
  }

  return (
    <InfiniteScroll loadMore={loadMore}>
      {items.map(item => <UserCard key={item.id} data={item} />)}
    </InfiniteScroll>
  )
}
```

### Pattern 5: Dynamic Table Model

```typescript
import { TableModel, useModelList, useModel } from '@airiot/client'

// For dynamic tables where schema is stored on the server
function DynamicTableCRUD({ tableId }) {
  return (
    <TableModel
      tableId={tableId}
      loadingComponent={<TableSkeleton />}
    >
      <DynamicTableList />
    </TableModel>
  )
}

// Full CRUD with dynamic schema
function DynamicTableList() {
  const { items, loading } = useModelList()
  const { model, title } = useModel()
  const { saveItem } = useModelSave()
  const { deleteItem } = useModelDelete()

  if (loading) return <TableSkeleton />

  return (
    <div>
      <TableHeader>
        <h1>{title}</h1>
        <CreateButton onSubmit={saveItem} />
      </TableHeader>

      <Table data={items} columns={model.properties}>
        {(item) => (
          <TableRow key={item.id}>
            {Object.keys(model.properties).map(field => (
              <TableCell key={field}>{item[field]}</TableCell>
            ))}
            <TableCell>
              <EditButton id={item.id} />
              <DeleteButton
                onClick={async () => {
                  if (confirm('Confirm delete?')) {
                    await deleteItem(item.id)
                  }
                }}
              />
            </TableCell>
          </TableRow>
        )}
      </Table>
    </div>
  )
}

// Admin panel for managing dynamic tables
function TableAdmin({ tableIds }) {
  const [selectedTableId, setSelectedTableId] = useState(tableIds[0])

  return (
    <div>
      <TableSelector
        tables={tableIds}
        selected={selectedTableId}
        onChange={setSelectedTableId}
      />
      <DynamicTableCRUD tableId={selectedTableId} />
    </div>
  )
}
```

---

## Best Practices

### Type Definitions

```typescript
import type { ModelSchema, FormField } from '@airiot/client'

interface User {
  id: string
  username: string
  email: string
  createdAt: string
}

const userModel: ModelSchema = {
  name: 'user',
  properties: {
    username: { type: 'string', title: 'Username' },
    email: { type: 'string', title: 'Email' }
  }
}
```

### Error Handling

```typescript
async function handleSubmit(values) {
  try {
    await api.save(values)
    message.success('Save successful')
  } catch (error) {
    // API errors include json and status
    if (error.json) {
      // Form validation errors
      console.error('Validation error:', error.json)
    } else if (error.status) {
      // HTTP errors
      message.error(`Request failed: ${error.status}`)
    } else {
      // Other errors
      message.error('Unknown error')
    }
  }
}
```

### Loading States

```typescript
function DataLoader() {
  const { loading } = useModelList()
  const { loading: saving } = useModelSave()

  return (
    <div>
      {loading && <Spinner />}
      <button disabled={saving}>
        {saving ? 'Saving...' : 'Save'}
      </button>
    </div>
  )
}
```

---

## Important Notes

### AJV Validation Configuration

AJV configured with `strictSchema: false`, allowing custom properties:

```typescript
// Can add custom properties in schema
const schema = {
  type: 'object',
  properties: {
    customField: {
      type: 'string',
      title: 'Custom Field',
      field: { customProp: 'value' },  // Custom property
      formRender: 'custom'             // Custom renderer
    }
  }
}
```

### Token Handling

```typescript
// Token auto retrieved from config.user.token
setConfig({
  user: { token: 'your-token-here' }
})

// Some resources don't need token (configured in noToken list)
// These won't include Authorization header
```

### Data Conversion

```typescript
const api = createAPI({
  convertItem: (item) => ({
    ...item,
    // Handle _id to id conversion
    id: item._id || item.id,
    // Custom field conversion
    fullName: `${item.firstName} ${item.lastName}`
  })
})
```

### Date/Time Format

```typescript
// Library uses dayjs for dates
// datetime format: YYYY-MM-DD HH:mm:ss
// date format: YYYY-MM-DD
// time format: HH:mm:ss

const schema = {
  properties: {
    createdAt: {
      type: 'string',
      format: 'datetime',  // Uses custom datetime format validation
      title: 'Created At'
    }
  }
}
```

---

## Environment Configuration

### Vite Environment Variables

```bash
# .env.local
AIRIOT_API_TARGET=http://localhost:8080/
AIRIOT_API_PORT=3000
```

### Vite Config

```typescript
// vite.config.ts
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')

  return {
    server: env.AIRIOT_API_TARGET ? {
      port: env.AIRIOT_API_PORT || 3000,
      proxy: {
        '/rest': {
          target: env.AIRIOT_API_TARGET,
          changeOrigin: true,
          secure: false
        }
      }
    } : undefined
  }
})
```

---

## FAQ

### Q: How to handle file upload?

**A:** Use native fetch or FormData:

```typescript
const api = createAPI({ name: 'core/file' })

const uploadFile = async (file: File) => {
  const formData = new FormData()
  formData.append('file', file)

  return api.fetch('/upload', {
    method: 'POST',
    body: formData,
    headers: {}  // Don't set Content-Type, let browser auto set
  })
}
```

### Q: How to customize validation messages?

**A:** Use validationMessage property:

```typescript
const schema = {
  properties: {
    username: {
      type: 'string',
      minLength: 3,
      maxLength: 20,
      validationMessage: {
        minLength: 'Username must be at least 3 characters',
        maxLength: 'Username must be at most 20 characters'
      }
    }
  }
}
```

### Q: When should I use Model vs TableModel?

**A:** Use `Model` for static schemas defined in code, `TableModel` for dynamic schemas from the server:

```typescript
// Model - Static schema (defined in code)
<Model name="user" schema={userSchema}>
  <UserList />
</Model>

// TableModel - Dynamic schema (fetched from server)
<TableModel tableId="table-123">
  <UserList />
</TableModel>
```

**Use TableModel when:**
- Table schema can change at runtime
- Different tenants/organizations have different schemas
- Building admin/configuration panels
- Schema stored in database rather than code

**Use Model when:**
- Schema is fixed and defined in code
- Performance is critical (no extra API call)
- Simpler setup for known data models

### Q: How to handle TableModel loading errors?

**A:** Use error boundaries and handle the loading state:

```typescript
function SafeTableModel({ tableId, children }) {
  const [error, setError] = useState(null)

  if (error) {
    return <ErrorFallback error={error} onRetry={() => setError(null)} />
  }

  return (
    <ErrorBoundary onError={setError}>
      <TableModel
        tableId={tableId}
        loadingComponent={<LoadingSpinner />}
      >
        {children}
      </TableModel>
    </ErrorBoundary>
  )
}
```

---

## Quick Reference

| Task | Hook/Function | Module |
|------|--------------|--------|
| Login | `useLogin()` | Auth |
| Logout | `useLogout()` | Auth |
| Get user | `useUser()` | Auth |
| Create API | `createAPI()` | API |
| Query data | `api.query()` | API |
| Get item | `api.get()` | API |
| Save item | `api.save()` | API |
| Delete item | `api.delete()` | API |
| Schema form | `SchemaForm` | Form |
| Static model | `Model` | Model |
| Dynamic model | `TableModel` | Model |
| List data | `useModelList()` | Model |
| Get item | `useModelGet()` | Model |
| Save item | `useModelSave()` | Model |
| Delete item | `useModelDelete()` | Model |
| Pagination | `useModelPagination()` | Model |
| Set config | `setConfig()` | Config |
| Get config | `getConfig()` | Config |
| Show message | `useMessage()` | Config |
