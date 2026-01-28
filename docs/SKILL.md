---
name: airiot
description: "Complete AIRIOT Platform Development Guide - React TypeScript client with shadcn/ui framework, Vite build tool, and MCP server integration. Covers project initialization, development standards, and comprehensive client library usage including API client (createAPI, CRUD operations), Authentication (useLogin, useLogout, useUser), JSON Schema Forms (SchemaForm, FieldArray), Jotai-based State Management (Model, TableModel, useModel hooks), Page Hooks (usePageVar, useDatasourceValue), Real-time Data Subscription (Subscribe, useDataTag, useTableData), and Configuration (setConfig, useMessage)."
version: "1.0.0"
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

创建一个Airiot项目请严格遵照 ./vite.md 这个文档创建。

### 1.3 Core Dependencies & Services

#### 1.3.1 AIRIOT MCP Service Installation

The AIRIOT MCP (Model-Context-Protocol) service is the core backend component for communicating with the AIRIOT platform, following the Model-Controller-Provider (MCP) architecture.

**Start MCP Service:**

```bash
npx @airiot/mcp-server
```

**Environment Variables Configuration:**

The MCP service requires the following environment variables. The system will prompt for configuration if not set:

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

**Configuration Description:**
- **AIRIOT_BASE_URL**: AIRIOT platform server address
- **AIRIOT_PROJECT_ID**: Project unique identifier
- **Authentication (choose one)**:
  - Use `AIRIOT_TOKEN` for API token authentication
  - OR use `AIRIOT_USERNAME` and `AIRIOT_PASSWORD` for username/password authentication

**Install MCP Server to AI Agent:**

Install the MCP server to your AI agent's MCP server configuration based on the above information.

#### 1.3.2 Install AIRIOT Client SDK

Install the AIRIOT client toolkit package for type-safe, well-encapsulated platform functionality calls:

```bash
npm i -s @airiot/client@latest
```

---

## Part 2: AIRIOT Project Structure & Development Standards

### 2.1 Source Code Directory Structure

All source code is located in the **`src`** directory with strict adherence to the following conventions:

| Directory Path | Purpose & File Type Description |
| :--- | :--- |
| `src/pages/` | Store all **page-level** components and routing files |
| `src/blocks/` | Store **block-level** reusable components (large functional modules) |
| `src/components/` | Store **business-level** common components |
| `src/components/ui/` | Store **basic UI components** (shadcn/ui based components and business-independent pure presentation components) |
| Other directories | Consistent with **shadcn/ui** project standard directory structure |

### 2.2 Development Standards

#### 2.2.1 Component Naming Conventions

- **Page Components**: Use PascalCase, filename matches component name, e.g., `UserManagementPage.tsx`
- **Block Components**: Use PascalCase, e.g., `DataTable.tsx`
- **Business Components**: Use PascalCase, e.g., `UserCard.tsx`
- **UI Components**: Use kebab-case, e.g., `button.tsx`, `input.tsx`

#### 2.2.2 File Organization Standards

- **Organize by functional modules**: Related components placed in same directory
- **Promote shared components**: Components used in multiple places should be in `components/` directory
- **Isolate UI components**: Pure presentation components in `components/ui/` directory

#### 2.2.3 Code Style Standards

- **Use TypeScript**: All components and utility functions must use TypeScript
- **Functional components**: Prioritize functional components and Hooks
- **Props type definitions**: Use interface or type to define Props
- **Import order**: Third-party libraries → Project internal modules → Type imports → Relative path imports

---

## Part 3: AIRIOT Client Usage Guide

> **Note**: All content in this section, including API descriptions, code examples, and configuration parameters, is strictly based on the official technical documentation in the project's **`docs`** directory, ensuring authoritativeness, accuracy, and timeliness.

### 3.1 Core Modules Overview

The `@airiot/client` provides the following core modules:

| Module | Description | Main APIs |
|--------|-------------|-----------|
| **API Module** | RESTful API client | `createAPI`, `query`, `get`, `save`, `delete` |
| **Auth Module** | User authentication and session management | `useLogin`, `useLogout`, `useUser`, `useUserReg` |
| **Form Module** | JSON Schema dynamic forms | `SchemaForm`, `Form`, `FieldArray`, `useForm` |
| **Model Module** | Jotai-based state management | `Model`, `TableModel`, `useModelList`, `useModelGet` |
| **Page Hooks** | Page-level state management | `usePageVar`, `useDatasourceValue`, `useDataVarValue` |
| **Subscribe** | WebSocket real-time data subscription | `Subscribe`, `useDataTag`, `useTableData` |
| **Config** | Global configuration management | `setConfig`, `getConfig`, `getSettings` |

