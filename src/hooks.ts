import api from './api'

export const getSettings = async () => {
  return await api({ name: 'core/setting' })
        .fetch('', {}).then(res => res?.json || {})
}

export const useMessage = () => {
  return { 
    info: (message: string) => {},
    success: (message: string) => {},
    error: (message: string) => {}
  }
}