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

export const generateBrandedEndpoint = memoizee((basePath, brand, options) => {
  let url = `${basePath}/${brand}`

  if (options && options.language) {
    url += `?lng=${options.language}`
  }

  return url
})

export type GridShape = {
  cols: number,
  rows: number,
  ar: number
}

export const formToGridWithAspectRatio = (() => {
  const MAX_ALLOWABLE_PASSES = 10000
  const getSquare = memoizee(function getSquare (items: number): GridShape {
    const sqCols = Math.ceil(Math.sqrt(items))
    const sqRows = Math.ceil(items / sqCols)
    const sqAspectRatio = sqRows / sqCols

    return {
      cols: sqCols,
      rows: sqRows,
      ar: sqAspectRatio
    }
  }, { primitive: true, length: 1 })

  function formToAspectRatio (items: number, targetAr: number, narrower: boolean = true): GridShape {
    const sqData = getSquare(items)
    let pass = MAX_ALLOWABLE_PASSES
    let lastValues = { ...sqData }
    let lastDiff = Math.abs(sqData.ar - targetAr)

    // TODO: we can reduce the number of passes this needs to make by...
    // 1) making a single pass and seeing how far from the target we are
    // 2) making additional passes with larger differences, meaning we add or remove 2/5/10 columns per pass
    // 3) falling back to single changes as we get closer to our target value
    while (pass--) {
      const newCols = lastValues.cols + (narrower ? -1 : 1)
      const newRows = Math.ceil(items / newCols)
      const newAspectRatio = newRows / newCols
      const newDiff = Math.abs(newAspectRatio - targetAr)

      if (newDiff > lastDiff) {
        return lastValues
      } else {
        lastDiff = newDiff
        lastValues = {
          cols: newCols,
          rows: newRows,
          ar: newAspectRatio
        }
      }
    }

    throw Error(`Exceeded maximum allowable number of passes to find aspect ratio of ${targetAr} from ${items} items`)
  }

  return function formToGridWithAspectRatio (totalItems: number, desiredAspectRatio: number): GridShape {
    const sqData = getSquare(totalItems)
    const diff = sqData.ar - desiredAspectRatio

    if (diff > 0) {
      // get shorter -- more cols, fewer rows
      return formToAspectRatio(totalItems, desiredAspectRatio, false)
    } else if (diff < 0) {
      // get taller -- more rows, fewer cols
      return formToAspectRatio(totalItems, desiredAspectRatio, true)
    } else {
      // it's actually perfect, so just return as-is
      return sqData
    }
  }
})()

/**
 * This will take any nested array or object and flatten it into an object with dot-separated keys
 * @param {object | array} tgt any iterable object or array
 * @param {string} prefix string value to place before all keys
 */
export function flattenNestedObject (tgt: any, prefix: string = '') {
  if (!tgt) {
    return {}
  }

  return Object.keys(tgt).reduce((messages, key) => {
    const value = tgt[key]
    const prefixedKey = prefix ? `${prefix}.${key}` : key

    if (typeof value === 'object' && Object.keys(value).length) {
      Object.assign(messages, flattenNestedObject(value, prefixedKey))
    } else {
      Object.assign(messages, { [prefixedKey]: value })
    }

    return messages
  }, {})
}

export function getEveryNthValue (arr: any[], index: number): any[] {
  return arr.filter((v: any, i: number) => (i + 1) % index === 0)
}

export function significantFigures (num: number, digits: number): number {
  const pow = Math.pow(10, digits)
  return Math.round(num * pow) / pow
}
