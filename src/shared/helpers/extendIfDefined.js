// @flow
import { type $Arguments } from 'src/shared/types/Common'

export default function extendIfDefined<T> (...args: $Arguments<T>): T | typeof undefined {
  const argsArr = Array.from(arguments)
  const source = arguments[0]
  const rest = argsArr.slice(1)

  if (source) {
    rest.forEach(obj => {
      Object.keys(obj).forEach(key => {
        const val = obj[key]
        if (typeof val !== 'undefined') {
          source[key] = val
        }
      })
    })
  }

  return source
}
