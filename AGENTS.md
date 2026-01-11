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
