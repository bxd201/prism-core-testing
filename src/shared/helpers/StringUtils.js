// @flow
import { memoize } from 'lodash'

export const arrayToSpacedString = memoize(function arrayToSpacedString (arr: string[]) {
  return arr.join(' ')
})

export const numToAlphaString = memoize(function numToAlphaString (num: number) {
  return num.toString().replace(/-/g, 'n').replace(/\./g, '-')
})
