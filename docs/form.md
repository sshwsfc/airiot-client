# 表单模块

表单模块基于 **react-hook-form** 和 **Zod** 提供强大的表单构建和验证功能。

## 导出

```typescript
import {
  // Hooks
  useForm,
  useFormSchema,
  useFieldUIState,
  useFieldUIStateValue,
  useSetFieldUIState,

  // Context
  FormProvider,
  useFormContext,

  // React Hook Form 导出
  useFormState,
  useWatch,
  useFieldArray,
  Controller
} from '@airiot/client'
```

## 核心概念

表单模块已从 `react-final-form` + `Ajv` 迁移到 `react-hook-form` + `Zod`，提供：
- ✅ 更好的性能和更小的包体积
- ✅ 完整的 TypeScript 类型支持
- ✅ 更简洁的 API
- ✅ 字段 UI 状态管理

---

## Hooks

### `useForm(props)`

增强的表单 Hook，集成了字段 UI 状态管理。

**类型定义：**
```typescript
interface UseFormProps {
  defaultValues?: Partial<FieldValues>
  onEffect?: (values: FieldValues, methods: UseFormReturn<FieldValues>) => void
  resolver?: Resolver<any, any>
  mode?: 'onSubmit' | 'onChange' | 'onBlur' | 'all'
  reValidateMode?: 'onSubmit' | 'onChange' | 'onBlur'
  criteriaMode?: 'firstError' | 'all'
  shouldFocusError?: boolean
}

interface UseFormReturnExtended extends UseFormReturn {
  watch: UseFormWatch<FieldValues>
  getValues: UseFormGetValues<FieldValues>
  setValue: UseFormSetValue<FieldValues>
  trigger: UseFormTrigger<FieldValues>
  reset: UseFormReset<FieldValues>
  formState: UseFormState
  register: UseFormRegister
  setFieldUIState: (fieldName: string, update: FieldUIStateUpdate) => void
  store: Store
}
```

**使用示例：**
```typescript
import { useForm, FormProvider } from '@airiot/client'

function UserForm() {
  const handleSubmit = (values: any) => {
    console.log('表单提交:', values)
  }

  const form = useForm({
    defaultValues: {
      username: '',
      email: '',
      age: 0
    },
    onEffect: (values, methods) => {
      console.log('表单值变化:', values)

      // 动态控制字段可见性
      if (values.age < 18) {
        methods.setFieldUIState('guardianContact', {
          visible: true,
          required: true
        })
      }
    }
  })

  return (
    <FormProvider {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)}>
        {/* 表单字段 */}
      </form>
    </FormProvider>
  )
}
```

---

### `useFormSchema(props)`

将 JSON Schema 转换为表单字段和 Zod resolver。

**类型定义：**
```typescript
interface UseFormSchemaProps {
  schema: SchemaField          // JSON Schema
  formSchema?: Record<string, FormField>  // UI 配置
  mode?: 'onSubmit' | 'onChange' | 'onBlur' | 'all'
  reValidateMode?: 'onSubmit' | 'onChange' | 'onBlur'
  criteriaMode?: 'firstError' | 'all'
  shouldFocusError?: boolean
}

interface UseFormSchemaReturn {
  fields: FormField[]         // 转换后的表单字段
  resolver: Resolver<any, any>   // Zod resolver
}
```

