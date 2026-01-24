import React from 'react'
import { type Store } from 'jotai/vanilla/store'

export interface TableData {
  id: string
  table?: {
    id: string
  }
  _table?: string
  [key: string]: any
}

export interface CellDataValue {
  tableData?: TableData
  [key: string]: any
}

const IterationContext = React.createContext({ value: null as any });
IterationContext.displayName = 'Cell_Iteration'

const PageStoreContext = React.createContext({ store: undefined } as { store: Store | undefined });
PageStoreContext.displayName = 'Page_Store'

const CellDataContext = React.createContext({ value: null as CellDataValue | null });
CellDataContext.displayName = 'Cell_Data'

export { IterationContext, PageStoreContext, CellDataContext }