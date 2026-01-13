import React from 'react'
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom'
import { LayoutDashboard, Database, Shield, FileText, FolderTree, Activity, Settings, Server } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'

import ApiDemoPage from './pages/ApiDemoPage'
import AuthDemoPage from './pages/AuthDemoPage'
import FormDemoPage from './pages/FormDemoPage'
import ModelDemoPage from './pages/ModelDemoPage'
import BuiltinModelsPage from './pages/BuiltinModelsPage'
import ConfigDemoPage from './pages/ConfigDemoPage'

function App() {
  const navigationItems = [
    { path: '/', label: '首页', icon: LayoutDashboard },
    { path: '/api', label: 'API 模块', icon: Database },
    { path: '/auth', label: '认证模块', icon: Shield },
    { path: '/form', label: '表单模块', icon: FileText },
    { path: '/model', label: '模型模块', icon: FolderTree },
    { path: '/builtin-models', label: '内置模型', icon: Activity },
    { path: '/config', label: '全局配置', icon: Settings }
  ]

  return (
    <BrowserRouter>
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="h-10 w-10 rounded-lg bg-primary flex items-center justify-center">
                <LayoutDashboard className="h-6 w-6 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-foreground">@airiot/client Demo</h1>
                <p className="text-sm text-muted-foreground">演示 @airiot/client 库的所有功能</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <a
                href="https://github.com/sshwsfc/airiot-client"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2"
              >
                <Server className="mr-2 h-4 w-4" />
                GitHub
              </a>
            </div>
          </div>
        </div>
      </header>

      {/* Layout */}
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-[260px_1fr] gap-6">
          {/* Sidebar Navigation */}
          <aside className="hidden md:block">
            <nav className="space-y-2">
              {navigationItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className="flex items-center space-x-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                >
                  <item.icon className="h-4 w-4" />
                  {item.label}
                </Link>
              ))}
            </nav>

            {/* Info Card */}
            <div className="mt-8 p-4 rounded-lg border bg-card">
              <h3 className="font-semibold text-foreground mb-2">功能模块</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-start space-x-2">
                  <Database className="h-4 w-4 mt-0.5 text-primary" />
                  <span>API 模块 - 简化的 HTTP 请求</span>
                </li>
                <li className="flex items-start space-x-2">
                  <Shield className="h-4 w-4 mt-0.5 text-primary" />
                  <span>认证模块 - 登录/登出流程</span>
                </li>
                <li className="flex items-start space-x-2">
                  <FileText className="h-4 w-4 mt-0.5 text-primary" />
                  <span>表单模块 - 基于 Schema 的表单</span>
                </li>
                <li className="flex items-start space-x-2">
                  <FolderTree className="h-4 w-4 mt-0.5 text-primary" />
                  <span>模型模块 - 集成的状态管理</span>
                </li>
                <li className="flex items-start space-x-2">
                  <Activity className="h-4 w-4 mt-0.5 text-primary" />
                  <span>内置模型 - 46 个预置模型</span>
                </li>
                <li className="flex items-start space-x-2">
                  <Settings className="h-4 w-4 mt-0.5 text-primary" />
                  <span>全局配置 - 应用级别设置</span>
                </li>
              </ul>
            </div>
          </aside>

          {/* Main Content */}
          <main>
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/api" element={<ApiDemoPage />} />
              <Route path="/auth" element={<AuthDemoPage />} />
              <Route path="/form" element={<FormDemoPage />} />
              <Route path="/model" element={<ModelDemoPage />} />
              <Route path="/builtin-models" element={<BuiltinModelsPage />} />
              <Route path="/config" element={<ConfigDemoPage />} />
            </Routes>
          </main>
        </div>
      </div>
    </div>
    </BrowserRouter>
  )
}

function HomePage() {
  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle>欢迎使用 @airiot/client Demo</CardTitle>
        <CardDescription>这是一个完整的演示项目，展示 @airiot/client 库的所有功能</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-semibold text-foreground mb-2">快速开始</h3>
            <p className="text-muted-foreground">选择左侧导航栏的模块，查看详细的演示功能。每个模块都展示了对应 API 和组件的实际使用方法。</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-lg border bg-card">
              <h4 className="font-semibold text-foreground mb-2 flex items-center">
                <Server className="mr-2 h-5 w-5 text-primary" />
                后端需求
              </h4>
              <p className="text-sm text-muted-foreground">某些功能需要后端 API 支持，此 Demo 主要演示前端功能。</p>
            </div>
            <div className="p-4 rounded-lg border bg-card">
              <h4 className="font-semibold text-foreground mb-2 flex items-center">
                <Activity className="mr-2 h-5 w-5 text-primary" />
                演示数据
              </h4>
              <p className="text-sm text-muted-foreground">Demo 使用模拟数据进行演示，实际使用需要连接真实后端。</p>
            </div>
          </div>

          <Alert>
            <AlertDescription>
              <strong>提示：</strong> 查看 <strong className="text-primary">内置模型</strong> 页面，了解所有 46 个预置的系统模型及其使用方法。
              <br />
              所有 UI 组件使用 shadcn/ui 风格，提供专业美观的界面体验。
            </AlertDescription>
          </Alert>
        </div>
      </CardContent>
    </Card>
  )
}

export default App
