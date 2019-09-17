// @flow
import _ from 'lodash'
import toNumber from 'lodash/toNumber'
import mean from 'lodash/mean'

import { significantFigures, geometricMean } from '../../../../shared/helpers/DataUtils'

import { type NumericArray } from '../../../../shared/types/Common'

import { OUTLIER_PCT, TGT_QUINTILE } from './totalImage.constants'

// gets averages of most to least common values, sometimes helpful
export function avgCommonFrom (arr: NumericArray, sampleReductionFactor: number = 0) {
  const reducedCollection = sampleReductionFactor > 1 ? arr.filter((v, i) => i % sampleReductionFactor === 0) : arr
  const values = _(reducedCollection)
    .chain()
    .groupBy()
    .mapValues(a => a.length)
    .thru(obj => Object.keys(obj).map(p => ({
      value: p,
      count: obj[p]
    })))
    .sortBy('count')
    .map(p => toNumber(p.value))
    .value()

  const len = values.length
  const quarter = Math.round(len / 4)

  return {
    mostCommon: significantFigures(mean(values.slice(quarter * 3)), 3),
    leastCommon: significantFigures(mean(values.slice(0, quarter)), 3),
    loMid: significantFigures(mean(values.slice(quarter, quarter * 2)), 3),
    hiMid: significantFigures(mean(values.slice(quarter * 2, quarter * 3)), 3)
  }
}

// gets extreme values
export function sliceMeanFrom (arr: NumericArray, quint: number = TGT_QUINTILE, sampleReductionFactor: number = 0) {
  const reducedCollection = sampleReductionFactor > 1 ? arr.filter((v, i) => i % sampleReductionFactor === 0) : arr
  const collectionLen = reducedCollection.length
  const edge = Math.round(collectionLen * (OUTLIER_PCT / 2))
  const values = _(reducedCollection)
    .chain()
    .sortBy()
    .slice(edge, 0 - edge)
    .value()

  const total = values.length
  const sliceSize = Math.round(total * quint)
  const middle = Math.round((total + sliceSize) / 2)

  const getSliceMean = (values, start, end) => {
    const v = _(values)
      .chain()
      .slice(start, end)
      .thru(arr => geometricMean(arr))
      .value()

    if (isNaN(v)) {
      // FIXME: handle non-numeric case; remove debugger
      // we should always have numeric values for these, so this needs to be handled
      debugger // eslint-disable-line
    }

    return v
  }

  return {
    upper: significantFigures(getSliceMean(values, total - sliceSize), 3),
    middle: significantFigures(getSliceMean(values, middle, middle + sliceSize), 3),
    lower: significantFigures(getSliceMean(values, 0, sliceSize), 3)
  }
}

export function medianFrom (arr: NumericArray, sampleReductionFactor: number = 0) {
  return _(arr)
    .chain()
    .filter((v, i) => (sampleReductionFactor > 1 && i % sampleReductionFactor === 0) ? v : null)
    .sortBy()
    .thru(arr => arr[Math.round(arr.length / 2)])
    .value()
}

export function meanFrom (arr: NumericArray, sampleReductionFactor: number = 0) {
  return _(arr)
    .chain()
    .filter((v, i) => (sampleReductionFactor > 1 && i % sampleReductionFactor === 0) ? v : null)
    .mean()
    .thru(v => significantFigures(v, 3))
    .value()
}

// TODO: remove this; it's just for exporting data for analysis
export function toExcel (values: string[]): void {
  console.log(values.join('\t'))
}

export function runPerImagePixel (imageData: any, cb: Function) {
  const len = imageData.length
  const step = 4

  for (let i = 0; i < len; i += step) {
    cb(i)
  }
}
