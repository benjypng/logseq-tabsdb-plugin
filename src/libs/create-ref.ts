import { Ref } from '../types'

export const createRef = <Value>(initial: Value): Ref<Value> => {
  let value = initial
  return {
    get: () => value,
    set: (next) => {
      value = next
    },
    update: (transform) => {
      value = transform(value)
    },
  }
}
