# 表单模块

表单模块基于 JSON Schema 提供强大的表单构建和验证功能。

## 导出

```typescript
import {
  // 组件
  Form,
  SchemaForm,
  BaseForm,
  FieldArray,

  // Hooks
  useForm,

  // 工具函数
  fieldBuilder,
  objectBuilder,
  schemaConvert,

  // 配置函数
  setFormFields,
  setSchemaConverters
} from '@airiot/client'
```

## 组件

### `SchemaForm`

基于 JSON Schema 的表单组件。

```typescript
import { SchemaForm } from '@airiot/client'

const userSchema = {
  type: 'object',
  properties: {
    username: {
      type: 'string',
      title: '用户名',
      minLength: 3
    },
    email: {
      type: 'string',
      format: 'email',
      title: '邮箱'
    },
    age: {
      type: 'integer',
      title: '年龄',
      minimum: 0,
      maximum: 120
    }
  },
  required: ['username', 'email']
}

function UserForm() {
  const handleSubmit = (values) => {
    console.log('Form values:', values)
  }

  return (
    <SchemaForm
      schema={userSchema}
      onSubmit={handleSubmit}
    />
  )
}
```

**Props：**

- `schema` - JSON Schema 对象（必填）
- `onSubmit` - 提交回调函数
- `validate` - 自定义验证函数
- `initialValues` - 初始值

### `Form`

通用表单组件。

```typescript
import { Form } from '@airiot/client'

function MyForm() {
  return (
    <Form onSubmit={handleSubmit}>
      <input name="username" />
      <input name="email" type="email" />
      <button type="submit">提交</button>
    </Form>
  )
}
```

### `BaseForm`

基础表单组件，提供更多自定义选项。

```typescript
import { BaseForm } from '@airiot/client'

function CustomForm() {
  return (
    <BaseForm
      schema={schema}
      onSubmit={handleSubmit}
      validate={validate}
      effect={effect}
      {...otherProps}
    >
      {({ form, formState }) => (
        <form onSubmit={form.handleSubmit}>
          {/* 自定义表单内容 */}
        </form>
      )}
    </BaseForm>
  )
}
```

### `useForm()`

表单 Hook，用于完全自定义表单实现。

```typescript
import { useForm } from '@airiot/client'

function CustomForm() {
  const { form, formState, values, errors } = useForm({
    schema: userSchema,
    onSubmit: handleSubmit
  })

  return (
    <form onSubmit={form.handleSubmit}>
      <input {...form.getInputProps('username')} />
      {errors.username && <span>{errors.username}</span>}
      <button type="submit">提交</button>
    </form>
  )
}
```

## JSON Schema 格式

### 基础字段类型

```typescript
const schema = {
  type: 'object',
  properties: {
    // 文本字段
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
      format: 'datetime',
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
      validationMessage: {
        minLength: '用户名至少 3 个字符',
        maxLength: '用户名最多 20 个字符'
      }
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

### 自定义验证函数

```typescript
import { SchemaForm } from '@airiot/client'

function MyForm() {
  const validate = (values) => {
    const errors = {}

    // 密码确认验证
    if (values.password !== values.confirmPassword) {
      errors.confirmPassword = '两次密码输入不一致'
    }

    // 自定义业务验证
    if (values.username === 'admin') {
      errors.username = '不能使用 admin 作为用户名'
    }

    return errors
  }

  return (
    <SchemaForm
      schema={schema}
      onSubmit={handleSubmit}
      validate={validate}
    />
  )
}
```

## 工具函数

### `schemaConvert(schema, options)`

将 JSON Schema 转换为表单字段配置。

```typescript
import { schemaConvert } from '@airiot/client'

const formFields = schemaConvert(schema, {
  readonly: ['id'],
  required: ['username']
})
```

### `fieldBuilder(key, schema, options)`

构建单个表单字段。

```typescript
import { fieldBuilder } from '@airiot/client'

const field = fieldBuilder('username', {
  type: 'string',
  title: '用户名'
}, {})
```

### `objectBuilder(schema, options)`

构建对象表单字段。

```typescript
import { objectBuilder } from '@airiot/client'

const objectField = objectBuilder({
  type: 'object',
  properties: {
    username: { type: 'string', title: '用户名' }
  }
}, {})
```

## 高级功能

### 自定义字段渲染器

```typescript
import { setFormFields } from '@airiot/client'

// 注册自定义字段渲染器
setFormFields({
  custom: ({ field, form }) => (
    <CustomComponent {...field} />
  )
})

// 在 schema 中使用
const schema = {
  type: 'object',
  properties: {
    customField: {
      type: 'string',
      title: '自定义字段',
      formRender: 'custom'
    }
  }
}
```

### 自定义 Schema 转换器

```typescript
import { setSchemaConverters } from '@airiot/client'

// 注册自定义转换器
setSchemaConverters([
  // 现有的转换器...
  (field, schema, options) => {
    // 自定义转换逻辑
    if (schema.type === 'custom-type') {
      field.type = 'custom-component'
    }
    return field
  }
])
```

### 使用 FieldArray

```typescript
import { SchemaForm, FieldArray } from '@airiot/client'

function DynamicForm() {
  return (
    <SchemaForm
      schema={schema}
      onSubmit={handleSubmit}
    >
      {(form) => (
        <FieldArray name="items">
          {({ fields }) => (
            <div>
              {fields.map((field, index) => (
                <div key={field.key}>
                  <input name={`items.${index}.name`} />
                  <button onClick={() => fields.remove(index)}>删除</button>
                </div>
              ))}
              <button onClick={() => fields.push({})}>添加</button>
            </div>
          )}
        </FieldArray>
      )}
    </SchemaForm>
  )
}
```
