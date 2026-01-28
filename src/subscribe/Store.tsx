import _ from 'lodash'
import React from 'react'

import worker from './worker'
import type { SubTag, SubData } from './types'

import { useDataTagSubscribe, useTagWarningSubscribe, useTableDataSubscribe, useComputeSubscribe, useTagsTimeoutSubscribe } from './subscribe'


// ============================================================================
// Context Types
// ============================================================================

interface SubscribeContextValue {
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

const Subscribe = ({ children }: StoreProps) => {
  const { subscribe: subscribeTags } = useDataTagSubscribe()
  const { subscribe: subscribeData } = useTableDataSubscribe()
  
  // useComputeSubscribe()
  // useTagsTimeoutSubscribe()
  // useTagWarningSubscribe()

  const contextValue: SubscribeContextValue = React.useMemo(() => ({
    subscribeTags,
    subscribeData
  }), [
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
