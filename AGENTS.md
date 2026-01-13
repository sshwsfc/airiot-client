# Agentic Coding Guidelines

## Project Overview
This is a TypeScript client library for Airiot (@airiot/client) built with Vite. The library provides API, authentication, form handling, and model management components.

## Commands

### Build and Development
- `npm run build` - Build library (outputs ES and UMD to `dist/`)
- `npm run dev` - Build in watch mode for development
- `npm run type-check` - TypeScript type checking without emitting

### Testing
No test suite is configured. Run TypeScript checks with `npm run type-check`.

## Code Style Guidelines

### TypeScript Configuration
- Target: ES2020, Module: ESNext
- Strict mode enabled with `noUnusedLocals`, `noUnusedParameters`, `noFallthroughCasesInSwitch`
- JSX set to `react-jsx` transform
- Declaration files generated to `dist/`

### Imports
- Use named imports from libraries: `import { useState } from 'react'`
- Lodash functions imported individually: `import clone from 'lodash/clone'`
- Default imports for main modules: `import api from './api'`
- Type imports: `import type { APIOptions } from './api'`

### Naming Conventions
- Components: PascalCase (`BaseForm`, `Form`, `Model`, `ModelInitial`)
- Hooks: camelCase with `use` prefix (`useModel`, `useLogin`, `useConfig`)
- Functions: camelCase (`mergeQueries`, `getTimezoneOffset`, `createAPI`)
- Constants/Atoms: camelCase (`configAtom`, `modelRegistry`, `globalContext`)
- Types/Interfaces: PascalCase (`APIOptions`, `ModelSchema`, `FormProps`, `FetchOptions`)
- File names: lowercase with `.ts` or `.tsx` extension (match exports)

### Formatting
- 2-space indentation
- Semicolons required
- Single quotes for strings (except when avoiding escapes)
- No trailing whitespace

### Type Definitions
- Define interfaces at file top, after imports
- Export types used across modules: `export type { FormField } from './schema'`
- Use `[key: string]: any` for flexible object properties when needed
- Prefer explicit types over `any` when possible

### Error Handling
- Throw `Error` objects with descriptive messages: `throw new Error('api option resource is undefined')`
- Check context existence: `if (!context) { throw new Error('Need Model Context when use model hooks.') }`
- Catch API errors and re-throw with status/data: `const err: any = { json: error.response?.data, status: error.response?.status }; throw err`
- Validate required parameters before use

### Exports
- Named exports for functions/components: `export { BaseForm, Form, SchemaForm }`
- Type exports: `export type { ModelSchema, ModelAtoms }`
- Default exports for main modules/app registries: `export default app`

### React Patterns
- Functional components with hooks (no classes)
- Use `useEffect` for side effects, `useMemo` for expensive computations
- Context for state sharing (`ModelContext`)
- Jotai for state management (`useAtom`, `useAtomValue`, `useSetAtom`)
- Destructure props explicitly: `const { formKey, validate, effect, ...rest } = props`

### API Structure
- Factory function pattern: `export function createAPI(options: APIOptions): APIInstance`
- Chainable methods on API instances: `api.get(id)`, `api.query(filter)`, `api.save(data)`
- Global context for user/token management: `setContext()`, `getContext()`

### File Organization
- `src/api/` - API client and data fetching
- `src/auth/` - Authentication hooks (login, logout, user)
- `src/form/` - Form components and schema handling
- `src/model/` - Model management and hooks
- `src/hooks.ts` - Global hooks (config, message)
- `src/index.ts` - Main export, bundles all modules

## Dependencies
- React 18+ for UI components
- React Router for routing
- Jotai for state management
- Axios for HTTP requests
- Lodash for utilities
- Final Form for form handling
- AJV for JSON schema validation

## External Dependencies
These are NOT bundled in the library:
- `react`
- `react-dom`
- `react-router`

Use them via peer dependencies in consuming applications.

## Model Registry

### Built-in Models

The library includes a collection of built-in Airiot system models defined in `src/model/models.json`. These models are automatically registered in the `modelRegistry` and can be used by specifying the `name` prop on the `Model` component.

### Available Built-in Models

