// @flow
import kebabCase from 'lodash/kebabCase'
import memoizee from 'memoizee'

const normalizeCssPropName = memoizee((name: string): string => {
  return `--${kebabCase(name)}`
}, { primitive: true, length: 1 })

export default normalizeCssPropName
