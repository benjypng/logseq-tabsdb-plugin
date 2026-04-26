export interface Tab {
  name: string
  fullTitle?: string
  title?: string
  isBlock?: boolean
  scroll: number
  cursor?: any
}

export interface State {
  tabs: Tab[]
  active: number
}

export interface Ref<Value> {
  get: () => Value
  set: (next: Value) => void
  update: (transform: (current: Value) => Value) => void
}
