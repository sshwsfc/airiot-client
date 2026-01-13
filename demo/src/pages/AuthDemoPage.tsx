import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'

export default function AuthDemoPage() {
  const [user, setUser] = useState<any>(null)
  const [loginForm, setLoginForm] = useState({
    username: '',
    password: '',
    verifyCode: '',
    remember: false
  })

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    setUser({
      id: 'demo-user',
      username: loginForm.username,
      token: 'demo-token',
      permissions: ['view', 'edit']
    })
    setLoginForm({ username: '', password: '', verifyCode: '', remember: false })
    alert('登录成功！')
  }

  const handleLogout = () => {
    setUser(null)
    alert('已登出')
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>认证模块演示</CardTitle>
        <CardDescription>演示 useUser, useLogin, useLogout 的功能</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* 用户状态 */}
          <div className="p-4 rounded-lg border bg-muted">
            <h3 className="text-lg font-semibold mb-3">当前用户</h3>
            {user ? (
              <div className="space-y-2">
                <p><strong>ID:</strong> {user.id}</p>
                <p><strong>用户名:</strong> {user.username}</p>
                <p><strong>Token:</strong> {user.token}</p>
                <p><strong>权限:</strong> {user.permissions?.join(', ') || '无'}</p>
                <Button variant="destructive" onClick={handleLogout}>
                  登出
                </Button>
              </div>
            ) : (
              <Alert variant="default">
                <AlertDescription>未登录</AlertDescription>
              </Alert>
            )}
          </div>

          {/* 登录表单 */}
          <div className="p-4 rounded-lg border">
            <h3 className="text-lg font-semibold mb-4">登录</h3>
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2">用户名</label>
                <Input
                  placeholder="请输入用户名"
                  value={loginForm.username}
                  onChange={(e) => setLoginForm({ ...loginForm, username: e.target.value })}
                  required
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-2">密码</label>
                <Input
                  type="password"
                  placeholder="请输入密码"
                  value={loginForm.password}
                  onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                  required
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-2">验证码</label>
                <Input
                  placeholder="请输入验证码"
                  value={loginForm.verifyCode}
                  onChange={(e) => setLoginForm({ ...loginForm, verifyCode: e.target.value })}
                />
              </div>
              <div className="flex items-center space-x-2">
                <label className="flex items-center space-x-2 text-sm">
                  <input
                    type="checkbox"
                    checked={loginForm.remember}
                    onChange={(e) => setLoginForm({ ...loginForm, remember: e.target.checked })}
                  />
                  记住我
                </label>
              </div>
              <Button type="submit" className="w-full">
                登录
              </Button>
            </form>
          </div>

          <Alert variant="default">
            <AlertDescription>
              <strong>说明：</strong>
              <br />
              <strong>useUser()</strong> - 获取和设置用户信息
              <br />
              <strong>useLogin()</strong> - 提供登录功能
              <br />
              <strong>useLogout()</strong> - 提供登出功能
            </AlertDescription>
          </Alert>
        </div>
      </CardContent>
    </Card>
  )
}
