import _ from 'lodash'
import { atom, useAtom, useAtomValue, useSetAtom } from 'jotai'
import { createFamily, createCallback, usePageStore } from './util'

export const pageVar = atom({} as Record<string, any>)

const family = createFamily(pageVar)

export function usePageVar(path?: string) {
  return useAtom(family(path), {store: usePageStore()})
}

export function usePageVarValue(path?: string) {
  return useAtomValue(family(path), {store: usePageStore()})
}

export function useSetPageVar(path?: string) {
  return useSetAtom(family(path), {store: usePageStore()})
}

export function usePageVarCallback() {
  return createCallback(pageVar, {store: usePageStore()})
}