---

### 3.2 API Module

#### 3.2.1 Create API Instance

```typescript
import { createAPI } from '@airiot/client'

const userApi = createAPI({
  name: 'core/user',           // API name
  resource: 'user',            // Resource path
  headers: {},                 // Custom request headers
  idProp: 'id',                // ID field name
  convertItem: (item) => ({    // Data conversion function
    ...item,
    fullName: `${item.firstName} ${item.lastName}`
  })
})
```

#### 3.2.2 Query Data

```typescript
// Paginated query
const { items, total } = await userApi.query(
  { skip: 0, limit: 10 },                    // Query options
  { status: { $eq: 'active' } }              // Where conditions
)

// Sorted query
const { items } = await userApi.query({
  skip: 0,
  limit: 20,
  order: { createdAt: 'DESC' }              // Sort by creation time descending
})

// Custom query
const { items } = await userApi.query(
  { skip: 0, limit: 10 },
  null,                                     // No where conditions
  true,                                     // Return total count
  (api) => api.fetch('/custom/endpoint')   // Custom query
)
```

#### 3.2.3 CRUD Operations

```typescript
// Get single item
const user = await userApi.get('user123')

// Create data
const newUser = await userApi.save({
  name: 'John Doe',
  email: 'john@example.com'
})

// Update data
const updatedUser = await userApi.save('user123', {
  name: 'Jane Doe'
})

// Delete data
await userApi.delete('user123')

// Batch delete
await userApi.delete(['id1', 'id2', 'id3'])

// Count
const count = await userApi.count({ status: { $eq: 'active' } })
```

---

### 3.3 Authentication Module

#### 3.3.1 User Login

```typescript
import { useLogin } from '@airiot/client'

function LoginForm() {
  const { onLogin, loading, error } = useLogin()

  const handleLogin = async () => {
    try {
      await onLogin({
        username: 'admin',
        password: 'password123',
        remember: true                    // Remember me
      })
      console.log('Login successful')
    } catch (err) {
      console.error('Login failed:', err)
    }
  }

  return <button onClick={handleLogin} disabled={loading}>
    {loading ? 'Logging in...' : 'Login'}
  </button>
}
```

#### 3.3.2 Get User Information

```typescript
import { useUser } from '@airiot/client'

function UserProfile() {
  const { user, loading, loadUser, logout } = useUser()

  useEffect(() => {
    loadUser()  // Load user info from localStorage
  }, [])

  if (loading) return <div>Loading...</div>

  return (
    <div>
      <p>Username: {user?.username}</p>
      <p>Email: {user?.email}</p>
      <button onClick={logout}>Logout</button>
    </div>
  )
}
```

#### 3.3.3 User Registration

```typescript
import { useUserReg } from '@airiot/client'

function RegisterForm() {
  const { onReg, loading } = useUserReg()

  const handleRegister = async () => {
    await onReg({
      username: 'newuser',
      password: 'password123',
      email: 'newuser@example.com'
    })
  }

  return <button onClick={handleRegister}>Register</button>
}
```

---

### 3.4 Form Module

#### 3.4.1 SchemaForm Component

Define forms using JSON Schema:

```typescript
import { SchemaForm } from '@airiot/client'

const userSchema = {
  type: 'object',
  properties: {
    name: {
      type: 'string',
      title: 'Name'
    },
    email: {
      type: 'string',
      title: 'Email',
      format: 'email'
    },
    age: {
      type: 'number',
      title: 'Age',
      minimum: 0,
      maximum: 150
    }
  },
  required: ['name', 'email']
}

function UserForm() {
  const handleSubmit = (data: any) => {
    console.log('Form data:', data)
  }

  return (
    <SchemaForm
      schema={userSchema}
      onSubmit={handleSubmit}
    />
  )
}
```

#### 3.4.2 Custom Field Renderers

```typescript
import { setFormFields } from '@airiot/client'
import { CustomInput } from './CustomInput'

// Register custom field
setFormFields({
  custom: CustomInput
})

// Use in Schema
const schema = {
  type: 'object',
  properties: {
    customField: {
      type: 'custom',      // Use custom field
      title: 'Custom Field'
    }
  }
}
```

#### 3.4.3 Array Fields

```typescript
import { FieldArray } from '@airiot/client'

function PhoneNumbersForm() {
  return (
    <FieldArray
      name="phoneNumbers"
      schema={{
        type: 'object',
        properties: {
          type: { type: 'string', enum: ['home', 'work', 'mobile'] },
          number: { type: 'string', title: 'Number' }
        }
      }}
    />
  )
}
```

