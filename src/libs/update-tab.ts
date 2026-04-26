import { State, Tab } from '../types'

export const updateTab = (
  state: State,
  index: number,
  patch: Partial<Tab>,
): State => {
  const existingTab = state.tabs[index]
  if (!existingTab) return state
  const tabs = state.tabs.slice()
  tabs[index] = { ...existingTab, ...patch }
  return { ...state, tabs }
}
