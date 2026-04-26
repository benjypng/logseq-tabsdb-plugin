import { State, Tab } from '../types'
import { addTab } from './add-tab'
import { updateTab } from './update-tab'

export const reconcileInitial = (state: State, initialTab: Tab): State => {
  const existingIndex = state.tabs.findIndex(
    (tab) => tab.name === initialTab.name,
  )
  if (existingIndex >= 0)
    return updateTab({ ...state, active: existingIndex }, existingIndex, {
      fullTitle: initialTab.fullTitle,
      title: initialTab.title,
    })
  return addTab(state, initialTab)
}
