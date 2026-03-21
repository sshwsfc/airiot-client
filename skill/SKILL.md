---
name: airiot-frontend
description: "Complete AIRIOT Platform Development Guide - React TypeScript client with shadcn/ui framework, Vite build tool, and AIRIOT CLI tools. Covers project initialization, development standards, and comprehensive client library usage including API client (createAPI, CRUD operations), Authentication (useLogin, useLogout, useUser), Form Hooks (useForm, useFieldArray, Controller), Jotai-based State Management (Model, TableModel, useModel hooks), Page Hooks (usePageVar, useDatasourceValue, useDataVarValue), Real-time Data Subscription (Subscribe, useTag, useTableData), Event System (useEvents, useEvent), and Configuration (setConfig, useMessage)."
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

### 1.2 Project Creation Command

```bash
npx shadcn@latest create --preset "mira" --template vite -n airiot-project -y
```

**Core Configuration Parameters:**
- `--preset "mira"`: Use Radix Mira design style preset
- `--template vite`: Vite-based build tool template
- `-n airiot-project`: Project name (can be modified as needed)
- `-y`: Automatically confirm prompts

### 1.3 Core Dependencies & Services

#### 1.3.1 AIRIOT CLI Installation

The AIRIOT CLI provides tools for connecting and interacting with the AIRIOT platform.

**Install CLI:**

```bash
npx @airiot/tools
```

**Configuration:**

The CLI will guide you through the configuration process:

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
| `src/blocks/` | Block-level reusable components (large functional modules) |
| `src/components/` | Business-level common components |
| `src/components/ui/` | Basic UI components (shadcn/ui based) |

### 2.2 Development Standards

#### 2.2.1 Component Naming Conventions

- **Page Components**: PascalCase, e.g., `UserManagementPage.tsx`
- **Block Components**: PascalCase, e.g., `DataTable.tsx`
- **Business Components**: PascalCase, e.g., `UserCard.tsx`
- **UI Components**: kebab-case, e.g., `button.tsx`, `input.tsx`

#### 2.2.2 Code Style Standards

- Use TypeScript for all components
- Prioritize functional components and Hooks
- Use interface or type for Props definitions

---

## Part 3: AIRIOT Client Usage Guide

### 3.1 Core Modules Overview

The `@airiot/client` provides the following core modules:

| Module | Description | Main APIs |
|--------|-------------|-----------|
| **API Module** | RESTful API client | `createAPI`, `query`, `get`, `save`, `delete`, `count` |
| **Auth Module** | User authentication | `useLogin`, `useLogout`, `useUser`, `useUserReg` |
| **Form Module** | React Hook Form integration | `useForm`, `useFieldArray`, `Controller`, `useFieldUIState` |
| **Model Module** | Jotai-based state management | `Model`, `TableModel`, `useModelList`, `useModelGet`, `useModelSave`, `useModelDelete` |
| **Page Hooks** | Page-level state management | `usePageVar`, `useDatasourceValue`, `useDataVarValue`, `useSetPageVar` |
| **Subscribe Module** | WebSocket real-time data | `Subscribe`, `useTag`, `useTableData`, `useSubscribeContext` |
| **Event System** | Event-driven actions | `useEvents`, `useEvent`, `useEventsWithSpread` |
| **Config Module** | Global configuration | `setConfig`, `getConfig`, `getSettings`, `useMessage` |

---

### 3.2 API Module

#### 3.2.1 Create API Instance

```typescript
import { createAPI } from '@airiot/client'

const userApi = createAPI({
  name: 'core/user',           // API name (required)
  resource: 'user',            // Resource path (required)
  headers: {},                 // Custom request headers
  idProp: 'id',                // ID field name (string or string array for composite id)
  convertItem: (item) => ({    // Data conversion function
    ...item,
    fullName: `${item.firstName} ${item.lastName}`
  }),
  apiMessage: true,            // Show API request messages
  properties: {}               // Schema properties for query conversion
})
```

#### 3.2.2 Query Data

```typescript
// Paginated query with where conditions
const { items, total } = await userApi.query(
  { skip: 0, limit: 10, order: { createdAt: 'DESC' } },  // Query options
  { status: { $eq: 'active' } }                          // Where conditions
)

// Query with fields projection
const { items } = await userApi.query({
  skip: 0,
  limit: 20,
  fields: ['id', 'name', 'email']  // Only return specified fields
})

// Query with count
const { items, total } = await userApi.query(
  { skip: 0, limit: 10 },
  { status: 'active' },
  true  // Return total count
)
```

