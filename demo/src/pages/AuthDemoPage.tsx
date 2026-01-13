import { useState } from 'react'
import { useUser, useLogin, useLogout } from '@airiot/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'

export default function AuthDemoPage() {
  const { user, setUser } = useUser()
  const { showCode, onLogin } = useLogin()
  const { onLogout } = useLogout()
  const [loginForm, setLoginForm] = useState({
    username: '',
    password: '',
    verifyCode: '',
    remember: false
  })

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await onLogin({
        username: loginForm.username,
        password: loginForm.password,
        verifyCode: loginForm.verifyCode,
        remenber: loginForm.remember
      })
      setLoginForm({ username: '', password: '', verifyCode: '', remember: false })
      alert('登录成功！')
    } catch (err: any) {
      console.error('登录失败:', err)
      alert(`登录失败: ${err.message || err.json?._error || '未知错误'}`)
    }
  }

  const handleLogoutClick = () => {
    onLogout()
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
                <Button variant="destructive" onClick={handleLogoutClick}>
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
              {showCode && (
                <div>
                  <label className="text-sm font-medium mb-2">验证码</label>
                  <Input
                    placeholder="请输入验证码"
                    value={loginForm.verifyCode}
                    onChange={(e) => setLoginForm({ ...loginForm, verifyCode: e.target.value })}
                  />
                </div>
              )}
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
              <strong>useLogin()</strong> - 提供登录功能，返回 showCode 判断是否需要验证码
              <br />
              <strong>useLogout()</strong> - 提供登出功能，清除用户信息
              <br />
              所有请求会通过 Vite proxy 转发到 http://localhost:8080
            </AlertDescription>
          </Alert>
        </div>
      </CardContent>
    </Card>
  )
}
