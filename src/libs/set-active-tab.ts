import { State } from '../types'

export const setActive = (state: State, index: number): State =>
  state.tabs[index] && index !== state.active
    ? { ...state, active: index }
    : state