---

### 3.5 Model Module

#### 3.5.1 Model Component

```typescript
import { Model } from '@airiot/client'

const userModel = {
  name: 'user',
  state: {
    list: [],
    selected: null
  },
  operations: {
    query: async () => {
      const { items } = await userApi.query({ skip: 0, limit: 100 })
      return items
    }
  }
}

function UserList() {
  const { list, query } = useModel()

  useEffect(() => {
    query()
  }, [])

  return (
    <ul>
      {list.map(user => (
        <li key={user.id}>{user.name}</li>
      ))}
    </ul>
  )
}

function App() {
  return (
    <Model model={userModel}>
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
    >
      <DataGrid />
    </TableModel>
  )
}
```

#### 3.5.3 Model Hooks

```typescript
import {
  useModelList,
  useModelGet,
  useModelSave,
  useModelDelete,
  useModelCount
} from '@airiot/client'

function UserManagement() {
  // Get list data
  const { items, loading, query } = useModelList()

  // Get single item
  const { data, get } = useModelGet()

  // Save data
  const { save, saving } = useModelSave()

  // Delete data
  const { remove } = useModelDelete()

  // Count
  const { count } = useModelCount()

  return <div>...</div>
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
      <p>Current language: {language}</p>
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
```

#### 3.6.3 Component Context

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

#### 3.7.2 Auto-subscribe Data Tags

```typescript
import { useDataTag } from '@airiot/client'

function DeviceMonitor() {
  const temperature = useDataTag({
    tableId: 'device-table',
    dataId: 'device-001',
    tagId: 'temperature'
  })

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
import { useSubscribeContext, useDataTagValue } from '@airiot/client'

function CustomMonitor() {
  const { subscribeTags } = useSubscribeContext()
  const temperature = useDataTagValue({
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

---

### 3.8 Configuration Module

#### 3.8.1 Global Configuration

```typescript
import { setConfig, getConfig } from '@airiot/client'

// Set global config
setConfig({
  language: 'zh-CN',
  module: 'admin'
})

// Get config
const config = getConfig()
console.log(config.language)  // 'zh-CN'
```

#### 3.8.2 Server Settings

```typescript
import { getSettings } from '@airiot/client'

function SettingsLoader() {
  const [settings, setSettings] = useState(null)

  useEffect(() => {
    getSettings().then(data => {
      setSettings(data)
    })
  }, [])

  return <div>{JSON.stringify(settings)}</div>
}
```

#### 3.8.3 Message Notifications

```typescript
import { useMessage } from '@airiot/client'

function MessageExample() {
  const message = useMessage()

  return (
    <>
      <button onClick={() => message.success('Operation successful')}>
        Success message
      </button>
      <button onClick={() => message.error('Operation failed')}>
        Error message
      </button>
      <button onClick={() => message.warning('Warning message')}>
        Warning message
      </button>
      <button onClick={() => message.info('Info message')}>
        Info message
      </button>
    </>
  )
}
```

---

### 3.9 Common Usage Patterns

#### 3.9.1 Authenticated Route Protection

```typescript
import { useUser } from '@airiot/client'

function ProtectedRoute({ children }) {
  const { user, loading } = useUser()

  if (loading) return <div>Loading...</div>
  if (!user) return <Navigate to="/login" />

  return children
}

// Usage
function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <DashboardPage />
          </ProtectedRoute>
        }
      />
    </Routes>
  )
}
```

#### 3.9.2 Complete CRUD Example

```typescript
import { createAPI } from '@airiot/client'
import { Model, useModelList, useModelSave, useModelDelete } from '@airiot/client'

const userApi = createAPI({
  name: 'core/user',
  resource: 'user'
})

function UserManagement() {
  const { items, loading, query } = useModelList()
  const { save, saving } = useModelSave()
  const { remove } = useModelDelete()

  // Query user list
  useEffect(() => {
    query()
  }, [])

  // Create user
  const handleCreate = async (data: any) => {
    await save(data)
    query()  // Refresh list
  }

  // Delete user
  const handleDelete = async (id: string) => {
    await remove(id)
    query()  // Refresh list
  }

  if (loading) return <div>Loading...</div>

  return (
    <div>
      <UserForm onSubmit={handleCreate} loading={saving} />
      <UserTable data={items} onDelete={handleDelete} />
    </div>
  )
}
```

#### 3.9.3 Infinite Scroll

```typescript
import { useModelList } from '@airiot/client'

