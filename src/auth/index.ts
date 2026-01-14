import React from 'react'
import isEmpty from 'lodash/isEmpty'
import omit from 'lodash/omit'
import dayjs from 'dayjs'
import sha1 from 'crypto-js/sha1'
import { useSearchParams, useLocation, useNavigate } from 'react-router-dom'
import { useMessage } from '../hooks'
import { getConfig, setConfig } from '../config'
import api from '../api'

export const useUser = () => {
  const storageKey = 'user'

  const setUser = (user: any) => setConfig({ user })

  const loadUser = () => {
    const storage = localStorage
    const userStr = storage.getItem(storageKey)
    if (userStr) {
      try {
        const user = JSON.parse(userStr)
        const now = dayjs().unix()
        // 用户信息有效期为7天
        if (user.time && now - user.time < 7 * 24 * 60 * 60) {
          setUser(user)
        } else {
          storage.removeItem(storageKey)
        }
      } catch (err) {
        console.error('解析用户信息失败:', err)
        storage.removeItem(storageKey)
      }
    }
  }
  return { user: getConfig().user, setUser, storageKey, loadUser }
}

const uploadUser = (storage: Storage, json: any, storageKey: string, setUser: (user: any) => void) => {
  const host = window.location.host
  setUser(json)
  // update_models(json)
  const userInfo = omit(json, [
    'nodeInUser', 'node', 'warnFilter',
    'dashboardFilterDeletePermission', 'dashboardFilterEditPermission', 'dashboardFilterViewPermission'
  ])
  storage.setItem(storageKey, JSON.stringify({ ...userInfo, time: dayjs().unix() }))
  // 清除免密登录token
  sessionStorage.removeItem(`${host}_portal_token`)
  localStorage.setItem('resetVerifyCode', 'false')
}

export const useLogin = () => {
  const query = useSearchParams()[0]
  const location = useLocation()
  const navigate = useNavigate()
  const settings = getConfig()

  const { setUser, storageKey } = useUser()
  const message = useMessage()
  const [ showCode, setShowCode ] = React.useState(false)
  const [ resetVerifyCode, setResetVerifyCode ] = React.useState<null|string>(null)

  const showExtra = false
  const showCodesetting = settings?.notShowCodeAdmin

  const onSubmit = (value: { verifyCode?: string; username: string; password: string; remember?: boolean }) => {
    const { verifyCode, username, password, remember } = value

    if (!showCodesetting && showCode && isEmpty(verifyCode)) {
      message.info(('验证码不能为空！')); return
    }

    const data = { verifyCode, username, password: sha1(password).toString() }
    // 记住我永久储存
    const storage = remember ? localStorage : sessionStorage

    return new Promise((resolve, reject) => {
      let url = 'core/auth/login'
      let where = { method: 'POST', body: JSON.stringify(data) }

      api({ name: url })
        .fetch('', { ...where })
        .then(({ json, headers }) => {

          const redirect = headers['x-oauth-redirect']
          storage.removeItem(storageKey)

          // getTokenSettings(json)
          uploadUser(storage, json, storageKey, setUser)

          //处理黑名单角色权限
          // if (!json?.isAdmin && json?.blackPermissions?.length) {
          //   getAllPermissions(defaultPermissions, json).then(res => {
          //     let mergePermission = []
          //     res?.length && res.forEach(val => {
          //       let index = json.blackPermissions.findIndex(item => item == val)
          //       if (index == -1) {
          //         mergePermission.push(val)
          //       }
          //     })
          //     json.permissions = mergePermission
          //     changeAuthUser(json.permissions)
          //     uploadUser(storage, json, storageKey, setUser)
          //   }).catch(err => {
          //     uploadUser(storage, json, storageKey, setUser)
          //   })
          // } else {
          //   uploadUser(storage, json, storageKey, setUser)
          // }

          // 需要跳转切换语言页面
          // if (ifLanguageChange(json)) {
          //   app.go('changeLanguage')
          //   return
          // }
          // unuse无权限模块

          const needChangePwd = settings?.userExpand?.needChangePwd && json.isFirstLogin

          if (!needChangePwd) {
            if (redirect && redirect == '#/oAuth') {
              navigate(`/oAuth?${url}`, { replace: true })
            } else {
              // 设置了登录后页面的情况 跳转到登录后页面
              const redirect = location.state?.from?.pathname || query.get('redirect') || '/'
              navigate(redirect, { replace: true })
            }
          }
          resolve({ needChangePwd, password, id: json.id, username })
        })
        .catch((err: any) => {
          setResetVerifyCode(new Date().toString())
          if (err.status !== 451) setShowCode(true)
          if (err.status == 400 || err.status == 451) {
            reject({ ...err.json, username: err?.json?.user, 'FORM_ERROR': err?.json?.user })
          } else {
            reject(err)
          }
        })
    })
  }

  return { showCode, showExtra, resetVerifyCode, onLogin: onSubmit }
}

export const useUserReg = () => {
  const navigate = useNavigate()
  const message = useMessage()

  const onSubmit = (value: any) => {
    return new Promise((resolve, reject) => {
      api({ name: 'core/register/normal' })
        .fetch('', {
          method: 'POST',
          body: JSON.stringify({
            ...value,
            password: sha1(value.password).toString()
          }),
        })
        .then(({ json }) => {
          message.success(json?.Message || ('注册成功'))
          resolve(true)
          navigate('/login')
        })
        .catch((err) => {
          reject(err)
          throw new Error(err)
        })
    })
  }

  return { onUserReg: onSubmit }
}

export const useLogout = () => {
  const navigate = useNavigate()
  const { setUser,storageKey } = useUser()

  const onLogout = () => {
    api({ name: 'core/auth/logout' }).fetch('')
      .then(() => {
        localStorage.removeItem(storageKey)
        sessionStorage.removeItem(storageKey)
        setUser(null)
        navigate('/logout')
      })
  }

  return { onLogout }

}