#### 3.2.3 CRUD Operations

```typescript
// Get single item
const user = await userApi.get('user123')

// Create new item
const newUser = await userApi.save({
  name: 'John Doe',
  email: 'john@example.com'
})

// Update item (with id)
const updatedUser = await userApi.save({
  id: 'user123',
  name: 'Jane Doe'
})

// Partial update (PATCH)
const partialUpdate = await userApi.save(
  { id: 'user123', status: 'inactive' },
  true  // partial = true
)

// Delete single item
await userApi.delete('user123')

// Delete multiple items
await userApi.delete(['id1', 'id2', 'id3'])

// Count items
const count = await userApi.count({ status: { $eq: 'active' } })
```

---

### 3.3 Authentication Module

#### 3.3.1 User Login

```typescript
import { useLogin } from '@airiot/client'

function LoginForm() {
  const { onLogin, showCode, showExtra, resetVerifyCode } = useLogin()

  const handleLogin = async () => {
    try {
      const result = await onLogin({
        username: 'admin',
        password: 'password123',
        verifyCode: '123456',  // Required if showCode is true
        remember: true          // Use localStorage instead of sessionStorage
      })

      if (result?.needChangePwd) {
        // Redirect to change password page
      }
    } catch (err) {
      console.error('Login failed:', err)
    }
  }

  return <button onClick={handleLogin}>Login</button>
}
```

#### 3.3.2 Get User Information

```typescript
import { useUser } from '@airiot/client'

function UserProfile() {
  const { user, setUser, loadUser, storageKey } = useUser()

  useEffect(() => {
    loadUser()  // Load user from localStorage/sessionStorage
  }, [])

  return (
    <div>
      <p>Username: {user?.username}</p>
      <p>Email: {user?.email}</p>
    </div>
  )
}
```

#### 3.3.3 User Logout

```typescript
import { useLogout } from '@airiot/client'

function LogoutButton() {
  const { onLogout } = useLogout()

  return <button onClick={onLogout}>Logout</button>
}
```

#### 3.3.4 User Registration

```typescript
import { useUserReg } from '@airiot/client'

function RegisterForm() {
  const { onUserReg } = useUserReg()

  const handleRegister = async () => {
    try {
      await onUserReg({
        username: 'newuser',
        password: 'password123',
        email: 'newuser@example.com'
      })
    } catch (err) {
      console.error('Registration failed:', err)
    }
  }

  return <button onClick={handleRegister}>Register</button>
}
```

---

### 3.4 Form Module (React Hook Form)

The form module is based on **react-hook-form**. All form-related hooks are re-exported.

#### 3.4.1 useForm Hook

```typescript
import { useForm } from '@airiot/client'

function MyForm() {
  const { register, handleSubmit, formState: { errors } } = useForm({
    defaultValues: {
      name: '',
      email: ''
    }
  })

  const onSubmit = (data) => {
    console.log(data)
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <input {...register('name', { required: 'Name is required' })} />
      {errors.name && <span>{errors.name.message}</span>}
      <input {...register('email', { required: 'Email is required' })} />
      {errors.email && <span>{errors.email.message}</span>}
      <button type="submit">Submit</button>
    </form>
  )
}
```

#### 3.4.2 Field State Management

```typescript
import { useFieldUIState, setFieldVisibility, setFieldDisabled, setFieldLoading } from '@airiot/client'

// Get field UI state
const { visible, disabled, loading } = useFieldUIState('fieldName')

// Set field visibility
setFieldVisibility('fieldName', false)  // Hide field

// Set field disabled state
setFieldDisabled('fieldName', true)  // Disable field

// Set field loading state
setFieldLoading('fieldName', true)  // Show loading spinner
```

#### 3.4.3 Field Arrays