**使用示例：**
```typescript
import { useFormSchema, useForm, FormProvider } from '@airiot/client'

const userSchema = {
  type: 'object',
  properties: {
    username: {
      type: 'string',
      title: '用户名',
      minLength: 3,
      maxLength: 20
    },
    email: {
      type: 'string',
      format: 'email',
      title: '邮箱'
    },
    age: {
      type: 'number',
      title: '年龄',
      minimum: 0,
      maximum: 120
    },
    gender: {
      type: 'string',
      title: '性别',
      enum: ['male', 'female', 'other']
    },
    status: {
      type: 'string',
      title: '状态',
      enum: ['active', 'inactive', 'pending']
    }
  },
  required: ['username', 'email']
}

function UserForm() {
  const { fields, resolver } = useFormSchema({
    schema: userSchema,
    formSchema: {
      username: { component: Input },
      gender: {
        component: Select,
        options: [
          { label: '男', value: 'male' },
          { label: '女', value: 'female' },
          { label: '其他', value: 'other' }
        ]
      },
      status: {
        component: Select,
        options: [
          { label: '活跃', value: 'active' },
          { label: '未激活', value: 'inactive' },
          { label: '待定', value: 'pending' }
        ]
      }
    }
  })

  const form = useForm({ resolver, mode: 'onSubmit' })

  return (
    <FormProvider {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        {fields.map(field => (
          <FormField key={field.name} {...field} />
        ))}
      </form>
    </FormProvider>
  )
}
```

---

## 字段 UI 状态管理

### `FieldUIState` 接口

字段 UI 状态接口定义：

```typescript
interface FieldUIState {
  visible?: boolean      // 字段是否可见
  disabled?: boolean     // 字段是否禁用
  loading?: boolean      // 字段是否加载中
  readonly?: boolean     // 字段是否只读
  required?: boolean     // 是否必填
  custom?: Record<string, any>  // 自定义状态
}
```

### `useFieldUIState(fieldName)`

获取和管理字段的 UI 状态。

```typescript
const [uiState, setUIState, resetUIState] = useFieldUIState('username')

uiState.visible     // 字段是否可见
uiState.disabled    // 字段是否禁用
uiState.loading     // 字段是否加载中
uiState.readonly    // 字段是否只读
uiState.required    // 是否必填
uiState.custom      // 自定义状态

// 更新状态
setUIState({ visible: false })
setUIState({ disabled: true })
setUIState({ loading: true })

// 函数式更新
setUIState(prev => ({ ...prev, disabled: true, visible: false }))

// 重置状态
resetUIState()
```

### `useFieldUIStateValue(fieldName)`

只读获取字段 UI 状态。

```typescript
const uiState = useFieldUIStateValue('username')

if (!uiState.visible) return null
if (uiState.disabled) return <ReadOnlyComponent />
```

### `useSetFieldUIState(fieldName)`

只写更新字段 UI 状态。

```typescript
const setUIState = useSetFieldUIState('username')

setUIState({ visible: false })
setUIState({ disabled: true })
```

### 工具函数

```typescript
import {
  setFieldVisibility,
  setFieldDisabled,
  setFieldLoading
} from '@airiot/client'

// 设置字段可见性
setFieldVisibility('username', false)

// 设置字段禁用状态
setFieldDisabled('username', true)

// 设置加载状态
setFieldLoading('username', true)
```

**注意：** 字段的验证错误由 react-hook-form 的表单状态管理，使用 `fieldState.error` 访问。

---

## Context

### `FormProvider`

表单上下文提供者，用于包裹表单组件。

```typescript
import { FormProvider, useForm } from '@airiot/client'

function MyForm() {
  const form = useForm({
    defaultValues: { username: '' }
  })

  return (
    <FormProvider {...form}>
      {/* 表单内容 */}
    </FormProvider>
  )
}
```

### `useFormContext()`

访问表单上下文。

```typescript
import { useFormContext, Controller } from '@airiot/client'

function MyField({ name }: { name: string }) {
  const { control } = useFormContext()
  const uiState = useFieldUIStateValue(name)

  return uiState.visible ? (
    <Controller
      name={name}
      control={control}
      render={({ field }) => (
        <input {...field} disabled={uiState.disabled} />
      )}
    />
  ) : null
}
```

---

## JSON Schema 格式

### 基础字段类型

