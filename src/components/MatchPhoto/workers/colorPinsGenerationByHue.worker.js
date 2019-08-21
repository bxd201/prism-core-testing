/* eslint-disable */
// @flow
import { createColorTallies, getPixelPosition } from '../MatchPhotoUtils'
import random from 'lodash/random'
import sampleSize from 'lodash/sampleSize'
import groupBy from 'lodash/groupBy'
import toArray from 'lodash/toArray'
import { findBrandColor } from '../../InspirationPhotos/data'
import { brandColors } from '../../InspirationPhotos/sw-colors-in-LAB.js'

declare var self: DedicatedWorkerGlobalScope

self.addEventListener('message', (e: Object) => {
  const { imageData, imageDimensions } = e.data
  const colorTally = createColorTallies(imageData.data, imageDimensions.width, imageDimensions.height)
  const colorTallyGroupByHue = toArray(groupBy(colorTally, (color) => color.hueRangeNumber))

  const colorTallyRandomEachHue = colorTallyGroupByHue.map((colorTally) => {
    let sampleSizeCount = 10
    if (colorTally.length < 10) {
      sampleSizeCount = colorTally.length
    }
    return sampleSize(colorTally, sampleSizeCount)
  })

  const colorMap = {}

  const pinsArrayByHue = colorTallyRandomEachHue.map((colors, index) => {
    const pinsArray = colors.map(color => {
      const randomByteIndex = random(0, color.byteIndices.length - 1)
      const pixelPosition = getPixelPosition(color.byteIndices[randomByteIndex], imageDimensions.width, imageDimensions.height)
      const r = color.value.r
      const g = color.value.g
      const b = color.value.b
      const arrayIndex = findBrandColor([r, g, b])
      const sherwinRgb = `rgb(${brandColors[arrayIndex + 2]})`

      const key = sherwinRgb
      if (!colorMap.hasOwnProperty(key) && pixelPosition.x >= 0.15 && pixelPosition.y >= 0.15 && pixelPosition.x <= 0.85 && pixelPosition.y <= 0.85) {
        colorMap[key] = [index]
        return {
          r: r,
          g: g,
          b: b,
          x: pixelPosition.x,
          y: pixelPosition.y
        }
      }
    })

    return pinsArray.filter(pin => pin !== undefined)
  })

  const pins = pinsArrayByHue.map(pin => (pin.length > 0) && pin[random(0, pin.length - 1)])
  const pinsReduced = pins.filter(pin => pin !== undefined && pin !== false)
  const pinsRandom = sampleSize(pinsReduced, 8)
  self.postMessage({ pinsRandom: pinsRandom })
})