```typescript
import { useFieldArray } from '@airiot/client'

function PhoneNumbersForm() {
  const { control, register } = useForm()
  const { fields, append, remove } = useFieldArray({
    control,
    name: 'phoneNumbers'
  })

  return (
    <div>
      {fields.map((field, index) => (
        <div key={field.id}>
          <input {...register(`phoneNumbers.${index}.type`)} />
          <input {...register(`phoneNumbers.${index}.number`)} />
          <button onClick={() => remove(index)}>Remove</button>
        </div>
      ))}
      <button onClick={() => append({ type: 'mobile', number: '' })}>
        Add Phone
      </button>
    </div>
  )
}
```

---

### 3.5 Model Module (Jotai State Management)

#### 3.5.1 Model Component

```typescript
import { Model } from '@airiot/client'

const userModel = {
  name: 'user',
  title: 'User',
  resource: 'core/user',
  properties: {
    name: { type: 'string', title: 'Name' },
    email: { type: 'string', title: 'Email' }
  },
  permission: {
    add: true,
    edit: true,
    delete: true,
    view: true
  }
}

function UserList() {
  const { items, loading } = useModelList()

  return (
    <ul>
      {items.map(user => (
        <li key={user.id}>{user.name}</li>
      ))}
    </ul>
  )
}

function App() {
  return (
    <Model name="user">
      <UserList />
    </Model>
  )
}
```

#### 3.5.2 TableModel Component

Dynamic table model that fetches schema from server:

```typescript
import { TableModel } from '@airiot/client'

function DynamicTable() {
  return (
    <TableModel
      tableId="device-table"
      loadingComponent={<div>Loading...</div>}
      initQuery={{ skip: 0, limit: 20 }}
      initialValues={{ archived: true }}
    >
      <UserList />
    </TableModel>
  )
}
```

#### 3.5.3 Model Hooks

```typescript
import {
  useModelList,        // Get list data with auto-loading
  useModelGet,         // Get single item by id
  useModelSave,        // Save item (create or update)
  useModelDelete,      // Delete item
  useModelGetItems,    // Manual query with filters
  useModelItem,        // Combined get/save/delete hooks
  useModelQuery,       // Simple query hook
  useModelPermission,  // Get model permissions
  useModelEvent,       // Get model event handlers
  useModelPagination,  // Pagination controls
  useModelCount,       // Get total count
  useModelPageSize,    // Page size controls
  useModelFields,      // Field display controls
  useModelSelect,      // Selection management
  useModelListRow,     // Single row hooks
  useModelListHeader,  // Header hooks
  useModelListOrder,   // Sorting hooks
  useModelListItem     // Single cell hooks
} from '@airiot/client'

// Example: useModelList
function UserManagement() {
  const { items, loading, selected, fields } = useModelList()

  return (
    <div>
      {loading ? <div>Loading...</div> : null}
      <table>
        {fields.map(field => (
          <th key={field}>{field}</th>
        ))}
        {items.map(user => (
          <tr key={user.id}>
            <td>{user.name}</td>
          </tr>
        ))}
      </table>
    </div>
  )
}

// Example: useModelGet
function UserEdit({ id }) {
  const { data, loading, model } = useModelGet({ id })

  if (loading) return <div>Loading...</div>

  return (
    <form>
      <h1>{model.title}</h1>
      {/* Form fields */}
    </form>
  )
}

// Example: useModelSave
function UserForm() {
  const { saveItem } = useModelSave()

  const handleSubmit = async (data) => {
    try {
      const saved = await saveItem(data)
      console.log('Saved:', saved)
    } catch (err) {
      console.error('Save failed:', err)
    }
  }

  return <form onSubmit={handleSubmit}>...</form>
}

// Example: useModelDelete
function UserDeleteButton({ id }) {
  const { deleteItem } = useModelDelete({ id })

  return <button onClick={() => deleteItem()}>Delete</button>
}

// Example: useModelGetItems
function UserSearch() {
  const { getItems } = useModelGetItems()

  const handleSearch = async (keyword) => {
    const { items, total } = await getItems({
      option: { skip: 0, limit: 10 },
      wheres: { name: { $regex: keyword } }
    })
  }

  return <input onChange={(e) => handleSearch(e.target.value)} />
}
```

---

### 3.6 Page Hooks

#### 3.6.1 Page Variable Management

