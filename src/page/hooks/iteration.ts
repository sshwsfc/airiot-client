import React from 'react'
import _ from 'lodash'
import { IterationContext } from '../context'

export function useIteration() {
  return React.useContext(IterationContext) || {}
}

export function useIterationValue(path?: string) {
  const context = React.useContext(IterationContext)
  const value = context?.value
  return path ? _.get(value, path) : value
}
