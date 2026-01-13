import api from './api'
import { useUser } from './auth'

export const getSettings = async () => {
  const { user } = useUser()
  const isLogin = Boolean(user?.token)

  let url = 'core/setting/part'

  if (isLogin) {
    // admin用户 或者 有系统配置的权限
    if (user.isSuper || user?.permissions?.indexOf('setting.view') > -1) {
      url = 'core/setting' //全部字段信息
    } else {
      url = 'core/setting/login/part'
    }
  }
  return await api({ name: url })
        .fetch('', {}).then(res => res?.json || {})
}

export const useMessage = () => {
  return { 
    info: (message: string) => {},
    success: (message: string) => {},
    error: (message: string) => {}
  }
}