```typescript
import {
  usePageVar,
  usePageVarValue,
  useSetPageVar
} from '@airiot/client'

function SettingsPage() {
  const [theme, setTheme] = usePageVar('theme')
  const language = usePageVarValue('language')

  return (
    <div>
      <p>Current theme: {theme}</p>
      <button onClick={() => setTheme('dark')}>
        Switch to dark theme
      </button>
    </div>
  )
}
```

#### 3.6.2 Datasource Management

```typescript
import { useDatasourceValue, useDatasetSet } from '@airiot/client'

function DataView() {
  const users = useDatasourceValue('users')
  const setDataset = useDatasetSet('users')

  useEffect(() => {
    // Load data
    fetchUsers().then(data => setDataset(data))
  }, [])

  return (
    <ul>
      {users?.map(user => (
        <li key={user.id}>{user.name}</li>
      ))}
    </ul>
  )
}

// Access nested properties
const userName = useDatasourceValue('users.0.name')  // Get first user's name
```

#### 3.6.3 Component Context (Data Variables)

```typescript
import { useDataVarValue, useSetDataVar } from '@airiot/client'

function ComponentWrapper({ children }) {
  const setData = useSetDataVar('chart1')

  useEffect(() => {
    setData({ status: 'ready', data: [] })
  }, [])

  return <Page>{children}</Page>
}

function Chart() {
  const data = useDataVarValue('chart1')
  return <div>{JSON.stringify(data)}</div>
}
```

#### 3.6.4 Cell Data Context

```typescript
import { useCellDataValue } from '@airiot/client'

function TableCell() {
  const cellData = useCellDataValue()
  // Access table data context in cell components
  console.log(cellData?.tableData)
}
```

---

### 3.7 Data Subscription Module

#### 3.7.1 Subscribe Provider

Wrap Provider at application root:

```typescript
import { Subscribe } from '@airiot/client'

function App() {
  return (
    <Subscribe>
      <YourComponents />
    </Subscribe>
  )
}
```

#### 3.7.2 Subscribe Data Tags

```typescript
import { useTag } from '@airiot/client'

function DeviceMonitor() {
  const temperature = useTag({
    tableId: 'device-table',
    dataId: 'device-001',
    tagId: 'temperature'
  })

  // Auto-subscription when component mounts
  return (
    <div>
      <p>Temperature: {temperature?.value}°C</p>
      <p>Status: {temperature?.timeoutState?.isOffline ? 'Offline' : 'Online'}</p>
    </div>
  )
}
```

#### 3.7.3 Manual Subscription Management

```typescript
import { useSubscribeContext, useTagValue } from '@airiot/client'

function CustomMonitor() {
  const { subscribeTags } = useSubscribeContext()
  const temperature = useTagValue({
    tableId: 'device-table',
    dataId: 'device-001',
    tagId: 'temperature'
  })

  useEffect(() => {
    // Manual subscription
    subscribeTags([
      { tableId: 'device-table', dataId: 'device-001', tagId: 'temperature' }
    ], true)  // true = clear previous subscriptions
  }, [subscribeTags])

  return <div>Temperature: {temperature?.value}°C</div>
}
```

#### 3.7.4 Subscribe Table Data

```typescript
import { useTableData } from '@airiot/client'

function DeviceInfo() {
  const name = useTableData({
    field: 'name',
    dataId: 'device-001',
    tableId: 'device-table'
  })

  return <div>Device name: {name}</div>
}
```

#### 3.7.5 Update Tags and Data

```typescript
import {
  useUpdateTags,
  useUpdateData,
  useUpdateReference
} from '@airiot/client'

function TagUpdater() {
  const updateTags = useUpdateTags()
  const updateData = useUpdateData()
  const updateReference = useUpdateReference()

  const handleUpdate = () => {
    // Update tag values
    updateTags({
      'table|data|tag': { value: 100, quality: 'good' }
    })

    // Update data values
    updateData({
      'table|data': { name: 'Updated Name' }
    })

    // Update reference/computed values
    updateReference({
      tableId: 'table1',
      tableDataId: 'data1',
      field: 'computedField',
      value: 'result'
    })
  }

  return <button onClick={handleUpdate}>Update</button>
}
```

---

### 3.8 Event System

The event system provides a declarative way to handle user interactions and execute actions.

#### 3.8.1 useEvents Hook

