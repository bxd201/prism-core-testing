// @flow
import { TAU } from '../../constants/globals'

export const getTransformParams = (angle: number = 0, width: number, height: number): Object => {
  let rotation = (angle * TAU) / 360

  const hScale = 1
  const vScale = 1
  const vSkew = 0
  const hSkew = 0
  let hTrans = 0
  let vTrans = 0

  let canvasWidth = 0
  let canvasHeight = 0

  switch (angle) {
    case 90:
    case -270:
      hTrans = width
      canvasWidth = height
      canvasHeight = width
      break
    case 180:
    case -180:
      vTrans = height
      hTrans = width
      canvasWidth = width
      canvasHeight = height
      break
    case 270:
    case -90:
      vTrans = height
      canvasWidth = height
      canvasHeight = width
      break
    default:
      // 0 degrees
      rotation = 0
      canvasWidth = width
      canvasHeight = height
  }

  return {
    canvasWidth,
    canvasHeight,
    vScale,
    hScale,
    vSkew,
    hSkew,
    hTrans,
    vTrans,
    rotation
  }
}
