import { atom, useAtom, useAtomValue } from 'jotai'
import _ from 'lodash'

const initSize = { device: 'PC' as const, width: 1200, height: 800, rootWidth: '100%', rootHeight: '100%' }

export const view = atom({ size: initSize, theme: {}, script: {} })
export const playback = atom({})
export const rootScale = atom(100)

export function useScale() {
  return useAtom(rootScale)
}

export function useViewValue(path?: string) {
  const viewState = useAtomValue(view)
  return path ? _.get(viewState, path) : viewState
}

export function usePlayback() {
  return useAtom(playback)
}