```typescript
const schema = {
  type: 'object',
  properties: {
    // 字符串字段
    username: {
      type: 'string',
      title: '用户名'
    },

    // 数字字段
    age: {
      type: 'number',
      title: '年龄'
    },

    // 整数字段
    count: {
      type: 'integer',
      title: '数量'
    },

    // 布尔字段
    isActive: {
      type: 'boolean',
      title: '是否激活'
    },

    // 日期字段
    birthDate: {
      type: 'string',
      format: 'date',
      title: '出生日期'
    },

    // 日期时间字段
    createdAt: {
      type: 'string',
      format: 'date-time',
      title: '创建时间'
    },

    // 时间字段
    time: {
      type: 'string',
      format: 'time',
      title: '时间'
    }
  }
}
```

### 枚举字段

```typescript
const schema = {
  type: 'object',
  properties: {
    status: {
      type: 'string',
      title: '状态',
      enum: ['active', 'inactive', 'pending'],
      enumNames: ['激活', '未激活', '待定']
    },

    priority: {
      type: 'number',
      title: '优先级',
      enum: [1, 2, 3],
      enum_title: { 1: '高', 2: '中', 3: '低' }
    }
  }
}
```

### 对象字段

```typescript
const schema = {
  type: 'object',
  properties: {
    address: {
      type: 'object',
      title: '地址',
      properties: {
        street: { type: 'string', title: '街道' },
        city: { type: 'string', title: '城市' },
        zipCode: { type: 'string', title: '邮编' }
      },
      required: ['city']
    }
  }
}
```

### 数组字段

```typescript
const schema = {
  type: 'object',
  properties: {
    tags: {
      type: 'array',
      title: '标签',
      items: {
        type: 'string'
      }
    },

    items: {
      type: 'array',
      title: '项目',
      items: {
        type: 'object',
        properties: {
          name: { type: 'string', title: '名称' },
          price: { type: 'number', title: '价格' }
        }
      }
    }
  }
}
```

---

## 验证

### 内置验证规则

```typescript
const schema = {
  type: 'object',
  properties: {
    username: {
      type: 'string',
      title: '用户名',
      minLength: 3,      // 最小长度
      maxLength: 20,     // 最大长度
    },
    age: {
      type: 'integer',
      title: '年龄',
      minimum: 0,        // 最小值
      maximum: 120,      // 最大值
      exclusiveMinimum: false,  // 不包含最小值
      exclusiveMaximum: false  // 不包含最大值
    },
    email: {
      type: 'string',
      format: 'email',  // 邮箱格式验证
      title: '邮箱'
    }
  },
  required: ['username', 'age']  // 必填字段
}
```

### 自定义验证

```typescript
import { useFormSchema, useForm } from '@airiot/client'

const { resolver } = useFormSchema({
  schema: userSchema
})

const form = useForm({
  resolver,
  mode: 'onSubmit'
})

// 在 SchemaForm 中使用自定义验证
<SchemaForm
  schema={userSchema}
  validate={(values) => {
    const errors: any = {}

    // 自定义验证规则
    if (values.password !== values.confirmPassword) {
      errors.confirmPassword = '两次密码输入不一致'
    }

    return errors
  }}
  onSubmit={handleSubmit}
/>
```

---

## 完整示例

### 基础表单示例

