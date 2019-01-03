// @flow
import { memoize } from 'lodash'

export function getByLowerCasePropName (obj: Object, propName: string): any {
  const realKey: string[] = Object.keys(obj).map(prop => prop.toLowerCase()).filter(prop => prop === propName)
  if (realKey.length && obj.hasOwnProperty(realKey[0])) {
    return obj[realKey[0]]
  }
}

export function getTotalWidthOf2dArray (arr: any[][]): number {
  const num = arr.reduce((total: number, current: any[]) => {
    return Math.max(total, current.length)
  }, arr[0].length)
  return num
}

export const ensureFullyQualifiedAssetUrl = memoize(function ensureFullyQualifiedAssetUrl (url: string): string {
  return (url.indexOf('scene7') > -1) ? url : `${BASE_PATH}${url}` // eslint-disable-line no-undef
})
