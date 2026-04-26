import { State } from '../types'

export const validate = (state: State) => {
  if (state.active < -1 || state.active >= state.tabs.length)
    throw new Error(`active out of range: ${state.active}/${state.tabs.length}`)
  if (state.tabs.length > 0 && state.active === -1)
    throw new Error('active=-1 with non-empty tabs')
  const names = new Set<string>()
  for (const tab of state.tabs) {
    if (names.has(tab.name)) throw new Error(`duplicate tab: ${tab.name}`)
    names.add(tab.name)
  }
}
