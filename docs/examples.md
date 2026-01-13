# 使用示例

本章节提供实际使用场景的代码示例。

## 用户管理系统

### 1. 用户列表页面

```typescript
import { Model, useModelList, useModelPermission, useModelPagination, useModelPageSize, useModelSelect, useModelDelete } from '@airiot/client'

const userModel = {
  name: 'user',
  title: '用户',
  api: { name: 'core/user' },
  properties: {
    username: { type: 'string', title: '用户名' },
    email: { type: 'string', title: '邮箱' },
    role: { type: 'string', title: '角色' },
    status: { type: 'string', title: '状态' },
    createdAt: { type: 'string', format: 'datetime', title: '创建时间' }
  },
  listFields: ['username', 'email', 'role', 'status', 'createdAt']
}

function UserList() {
  const { loading, items, selected } = useModelList()
  const { canAdd, canEdit, canDelete } = useModelPermission()
  const { count, activePage, changePage } = useModelPagination()
  const { sizes, setPageSize, size } = useModelPageSize()
  const { onSelect, onSelectAll } = useModelSelect()
  const { deleteItem } = useModelDelete()

  if (loading) return <Spinner />

  return (
    <div className="user-list">
      <div className="toolbar">
        {canAdd && <Button onClick={() => navigate('/users/new')}>新增</Button>}
        <Button onClick={() => handleBatchDelete()}>批量删除</Button>
      </div>

      <Table
        data={items}
        columns={userModel.listFields.map(field => ({
          key: field,
          title: userModel.properties[field].title
        }))}
        selected={selected}
        onSelect={onSelect}
        onSelectAll={onSelectAll}
        rowActions={(item) => (
          <>
            {canEdit && <Button onClick={() => navigate(`/users/${item.id}`)}>编辑</Button>}
            {canDelete && <Button onClick={() => deleteItem(item.id)}>删除</Button>}
          </>
        )}
      />

      <div className="pagination">
        <Pagination
          total={count}
          current={activePage}
          pageSize={size}
          onPageChange={changePage}
        />
        <Select value={size} onChange={setPageSize}>
          {sizes.map(s => <option key={s} value={s}>{s}条/页</option>)}
        </Select>
      </div>
    </div>
  )
}

export default function UserManagement() {
  return (
    <Model model={userModel}>
      <UserList />
    </Model>
  )
}
```

### 2. 用户表单（新增/编辑）

```typescript
import { Model, useModelGet, useModelSave } from '@airiot/client'
import { SchemaForm } from '@airiot/client'

const userFormSchema = {
  type: 'object',
  properties: {
    username: {
      type: 'string',
      title: '用户名',
      minLength: 3,
      maxLength: 20,
      field: { placeholder: '请输入用户名' }
    },
    email: {
      type: 'string',
      format: 'email',
      title: '邮箱',
      field: { placeholder: '请输入邮箱' }
    },
    password: {
      type: 'string',
      title: '密码',
      minLength: 6,
      field: { type: 'password', placeholder: '请输入密码' }
    },
    confirmPassword: {
      type: 'string',
      title: '确认密码',
      field: { type: 'password', placeholder: '请再次输入密码' }
    },
    role: {
      type: 'string',
      title: '角色',
      enum: ['admin', 'user', 'guest'],
      enumNames: ['管理员', '用户', '访客']
    },
    status: {
      type: 'string',
      title: '状态',
      enum: ['active', 'inactive'],
      enumNames: ['激活', '未激活']
    }
  },
  required: ['username', 'email', 'role']
}

function UserForm() {
  const { data, loading } = useModelGet()
  const { saveItem } = useModelSave()
  const navigate = useNavigate()
  const location = useLocation()
  const userId = location.pathname.split('/').pop()

  useEffect(() => {
    if (userId !== 'new') {
      // 加载用户数据
    }
  }, [userId])

  const validate = (values) => {
    const errors = {}
    if (values.password && values.password !== values.confirmPassword) {
      errors.confirmPassword = '两次密码输入不一致'
    }
    return errors
  }

  const handleSubmit = async (values) => {
    try {
      await saveItem(values)
      message.success('保存成功')
      navigate('/users')
    } catch (error) {
      message.error('保存失败')
    }
  }

  if (loading && userId !== 'new') return <Spinner />

  return (
    <div className="user-form">
      <h2>{userId === 'new' ? '新增用户' : '编辑用户'}</h2>
      <SchemaForm
        schema={userFormSchema}
        initialValues={data}
        onSubmit={handleSubmit}
        validate={validate}
      >
        {({ form, formState }) => (
          <form onSubmit={form.handleSubmit}>
            <FormFields />
            <Button type="submit">保存</Button>
            <Button onClick={() => navigate('/users')}>取消</Button>
          </form>
        )}
      </SchemaForm>
    </div>
  )
}

export default function UserFormPage() {
  return (
    <Model model={userModel}>
      <UserForm />
    </Model>
  )
}
```

## 登录系统

### 1. 登录页面

```typescript
import { useLogin } from '@airiot/client'
import { useNavigate, useLocation } from 'react-router-dom'

function LoginPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { showCode, onLogin } = useLogin()
  const [form, setForm] = useState({})

  const handleSubmit = async (e) => {
    e.preventDefault()
    const formData = new FormData(e.target)
    const values = Object.fromEntries(formData)

    try {
      const result = await onLogin({
        username: values.username,
        password: values.password,
        verifyCode: values.verifyCode,
        remenber: values.remember
      })

      if (result.needChangePwd) {
        navigate('/change-password', {
          state: { username: result.username, password: result.password }
        })
      } else {
        // 登录成功，会自动跳转
      }
    } catch (error) {
      message.error(error.FORM_ERROR || '登录失败')
    }
  }

  return (
    <div className="login-page">
      <div className="login-form">
        <h1>登录</h1>
        <form onSubmit={handleSubmit}>
          <input
            name="username"
            placeholder="用户名"
            required
            autoFocus
          />
          <input
            name="password"
            type="password"
            placeholder="密码"
            required
          />
          {showCode && (
            <input
              name="verifyCode"
              placeholder="验证码"
              required
            />
          )}
          <label>
            <input name="remember" type="checkbox" />
            记住我
          </label>
          <button type="submit">登录</button>
        </form>
        <div className="links">
          <a href="/register">注册账号</a>
          <a href="/forgot-password">忘记密码</a>
        </div>
      </div>
    </div>
  )
}
```

