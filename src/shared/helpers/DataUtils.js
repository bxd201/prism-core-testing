// @flow
import memoizee from 'memoizee'
import urlPattern from 'src/shared/regex/url'

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

export const removeExtraURLSlashesAfterProtocol = (url: string) => {
  return url.replace(/([^:])(\/){2,}/g, '$1/')
}

export const ensureFullyQualifiedAssetUrl = memoizee(function ensureFullyQualifiedAssetUrl (url: string): string {
  if (typeof url === 'string' && url.length > 1) {
    const matches = url.match(urlPattern)
    return matches && matches[1] ? url : removeExtraURLSlashesAfterProtocol(`${BASE_PATH}/${url}`)
  }

  return ''
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

export const significantFigures = memoizee((num: number, digits: number): number => {
  const pow = Math.pow(10, digits)
  return Math.round(num * pow) / pow
}, { primitive: true, length: 2 })

export function geometricMean (nums: number[], allowZero: boolean = false): number {
  const len = nums.length

  // more than one number is required
  if (len === 1) {
    return NaN
  }

  for (let i = nums.length - 1; i >= 0; i--) {
    const num = nums[i]

    if (allowZero && num === 0) {
      // if there is any zero at all in this dataset (and it is allowed), skip the legwork and return 0
      return 0
    }

    // otherwise return NaN if any values <= 0 are present
    if (num <= 0) {
      return NaN
    }
  }

  return nums.map(num => Math.pow(num, 1 / len)).reduce((n0, n1) => !n0 ? n1 : n0 * n1, 0)
}

/**
 * Compresses values greater than a particular threshold based on a ratio (larger numbers)
 * @param {number} value input value, any kind of number; once it's larger than threshold it will be compressed
 * @param {number} threshold minimum value at which the compression will begin taking place
 * @param {number} ratio ratio of compression/expansion; values > 1 compresses, 0 > values < 1 expands
 * @param {number} max defaults to Infinity; maximum output value of this function
 */
export function compress (value: number, threshold: number, ratio: number = 1, max: number = Infinity): number {
  const toLimit = value > threshold ? threshold + (value - threshold) / ratio : value
  return Math.min(toLimit, max)
}

export function expand (value: number, threshold: number, ratio: number = 1, min: number = -Infinity): number {
  const toLimit = value > threshold ? threshold + (value - threshold) / ratio : value
  return Math.max(toLimit, min)
}

/**
 * If given value X, will return associated Y value found along a bell curve
 * @param {number} xRef input X to convert to value Y along bell curve
 * @param {number} xMax top X value to set scale for xRef input; defaults to 1
 * @param {number} yMax top Y value to set scale for output Y; defaults to 1
 * @description https://www.desmos.com/calculator/w9jrdpvsmk
 */
export function mapAlongSine (xRef: number, xMax: number = 1, yMax: number = 1): number {
  const x = Math.min(xMax, xRef) / xMax * Math.PI
  const h = 0.25 * Math.PI
  const b = 0.5
  const k = 0.5
  const a = 0.5
  return (a * Math.sin((x - h) / b) + k) * yMax
}
