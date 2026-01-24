import _ from 'lodash'
import { atom, useAtom, useAtomValue, useSetAtom } from 'jotai'
import { createFamily, createCallback, usePageStore } from './util'

export const cellFns = atom({})

const family = createFamily(cellFns)

export function useFunctions(path?: string) {
  return useAtom(family(path), {store: usePageStore()})
}

export function useFunctionsValue(path?: string) {
  return useAtomValue(family(path), {store: usePageStore()})
}

export function useFunctionsSet(path?: string) {
  return useSetAtom(family(path), {store: usePageStore()})
}

export function useFunctionsGet() {
  return createCallback(cellFns, {store: usePageStore()})
}