### 2. 受保护的路由

```typescript
import { useUser } from '@airiot/client'
import { Navigate } from 'react-router-dom'

function ProtectedRoute({ children, requiredPermissions = [] }) {
  const { user } = useUser()

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  // 检查权限
  if (requiredPermissions.length > 0) {
    const hasPermission = requiredPermissions.every(perm =>
      user.permissions?.includes(perm)
    )
    if (!hasPermission) {
      return <Navigate to="/403" replace />
    }
  }

  return children
}

// 使用示例
function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin"
        element={
          <ProtectedRoute requiredPermissions={['admin']}>
            <AdminPanel />
          </ProtectedRoute>
        }
      />
    </Routes>
  )
}
```

## 数据筛选

### 1. 筛选组件

```typescript
import { Model, useModelList, useModel } from '@airiot/client'
import { useSetAtom } from 'jotai'

function FilterPanel() {
  const { atoms } = useModel()
  const setWheres = useSetAtom(atoms.wheres)
  const setOption = useSetAtom(atoms.option)

  const handleFilter = (filters) => {
    const whereConditions = {}

    // 文本搜索
    if (filters.search) {
      whereConditions.username = { $regex: filters.search }
    }

    // 状态筛选
    if (filters.status) {
      whereConditions.status = { $eq: filters.status }
    }

    // 日期范围
    if (filters.dateRange) {
      whereConditions.createdAt = {
        $gte: filters.dateRange[0],
        $lte: filters.dateRange[1]
      }
    }

    setWheres(whereConditions)
    setOption({ skip: 0 })  // 重置到第一页
  }

  const handleReset = () => {
    setWheres({})
    setOption({ skip: 0 })
  }

  return <FilterForm onFilter={handleFilter} onReset={handleReset} />
}

function FilteredList() {
  const { items, loading } = useModelList()

  return (
    <div>
      <FilterPanel />
      {loading ? <Spinner /> : <Table data={items} />}
    </div>
  )
}
```

### 2. 高级筛选

```typescript
function AdvancedFilter() {
  const { atoms } = useModel()
  const setWheres = useSetAtom(atoms.wheres)

  const handleAdvancedSearch = (criteria) => {
    const where = {}

    // 多条件组合
    if (criteria.keywords) {
      where.$or = [
        { username: { $regex: criteria.keywords } },
        { email: { $regex: criteria.keywords } }
      ]
    }

    // 数组筛选
    if (criteria.tags && criteria.tags.length > 0) {
      where.tags = { $in: criteria.tags }
    }

    // 嵌套对象筛选
    if (criteria.department) {
      where.departmentId = criteria.department.id
    }

    // 复杂条件
    if (criteria.minAge || criteria.maxAge) {
      where.age = {}
      if (criteria.minAge) where.age.$gte = criteria.minAge
      if (criteria.maxAge) where.age.$lte = criteria.maxAge
    }

    setWheres(where)
  }

  return <AdvancedSearchForm onSearch={handleAdvancedSearch} />
}
```

## API 使用示例

### 1. 自定义 API 调用

```typescript
import { createAPI, setConfig } from '@airiot/client'

// 配置全局上下文
setConfig({
  user: { token: localStorage.getItem('token') },
  language: 'zh-CN'
})

// 创建自定义 API
const customAPI = createAPI({
  name: 'custom-data',
  resource: 'api/custom',
  idProp: 'customId',
  convertItem: (item) => ({
    ...item,
    formattedDate: formatDate(item.createdAt),
    fullName: `${item.firstName} ${item.lastName}`
  })
})

// 使用 API
async function fetchData() {
  // 基础查询
  const { items, total } = await customAPI.query({
    skip: 0,
    limit: 10,
    order: { createdAt: 'DESC' }
  })

  // 条件查询
  const activeItems = await customAPI.query(
    {},
    { status: { $eq: 'active' } }
  )

  // 获取单条
  const item = await customAPI.get('item123')

  // 保存
  const newItem = await customAPI.save({
    name: 'New Item',
    status: 'active'
  })

  // 更新
  const updated = await customAPI.save({
    id: 'item123',
    name: 'Updated Name'
  })

  // 部分更新
  const partialUpdated = await customAPI.save({
    id: 'item123',
    status: 'inactive'
  }, true)

  // 删除
  await customAPI.delete('item123')

  // 计数
  const count = await customAPI.count({ status: 'active' })
}
```

### 2. 错误处理

```typescript
async function apiCall() {
  try {
    const data = await api.get('item123')
    // 处理数据
  } catch (error) {
    if (error.status === 401) {
      // 未授权，跳转登录
      navigate('/login')
    } else if (error.status === 403) {
      // 无权限
      message.error('您没有权限执行此操作')
    } else if (error.status === 404) {
      // 资源不存在
      message.error('数据不存在')
    } else if (error.status === 500) {
      // 服务器错误
      message.error('服务器错误，请稍后重试')
    } else {
      // 其他错误
      console.error('API Error:', error)
      message.error(error.json?._error || '操作失败')
    }
  }
}
```