```typescript
import { useForm, FormProvider, Controller } from '@airiot/client'
import { useFormContext, useFieldUIStateValue } from '@airiot/client'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

function UserForm() {
  const form = useForm({
    defaultValues: {
      username: '',
      email: '',
      age: 0
    },
    onEffect: (values, methods) => {
      // 当年龄小于 18 时，显示监护人联系方式字段
      if (values.age < 18) {
        methods.setFieldUIState('guardianContact', {
          visible: true,
          required: true
        })
      } else {
        methods.setFieldUIState('guardianContact', {
          visible: false
        })
      }
    }
  })

  const onSubmit = (data: any) => {
    console.log('提交的数据:', data)
  }

  return (
    <FormProvider {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <Controller
          name="username"
          control={form.control}
          render={({ field, fieldState }) => (
            <div>
              <label>用户名</label>
              <input {...field} />
              {fieldState.error && <span>{fieldState.error.message}</span>}
            </div>
          )}
        />

        <Controller
          name="email"
          control={form.control}
          render={({ field }) => (
            <div>
              <label>邮箱</label>
              <input {...field} type="email" />
            </div>
          )}
        />

        <Controller
          name="age"
          control={form.control}
          render={({ field }) => (
            <div>
              <label>年龄</label>
              <input {...field} type="number" />
            </div>
          )}
        />

        <Controller
          name="guardianContact"
          control={form.control}
          render={({ field }) => {
            const ui = useFieldUIStateValue('guardianContact')
            return ui.visible ? (
              <div>
                <label>监护人联系方式 (必填)</label>
                <input {...field} />
              </div>
            ) : null
          }}
        />

        <Button type="submit">提交</Button>
      </form>
    </FormProvider>
  )
}
```

### Schema 表单示例

```typescript
import { useFormSchema, useForm, FormProvider } from '@airiot/client'

const userSchema = {
  type: 'object',
  properties: {
    username: {
      type: 'string',
      title: '用户名',
      minLength: 3,
      maxLength: 20
    },
    email: {
      type: 'string',
      format: 'email',
      title: '邮箱'
    },
    age: {
      type: 'number',
      title: '年龄',
      minimum: 0,
      maximum: 120
    },
    gender: {
      type: 'string',
      title: '性别',
      enum: ['male', 'female', 'other']
    },
    status: {
      type: 'string',
      title: '状态',
      enum: ['active', 'inactive', 'pending']
    }
  },
  required: ['username', 'email']
}

const formSchema = {
  username: { component: Input },
  email: { component: Input },
  age: { component: Input },
  gender: {
    component: Select,
    options: [
      { label: '男', value: 'male' },
      { label: '女', value: 'female' },
      { label: '其他', value: 'other' }
    ]
  },
  status: {
    component: Select,
    options: [
      { label: '活跃', value: 'active' },
      { label: '未激活', value: 'inactive' },
      { label: '待定', value: 'pending' }
    ]
  }
}

function SchemaUserForm() {
  const { fields, resolver } = useFormSchema({
    schema: userSchema,
    formSchema
  })

  const form = useForm({ resolver, mode: 'onSubmit' })

  const handleSubmit = (values: any) => {
    console.log('提交的数据:', values)
  }

  return (
    <FormProvider {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)}>
        {fields.map(field => (
          <FormField key={field.name} {...field} />
        ))}
        <Button type="submit">提交</Button>
      </form>
    </FormProvider>
  )
}
```

### 字段 UI 状态示例

```typescript
import { useForm, FormProvider, useFieldUIStateValue, Controller } from '@airiot/client'

function ConditionalFieldsForm() {
  const form = useForm({
    defaultValues: { accountType: 'personal', age: 0 }
  })

  return (
    <FormProvider {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <Controller
          name="accountType"
          control={form.control}
          render={({ field }) => (
            <select {...field}>
              <option value="personal">个人账户</option>
              <option value="business">企业账户</option>
            </select>
          )}
        />

        {/* 根据账户类型显示不同字段 */}
        <AccountTypeFields />
      </form>
    </FormProvider>
  )
}

function AccountTypeFields() {
  const form = useFormContext()
  const accountType = useWatch({
    control: form.control,
    name: 'accountType'
  })

  if (accountType === 'business') {
    return (
      <>
        <Controller name="companyName" control={form.control} render={({ field }) => (
          <input {...field} placeholder="公司名称" />
        )} />
        <Controller name="taxId" control={form.control} render={({ field }) => (
          <input {...field} placeholder="税号" />
        )} />
      </>
    )
  }

  return (
    <>
      <Controller name="firstName" control={form.control} render={({ field }) => (
        <input {...field} placeholder="名" />
      )} />
      <Controller name="lastName" control={form.control} render={({ field }) => (
        <input {...field} placeholder="姓" />
      )} />
    </>
  )
}
```

