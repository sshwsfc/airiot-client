# Page Hooks - 页面级 Hooks

Page Hooks 模块提供了一组用于页面开发的 React Hooks，用于管理页面变量、数据源订阅、组件上下文、视图状态和迭代数据等。

## 目录

- [概述](#概述)
- [页面变量 (PageVar)](#页面变量-pagevar)
- [数据源 (Datasource)](#数据源-datasource)
- [组件上下文 (Context)](#组件上下文-context)
- [组件函数 (Functions)](#组件函数-functions)
- [视图状态 (View)](#视图状态-view)
- [迭代数据 (Iteration)](#迭代数据-iteration)
- [订阅管理 (Subscribe)](#订阅管理-subscribe)

---

## 概述

Page Hooks 是基于 Jotai 状态管理库构建的页面级状态管理解决方案，提供了：

- **页面变量管理** - 管理页面级别的变量和状态
- **数据源管理** - 管理数据集和数据源
- **组件上下文** - 管理组件的数据上下文
- **函数管理** - 管理组件暴露的方法
- **视图状态** - 管理视图相关的状态
- **迭代数据** - 管理迭代上下文数据
- **订阅系统** - 管理数据点订阅

所有 hooks 都使用页面级别的 Store（通过 `PageStoreContext`），确保状态隔离。

---

## 页面变量 (PageVar)

页面变量管理提供了一组 hooks 用于管理页面级别的变量。

### Hooks

#### `usePageVar(path?: string)`

获取页面变量的 state 和 setter。

```typescript
import { usePageVar } from '@airiot/client'

function MyComponent() {
  const [value, setValue] = usePageVar('user.name')
  return <div>{value}</div>
}
```

#### `usePageVarValue(path?: string)`

获取页面变量的值（只读）。

```typescript
import { usePageVarValue } from '@airiot/client'

function MyComponent() {
  const userName = usePageVarValue('user.name')
  return <div>{userName}</div>
}
```

#### `useSetPageVar(path?: string)`

获取页面变量的 setter（只写）。

```typescript
import { useSetPageVar } from '@airiot/client'

function MyComponent() {
  const setUserName = useSetPageVar('user.name')

  const handleClick = () => {
    setUserName('John')
  }

  return <button onClick={handleClick}>设置名称</button>
}
```

#### `usePageVarCallback()`

获取页面变量的回调函数（用于在非组件环境中访问）。

```typescript
import { usePageVarCallback } from '@airiot/client'

function MyComponent() {
  const getPageVar = usePageVarCallback()

  const handleClick = () => {
    const allVars = getPageVar()
    console.log(allVars)
  }

  return <button onClick={handleClick}>获取所有变量</button>
}
```

### 使用示例

```typescript
import { usePageVar, usePageVarValue, useSetPageVar } from '@airiot/client'

function SettingsPage() {
  const [theme, setTheme] = usePageVar('theme')
  const language = usePageVarValue('language')
  const setLanguage = useSetPageVar('language')

  return (
    <div>
      <p>当前主题: {theme}</p>
      <p>当前语言: {language}</p>
      <button onClick={() => setTheme('dark')}>切换深色主题</button>
      <button onClick={() => setLanguage('en')}>Switch to English</button>
    </div>
  )
}
```

---

## 数据源 (Datasource)

数据源管理提供了一组 hooks 用于管理数据集和数据源。

### Hooks

#### `useDatasetSet(id: string)`

获取数据集的 setter。

```typescript
import { useDatasetSet } from '@airiot/client'

function MyComponent() {
  const setDataset = useDatasetSet('dataset1')

  const loadData = async () => {
    const data = await fetchData()
    setDataset(data)
  }

  return <button onClick={loadData}>加载数据</button>
}
```

#### `useDatasetsValue(ids: string[])`

获取多个数据集的值。

```typescript
import { useDatasetsValue } from '@airiot/client'

function MyComponent() {
  const datasets = useDatasetsValue(['dataset1', 'dataset2'])

  return (
    <div>
      <p>数据集1: {JSON.stringify(datasets['dataset1'])}</p>
      <p>数据集2: {JSON.stringify(datasets['dataset2'])}</p>
    </div>
  )
}
```

#### `useDatasourceValue(path: string)`

通过路径获取数据源值。

```typescript
import { useDatasourceValue } from '@airiot/client'

function MyComponent() {
  // 获取 dataset1.users 的值
  const users = useDatasourceValue('dataset1.users')

  return (
    <ul>
      {users?.map(user => (
        <li key={user.id}>{user.name}</li>
      ))}
    </ul>
  )
}
```

### 使用示例

```typescript
import { useDatasetSet, useDatasourceValue } from '@airiot/client'

function DataTable() {
  const setDataset = useDatasetSet('users')
  const users = useDatasourceValue('users')

  useEffect(() => {
    // 初始化数据
    setDataset([
      { id: 1, name: 'Alice', age: 25 },
      { id: 2, name: 'Bob', age: 30 }
    ])
  }, [])

  return (
    <table>
      <thead>
        <tr>
          <th>ID</th>
          <th>姓名</th>
          <th>年龄</th>
        </tr>
      </thead>
      <tbody>
        {users?.map(user => (
          <tr key={user.id}>
            <td>{user.id}</td>
            <td>{user.name}</td>
            <td>{user.age}</td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}
```

---

## 组件上下文 (Context)

组件上下文提供了一组 hooks 用于管理组件的数据上下文。

### Hooks

#### `useDataVarValue(cellkey: string)`

获取组件数据变量的值。

```typescript
import { useDataVarValue } from '@airiot/client'

function MyComponent() {
  const data = useDataVarValue('component1')
  return <div>{JSON.stringify(data)}</div>
}
```

#### `useSetDataVar(cellkey: string)`

设置组件数据变量。

```typescript
import { useSetDataVar } from '@airiot/client'

function MyComponent() {
  const setData = useSetDataVar('component1')

  const updateData = () => {
    setData({ status: 'active', value: 100 })
  }

  return <button onClick={updateData}>更新数据</button>
}
```

### 使用示例

```typescript
import { useDataVarValue, useSetDataVar } from '@airiot/client'

function Component() {
  const data = useDataVarValue('myComponent')
  const setData = useSetDataVar('myComponent')

  const handleStatusChange = (newStatus: string) => {
    setData({ ...data, status: newStatus })
  }

  return (
    <div>
      <p>状态: {data?.status}</p>
      <button onClick={() => handleStatusChange('active')}>激活</button>
      <button onClick={() => handleStatusChange('inactive')}>停用</button>
    </div>
  )
}
```

---

## 组件函数 (Functions)

组件函数管理提供了一组 hooks 用于管理组件暴露的方法和事件。

### Hooks

#### `useFunctions(path?: string)`

获取组件函数的 state 和 setter。

```typescript
import { useFunctions } from '@airiot/client'

function MyComponent() {
  const [functions, setFunctions] = useFunctions('myComponent')

  const handleClick = () => {
    functions?.onClick?.()
  }

  return <button onClick={handleClick}>点击</button>
}
```

#### `useFunctionsValue(path?: string)`

获取组件函数（只读）。

```typescript
import { useFunctionsValue } from '@airiot/client'

function MyComponent() {
  const functions = useFunctionsValue('myComponent')

  useEffect(() => {
    // 调用组件的初始化方法
    functions?.onInit?.()
  }, [])

  return <div>组件内容</div>
}
```

#### `useFunctionsSet(path?: string)`

设置组件函数（只写）。

```typescript
import { useFunctionsSet } from '@airiot/client'

function MyComponent() {
  const setFunctions = useFunctionsSet('myComponent')

  useEffect(() => {
    // 注册组件方法
    setFunctions({
      handleClick: () => console.log('clicked'),
      getData: () => ({ foo: 'bar' })
    })
  }, [])

  return <div>组件内容</div>
}
```

#### `useFunctionsGet()`

获取组件函数的回调。

```typescript
import { useFunctionsGet } from '@airiot/client'

function ParentComponent() {
  const getFunctions = useFunctionsGet()

  const callChildMethod = () => {
    const childFns = getFunctions()
    childFns?.myComponent?.handleClick?.()
  }

  return (
    <div>
      <ChildComponent id="myComponent" />
      <button onClick={callChildMethod}>调用子组件方法</button>
    </div>
  )
}
```

---

## 视图状态 (View)

视图状态提供了一组 hooks 用于管理视图相关的状态。

### Hooks

#### `useScale()`

获取视图缩放比例的 state 和 setter。

```typescript
import { useScale } from '@airiot/client'

function MyComponent() {
  const [scale, setScale] = useScale()

  return (
    <div>
      <p>当前缩放: {scale}%</p>
      <button onClick={() => setScale(scale + 10)}>放大</button>
      <button onClick={() => setScale(scale - 10)}>缩小</button>
    </div>
  )
}
```

#### `useViewValue(path?: string)`

获取视图状态的值。

```typescript
import { useViewValue } from '@airiot/client'

function MyComponent() {
  const size = useViewValue('size')
  const theme = useViewValue('theme')

  return (
    <div>
      <p>尺寸: {size?.width}x{size?.height}</p>
      <p>设备: {size?.device}</p>
    </div>
  )
}
```

#### `usePlayback()`

获取播放状态的 state 和 setter。

```typescript
import { usePlayback } from '@airiot/client'

function PlaybackControls() {
  const [playback, setPlayback] = usePlayback()

  const togglePlay = () => {
    setPlayback({ ...playback, isPlaying: !playback.isPlaying })
  }

  return (
    <div>
      <button onClick={togglePlay}>
        {playback.isPlaying ? '暂停' : '播放'}
      </button>
    </div>
  )
}
```

---

## 迭代数据 (Iteration)

迭代数据提供了一组 hooks 用于访问迭代上下文。

### Hooks

#### `useIteration()`

获取迭代上下文。

```typescript
import { useIteration } from '@airiot/client'

function IterationItem() {
  const iteration = useIteration()

  return (
    <div>
      <p>索引: {iteration.index}</p>
      <p>总数: {iteration.count}</p>
    </div>
  )
}
```

#### `useIterationValue(path?: string)`

获取迭代上下文中的值。

```typescript
import { useIterationValue } from '@airiot/client'

function IterationItem() {
  const item = useIterationValue()  // 获取当前迭代项
  const itemName = useIterationValue('name')  // 获取当前迭代项的 name 属性

  return (
    <div>
      <p>项目: {JSON.stringify(item)}</p>
      <p>名称: {itemName}</p>
    </div>
  )
}
```

### 使用示例

```typescript
import { useIteration, useIterationValue } from '@airiot/client'

function IterationDemo() {
  const items = [
    { id: 1, name: 'Item 1', value: 100 },
    { id: 2, name: 'Item 2', value: 200 },
    { id: 3, name: 'Item 3', value: 300 }
  ]

  return (
    <IterationContext.Provider value={{ items }}>
      {items.map((item, index) => (
        <IterationContext.Provider
          key={item.id}
          value={{ index, count: items.length, value: item }}
        >
          <IterationItem />
        </IterationContext.Provider>
      ))}
    </IterationContext.Provider>
  )
}

function IterationItem() {
  const iteration = useIteration()
  const item = useIterationValue()

  return (
    <div>
      <p>{iteration.index + 1} / {iteration.count}</p>
      <p>{item.name}: {item.value}</p>
    </div>
  )
}
```

---

## 订阅管理 (Subscribe)

订阅管理提供了一组 hooks 用于管理数据点订阅。

> **注意：** 更完整的实时数据订阅功能请参考 [数据订阅模块](./subscribe.md)，它提供了基于 WebSocket 的实时数据推送、报警订阅、计算记录订阅等更强大的功能。

### Hooks

#### `useSubscribeValue()`

获取订阅数据。

```typescript
import { useSubscribeValue } from '@airiot/client'

function SubscribeStatus() {
  const { tags, dataIds } = useSubscribeValue()

  return (
    <div>
      <p>已订阅标签: {tags.length}</p>
      <p>已订阅数据: {dataIds.length}</p>
    </div>
  )
}
```

#### `useSubscribeSet()`

获取订阅管理器的 setter。

```typescript
import { useSubscribeSet } from '@airiot/client'

function SubscribeControls() {
  const setSubscribe = useSubscribeSet()

  const subscribeToTag = () => {
    setSubscribe([{
      tableId: 'table1',
      tableDataId: 'data1',
      tagId: 'tag1',
      type: 'tag',
      isSub: true
    }])
  }

  const unsubscribeFromTag = () => {
    setSubscribe([{
      tableId: 'table1',
      tableDataId: 'data1',
      tagId: 'tag1',
      type: 'tag',
      isSub: false
    }])
  }

  return (
    <div>
      <button onClick={subscribeToTag}>订阅</button>
      <button onClick={unsubscribeFromTag}>取消订阅</button>
    </div>
  )
}
```

---

## 工具函数

### `createFamily<T>(atomState: AtomState<T>)`

创建一个 atomFamily，用于通过路径访问 atom 的部分数据。

```typescript
import { atom, createFamily } from '@airiot/client'

const myAtom = atom({ user: { name: 'John', age: 30 } })
const family = createFamily(myAtom)

// 在组件中使用
function MyComponent() {
  const userName = useAtomValue(family('user.name'))
  return <div>{userName}</div>
}
```

### `createCallback<T>(atomState: AtomState<T>, options?)`

创建一个回调函数，用于在非组件环境中访问 atom。

```typescript
import { atom, createCallback } from '@airiot/client'

const myAtom = atom({ value: 100 })

function MyComponent() {
  const getAtom = createCallback(myAtom)

  const handleClick = () => {
    const value = getAtom()
    console.log(value)
  }

  return <button onClick={handleClick}>获取值</button>
}
```

### `usePageStore()`

获取页面级别的 Store。

```typescript
import { usePageStore } from '@airiot/client'

function MyComponent() {
  const store = usePageStore()
  // 使用 store 访问 jotai store
}
```

---

## 完整示例

下面是一个使用多种 Page Hooks 的完整示例：

```typescript
import { usePageVar, useDatasourceValue, useDataVarValue, useIteration } from '@airiot/client'

function DashboardPage() {
  // 页面变量
  const [theme, setTheme] = usePageVar('theme')
  const title = usePageVarValue('title')

  // 数据源
  const users = useDatasourceValue('users')

  // 组件数据
  const componentData = useDataVarValue('chart1')

  // 迭代数据
  const iteration = useIteration()

  return (
    <div className={theme}>
      <h1>{title}</h1>

      <div>
        <h2>用户列表</h2>
        <ul>
          {users?.map(user => (
            <li key={user.id}>{user.name}</li>
          ))}
        </ul>
      </div>

      <div>
        <h2>图表数据</h2>
        <p>{JSON.stringify(componentData)}</p>
      </div>

      <div>
        <h2>迭代信息</h2>
        <p>索引: {iteration.index}</p>
      </div>

      <button onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}>
        切换主题
      </button>
    </div>
  )
}
```

---

## API 参考

### 导入方式

```typescript
// 导入所有 hooks
import * from '@airiot/client'

// 或单独导入
import {
  usePageVar,
  usePageVarValue,
  useSetPageVar,
  useDatasourceValue,
  useDataVarValue,
  useFunctions,
  useScale,
  useViewValue,
  useIteration,
  useIterationValue
} from '@airiot/client'
```

### TypeScript 类型定义

```typescript
// 页面变量
type PageVar = Record<string, any>

// 数据源
type Dataset = Record<string, any>
type DatasourcePath = string  // 格式: "datasetId.path.to.value"

// 组件上下文
type CellData = Record<string, any>

// 组件函数
type CellFunctions = Record<string, Function>

// 视图状态
type ViewState = {
  size: {
    device: 'PC' | 'Mobile' | 'Tablet'
    width: number
    height: number
    rootWidth: string
    rootHeight: string
  }
  theme: Record<string, any>
  script: Record<string, any>
}

// 迭代上下文
type IterationContext = {
  index: number
  count: number
  value?: any
  [key: string]: any
}

// 订阅项
type SubscribeItem = {
  tableId: string
  tableDataId: string
  tagId?: string
  field?: string
  type: 'tag' | 'properties'
  isSub: boolean
}
```

---

## 最佳实践

### 1. 合理使用路径

使用点号分隔的路径来访问嵌套数据：

```typescript
// 推荐
const userName = usePageVarValue('user.profile.name')

// 不推荐（会创建多个订阅）
const user = usePageVarValue('user')
const userName = user?.profile?.name
```

### 2. 分离读写

```typescript
// 推荐：只读和只写分离
const value = usePageVarValue('data')
const setValue = useSetPageVar('data')

// 不推荐：读写都获取
const [value, setValue] = usePageVar('data')  // 如果只读取或只写入
```

### 3. 使用 usePageStore 进行性能优化

当需要访问多个相同的数据源时，使用 usePageStore 避免重复订阅：

```typescript
import { usePageStore } from '@airiot/client'

function MyComponent() {
  const store = usePageStore()
  const dataset1 = useAtomValue(dataset('id1'), { store })
  const dataset2 = useAtomValue(dataset('id2'), { store })
  // ...
}
```

### 4. 清理订阅

确保在组件卸载时取消订阅：

```typescript
useEffect(() => {
  const setSubscribe = useSubscribeSet()

  // 订阅
  setSubscribe([{ ...options, isSub: true }])

  return () => {
    // 取消订阅
    setSubscribe([{ ...options, isSub: false }])
  }
}, [])
```

---

## 常见问题

### Q: Page Hooks 和普通 React State 有什么区别？

A: Page Hooks 基于 Jotai 实现，提供了：
- 更细粒度的更新控制
- 跨组件状态共享
- 路径级别的订阅
- 更好的性能优化

### Q: 如何在非组件环境中使用？

A: 使用 `usePageVarCallback` 或 `createCallback` 获取回调函数：

```typescript
const getPageVar = usePageVarCallback()
// 在事件处理、setTimeout 等场景中使用
```

### Q: 如何调试状态变化？

A: 可以使用 Jotai 的 devtools：

```typescript
import { useAtomDevtools } from 'jotai/devtools'

// 在开发环境中启用
if (process.env.NODE_ENV === 'development') {
  useAtomDevtools(pageVar)
}
```
