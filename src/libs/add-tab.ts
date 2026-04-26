import { State, Tab } from '../types'

export const addTab = (state: State, newTab: Tab): State => {
  const existingIndex = state.tabs.findIndex((tab) => tab.name === newTab.name)
  if (existingIndex >= 0) return { ...state, active: existingIndex }
  return { tabs: [...state.tabs, newTab], active: state.tabs.length }
}
