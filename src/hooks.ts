import api from './api'
import { useUser } from './auth'
import { getConfig } from './config'

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
  const toast = getConfig().toast
  return { 
    info: toast?.info || ((message: string) => alert(message)),
    success: toast?.success || ((message: string) => alert(message)),
    error: toast?.error || ((message: string) => alert(message)),
    warning: toast?.warning || ((message: string) => alert(message))
  }
}