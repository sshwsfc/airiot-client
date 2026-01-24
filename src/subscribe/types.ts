// 订阅标签相关类型
export interface SubTag {
  tableId: string
  dataId?: string
  tagId?: string
}

// 订阅数据ID相关类型
export interface SubData {
  tableId: string
  dataId?: string
  fields?: string[]
}

// 标签值类型
export interface TagValue {
  value?: any
  time?: any
  warningState?: any
  timeoutState?: any
  [key: string]: any
}

// 播放状态类型
export interface PlaybackState {
  time: string
  speed: number
  [key: string]: any
}

// WebSocket上下文类型
export interface WsContext {
  subscribe: (event: string, data: any) => () => void
  onData: (callback: (data: any) => void) => void
}

// 时间重连上下文类型
export interface TimeReconnectContext {
  reconnect: () => void
}

// 属性选项类型
export interface TagOptions {
  tableId?: string
  dataId?: string
  tagId: string
}

export interface DataPropOptions {
  field: string
  dataId?: string
  tableId?: string
  type?: string
  config?: string
  relateShowField?: string
  enumObj?: Record<string, string>
}

// 标签节点类型（用于parseTags函数）
export interface TagNode {
  [key: string]: TagNode | any
  id?: string
}

// 标签项类型
export interface TagItem {
  id?: string
  [key: string]: any
}
