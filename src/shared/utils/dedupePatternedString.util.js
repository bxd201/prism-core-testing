// @flow
import uniq from 'lodash/uniq'

export const ERROR_NOT_STRING = 'Input must be a string'

/**
 * @description Will take a string and remove duplicates based on a provided delimiter.
 * @param {string} input input on which deduping should be performed
 * @param {string} [''] delimiter delimiter marking breaks in provided string
 * @example dedupePatternedString('test') // outputs 'tes'
 * @example dedupePatternedString('a,b,a,c', ',') // outputs 'a,b,c')
 */
function dedupePatternedString (input: string, delimiter: string = ''): string {
  if (typeof input !== 'string') throw new TypeError(ERROR_NOT_STRING)

  return uniq(input.split(delimiter)).join(delimiter)
}

export default dedupePatternedString
