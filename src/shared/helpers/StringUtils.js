// @flow
import { memoize, kebabCase } from 'lodash'

export const arrayToSpacedString = memoize(function arrayToSpacedString (arr: string[]) {
  return arr.join(' ')
})

export const numToAlphaString = memoize(function numToAlphaString (num: number) {
  return num.toString().replace(/-/g, 'n').replace(/\./g, '-')
})

export const compareKebabs = memoize(function compareKebabs (str1: string, str2: string): boolean {
  return kebabCase(str1) === kebabCase(str2)
}, function () { return `${arguments[0]}|${arguments[1]}` })
