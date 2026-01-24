import _ from 'lodash'
import React from 'react'
import { createStore } from 'jotai'

import worker from './worker'
import type { SubTag, SubData } from './types'

import { useDataTagSubscribe, useTagWarningSubscribe, useTableDataSubscribe, useComputeSubscribe, useTagsTimeoutSubscribe } from './subscribe'


// ============================================================================
// Context Types
// ============================================================================

interface SubscribeContextValue {
  store: ReturnType<typeof createStore>

  subscribeTags: (tags: SubTag[], clear?: boolean) => void
  subscribeData: (dataIds: SubData[], clear?: boolean) => void
}

const SubscribeContext = React.createContext<SubscribeContextValue | null>(null)

// Export type for external use
export type { SubscribeContextValue }

// ============================================================================
// Provider Component
// ============================================================================

interface StoreProps {
  children: React.ReactNode
}

const Subscribe: React.FC<StoreProps> = ({ children }) => {
  const [store] = React.useState(() => createStore())

  const { subscribe: subscribeTags } = useDataTagSubscribe()
  const { subscribe: subscribeData } = useTableDataSubscribe()
  
  useComputeSubscribe()
  useTagsTimeoutSubscribe()

  const contextValue: SubscribeContextValue = React.useMemo(() => ({
    store,
    subscribeTags,
    subscribeData
  }), [
    store,
    subscribeTags,
    subscribeData
  ])

  return (
    <SubscribeContext.Provider value={contextValue}>
      {children}
    </SubscribeContext.Provider>
  )
}

export default Subscribe
export { SubscribeContext, worker, Subscribe }
