import { State, Tab } from '../types'

export const replaceTab = (state: State, index: number, tab: Tab): State => {
  if (!state.tabs[index]) return state
  const tabs = state.tabs.slice()
  tabs[index] = tab
  return { ...state, tabs }
}
