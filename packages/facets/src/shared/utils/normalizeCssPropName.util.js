// @flow
import kebabCase from 'lodash/kebabCase'
import memoizee from 'memoizee'

export const ERROR_STRING = 'name must be a string'
export const ERROR_EMPTY = 'name must not be an empty string'

const normalizeCssPropName = memoizee((name: string): string => {
  if (typeof name !== 'string') throw new TypeError(ERROR_STRING)
  if (name.trim().length === 0) throw new Error(ERROR_EMPTY)

  return `--${kebabCase(name)}`
}, { primitive: true, length: 1 })

export default normalizeCssPropName
