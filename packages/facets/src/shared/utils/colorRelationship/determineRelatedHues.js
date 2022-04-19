// @flow

import { bracketedDistance, actOnNormalizedRadialData, getAnalog, getSplitComplementaryFromNearPoints, getSplitComplementaryFromFarPoints, getTetradic, getDiad, getSquare } from './index'

export default function (col1: number, col2: number): number[][] | typeof undefined {
  if (typeof col1 === 'undefined' || typeof col2 === 'undefined') {
    return
  }

  return actOnNormalizedRadialData(col1, col2, (col1Off, col2Off, denormalize) => {
    const dist = bracketedDistance(col1Off, col2Off)

    switch (dist) {
      case 0:
        // diad in both directions (2 spaces over)
        const diads = getDiad(col1Off, col2Off).map(denormalize)
        return [diads]
      case 1:
        // colors 1 space apart are not having relationships computed
        // this is not close enough to be considered the "same" color, and not far
        // enough apart to be considered part of a multi-color relationship
        return
      case 2: {
        // analogous, split-complementary, and tetradic
        const analog = [(getAnalog(col1Off, col2Off))].map(denormalize)
        const splitComp = [(getSplitComplementaryFromNearPoints(col1Off, col2Off))].map(denormalize)
        const tetradic = getTetradic(col1Off, col2Off).map(denormalize)
        return [analog, splitComp, tetradic]
      }
      case 3: {
        // square
        const square = getSquare(col1Off, col2Off).map(denormalize)
        return [square]
      }
      case 4: {
        // triadic & rectangular (tetradic)
        const triadic = [getSplitComplementaryFromNearPoints(col1Off, col2Off)].map(denormalize)
        const tetradic = getTetradic(col1Off, col2Off).map(denormalize)
        return [triadic, tetradic]
      }
      case 5: {
        // split-complementary in 2 different orientations
        const splitComp1 = getSplitComplementaryFromFarPoints(col1Off, col2Off).map(denormalize)
        return [splitComp1]
      }
      case 6: {
        // square, rectangular (tetradic)
        const square = getSquare(col1Off, col2Off).map(denormalize)
        const tetradic = getTetradic(col1Off, col2Off).map(denormalize)
        return [square, tetradic]
      }
      default:
    }
  })
}