function InfiniteList() {
  const { items, loading, query, hasMore } = useModelList()
  const [page, setPage] = useState(0)

  const loadMore = () => {
    const nextPage = page + 1
    query({ skip: nextPage * 20, limit: 20 })
    setPage(nextPage)
  }

  return (
    <div>
      {items.map(item => (
        <div key={item.id}>{item.name}</div>
      ))}
      {hasMore && (
        <button onClick={loadMore} disabled={loading}>
          {loading ? 'Loading...' : 'Load more'}
        </button>
      )}
    </div>
  )
}
```

---

### 3.10 Best Practices

#### 3.10.1 Error Handling

```typescript
import { useLogin } from '@airiot/client'

function LoginForm() {
  const { onLogin, error } = useLogin()

  const handleSubmit = async () => {
    try {
      await onLogin({ username, password })
      // Success handling
    } catch (err) {
      console.error('Login failed:', err)
      // Error handling
    }
  }

  return (
    <>
      {error && <div className="error">{error.message}</div>}
      <form onSubmit={handleSubmit}>...</form>
    </>
  )
}
```

#### 3.10.2 Performance Optimization

```typescript
import { useCallback, useMemo } from 'react'
import { useModelList } from '@airiot/client'

function OptimizedList() {
  const { items } = useModelList()

  // Use useMemo to cache computed results
  const sortedItems = useMemo(() => {
    return [...items].sort((a, b) =>
      a.name.localeCompare(b.name)
    )
  }, [items])

  // Use useCallback to cache callback functions
  const handleClick = useCallback((id: string) => {
    console.log('Clicked:', id)
  }, [])

  return (
    <ul>
      {sortedItems.map(item => (
        <li key={item.id} onClick={() => handleClick(item.id)}>
          {item.name}
        </li>
      ))}
    </ul>
  )
}
```

#### 3.10.3 TypeScript Type Safety

```typescript
import { createAPI } from '@airiot/client'

// Define data type
interface User {
  id: string
  name: string
  email: string
  createdAt: string
}

// Define API type
const userApi = createAPI<User>({
  name: 'core/user',
  resource: 'user',
  convertItem: (item) => ({
    ...item,
    fullName: `${item.firstName} ${item.lastName}`
  })
})

// Use with type hints
async function getUser() {
  const user = await userApi.get('id')
  console.log(user?.name)  // TypeScript knows this is string type
}
```

---

### 3.11 Troubleshooting

#### Q: How to debug API requests?

A: Use `apiMessage: true` to enable API messages:

```typescript
const api = createAPI({
  name: 'core/user',
  resource: 'user',
  apiMessage: true  // Show API request messages
})
```

#### Q: Form validation not working?

A: Ensure JSON Schema correctly defines `required` array and validation rules:

```typescript
const schema = {
  type: 'object',
  required: ['name', 'email'],  // Required fields
  properties: {
    email: {
      type: 'string',
      format: 'email'  // Email format validation
    }
  }
}
```

#### Q: Model state not updating?

A: Ensure hooks are used inside Model Provider:

```typescript
function MyComponent() {
  return (
    <Model model={userModel}>
      <UserList />  {/* Correct: inside Provider */}
    </Model>
  )
}

// Wrong: cannot use useModel hooks outside Provider
```

#### Q: Data subscription not updating?

A: Ensure inside Subscribe Provider:

```typescript
function App() {
  return (
    <Subscribe>
      <DeviceMonitor />  {/* Correct */}
    </Subscribe>
  )
}
```

---

### 3.12 Related Documentation

For complete API documentation and examples, refer to:

- [API Module](./api.md) - API module details
- [Auth Module](./auth.md) - Authentication guide
- [Form Module](./form.md) - Form module
- [Model Module](./model.md) - State management
- [Page Hooks](./page-hooks.md) - Page-level hooks
- [Subscribe](./subscribe.md) - Real-time subscriptions
- [Getting Started](./getting-started.md) - Quick start guide
- [Examples](./examples.md) - Usage examples

---

## Appendix

### A. Complete Dependency List

```json
{
  "dependencies": {
    "@airiot/client": "latest",
    "react": "^19.0.0",
    "react-dom": "^19.0.0",
    "react-router-dom": "^7.12.0",
    "jotai": "^2.7.0"
  }
}
```

### B. TypeScript Configuration

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true
  },
  "include": ["src"],
  "references": [{ "path": "./tsconfig.node.json" }]
}
```

### C. Environment Variables Reference

```bash
# .env.local

# AIRIOT API Configuration
AIRIOT_API_TARGET=http://localhost:8080/
AIRIOT_API_PORT=3000

# Development Mode
VITE_DEV=true
```

---

**Document Version**: v1.0.0
**Last Updated**: 2025-01-24
**Maintained By**: AIRIOT Development Team
