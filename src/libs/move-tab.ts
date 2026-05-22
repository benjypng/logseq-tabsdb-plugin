import { State } from '../types'

export const moveTab = (
  state: State,
  fromIndex: number,
  insertIndex: number,
): State => {
  if (fromIndex < 0 || fromIndex >= state.tabs.length) return state
  if (insertIndex < 0 || insertIndex > state.tabs.length) return state
  if (insertIndex === fromIndex || insertIndex === fromIndex + 1) return state
  const activeTab = state.tabs[state.active]
  const movedTab = state.tabs[fromIndex]
  if (!movedTab) return state
  const tabs = [...state.tabs]
  tabs.splice(fromIndex, 1)
  const adjustedInsertIndex =
    insertIndex > fromIndex ? insertIndex - 1 : insertIndex
  tabs.splice(adjustedInsertIndex, 0, movedTab)
  const active = activeTab ? tabs.indexOf(activeTab) : -1
  return { tabs, active }
}
