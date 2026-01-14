import { useState } from 'react'
import type { ReactNode } from 'react'
import { useForm, SchemaForm, Form, setFormFields } from '@airiot/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select } from '@/components/ui/select'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'

setFormFields({
  text: {
    component: Input,
    parse: (value: string) => value === '' ? null : value
  },
  textarea: {
    component: Textarea,
    parse: (value: string) => value === '' ? null : value
  },
  number: {
    component: Input,
    parse: (value: string) => {
      return value === '' || value == null ? null : parseFloat(value)
    },
    attrs: {
      type: 'number',
      style: {
        maxWidth: 200
      }
    }
  },
  integer: {
    component: Input,
    parse: (value: string) => {
      return value === '' || value == null ? null : parseFloat(value)
    },
    attrs: {
      type: 'number',
      style: {
        maxWidth: 200
      }
    }
  },
  select: {
    component: Select,
    parse: (value: string) => value
  },
  numselect: {
    component: Select,
    parse: (value: string) => {
      return value === '' || value == null ? null : parseFloat(value)
    }
  },
  // date: {
  //   component: DatePicker
  // },
  // datetime: {
  //   component: DatetimePicker
  // },
  // time: {
  //   component: TimePicker
  // },
  // bool: {
  //   component: Checkbox,
  //   normalize: (value, previousValue) => {
  //     return Boolean(value)
  //   }
  // },
  // checkbox: {
  //   component: Checkbox
  // },
  // transfer: {
  //   component: Transfer
  // },
  // fieldset: {
  //   component: Fieldset
  // },
  // array: {
  //   component: ArrayWidget
  // }
})

interface FieldGroupProps {
  label?: ReactNode;
  meta?: {
    touched?: boolean;
    error?: any;
    submitError?: any;
  };
  input?: { [key: string]: any };
  field?: {
    attrs?: { [key: string]: any };
    description?: ReactNode;
    help?: ReactNode;
    required?: boolean;
    formText?: ReactNode;
  };
  children?: ReactNode;
}

const FieldGroup = (props: FieldGroupProps) => {
  const { label, meta, input, field, children } = props;
  const attrs = field?.attrs || {};
  const error = meta?.touched && (meta.error || meta.submitError);
  const extra = field?.description || field?.help;

  const controlComponent = children ? children : (<Input {...input} {...attrs} />);

  return (
    <div className={`flex space-x-4 space-y-0 ${error ? 'text-destructive' : ''}`}>
      <label className='w-1/6 h-9 flex items-center justify-end'>
        {field?.required && <span className='text-destructive'>*</span>}
        {label}
      </label>
      <div className='flex-2'>
        <div className='relative'>
          {controlComponent}
        </div>
        {extra && <div className='text-sm text-muted-foreground mt-1'>{extra}</div>}
        <div className='text-sm text-destructive mt-1'>{field?.formText}</div>
        {error && <div className='text-sm text-destructive mt-1'>{typeof error === 'string' ? error : '验证失败'}</div>}
      </div>
    </div>
  );
};

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
    age: { type: 'integer', title: '年龄', minimum: 0, maximum: 120 },
    gender: { type: 'string', title: '性别', enum: ['male', 'female', 'other'] },
    status: { type: 'string', title: '状态', enum: ['active', 'inactive', 'pending'] },
    bio: { type: 'string', title: '简介' }
  },
  required: ['username', 'email'],
  form: [
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
}

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
            fields={userFormFields}
            onSubmit={handleSubmit}
            group={FieldGroup}
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
          </Form>
        </div>

        {/* 使用 SchemaForm 的示例 */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-4">使用 SchemaForm 组件</h3>
          <SchemaForm
            schema={userFormSchema}
            onSubmit={handleSubmit}
            group={FieldGroup}
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
