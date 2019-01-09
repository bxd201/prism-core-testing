// @flow
import { kebabCase } from 'lodash'
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
