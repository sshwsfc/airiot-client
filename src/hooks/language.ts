import { atom, useAtomValue, useSetAtom } from 'jotai'
import { createFamily, createCallback } from './util'

export const language = atom({})

const family = createFamily(language)

export function useLanguageDictionaryValue(path?: string) {
  return useAtomValue(family(path))
}

export function useLanguageDictionarySet(path?: string) {
  return useSetAtom(family(path))
}

export function useLanguageDictionaryGet() {
  return createCallback(language)
}
