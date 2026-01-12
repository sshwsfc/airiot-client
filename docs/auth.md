# 认证模块

认证模块提供完整的身份认证功能，包括登录、登出、用户注册和用户状态管理。

## Hooks

### `useUser()`

获取和设置用户信息。

```typescript
import { useUser } from '@airiot/client'

function UserProfile() {
  const { user, setUser, storageKey } = useUser()

  return (
    <div>
      {user ? <p>Welcome, {user.username}</p> : <p>Please login</p>}
    </div>
  )
}
```

**返回值：**

- `user` - 当前用户信息
- `setUser` - 设置用户信息的函数
- `storageKey` - 存储键名（默认为 'user'）

### `useLogin()`

提供登录功能。

```typescript
import { useLogin } from '@airiot/client'

function LoginForm() {
  const { showCode, onLogin } = useLogin()
  const [formValues, setFormValues] = useState({})

  const handleSubmit = async (values) => {
    try {
      const result = await onLogin({
        username: values.username,
        password: values.password,
        verifyCode: values.verifyCode,
        remenber: values.remember
      })
      // 登录成功，result 包含 needChangePwd, password, id, username
      console.log('Login success:', result)
    } catch (error) {
      // 登录失败，error 包含表单验证错误
      console.error('Login failed:', error)
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <input name="username" type="text" />
      <input name="password" type="password" />
      {showCode && <input name="verifyCode" type="text" />}
      <label>
        <input name="remember" type="checkbox" />
        记住我
      </label>
      <button type="submit">登录</button>
    </form>
  )
}
```

**返回值：**

- `showCode` - 是否显示验证码输入框（Boolean）
- `onLogin` - 登录函数

**onLogin 参数：**

- `username` - 用户名（必填）
- `password` - 密码（必填）
- `verifyCode` - 验证码（可选，当 showCode 为 true 时必填）
- `remenber` - 是否记住登录状态（布尔值，true 使用 localStorage，false 使用 sessionStorage）

**onLogin 返回值（Promise）：**

- `needChangePwd` - 是否需要修改密码
- `password` - 密码
- `id` - 用户 ID
- `username` - 用户名

### `useLogout()`

提供登出功能。

```typescript
import { useLogout } from '@airiot/client'

function LogoutButton() {
  const { onLogout } = useLogout()

  const handleLogout = () => {
    onLogout()
  }

  return <button onClick={handleLogout}>登出</button>
}
```

**返回值：**

- `onLogout` - 登出函数（无参数，无返回值）

### `useUserReg()`

提供用户注册功能。

```typescript
import { useUserReg } from '@airiot/client'

function RegisterForm() {
  const { onUserReg } = useUserReg()

  const handleSubmit = async (values) => {
    try {
      await onUserReg(values)
      // 注册成功，自动跳转到登录页面
      console.log('Registration success')
    } catch (error) {
      console.error('Registration failed:', error)
    }
  }

  return <form onSubmit={handleSubmit}>...</form>
}
```

**返回值：**

- `onUserReg` - 注册函数

**onUserReg 参数：**

注册表单的所有字段值，通常包括：
- `username` - 用户名
- `password` - 密码
- `email` - 邮箱
- 其他自定义字段

## 认证流程

### 登录流程

1. 用户提交登录表单
2. 调用 `onLogin` 函数
3. 密码使用 SHA1 加密
4. 发送登录请求到 `core/auth/login`
5. 成功后：
   - 用户信息存储到 localStorage 或 sessionStorage
   - 更新全局用户状态
   - 跳转到目标页面（或首页）
6. 失败后：
   - 显示错误信息
   - 如果需要验证码，显示验证码输入框

### 登出流程

1. 调用 `onLogout` 函数
2. 发送登出请求到 `core/auth/logout`
3. 清除存储的用户信息（localStorage 和 sessionStorage）
4. 更新全局用户状态为 null
5. 跳转到登出页面

### 注册流程

1. 用户提交注册表单
2. 调用 `onUserReg` 函数
3. 密码使用 SHA1 加密
4. 发送注册请求到 `core/register/normal`
5. 成功后显示成功消息，跳转到登录页面
6. 失败后显示错误信息

## 用户信息结构

```typescript
interface User {
  token?: string           // 认证令牌
  id?: string             // 用户 ID
  username?: string       // 用户名
  email?: string          // 邮箱
  isAdmin?: boolean       // 是否管理员
  permissions?: string[]  // 权限列表
  node?: any              // 节点信息
  nodeInUser?: any        // 用户节点信息
  // 其他自定义字段
}
```
