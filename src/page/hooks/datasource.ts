import _ from 'lodash'
import { atom, useSetAtom, useAtomValue } from 'jotai'
import { atomFamily } from 'jotai/utils'
import { usePageStore } from './util'

export const dataset = atomFamily(() => atom({}))

const datasetsSelector = atomFamily((ids: string[]) => atom((get) => {
  const result: Record<string, any> = {}
  for (let id of ids) {
    result[id] = get(dataset(id))
  }
  return result
}))

export function useDatasetSet(id: string) {
  return useSetAtom(dataset(id), {store: usePageStore()})
}

export function useDatasetsValue(ids: string[]) {
  return useAtomValue(datasetsSelector(ids), {store: usePageStore()})
}

export function useDatasourceValue(path: string) {
  if (!path) return undefined
  const datasetId = path.split('.')[0]
  const datasetPath = path.replace(`${datasetId}.`, '')

  const data = useAtomValue(dataset(datasetId), {store: usePageStore()})
  const res = datasetPath && datasetPath !== '' ? _.get(data, datasetPath) : data
  return res
}
