import { createRef } from '.'

export const createSerialQueue = () => {
  const tail = createRef<Promise<unknown>>(Promise.resolve())
  return <Result>(task: () => Promise<Result>): Promise<Result> => {
    const result = tail
      .get()
      .catch(() => undefined)
      .then(task)
    tail.set(result.catch(() => undefined))
    return result
  }
}
