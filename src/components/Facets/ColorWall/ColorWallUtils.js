// @flow
import { findIndex, concat } from 'lodash'
import { ZOOMED_VIEW_GRID_PADDING } from './ColorWallProps'
import { euclideanDistance } from '../../../shared/helpers/GeometryUtils'

export function getColorCoords (id: number, chunkedColorIds: number[][]): number[] | void {
  return chunkedColorIds.map((colorRow: number[], y: number) => {
    const x = findIndex(colorRow, (colorId: number) => {
      return colorId === id
    })

    if (x >= 0) {
      return [x, y]
    }

    return void (0)
  }).filter(val => !!val).reduce((total, current) => {
    return current || total
  })
}

export function drawCircle (radius: number, centerX: number, centerY: number, chunkedColorIds: number[][]) {
  const TL = { x: ZOOMED_VIEW_GRID_PADDING, y: ZOOMED_VIEW_GRID_PADDING }
  const BR = { x: chunkedColorIds[0].length - 1 - ZOOMED_VIEW_GRID_PADDING, y: chunkedColorIds.length - 1 - ZOOMED_VIEW_GRID_PADDING }
  const subsetCoordTL = { x: centerX - radius, y: centerY - radius }
  const subsetCoordBR = { x: centerX + radius, y: centerY + radius }

  let compensateX = 0
  let compensateY = 0

  function getCompensateX () {
    return compensateX
  }

  function getCompensateY () {
    return compensateY
  }

  let possibleCorners = [
    TL,
    { x: BR.x, y: TL.y }
  ]

  if ((radius * 2 + 1) < chunkedColorIds.length) {
    possibleCorners = concat(possibleCorners, BR, { x: TL.x, y: BR.y })
  }

  const nearestCorner = possibleCorners.reduce((last, current) => {
    const lastDist = euclideanDistance({ x: centerX, y: centerY }, last)
    const currDist = euclideanDistance({ x: centerX, y: centerY }, current)

    if (currDist < lastDist) {
      return current
    }
    return last
  })

  if (subsetCoordTL.x < TL.x) subsetCoordTL.x = TL.x
  if (subsetCoordTL.y < TL.y) subsetCoordTL.y = TL.y
  if (subsetCoordBR.x > BR.x) subsetCoordBR.x = BR.x
  if (subsetCoordBR.y > BR.y) subsetCoordBR.y = BR.y

  let levelHash = {}

  for (let x = subsetCoordTL.x; x <= subsetCoordBR.x; x++) {
    for (let y = subsetCoordTL.y; y <= subsetCoordBR.y; y++) {
      let dist = Math.round(euclideanDistance({ x: x, y: y }, { x: centerX, y: centerY }))
      const offsetX = x - centerX
      const offsetY = y - centerY

      if (dist > radius) {
        continue
      }

      if (offsetX === 0 || offsetY === 0) {
        dist -= 0.5
      }

      dist = Math.min(dist * -1, 0)

      const _compensateX = calculateEdgeCompensation(x - ZOOMED_VIEW_GRID_PADDING, nearestCorner.x - ZOOMED_VIEW_GRID_PADDING, radius)
      const _compensateY = calculateEdgeCompensation(y - ZOOMED_VIEW_GRID_PADDING, nearestCorner.y - ZOOMED_VIEW_GRID_PADDING, radius)

      if (Math.abs(_compensateX) > Math.abs(compensateX)) {
        compensateX = _compensateX
      }

      if (Math.abs(_compensateY) > Math.abs(compensateY)) {
        compensateY = _compensateY
      }

      levelHash[chunkedColorIds[y][x]] = {
        level: dist,
        offsetX: offsetX,
        offsetY: offsetY,
        compensateX: getCompensateX,
        compensateY: getCompensateY
      }
    }
  }

  return levelHash
}

export function getCoordsObjectFromPairs (pairs: number[][]) {
  const len = pairs.length
  for (let i = 0; i < len; i++) {
    if (pairs[i] && pairs[i].length === 2) {
      return {
        x: pairs[i][0],
        y: pairs[i][1]
      }
    }
  }
}

function calculateEdgeCompensation (targetAxis, edgeAxis, radius) {
  const dist = edgeAxis - targetAxis
  let compensation = radius

  if (edgeAxis > targetAxis) {
    // positive value or zero
    compensation = Math.max((radius - dist), 0)
  } else if (edgeAxis < targetAxis) {
    // negative value or zero
    compensation = Math.max((radius + dist), 0)
  }

  if (edgeAxis > 0) {
    compensation *= -1
  }

  return compensation
}
