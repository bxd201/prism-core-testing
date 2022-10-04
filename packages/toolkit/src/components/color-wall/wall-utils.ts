import { MutableRefObject } from 'react'
import chunk from 'lodash/chunk'
import flattenDeep from 'lodash/flattenDeep'
import sortBy from 'lodash/sortBy'
import uniq from 'lodash/uniq'
import isSomething from '../../utils/isSomething'
import {
  BASE_SWATCH_SIZE,
  MAX_BASE_SIZE,
  MIN_BASE_SIZE,
  OUTER_SPACING,
  SWATCH_WIDTH_WRAP_THRESHOLD,
  TITLE_SIZE_MAX,
  TITLE_SIZE_MIN,
  TITLE_SIZE_RATIOS
} from './constants'
import { ChunkData } from './types'

interface ChunkPositions {
  current?: ChunkData
  first?: ChunkData
  last?: ChunkData
  next?: ChunkData
  previous?: ChunkData
}

interface ProximalSwatch {
  current: {
    id: number
    ref: MutableRefObject<HTMLButtonElement>
  }
  up: {
    id: number
    ref: MutableRefObject<HTMLButtonElement>
  }
  down: {
    id: number
    ref: MutableRefObject<HTMLButtonElement>
  }
  left: {
    id: number
    ref: MutableRefObject<HTMLButtonElement>
  }
  right: {
    id: number
    ref: MutableRefObject<HTMLButtonElement>
  }
}

export function getTitleFontSize(level: number = 1, scale: number = 1, constrained: boolean = false): number {
  const sizeMultiplier = TITLE_SIZE_RATIOS[level]
  const targetSize = BASE_SWATCH_SIZE * scale * sizeMultiplier

  if (!constrained) {
    return targetSize
  }

  // limit our font size to a max of TITLE_SIZE_MAX
  const minSize = Math.max(TITLE_SIZE_MIN, targetSize)
  const maxSize = Math.min(TITLE_SIZE_MAX, minSize)
  return maxSize
}

export function getTitleContainerSize(level: number = 1, scale: number = 1): number {
  return getTitleFontSize(level, scale, false) * 2.75
}

export function getCumulativeTitleContainerSize(levels: number[] = [], scale: number = 1): number {
  return levels.reduce((prev, next) => prev + getTitleContainerSize(next, scale), 0)
}

// TODO: this should actually return a memoized function which will return the perimeter level when provided an ID
export function getPerimeterLevelTest(chunkChildren, id, levels = 0): (id: any) => number {
  if (chunkChildren && isSomething(id)) {
    if (levels === 0) {
      return () => 0
    } else {
      const coords = getIdCoordsInChunk(id, chunkChildren)

      if (!coords) {
        return () => 0
      }

      // more than 0 levels...

      const perimeterArray = []

      for (let curLevel = 1; curLevel <= levels; curLevel++) {
        const north = chunkChildren[coords[1] - curLevel]?.[coords[0]] ?? null
        const south = chunkChildren[coords[1] + curLevel]?.[coords[0]] ?? null
        const east = chunkChildren[coords[1]]?.[coords[0] + curLevel] ?? null
        const west = chunkChildren[coords[1]]?.[coords[0] - curLevel] ?? null

        perimeterArray[curLevel * 2 - 1] = uniq([north, south, east, west].filter((v) => v !== null))
        perimeterArray[curLevel * 2] = uniq(
          [
            chunkChildren[coords[1] - curLevel]?.[coords[0] - 1] ?? null,
            chunkChildren[coords[1] - curLevel]?.[coords[0] + 1] ?? null,
            chunkChildren[coords[1] + curLevel]?.[coords[0] - 1] ?? null,
            chunkChildren[coords[1] + curLevel]?.[coords[0] + 1] ?? null,
            chunkChildren[coords[1] + 1]?.[coords[0] + curLevel] ?? null,
            chunkChildren[coords[1] - 1]?.[coords[0] + curLevel] ?? null,
            chunkChildren[coords[1] + 1]?.[coords[0] - curLevel] ?? null,
            chunkChildren[coords[1] - 1]?.[coords[0] - curLevel] ?? null
          ].filter((v) => v !== null)
        )
      }

      return function findPerimeterLevelById(id) {
        for (let i = 1; i < perimeterArray.length; i++) {
          if (perimeterArray[i].indexOf(id) > -1) {
            return i
          }
        }
      }
    }
  }

  return () => 0
}

export function getIdCoordsInChunk(id: string | number, chunk: number[][]): number[] {
  const coords = chunk.reduce((accum, next, y) => {
    if (accum) {
      return accum
    }

    const x = next.indexOf(id as number)

    if (x >= 0) {
      return [x, y]
    }
    return null
  }, undefined)

  return coords
}

