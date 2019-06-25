// @flow
import kebabCase from 'lodash/kebabCase'
import memoizee from 'memoizee'

export const arrayToSpacedString = memoizee(function arrayToSpacedString (arr: string[]): string {
  return arr.join(' ')
}, { primitive: true, length: 1 })

export const numToAlphaString = memoizee(function numToAlphaString (num: number): string {
  return num.toString().replace(/-/g, 'n').replace(/\./g, '-')
}, { primitive: true, length: 1 })

export const compareKebabs = memoizee(function compareKebabs (str1: string, str2: string): boolean {
  return kebabCase(str1) === kebabCase(str2)
}, { primitive: true, length: 2 })

export const trimTrailingSlashes = (str: string): string => {
  let _str = str

  while (_str.charAt(_str.length - 1) === '/') {
    _str = _str.substr(0, str.length - 1)
  }

  return _str
}
