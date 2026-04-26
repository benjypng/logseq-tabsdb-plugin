import { State, Tab } from '../types'
import { addTab } from './add-tab'
import { replaceTab } from './replace-tab'
import { updateTab } from './update-tab'

export const reconcileRoute = (
  state: State,
  incomingTab: Tab,
  openAsNewTab: boolean,
): State => {
  const existingIndex = state.tabs.findIndex(
    (tab) => tab.name === incomingTab.name,
  )
  if (existingIndex >= 0)
    return updateTab({ ...state, active: existingIndex }, existingIndex, {
      fullTitle: incomingTab.fullTitle,
      title: incomingTab.title,
    })
  if (openAsNewTab || state.active < 0) return addTab(state, incomingTab)
  return replaceTab(state, state.active, incomingTab)
}
