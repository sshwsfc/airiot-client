import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select } from '@/components/ui/select'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'

export default function FormDemoPage() {
  const [submitted, setSubmitted] = useState<any>(null)
  const [formValues, setFormValues] = useState({
    username: '',
    email: '',
    age: '',
    gender: '',
    status: '',
    bio: ''
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitted(formValues)
    alert('表单提交成功！')
  }

  const handleFieldChange = (field: string, value: any) => {
    setFormValues({ ...formValues, [field]: value })
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>表单模块演示</CardTitle>
        <CardDescription>演示 SchemaForm, useForm, 自定义表单的功能</CardDescription>
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

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-2">用户名 *</label>
            <Input
              placeholder="请输入用户名"
              value={formValues.username}
              onChange={(e) => handleFieldChange('username', e.target.value)}
              required
            />
          </div>
          <div>
            <label className="text-sm font-medium mb-2">邮箱 *</label>
            <Input
              type="email"
              placeholder="请输入邮箱"
              value={formValues.email}
              onChange={(e) => handleFieldChange('email', e.target.value)}
              required
            />
          </div>
          <div>
            <label className="text-sm font-medium mb-2">年龄 (0-120)</label>
            <Input
              type="number"
              min="0"
              max="120"
              value={formValues.age}
              onChange={(e) => handleFieldChange('age', e.target.value)}
            />
          </div>
          <div>
            <label className="text-sm font-medium mb-2">性别</label>
            <Select
              value={formValues.gender}
              onChange={(e) => handleFieldChange('gender', e.target.value)}
            >
              <option value="">请选择</option>
              <option value="male">男</option>
              <option value="female">女</option>
              <option value="other">其他</option>
            </Select>
          </div>
          <div>
            <label className="text-sm font-medium mb-2">状态</label>
            <Select
              value={formValues.status}
              onChange={(e) => handleFieldChange('status', e.target.value)}
            >
              <option value="">请选择</option>
              <option value="active">激活</option>
              <option value="inactive">未激活</option>
              <option value="pending">待定</option>
            </Select>
          </div>
          <div>
            <label className="text-sm font-medium mb-2">简介</label>
            <Textarea
              placeholder="请输入简介"
              value={formValues.bio}
              onChange={(e) => handleFieldChange('bio', e.target.value)}
              rows={3}
            />
          </div>
          <Button type="submit">提交表单</Button>
        </form>

        <Alert variant="default" className="mt-6">
          <AlertDescription>
            <strong>说明：</strong>
            <br />
            <strong>SchemaForm:</strong> - 基于 JSON Schema 的快速表单组件
            <br />
            <strong>useForm:</strong> - 完全自定义表单的 Hook
            <br />
            <strong>FieldArray:</strong> - 动态数组字段组件
            <br />
            支持的验证规则：minLength, maxLength, minimum, maximum, format(email), custom validate
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  )
}
