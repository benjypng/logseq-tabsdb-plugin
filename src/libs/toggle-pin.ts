import { State } from '../types'

export const togglePin = (state: State, index: number): State => {
  const target = state.tabs[index]
  if (!target) return state
  const previousActiveTab = state.tabs[state.active]
  const updatedTab = { ...target, pinned: !target.pinned }
  const without = state.tabs.filter((_, i) => i !== index)
  const insertIndex = without.findLastIndex((tab) => tab.pinned) + 1
  const tabs = [
    ...without.slice(0, insertIndex),
    updatedTab,
    ...without.slice(insertIndex),
  ]
  const active =
    state.active === index
      ? insertIndex
      : previousActiveTab
        ? tabs.indexOf(previousActiveTab)
        : -1
  return { tabs, active }
}
