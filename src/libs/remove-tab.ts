import { State } from '../types'

export const removeTab = (state: State, index: number): State => {
  const tabs = state.tabs.filter((_, tabIndex) => tabIndex !== index)
  let active = state.active
  if (state.active === index) active = Math.min(index, tabs.length - 1)
  else if (state.active > index) active = state.active - 1
  if (tabs.length === 0) active = -1
  return { tabs, active }
}
