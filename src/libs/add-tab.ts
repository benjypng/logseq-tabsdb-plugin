import { State, Tab } from '../types'

export const addTab = (state: State, newTab: Tab): State => {
  const existingIndex = state.tabs.findIndex((tab) => tab.name === newTab.name)
  if (existingIndex >= 0) return { ...state, active: existingIndex }
  const insertIndex = state.tabs.findLastIndex((tab) => tab.pinned) + 1
  const tabs = [
    ...state.tabs.slice(0, insertIndex),
    newTab,
    ...state.tabs.slice(insertIndex),
  ]
  return { tabs, active: insertIndex }
}
