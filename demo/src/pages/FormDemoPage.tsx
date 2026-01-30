import React, { useState, cloneElement } from 'react'
import type { ReactNode } from 'react'
import { useForm, FormProvider, useFormContext, useFormSchema, useFieldUIStateValue, Controller } from '@airiot/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { 
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue, } from '@/components/ui/select'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"


const Form = ({ children, onSubmit, onEffect, ...props }: { children: ReactNode, onSubmit: (data: any) => void, onEffect?: (values: any, methods: any) => void }) => {
  const methods = useForm({ ...props, onEffect })
  console.log('Form methods:', methods)
  return (<FormProvider {...methods}>
      <form onSubmit={methods.handleSubmit(onSubmit)}>
        {children}
      </form>
    </FormProvider>
  )
}

const SchemaForm = ({ schema, formSchema, onSubmit, children, ...props }: { schema: any, formSchema?: any, onSubmit: (data: any) => void, children?: (props: any) => ReactNode }) => {
  const { fields, resolver } = useFormSchema({ schema, formSchema })
  console.log('SchemaForm fields:', fields, resolver)
  const methods = useForm({
    resolver: resolver, ...props
  } as any)

  return (<FormProvider {...methods}>
      <form onSubmit={methods.handleSubmit(onSubmit)}>
        <input type="submit" />
      </form>
      {/* {children({
        children: fields,
        invalid: !methods.formState.isValid,
        submitting: methods.formState.isSubmitting,
        handleSubmit: methods.handleSubmit(onSubmit)
      })} */}
    </FormProvider>
  )
}

const fieldMap: { [key: string]: React.ComponentType<any> } = {
  'text': Input,
  'select': Select,
  'textarea': Textarea,
  'number': Input
}

const FormField = ({ name, label, type, description, children, options }: { name: string, label?: ReactNode, type?: string, description?: ReactNode, children?: ReactNode | ((props: any) => ReactNode), options?: any }) => {
  const { control } = useFormContext()
  const ui = useFieldUIStateValue(name)
  const ContorlComponent = type && fieldMap[type] || Input

  return ui.visible ? (
    <Controller
        name={name}
        control={control}
        rules={options}
        render={({ field, fieldState }) => (
        <Field data-invalid={fieldState.invalid}>
          <FieldLabel htmlFor={`form-rhf-${name}`}>
            {label || name}
          </FieldLabel>
          {
            children ? ( typeof children === 'function' ? children({
              id: `form-rhf-${name}`,
              ...field,
              ref: null,
              'aria-invalid': fieldState.invalid
            }) : cloneElement(children as React.ReactElement, {
              id: `form-rhf-${name}`,
              ...field,
              ref: null,
              'aria-invalid': fieldState.invalid
            }) ) : (
              <ContorlComponent
                id={`form-rhf-${name}`}
                {...field}
                ref={null}
                aria-invalid={fieldState.invalid}
              />
            )
          }
          {description && (
            <FieldDescription>
              {description}
            </FieldDescription>
          )}
          {fieldState.invalid && (
            <FieldError errors={[fieldState.error]} />
          )}
        </Field>
      )}
    />
  ) : null
}

const userFormFields = [
  { name: 'username', label: '用户名', type: 'text', required: true },
  { name: 'email', label: '邮箱', type: 'text', required: true },
  { name: 'age', label: '年龄', type: 'number' },
]

const userFormSchema = {
  type: 'object' as const,
  properties: {
    username: { type: 'string', title: '用户名', minLength: 3, maxLength: 20 },
    email: { type: 'string', title: '邮箱' },
    age: { type: 'number', title: '年龄', minimum: 0, maximum: 120 },
    gender: { type: 'string', title: '性别', enum: ['male', 'female', 'other'] },
    status: { type: 'string', title: '状态', enum: ['active', 'inactive', 'pending'] },
    bio: { type: 'string', title: '简介' }
  },
  required: ['username', 'email']
}
const userFormUISchema = [
  { key: 'username', component: Input },
  { key: 'email', component: Input },
  { key: 'age', component: Input },
  { key: 'gender', component: Select, options: [
    { label: '男', value: 'male' },
    { label: '女', value: 'female' },
    { label: '其他', value: 'other' }
  ] },
  { key: 'status', component: Select, options: [
    { label: '活跃', value: 'active' },
    { label: '不活跃', value: 'inactive' },
    { label: '待定', value: 'pending' }
  ] },
  { key: 'bio', component: Textarea }
]