- **Table** - Data table management (`core/t/schema`)
- **Device** - Single device (`core/t/schema`)
- **systemvariable** - Data dictionary (`core/systemVariable`)
- **DriverInstance** - Driver management (`driver/driverInstance`)
- **ProtocolProxy** - Proxy management (`driver/protocolProxy`)
- **Instruct** - Command status management (`driver/instruct`)
- **DeviceArchive** - Archive information (`driver/archivedlog`)
- **NetworkGraph** - Network communication exception statistics (`core/t/record`)
- **TaskManager** - Background task management (`core/taskmanager`)
- **DeviceEvent** - Driver event information (`driver/event`)
- **ArchiveEvent** - Driver event archive information (`driver/archiveEvent`)
- **System** - System settings (`setting`)
- **backup** - Backup and restore (`core/backup`)
- **dbBackup** - Database backup (`db-backup`)
- **dbBackupFTP** - Database backup FTP
- **tsdbBackup** - Historical data backup (`tsdb-backup`)
- **tsdbBackupFTP** - Historical data backup FTP
- **backupcycle** - Cycle backup (`core/backupCycle`)
- **Flow** - Workflow (`flow/flow`)
- **FlowTask** - My tasks (`flow/flowTask/currentUser`)
- **AllFlowTask** - Task management (`flow/flowTask`)
- **FlowJob** - My initiated workflows (`engine/job`)
- **JobInstance** - Workflow instance (`engine/jobInstance`)
- **ArchivedInstance** - Workflow instance archive (`engine/archivedInstance`)
- **Theme** - System theme (`core/theme`)
- **Log** - Operation log (`core/log`)
- **Archivedlog** - Log archive (`core/archivedlog`)
- **Apipermission** - Unauthorized access log (`core/apipermission`)
- **SystemLog** - System log (`syslog/log`)
- **Dashboard** - View/Dashboard (`core/dashboard`)
- **Site** - Frontend/Site (`core/site`)
- **Warning** - Warning management
- **Rule** - Rule management
- **WarningArchive** - Warning archive
- **tRecord** - Time series record
- **Report** - Report management
- **reportcopy** - Report copy
- **algorithm** - Algorithm management
- **OauthApp** - OAuth application
- **app** - Application management
- **Role** - Role management
- **User** - User management
- **Licenseinfo** - License information
- **SafeZone** - Safe zone management
- **ExamineUser** - User approval
- **ExamineRole** - Role approval
- **Datasource** - Datasource management
- **Operation** - Operation management
- **Service** - Service management
- **Dataset** - Dataset management
- **DataView** - Data view management
- **sync** - Data synchronization
- **Media** - Media management
- **Message** - Message management
- **Plan** - Plan management
- **Review** - Review management
- **Playback** - Playback management
- **warningPlayback** - Warning playback
- **warningCapture** - Warning capture

### Using Built-in Models

To use a built-in model, simply specify the model name as the `name` prop:

```tsx
import { Model } from '@airiot/client'

function DeviceList() {
  return (
    <Model name="Device">
      {/* Child components can access the model via context */}
    </Model>
  )
}
```

The `Model` component will automatically look up the model definition from `modelRegistry` using the `name` prop.

### Model Registry API

The `modelRegistry` object provides the following methods:

- `getModels()` - Get all registered models
- `getModel(name)` - Get a specific model by name
- `registerModel(name, model)` - Register a new model
- `getModelAtoms()` - Get model atoms generators
- `addModelAtoms(getAtoms)` - Add a model atoms generator

### Custom Models

You can also register custom models dynamically:

```tsx
import { modelRegistry } from '@airiot/client/model'

modelRegistry.registerModel('MyCustomModel', {
  name: 'myCustomModel',
  resource: 'api/custom',
  title: 'My Custom Model',
  properties: {
    id: { type: 'string', title: 'ID' },
    name: { type: 'string', title: 'Name' }
  },
  listFields: ['id', 'name'],
  permission: { view: true, add: true, edit: true, delete: true }
})
```

### Model Schema Structure

Each model schema includes:

- `name` - Internal model name
- `resource` - API resource path
- `title` - Display title
- `icon` - Icon identifier or React element
- `properties` - Field definitions (JSON Schema format)
- `listFields` - Fields to display in list view
- `form` - Form field configuration
- `permission` - CRUD permissions
- `rolePermission` - Role-based permissions
- `orders` - Default sort order
- `filters` - Filter configurations
- `components` - Custom components
- `events` - Event handlers
- `initialValues` - Initial query values