```typescript
import { useEvents } from '@airiot/client'

function MyButton() {
  const events = useEvents({
    click: [
      {
        type: 'changeVar',
        params: { var: { counter: 1 } }
      },
      {
        type: 'pageJump',
        params: { url: '/detail', openWay: '_self' }
      }
    ],
    doubleClick: [
      {
        type: 'sendRequest',
        params: {
          url: '/api/action',
          method: 'POST'
        }
      }
    ]
  })

  return (
    <button onClick={events.click} onDoubleClick={events.doubleClick}>
      Click Me
    </button>
  )
}
```

#### 3.8.2 useEvent Hook

```typescript
import { useEvent } from '@airiot/client'

function SingleEventButton() {
  const { handler, loading, error } = useEvent('click', [
    {
      type: 'changeVar',
      params: { varValue: { status: 'active' } },
      confirm: {
        title: 'Confirm',
        message: 'Are you sure?'
      }
    }
  ])

  return (
    <button onClick={handler} disabled={loading}>
      {loading ? 'Processing...' : 'Execute'}
      {error && <span>Error: {error}</span>}
    </button>
  )
}
```

#### 3.8.3 useEventsWithSpread Hook

```typescript
import { useEventsWithSpread } from '@airiot/client'

function SpreadEvents() {
  const events = useEventsWithSpread({
    click: [{ type: 'changeVar', params: { var: { count: 1 } } }],
    mouseEnter: [{ type: 'changeVar', params: { var: { hover: true } } }]
  })

  // Spread events directly on element
  return <div {...events}>Hover or Click Me</div>
}
```

#### 3.8.4 Action Types

```typescript
// Available action types:
type ActionType =
  | 'pageJump'          // Navigate to another page
  | 'changeVar'         // Modify page variables
  | 'changeTableData'   // Modify table data
  | 'changeDict'        // Modify data dictionary
  | 'changeDataPoint'   // Modify data point configuration
  | 'changeSystemSetting' // Modify system settings
  | 'changeUser'        // Modify user data
  | 'callFlow'          // Call workflow
  | 'executeCommand'    // Execute command
  | 'sendRequest'       // Send HTTP request
```

#### 3.8.5 Event Context

```typescript
// Event context provides functions for actions
interface EventContext {
  eventType: EventType        // Current event type
  eventParams?: React.SyntheticEvent  // Event parameters
  eventFunctions: {
    setPageVar: (path: string, value: any) => void
  }
}
```

---

### 3.9 Configuration Module

#### 3.9.1 Global Configuration

```typescript
import { setConfig, getConfig } from '@airiot/client'

// Set global config
setConfig({
  language: 'zh-CN',
  module: 'admin',
  rest: '/api/',
  projectId: 'project-123'
})

// Get config
const config = getConfig()
console.log(config.language)  // 'zh-CN'
```

#### 3.9.2 Toast Messages

```typescript
import { useMessage } from '@airiot/client'

function MessageExample() {
  const message = useMessage()

  return (
    <>
      <button onClick={() => message.success('Operation successful')}>
        Success
      </button>
      <button onClick={() => message.error('Operation failed')}>
        Error
      </button>
      <button onClick={() => message.warning('Warning message')}>
        Warning
      </button>
      <button onClick={() => message.info('Info message')}>
        Info
      </button>
    </>
  )
}
```

#### 3.9.3 Server Settings

```typescript
import { getSettings, useUser } from '@airiot/client'

function SettingsLoader() {
  const { user } = useUser()
  const [settings, setSettings] = useState(null)

  useEffect(() => {
    // Note: getSettings requires user context
    getSettings().then(data => {
      setSettings(data)
    })
  }, [user])

  return <div>{JSON.stringify(settings)}</div>
}
```

#### 3.9.4 Configuration Types

```typescript
interface Config {
  rest?: string              // REST API base path
  projectId?: string         // Project ID
  user?: UserInfo            // Current user
  toast?: ToastComponent     // Toast notification
  language?: string          // Language code
  module?: string            // Module name
  settings?: AppSettings     // App settings
}

interface UserInfo {
  id?: string
  username?: string
  name?: string
  email?: string
  token?: string
  isSuper?: boolean
  permissions?: string[]
  isFirstLogin?: boolean
}

interface AppSettings {
  safeRequest?: boolean
  notShowCodeAdmin?: boolean
  userExpand?: {
    needChangePwd?: boolean
    passwordExpireDays?: number
    minPasswordLength?: number
  }
  theme?: {
    mode?: 'light' | 'dark' | 'auto'
    primaryColor?: string
  }
}
```

