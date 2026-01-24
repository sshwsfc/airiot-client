import React from 'react'
import { createStore } from 'jotai'
import { pageVar } from './hooks/pagevar'
import { PageStoreContext } from './context'

export default ({ variables, children }: { variables?: Record<string, any>, children: React.ReactNode }) => {
  const [store] = React.useState(() => createStore())

  React.useEffect(() => {
    if (variables) {
      store.set(pageVar, variables)
    }
    // return () => { store }
  }, [variables, store])

  // browser
  return (
    <PageStoreContext.Provider value={{ store }}>
      {children}
    </PageStoreContext.Provider>
  )
}