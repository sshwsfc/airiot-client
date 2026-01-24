import { atom } from 'jotai'
import { useAtomValue, useSetAtom } from 'jotai'
import React from 'react'
import dayjs from 'dayjs'

const workerBlob = `
let servertime = null
const tagsMap = new Map()
self.onmessage = function (event) {
  const { type, value } = event.data;
  if (type == 'servertime' && value != servertime) {
    servertime = value
    const timeoutTags = []
    tagsMap.forEach(({ time, timeout }, key) => {
      const gap = servertime - time
      let level = null
      if (gap > timeout * 8) {
        level = 3
      } else if (gap > timeout * 3) {
        level = 2
      } else if (gap > timeout) {
        level = 1
      } else if (timeout > gap) {
        level = 0
      }
      timeoutTags.push({ key, level })
    })
    timeoutTags.length > 0 && self.postMessage(timeoutTags)
  } else {
    const { tableId, tableDataId, tagId, time, timeout } = value
    const key = tableId+'|'+tableDataId+'|'+tagId
    tagsMap.set(key, { time, timeout })
  }
};
`

const blob = new Blob([workerBlob], { type: 'application/javascript' })
const workerUrl = URL.createObjectURL(blob)
const worker = new Worker(workerUrl)

export const serverTimeState = atom<any>(null)

const useTime = ({ interval }: { interval: number }) => {
  const [time, setTime] = React.useState<dayjs.Dayjs | null>(null)

  React.useEffect(() => {
    const tick = () => {
      setTime(dayjs())
    }
    tick()
    const timer = setInterval(tick, interval)
    return () => {
      clearInterval(timer)
    }
  }, [interval])

  return { time }
}

export const ServerTime: React.FC = () => {
  const set = useSetAtom(serverTimeState)
  const { time } = useTime({ interval: 1000 })

  React.useEffect(() => {
    if (time) {
      set(time)
      worker.postMessage({
        type: 'servertime',
        value: dayjs(time).unix()
      })
    }
  }, [time?.unix(), set])

  return null
}

export function useServerTime() {
  return useAtomValue(serverTimeState)
}