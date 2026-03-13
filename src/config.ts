/**
 * Toast 消息提示组件接口
 */
export interface ToastComponent {
  info?: (message: string) => void
  success?: (message: string) => void
  error?: (message: string) => void
  warning?: (message: string) => void
}

/**
 * 用户信息接口
 */
export interface UserInfo {
  id?: string
  name?: string
  username?: string
  email?: string
  token?: string
  /** 是否为超级管理员 */
  isSuper?: boolean
  /** 用户权限列表 */
  permissions?: string[]
  /** 是否首次登录 */
  isFirstLogin?: boolean
  [key: string]: any
}

/**
 * 用户扩展设置
 */
export interface UserExpandSettings {
  /** 是否需要修改密码 */
  needChangePwd?: boolean
  /** 密码过期天数 */
  passwordExpireDays?: number
  /** 最小密码长度 */
  minPasswordLength?: number
  /** 密码复杂度要求 */
  passwordComplexity?: 'low' | 'medium' | 'high'
  [key: string]: any
}

/**
 * 应用设置信息
 */
export interface AppSettings {
  /** 是否使用安全请求（将 DELETE/PATCH/PUT 转换为 GET/POST） */
  safeRequest?: boolean

  /** 是否不显示验证码管理 */
  notShowCodeAdmin?: boolean

  /** 用户扩展配置 */
  userExpand?: UserExpandSettings

  /** 会话超时时间（分钟） */
  sessionTimeout?: number

  /** 是否启用自动保存 */
  autoSave?: boolean

  /** 自动保存间隔（毫秒） */
  autoSaveInterval?: number

  /** 分页默认大小 */
  defaultPageSize?: number

  /** 最大文件上传大小（MB） */
  maxUploadSize?: number

  /** 允许的文件类型 */
  allowedFileTypes?: string[]

  /** 主题设置 */
  theme?: {
    /** 主题模式 */
    mode?: 'light' | 'dark' | 'auto'
    /** 主色调 */
    primaryColor?: string
    /** 圆角大小 */
    borderRadius?: number
  }

  /** 其他自定义设置 */
  [key: string]: any
}

/**
 * 全局配置接口
 */
export interface Config {
  /** REST API 基础路径，默认为 '/rest/' */
  rest?: string

  /** 项目 ID，用于请求头 x-request-project */
  projectId?: string

  /** 当前登录用户信息 */
  user?: UserInfo

  /** Toast 消息提示组件 */
  toast?: ToastComponent

  /** 语言设置，如 'zh-CN', 'en-US' */
  language?: string

  /** 模块名称，如 'admin' */
  module?: string

  /** 应用设置信息 */
  settings?: AppSettings

  /** 其他自定义配置 */
  [key: string]: any
}

/**
 * 全局配置原子对象
 * 用于存储应用级别的全局配置信息
 */
const configAtom: Config = ({})

/**
 * 获取全局配置
 * @returns 当前全局配置对象
 * @example
 * const config = getConfig()
 * console.log(config.language) // 'zh-CN'
 * console.log(config.user?.name) // '张三'
 */
export const getConfig = (): Config => {
  return configAtom
}

/**
 * 设置全局配置
 * 将新配置合并到现有配置中
 * @param config 要设置的配置对象
 * @example
 * setConfig({ language: 'zh-CN', module: 'admin' })
 */
export const setConfig = (config: Partial<Config>): void => {
  Object.assign(configAtom, config)
}
