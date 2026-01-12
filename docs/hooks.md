# 全局钩子

全局钩子提供应用级别的配置、消息等功能。

## Hooks

### `useConfig()`

获取和设置全局配置。

```typescript
import { useConfig } from '@airiot/client'

function ConfigComponent() {
  const [config, setConfig] = useConfig()

  const updateConfig = (newConfig) => {
    setConfig({ ...config, ...newConfig })
  }

  return <div>{JSON.stringify(config)}</div>
}
```

### `useConfigValue()`

只读访问全局配置。

```typescript
import { useConfigValue } from '@airiot/client'

function ConfigDisplay() {
  const config = useConfigValue()

  return <div>{config.language}</div>
}
```

### `useSetConfig()`

只设置全局配置。

```typescript
import { useSetConfig } from '@airiot/client'

function ConfigUpdater() {
  const setConfig = useSetConfig()

  const updateLanguage = (lang) => {
    setConfig({ language: lang })
  }

  return <button onClick={() => updateLanguage('en')}>English</button>
}
```

### `useSettings()`

获取服务器端设置（异步）。

```typescript
import { useSettings } from '@airiot/client'

async function loadSettings() {
  const settings = await useSettings()
  console.log('Settings:', settings)
}
```

**返回值：**

返回从 `core/setting` API 获取的设置对象。

### `useMessage()`

消息提示（需自行实现）。

```typescript
import { useMessage } from '@airiot/client'

function MyComponent() {
  const message = useMessage()

  const handleClick = () => {
    message.info('这是一条信息')
    message.success('操作成功')
    message.error('操作失败')
  }

  return <button onClick={handleClick}>显示消息</button>
}
```

**注意：** 默认实现是空函数，需要在应用中自行集成消息提示组件。

## 配置结构

### 全局配置

```typescript
interface Config {
  language?: string           // 语言设置
  module?: string             // 当前模块
  theme?: string              // 主题
  [key: string]: any          // 其他自定义配置
}
```

## 使用示例

### 应用初始化

```typescript
import { useSetConfig } from '@airiot/client'
import { useEffect } from 'react'

function App() {
  const setConfig = useSetConfig()

  useEffect(() => {
    // 加载初始配置
    const loadConfig = async () => {
      const settings = await fetchSettings()
      setConfig({
        language: settings.language || 'zh-CN',
        module: 'admin',
        theme: 'light'
      })
    }

    loadConfig()
  }, [])

  return <div>{/* 应用内容 */}</div>
}
```

### 语言切换

```typescript
import { useConfigValue, useSetConfig } from '@airiot/client'

function LanguageSwitcher() {
  const config = useConfigValue()
  const setConfig = useSetConfig()

  const changeLanguage = (lang) => {
    setConfig({ language: lang })
    // 可能需要重新加载某些组件或页面
  }

  return (
    <select
      value={config.language}
      onChange={(e) => changeLanguage(e.target.value)}
    >
      <option value="zh-CN">中文</option>
      <option value="en">English</option>
    </select>
  )
}
```

### 加载服务器设置

```typescript
import { useSettings, useSetConfig } from '@airiot/client'
import { useEffect } from 'react'

function SettingsLoader() {
  const setConfig = useSetConfig()

  useEffect(() => {
    const load = async () => {
      try {
        const settings = await useSettings()
        setConfig(settings)
      } catch (error) {
        console.error('Failed to load settings:', error)
      }
    }
    load()
  }, [])

  return null
}
```

### 自定义消息提示

```typescript
import { createContext, useContext } from 'react'
import { useMessage as useOriginalMessage } from '@airiot/client'

// 创建自定义消息上下文
const MessageContext = createContext(null)

function MessageProvider({ children }) {
  const showMessage = (type, content) => {
    // 实现实际的消息提示 UI
    const toast = document.createElement('div')
    toast.className = `toast toast-${type}`
    toast.textContent = content
    document.body.appendChild(toast)

    setTimeout(() => {
      toast.remove()
    }, 3000)
  }

  const message = {
    info: (content) => showMessage('info', content),
    success: (content) => showMessage('success', content),
    error: (content) => showMessage('error', content)
  }

  return (
    <MessageContext.Provider value={message}>
      {children}
    </MessageContext.Provider>
  )
}

// 覆盖默认 useMessage
export function useMessage() {
  const customMessage = useContext(MessageContext)
  return customMessage || useOriginalMessage()
}
```
