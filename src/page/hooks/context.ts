import { useContext } from 'react'
import { type CellDataValue, CellDataContext } from '../context'

export function useCellDataValue<T = CellDataValue>() {
  const { value } = useContext(CellDataContext)
  return value as T
}
