import { atom } from 'jotai'
import { useAtomValue, useSetAtom } from 'jotai'
import React, { useEffect, useRef } from 'react'
import dayjs from 'dayjs'
import { useWS } from './ws'

export const serverTimeState = atom<any>(null)

const useInterval = (callback: () => void, delay: number | null) => {
  const savedCallback = useRef<(() => void) | null>(null)

  useEffect(() => {
    savedCallback.current = callback
  });

  useEffect(() => {
    const tick = () => {
      savedCallback.current && savedCallback.current()
    }
    if (delay !== null) {
      let id = setInterval(tick, delay)
      return () => clearInterval(id)
    }
  }, [delay])
}

export const useTimeSubscribe = () => {
  const time = React.useRef(dayjs())
  const { subscribe, onMessage } = useWS()
  const setTime = useSetAtom(serverTimeState)

  useInterval(() => {
    time.current = dayjs(time.current.add(1, 's'))
    setTime(time.current)
  }, 1000)

  onMessage(json => {
    if (json && json.time) {
      time.current = dayjs(parseInt(json.time))
      setTime(time.current)
    }
  })

  React.useEffect(() => subscribe('time', []), [])
}

export function useServerTime() {
  return useAtomValue(serverTimeState)
}