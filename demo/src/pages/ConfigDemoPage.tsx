import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'

export default function ConfigDemoPage() {
  const [config, setConfig] = useState({
    language: 'zh-CN',
    module: 'admin'
  })
  const [settings, setSettings] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  const handleUpdateConfig = () => {
    alert('配置已更新')
  }

  const handleLoadSettings = () => {
    setLoading(true)
    setTimeout(() => {
      setSettings({
        appName: '@airiot/client Demo',
        version: '1.0.0',
        description: '演示应用',
        features: ['API 模块', '认证模块', '表单模块', '模型模块', '内置模型'],
        author: 'Airiot Team'
      })
      setLoading(false)
      alert('设置加载成功')
    }, 1000)
  }

  const handleShowMessage = (type: string) => {
    if (type === 'info') alert('这是一条信息')
    if (type === 'success') alert('操作成功')
    if (type === 'error') alert('操作失败')
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>全局配置演示</CardTitle>
        <CardDescription>演示 getConfig, setConfig, getSettings, useMessage 的功能</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* 当前配置 */}
          <div className="p-4 rounded-lg border bg-muted">
            <h3 className="text-lg font-semibold mb-3">当前全局配置</h3>
            <div className="space-y-2">
              <p><strong>语言 (language):</strong> {config.language || '未设置'}</p>
              <p><strong>模块 (module):</strong> {config.module || '未设置'}</p>
            </div>
          </div>

          {/* 更新配置 */}
          <div className="p-4 rounded-lg border">
            <h3 className="text-lg font-semibold mb-3">更新配置</h3>
            <form onSubmit={(e) => { e.preventDefault(); handleUpdateConfig() }} className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2">语言</label>
                <Input
                  value={config.language}
                  onChange={(e) => setConfig({ ...config, language: e.target.value })}
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-2">模块</label>
                <Input
                  value={config.module}
                  onChange={(e) => setConfig({ ...config, module: e.target.value })}
                />
              </div>
              <Button type="submit">
                更新配置
              </Button>
            </form>
          </div>

          {/* 加载服务器设置 */}
          <div className="p-4 rounded-lg border">
            <h3 className="text-lg font-semibold mb-3">服务器设置</h3>
            <Button
              onClick={handleLoadSettings}
              disabled={loading}
              className="w-full"
            >
              {loading ? '加载中...' : '加载服务器设置'}
            </Button>

            {settings && (
              <div style={{ marginTop: '15px' }}>
                <h4 className="font-semibold mb-2">服务器设置内容：</h4>
                <pre className="p-4 rounded-lg bg-muted text-sm overflow-auto" style={{ maxHeight: '200px' }}>
                  {JSON.stringify(settings, null, 2)}
                </pre>
              </div>
            )}
          </div>

          {/* 消息提示 */}
          <div className="p-4 rounded-lg border">
            <h3 className="text-lg font-semibold mb-3">消息提示</h3>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => handleShowMessage('info')}>
                显示信息
              </Button>
              <Button variant="secondary" onClick={() => handleShowMessage('success')}>
                显示成功
              </Button>
              <Button variant="destructive" onClick={() => handleShowMessage('error')}>
                显示错误
              </Button>
            </div>
          </div>

          <Alert variant="default">
            <AlertDescription>
              <strong>说明：</strong>
              <br />
              <strong>getConfig()</strong> - 获取当前全局配置
              <br />
              <strong>setConfig(config)</strong> - 设置全局配置
              <br />
              <strong>getSettings()</strong> - 异步获取服务器端设置（从 core/setting API）
              <br />
              <strong>useMessage()</strong> - 消息提示 Hook（需自行实现 UI）
            </AlertDescription>
          </Alert>
        </div>
      </CardContent>
    </Card>
  )
}
