import { useState } from 'react'
import { useForm, SchemaForm } from '@airiot/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select } from '@/components/ui/select'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'

const userFormSchema = {
  type: 'object' as const,
  properties: {
    username: { type: 'string', title: '用户名', minLength: 3, maxLength: 20 },
    email: { type: 'string', format: 'email', title: '邮箱' },
    age: { type: 'integer', title: '年龄', minimum: 0, maximum: 120 },
    gender: { type: 'string', title: '性别', enum: ['male', 'female', 'other'] },
    status: { type: 'string', title: '状态', enum: ['active', 'inactive', 'pending'] },
    bio: { type: 'string', title: '简介' }
  },
  required: ['username', 'email']
}

const userModel = {
  name: 'demo',
  title: '演示模型',
  resource: 'demo',
  properties: {
    id: { type: 'string', title: 'ID' },
    name: { type: 'string', title: '名称' },
    email: { type: 'string', format: 'email', title: '邮箱' },
    age: { type: 'integer', title: '年龄', minimum: 0 },
    status: { type: 'string', title: '状态' },
    createdAt: { type: 'string', title: '创建时间', format: 'date-time' }
  },
  listFields: ['id', 'name', 'email', 'age', 'status', 'createdAt']
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
        <CardDescription>演示 useForm 和 Form 组件的功能</CardDescription>
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

        {/* 使用 useForm 的示例 */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-4">使用 useForm Hook</h3>
          <SchemaForm
            schema={userFormSchema}
            onSubmit={handleSubmit}
            render={({ form, values, errors }) => (
              <form onSubmit={form.handleSubmit} className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-2">用户名 *</label>
                  <input
                    {...form.getInputProps('username')}
                    placeholder="请输入用户名"
                  />
                  {errors.username && <p className="text-red-500 text-sm">{errors.username}</p>}
                </div>

                <div>
                  <label className="text-sm font-medium mb-2">邮箱 *</label>
                  <input
                    {...form.getInputProps('email')}
                    type="email"
                    placeholder="请输入邮箱"
                  />
                  {errors.email && <p className="text-red-500 text-sm">{errors.email}</p>}
                </div>

                <div>
                  <label className="text-sm font-medium mb-2">年龄 (0-120)</label>
                  <input
                    {...form.getInputProps('age')}
                    type="number"
                    min="0"
                    max="120"
                  />
                  {errors.age && <p className="text-red-500 text-sm">{errors.age}</p>}
                </div>

                <div>
                  <label className="text-sm font-medium mb-2">性别</label>
                  <select
                    {...form.getInputProps('gender')}
                  >
                    <option value="">请选择</option>
                    <option value="male">男</option>
                    <option value="female">女</option>
                    <option value="other">其他</option>
                  </select>
                </div>

                <div>
                  <label className="text-sm font-medium mb-2">状态</label>
                  <select
                    {...form.getInputProps('status')}
                  >
                    <option value="">请选择</option>
                    <option value="active">激活</option>
                    <option value="inactive">未激活</option>
                    <option value="pending">待定</option>
                  </select>
                </div>

                <div>
                  <label className="text-sm font-medium mb-2">简介</label>
                  <textarea
                    {...form.getInputProps('bio')}
                    placeholder="请输入简介"
                    rows={3}
                  />
                </div>

                <Button type="submit" disabled={form.submitting}>
                  {form.submitting ? '提交中...' : '提交表单'}
                </Button>
              </form>
            )}
          />
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
