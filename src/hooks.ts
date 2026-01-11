import { atom, useAtom, useSetAtom, useAtomValue } from 'jotai'
import api from './api'

const configAtom = atom<any>({})

export const useConfig = () => {
  return useAtom(configAtom)
}

export const useSetConfig = () => {
  return useSetAtom(configAtom)
}

export const useConfigValue = () => {
  return useAtomValue(configAtom)
}

export const useSettings = async () => {
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