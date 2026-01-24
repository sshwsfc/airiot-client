import _ from 'lodash'
import { atom, useAtomValue, useSetAtom } from 'jotai'
import { createFamily, createCallback } from './util'

export const dictionaries = atom({})

const family = createFamily(dictionaries)

export function useDictValue(path?: string) {
  return useAtomValue(family(path))
}

export function useDictSet(path?: string) {
  return useSetAtom(family(path))
}

export function useDictGet() {
  return createCallback(dictionaries)
}
