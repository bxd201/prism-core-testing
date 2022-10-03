// @flow
import { CLUSTER_SIZE,FULL, HALF, NUM_CLUSTERS, QUARTER } from './constants'

export const ERROR_ALL_ARGS_NUMBERS = 'All arguments must be numbers'

export function distance (one: number, two: number): number {
  if (typeof one !== 'number' || typeof two !== 'number') throw new TypeError(ERROR_ALL_ARGS_NUMBERS)

  return Math.max(one, two) - Math.min(one, two)
}

export function leastDistance (one: number, two: number, scale: number = FULL): number {
  if (typeof one !== 'number' || typeof two !== 'number') throw new TypeError(ERROR_ALL_ARGS_NUMBERS)

  const dist = distance(one, two)
  const halfScale = scale / 2
  return dist > halfScale ? (halfScale - (dist - halfScale)) : dist
}

export function bracketedDistance (one: number, two: number): number {
  if (typeof one !== 'number' || typeof two !== 'number') throw new TypeError(ERROR_ALL_ARGS_NUMBERS)
  const dist = leastDistance(one, two)
  return Math.round(dist / (FULL / NUM_CLUSTERS))
}

export function getDegreeCluster (one: number) {
  const cluster = Math.round(one / CLUSTER_SIZE)
  return cluster === NUM_CLUSTERS ? 0 : cluster
}

export function wrap (val: number) {
  while (val > FULL) {
    val -= FULL
  }

  while (val < 0) {
    val += FULL
  }

  if (val === FULL) {
    val = 0
  }

  return val
}

// TODO: define type for action, which gets 2 numbers and a denormalize method
export function actOnNormalizedRadialData (h1: number, h2: number, action: Function): any {
  const [lower, upper] = [h1, h2].sort()
  const diff = upper - lower

  const offset = diff > HALF ? upper : lower
  const denormalize = v => wrap(v + offset)

  const h1Offset = wrap(h1 - offset)
  const h2Offset = wrap(h2 - offset)

  return action(Math.min(h1Offset, h2Offset), Math.max(h1Offset, h2Offset), denormalize)
}

// in between
export function getAnalog (h1: number, h2: number): number {
  return wrap(Math.round((h1 + h2) / 2))
}

export function getDiad (h1: number, h2: number): [number, number] {
  return actOnNormalizedRadialData(h1, h2, (h1b, h2b, denormalize) => {
    const [lower, upper] = [h1b, h2b].sort()
    return [
      lower - (CLUSTER_SIZE * 2),
      upper + (CLUSTER_SIZE * 2)
    ]
  })
}

// opposite
export function getComplementary (h1: number): number {
  return wrap(Math.round(h1 + HALF))
}

// triangle
export function getSplitComplementaryFromNearPoints (h1: number, h2: number): number {
  return getComplementary(getAnalog(h1, h2))
}

// triangle
// when we only know one long side, there are 2 possible solutions for 2 possible split comp orientations
export function getSplitComplementaryFromFarPoints (h1: number, h2: number): [number, number] {
  return actOnNormalizedRadialData(h1, h2, (h1b, h2b, denormalize) => {
    const [lower, upper] = [h1b, h2b].sort()
    const rotationalDist = (HALF - upper) * 2 // finds distance over Y axis mirroring upper point
    const possibility1 = denormalize(upper + rotationalDist)
    const possibility2 = denormalize(lower - rotationalDist)

    return [possibility1, possibility2]
  })
}

// a square
export function getSquare (h1: number, h2: number): [number, number] {
  return actOnNormalizedRadialData(h1, h2, (h1b, h2b, denormalize) => {
    // find out how close they are -- the options are ~180 or ~90, respond accordingly
    const dist = leastDistance(h1b, h2b)
    const isComplementaryPair = Math.abs(HALF - dist) < Math.abs(QUARTER - dist)

    if (isComplementaryPair) {
      return [rotateQuarter(h1b), rotateQuarter(h2b)].map(denormalize)
    }

    return [rotateQuarter(h1b, false), rotateQuarter(h2b)].map(denormalize)
  })
}

export function getTriadic (h1: number, h2: number): number {
  return getSplitComplementaryFromNearPoints(h1, h2)
}

export function getTetradic (h1: number, h2: number): [number, number] {
  // TODO: add logic to determine if we need to find far or near related colors
  return actOnNormalizedRadialData(h1, h2, (h1b, h2b, denormalize) => {
    const [lower, upper] = [h1b, h2b].sort()
    const upperCluster = getDegreeCluster(upper)
    switch (upperCluster) {
      case 2:
      case 4: {
        // getting complements for both provided points in this configuration creates the tetrad
        return [getComplementary(h1), getComplementary(h2)].map(denormalize)
      }
      case 6:
      default: {
        // need to rotate both points forward and back by 2 clusters
        return [
          wrap(lower - (CLUSTER_SIZE * 2)),
          wrap(upper - (CLUSTER_SIZE * 2)),
          wrap(lower + (CLUSTER_SIZE * 2)),
          wrap(upper + (CLUSTER_SIZE * 2))
        ].map(denormalize)
      }
    }
  })
}

export function rotateHalf (h1: number, positive: boolean = true): number {
  return wrap(h1 + (HALF * (positive ? 1 : -1)))
}

export function rotateQuarter (h1: number, positive: boolean = true): number {
  return wrap(h1 + ((HALF / 2) * (positive ? 1 : -1)))
}
