# 全局配置和工具

全局配置提供应用级别的设置和工具函数。

## 配置方法

### `setConfig(config: any)`

设置全局配置。

```typescript
import { setConfig } from '@airiot/client'

setConfig({
  user: { token: 'your-token', id: 'user123' },
  language: 'zh-CN',
  module: 'admin',
  settings: {
    safeRequest: true
  }
})
```

### `getConfig(): any`

获取当前全局配置。

```typescript
import { getConfig } from '@airiot/client'

const config = getConfig()
console.log(config.user)
console.log(config.language)
```

## 配置结构

### 全局配置

```typescript
interface Config {
  language?: string           // 语言设置
  module?: string             // 当前模块
  theme?: string              // 主题
  user?: User                 // 用户信息
  settings?: {                // 设置
    safeRequest?: boolean
    [key: string]: any
  }
  [key: string]: any          // 其他自定义配置
}
```

## 工具函数

### `getSettings()`

获取服务器端设置（异步）。

```typescript
import { getSettings } from '@airiot/client'

async function loadSettings() {
  const settings = await getSettings()
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

## 使用示例

### 应用初始化

```typescript
import { setConfig } from '@airiot/client'

// 在应用入口文件中初始化配置
setConfig({
  language: 'zh-CN',
  module: 'admin',
  theme: 'light'
})
```

### 更新配置

```typescript
import { getConfig, setConfig } from '@airiot/client'

function updateLanguage(lang) {
  const currentConfig = getConfig()
  setConfig({
    ...currentConfig,
    language: lang
  })
}
```

### 加载服务器设置

```typescript
import { getSettings, setConfig } from '@airiot/client'

async function loadAppSettings() {
  try {
    const settings = await getSettings()
    setConfig(settings)
  } catch (error) {
    console.error('Failed to load settings:', error)
  }
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