---

## React Hook Form 导出

除了自定义的 hooks 外，我们还导出了 `react-hook-form` 的核心 API：

### `useFormState()`

获取表单状态。

```typescript
import { useFormState } from '@airiot/client'

function SubmitButton() {
  const { isSubmitting, isValid, dirty } = useFormState()

  return (
    <Button
      type="submit"
      disabled={isSubmitting || !isValid || !dirty}
    >
      {isSubmitting ? '提交中...' : '提交'}
    </Button>
  )
}
```

### `useWatch()`

监听表单值的变化。

```typescript
import { useWatch } from '@airiot/client'

function WatchValues() {
  const values = useWatch()

  useEffect(() => {
    console.log('表单值变化:', values)
  }, [values])

  return <pre>{JSON.stringify(values, null, 2)}</pre>
}
```

### `useFieldArray(props)`

管理数组字段。

```typescript
import { useFieldArray, FormProvider, useForm } from '@airiot/client'

function TagsForm() {
  const form = useForm()

  return (
    <FormProvider {...form}>
      <TagsInput />
    </FormProvider>
  )
}

function TagsInput() {
  const { fields, append, remove } = useFieldArray({
    control: useFormContext().control,
    name: 'tags'
  })

  return (
    <div>
      {fields.map((item, index) => (
        <div key={item.id}>
          <Controller
            name={`tags.${index}.name`}
            control={useFormContext().control}
            render={({ field }) => (
              <input {...field} />
            )}
          />
          <button onClick={() => remove(index)}>删除</button>
        </div>
      ))}
      <button onClick={() => append({ name: '' })}>添加标签</button>
    </div>
  )
}
```

### `Controller`

完全控制字段渲染。

```typescript
import { Controller, useFormContext } from '@airiot/client'

function CustomInput({ name }: { name: string }) {
  const { control } = useFormContext()
  const uiState = useFieldUIStateValue(name)

  return uiState.visible ? (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState }) => (
        <div className="flex flex-col gap-1">
          <label>{name}</label>
          <input {...field} disabled={uiState.disabled} />
          {fieldState.error?.message && (
            <span className="text-red-500">{fieldState.error.message}</span>
          )}
          {uiState.loading && <span>加载中...</span>}
        </div>
      )}
    />
  ) : null
}
```

---

## 迁移指南

如果您从旧版本（react-final-form + Ajv）迁移，请注意以下变化：

### 1. 表单组件

**旧版本:**
```typescript
import { Form, SchemaForm } from '@airiot/client'
<SchemaForm schema={schema} onSubmit={onSubmit} />
```

**新版本:**
```typescript
import { useForm, useFormSchema, FormProvider } from '@airiot/client'

const { fields, resolver } = useFormSchema({ schema })
const form = useForm({ resolver })
<FormProvider {...form}>
  {/* 表单内容 */}
</FormProvider>
```

### 2. 表单 Hook

**旧版本:**
```typescript
const { form, formState, values } = useForm({ schema })
```

**新版本:**
```typescript
const form = useForm({ onEffect: (values, methods) => {} })
form.setFieldUIState('fieldName', { visible: false })
```

### 3. Context

**旧版本:**
```typescript
const { form, ... } = useFormContext()
```

**新版本:**
```typescript
import { useFormContext, FormProvider } from '@airiot/client'
const { control } = useFormContext()
```

### 4. 字段渲染

**旧版本:**
```typescript
<Field name="username" component={Input} />
```

**新版本:**
```typescript
import { Controller } from '@airiot/client'
<Controller
  name="username"
  control={control}
  render={({ field }) => <Input {...field} />}
/>
```

---

## 相关文档

- [JSON Schema 规范](https://json-schema.org/)
- [react-hook-form 文档](https://react-hook-form.com/)
- [Zod 文档](https://zod.dev/)
- [shadcn/ui 文档](https://ui.shadcn.com/)