---

### 3.10 Common Usage Patterns

#### 3.10.1 Complete CRUD Example

```typescript
import { Model, useModelList, useModelSave, useModelDelete } from '@airiot/client'

function UserManagement() {
  const { items, loading } = useModelList()
  const { saveItem } = useModelSave()
  const { deleteItem } = useModelDelete()

  const handleCreate = async (data: any) => {
    await saveItem(data)
  }

  const handleDelete = async (id: string) => {
    await deleteItem(id)
  }

  if (loading) return <div>Loading...</div>

  return (
    <div>
      <UserForm onSubmit={handleCreate} />
      <UserTable data={items} onDelete={handleDelete} />
    </div>
  )
}

function App() {
  return (
    <Model name="user">
      <UserManagement />
    </Model>
  )
}
```

#### 3.10.2 Protected Route

```typescript
import { useUser } from '@airiot/client'

function ProtectedRoute({ children }) {
  const { user, loading } = useUser()

  if (loading) return <div>Loading...</div>
  if (!user) return <Navigate to="/login" />

  return children
}
```

---

### 3.11 Best Practices

#### 3.11.1 Model State Management

```typescript
// Always use hooks inside Model Provider
function App() {
  return (
    <Model name="user">
      <UserList />  {/* Correct */}
    </Model>
  )
}

// Wrong: cannot use hooks outside Provider
```

#### 3.11.2 Subscribe Context

```typescript
// Always wrap with Subscribe Provider
function App() {
  return (
    <Subscribe>
      <DeviceMonitor />  {/* Correct */}
    </Subscribe>
  )
}
```

#### 3.11.3 TypeScript Type Safety

```typescript
import { createAPI } from '@airiot/client'

interface User {
  id: string
  name: string
  email: string
}

const userApi = createAPI<User>({
  name: 'core/user',
  resource: 'user'
})

// TypeScript will infer correct types
async function getUser() {
  const user = await userApi.get('id')
  console.log(user?.name)  // Type is string
}
```

---

### 3.12 Troubleshooting

#### Q: API requests not working?

A: Check if user is authenticated:

```typescript
import { useUser } from '@airiot/client'

const { user } = useUser()
console.log('User token:', user?.token)
```

#### Q: Form validation not working?

A: Ensure proper validation rules:

```typescript
const { register } = useForm()
<input
  {...register('email', {
    required: 'Email is required',
    pattern: {
      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
      message: 'Invalid email'
    }
  })}
/>
```

#### Q: Data subscription not updating?

A: Ensure SubscribeProvider is wrapping the component:

```typescript
<Subscribe>
  <YourComponent />
</Subscribe>
```

---

## Appendix

### A. Complete Type Definitions

```typescript
// API Options
interface APIOptions {
  name: string
  resource: string
  proxyKey?: string
  headers?: Record<string, string>
  idProp?: string | string[]
  convertItem?: (item: any) => any
  queryParams?: Record<string, any>
  projectAll?: boolean
  projectFields?: string[]
  customQuery?: (api: any, filter: any, wheres: any, convertItem: any) => Promise<any>
  apiMessage?: boolean
  properties?: Record<string, SchemaProperty>
}

// Query Options
interface QueryOptions {
  order?: Record<string, 'ASC' | 'DESC'>
  skip?: number
  limit?: number
  groupBy?: string
  fields?: string[]
}

// Model Schema
interface ModelSchema {
  name?: string
  key?: string
  title?: string
  icon?: string
  permission?: {
    view?: boolean
    add?: boolean
    edit?: boolean
    delete?: boolean
  }
  initialValues?: any | (() => any)
  listFields?: string[]
  defaultOrder?: any
  orders?: any
  defaultPageSize?: number
  properties?: Record<string, any>
  displayField?: string
  components?: Record<string, React.ComponentType<any>>
  atoms?: ModelAtoms
  blocks?: Record<string, (...args: any[]) => any>
  events?: Record<string, (...args: any[]) => any>
}
```

---

**Document Version**: v1.2.0
**Last Updated**: 2025-03-21
**Maintained By**: AIRIOT Development Team
