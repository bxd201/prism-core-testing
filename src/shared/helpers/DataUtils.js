// @flow
import includes from 'lodash/includes'
import memoizee from 'memoizee'

export function getByLowerCasePropName (obj: Object, propName: string): any {
  const realKey: string[] = Object.keys(obj).map(prop => prop.toLowerCase()).filter(prop => prop === propName)
  if (realKey.length && obj.hasOwnProperty(realKey[0])) {
    return obj[realKey[0]]
  }
}

export function getTotalWidthOf2dArray (arr: any[][]): number {
  // if we have not been provided a 2D array...
  if (!arr || !arr[0]) {
    return 0
  }

  const num = arr.reduce((total: number, current: any[]) => {
    return Math.max(total, current.length)
  }, arr[0].length)
  return num
}

export const ensureFullyQualifiedAssetUrl = memoizee(function ensureFullyQualifiedAssetUrl (url: string): string {
  return includes(url, 'scene7') ? url : `${BASE_PATH}${url}` // eslint-disable-line no-undef
})