export function getProximalSwatchesBySwatchId(
  chunksSet: Set<ChunkData>,
  chunkId: string | number,
  swatchId: string | number
): ProximalSwatch {
  if (chunksSet && chunksSet.size > 0 && chunkId !== null && isSomething(swatchId)) {
    const hostChunk = Array.from(chunksSet).filter(({ id }) => id === chunkId)?.[0]
    const children = hostChunk?.data?.children

    if (hostChunk && children.length && children[0]?.length) {
      const coords = getIdCoordsInChunk(swatchId, children)

      if (coords) {
        const btnRefs = chunk(Array.from(hostChunk.swatchesRef?.current ?? []), children[0].length)
        const coordsUp = [coords[0], Math.max(coords[1] - 1, 0)]
        const coordsDn = [coords[0], Math.min(coords[1] + 1, children.length - 1)]
        const coordsL = [Math.max(coords[0] - 1, 0), coords[1]]
        const coordsR = [Math.min(coords[0] + 1, children[0]?.length - 1), coords[1]]

        const currId = btnRefs[coords[1]]?.[coords[0]]?.id ?? null
        const currRef = btnRefs[coords[1]]?.[coords[0]]?.el ?? null

        return {
          current: {
            id: currId,
            ref: currRef
          },
          up: {
            id: btnRefs[coordsUp[1]]?.[coordsUp[0]]?.id ?? currId,
            ref: btnRefs[coordsUp[1]]?.[coordsUp[0]]?.el ?? currRef
          },
          down: {
            id: btnRefs[coordsDn[1]]?.[coordsDn[0]]?.id ?? currId,
            ref: btnRefs[coordsDn[1]]?.[coordsDn[0]]?.el ?? currRef
          },
          left: {
            id: btnRefs[coordsL[1]]?.[coordsL[0]]?.id ?? currId,
            ref: btnRefs[coordsL[1]]?.[coordsL[0]]?.el ?? currRef
          },
          right: {
            id: btnRefs[coordsR[1]]?.[coordsR[0]]?.id ?? currId,
            ref: btnRefs[coordsR[1]]?.[coordsR[0]]?.el ?? currRef
          }
        }
      }
    }
  }

  return {
    current: null,
    up: null,
    down: null,
    left: null,
    right: null
  }
}

export function findPositionInChunks(chunkSet: Set<ChunkData>, swatchId): ChunkPositions {
  if (chunkSet?.size && isSomething(swatchId)) {
    const _chunks = Array.from(chunkSet)
    const b = _chunks.map(({ data }) => data)
    const c = b.map(({ children }) => children)
    const d = c.map((children) => flattenDeep(children))
    const f = d.map((children, i) => (children.includes(swatchId) ? i : -1))
    const g = f.reduce((accum, next) => Math.max(accum, next))

    const stuff = {
      current: _chunks[g] ?? null,
      next: _chunks[g + 1] ?? null,
      previous: _chunks[g - 1] ?? null
    }
    return stuff
  }

  return {
    current: null,
    next: null,
    previous: null
  }
}

export function getProximalChunksBySwatchId(chunksSet: Set<ChunkData>, swatchId?: string | number): ChunkPositions {
  if (chunksSet && chunksSet.size > 0) {
    const chunkArray = Array.from(chunksSet)
    const first = chunkArray[0]
    const last = chunkArray[chunkArray.length - 1]

    return {
      ...findPositionInChunks(chunksSet, swatchId),
      first,
      last
    }
  }

  return {
    current: null,
    first: null,
    last: null,
    next: null,
    previous: null
  }
}

export function getInTabOrder(list = []): any[] {
  return sortBy(
    uniq(list.filter(Boolean)).filter((el) => el.tabIndex !== -1),
    (el) => el.tabIndex
  )
}

export function getInitialSwatchInChunk(chunk, activeColorId): { el: HTMLButtonElement; id: number } {
  const chunkKids = chunk.data?.children

  if (chunkKids?.length) {
    const newId = flattenDeep(chunkKids).includes(activeColorId) ? activeColorId : chunkKids[0]?.[0] ?? null
    const foundSwatch = chunk.swatchesRef?.current?.filter?.(({ id }) => id === newId)?.[0] // eslint-disable-line

    if (foundSwatch) {
      return {
        el: getInTabOrder(foundSwatch.el?.current)[0],
        id: newId
      }
    }
  }
}

export function needsToWrap(targetScale: number): boolean {
  if (!isNaN(targetScale)) {
    return BASE_SWATCH_SIZE * targetScale < SWATCH_WIDTH_WRAP_THRESHOLD
  }

  throw Error('targetScale must be numeric')
}

export function determineScaleForAvailableWidth(wallWidth: number = 0, containerWidth: number = 0): number {
  if (!isNaN(wallWidth)) {
    const scaleTarget = containerWidth / (wallWidth + OUTER_SPACING * 2)
    const swatchSizeTarget = scaleTarget * BASE_SWATCH_SIZE
    const swatchSizeConstrained = Math.min(Math.max(swatchSizeTarget, MIN_BASE_SIZE), MAX_BASE_SIZE)
    const scaleConstrained = (swatchSizeConstrained / swatchSizeTarget) * scaleTarget

    return scaleConstrained
  } else {
    throw Error('Wall width must be numeric.')
  }
}

export function getAlignment(type): string {
  switch (type) {
    case 'start':
      return 'justify-start'
    case 'end':
      return 'justify-end'
    case 'center':
      return 'justify-center'
    case 'justify':
      return 'justify-between'
  }

  return 'justify-start'
}
