// @flow
import uniq from 'lodash/uniq'

/**
 * @description Will take a string and remove duplicates based on a provided delimiter.
 * @param {string} string string on which deduping should be performed
 * @param {string} [''] delimiter delimiter marking breaks in provided string
 * @example dedupePatternedString('test') // outputs 'tes'
 * @example dedupePatternedString('a,b,a,c', ',') // outputs 'a,b,c')
 */
export const dedupePatternedString = (string: string, delimiter: string = ''): string => {
  if (typeof string !== 'string') {
    return ''
  }

  return uniq(string.split(delimiter)).join(delimiter)
}
