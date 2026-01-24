import _ from 'lodash'
import { atom, PrimitiveAtom } from 'jotai'
import { atomFamily } from 'jotai/utils'
import { useAtomCallback } from 'jotai/utils'
import { useCallback, useContext } from 'react'
import { PageStoreContext } from '../context'

type AtomState<T> = PrimitiveAtom<T>

export function createFamily<T extends object>(atomState: AtomState<T>) {
  return atomFamily((path?: string) => atom(
    (get) => {
      const state = get(atomState)
      if (path) {
        return _.get(state, path)
      } else {
        return state
      }
    },
    (get, set, newValue) => {
      const getNewValue = (prevState: T) => _.isFunction(newValue) ? (newValue as (prev: T) => T)(prevState) : newValue
      const state = get(atomState)
      if (path) {
        const prev = _.get(state, path)
        const value = getNewValue(prev)
        _.set(state, path, value)
        set(atomState, { ...state })
      } else {
        set(atomState, getNewValue(state) as T)
      }
    },
  ))
}

export function createCallback<T extends object>(atomState: AtomState<T>, options?: any) {
  return useAtomCallback(useCallback((get) => get(atomState), [atomState]), options)
}

export function usePageStore() {
  return useContext(PageStoreContext).store
}