const GenderSelect = ({ value, onChange, ['aria-invalid']: ariaInvalid }: { value?: string, onChange?: (value: string) => void, ['aria-invalid']?: boolean }) => (
  <Select value={value} onValueChange={onChange}>
    <SelectTrigger className="w-full max-w-48" aria-invalid={ariaInvalid}>
      <SelectValue placeholder="Select a gender" />
    </SelectTrigger>
    <SelectContent>
      <SelectGroup>
        <SelectLabel>Gender</SelectLabel>
        <SelectItem value="male">Male</SelectItem>
        <SelectItem value="female">Female</SelectItem>
        <SelectItem value="other">Other</SelectItem>
      </SelectGroup>
    </SelectContent>
  </Select>
)

export default function FormDemoPage() {
  const [submitted, setSubmitted] = useState<any>(null)

  const handleSubmit = (values: any) => {
    console.log('表单提交:', values)
    setSubmitted(values)
    alert('表单提交成功！')
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>表单模块演示</CardTitle>
        <CardDescription>演示 useForm 和 Form、 SchemaForm 组件的功能</CardDescription>
      </CardHeader>
      <CardContent>
        {submitted && (
          <Alert variant="default" className="mb-4">
            <AlertDescription>
              <strong>提交成功：</strong>
              <pre className="mt-2 p-2 rounded bg-muted text-xs">
                {JSON.stringify(submitted, null, 2)}
              </pre>
            </AlertDescription>
          </Alert>
        )}
        {/* 使用 Form 的示例 */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-4">使用 Form 组件</h3>
          <Form
            onSubmit={handleSubmit}
            onEffect={(values: any, { setFieldUIState }) => {
              console.log('Form Effect - 当前值:', values, setFieldUIState)
              if(values.gender === 'other') {
                // 设置 status 字段为只读
                console.log('设置 status 字段为不可见')
                setFieldUIState('status', (prev: any) => ({ ...prev, visible: false }))
              } else {
                setFieldUIState('status', (prev: any) => ({ ...prev, visible: true }))
              }
            }}
          >
            <FieldGroup>
              {userFormFields.map(field => (
                <FormField
                  name={field.name}
                  label={field.label}
                  type={field.type}
                  options={{ required: field.required }}
                />
              ))}
              <FormField
                name="gender"
                label="性别"
                options={{ required: true }}
              >
                <GenderSelect />
              </FormField>
              <FormField
                name="status"
                label="状态"
                options={{ required: true }}
              >
                <Input placeholder="active, inactive, pending" />
              </FormField>
            </FieldGroup>
            {/** 提交和取消按钮 */}
            <div className='flex mt-4 justify-center'>
              <Button type="submit">
                Submit
              </Button>
            </div>
          </Form>
        </div>

        {/* 使用 SchemaForm 的示例 */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-4">使用 SchemaForm 组件</h3>
          <SchemaForm
            schema={userFormSchema}
            formSchema={userFormUISchema}
            onSubmit={handleSubmit}
          >{props => {
              const { children, invalid, handleSubmit, submitting, onCancel } = props
              return (
                <form className="rounded-md border p-4 space-y-4" onSubmit={handleSubmit}>
                  {children}
                  <div className='flex gap-4 justify-center'>
                    <Button type="submit" disabled={invalid || submitting}>保存</Button>
                    <Button onClick={() => onCancel ? onCancel() : history.back()} variant="secondary">取消</Button>
                  </div>
                </form>
              )
            }}
          </SchemaForm>
        </div>

        <Alert variant="default" className="mt-6">
          <AlertDescription>
            <strong>说明：</strong>
            <br />
            <strong>useForm:</strong> - 完全自定义表单的 Hook，使用 JSON Schema 进行验证
            <br />
            <strong>Form:</strong> - 基于 React Final Form 的表单组件
            <br />
            支持的验证规则：minLength, maxLength, minimum, maximum, format(email), enum, required
            <br />
            所有请求会通过 Vite proxy 转发到 http://localhost:8080
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  )
}
