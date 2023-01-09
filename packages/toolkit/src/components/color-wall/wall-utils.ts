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
import { ChunkData, Items } from './types'

interface ChunkPositions {
  current?: ChunkData
  first?: ChunkData
  last?: ChunkData
  next?: ChunkData
  previous?: ChunkData
}

interface DirectionProximalSwatch {
  id: number | string
  swatches: HTMLButtonElement[]
}

interface ProximalSwatch {
  current: DirectionProximalSwatch
  up: DirectionProximalSwatch
  down: DirectionProximalSwatch
  left: DirectionProximalSwatch
  right: DirectionProximalSwatch
}

export interface ChunkCoordinates {
  row: number
  column: number
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
export function getPerimeterLevelTest(
  chunkChildren: Items[],
  id: string | number,
  levels = 0
): (id: string | number) => number {
  if (chunkChildren && isSomething(id)) {
    if (levels === 0) {
      return () => 0
    } else {
      const { row, column } = getIdCoordsInChunk(id, chunkChildren)

      const perimeterArray: Items[] = []

      for (let curLevel = 1; curLevel <= levels; curLevel++) {
        const north = chunkChildren[row - curLevel]?.[column] ?? null
        const south = chunkChildren[row + curLevel]?.[column] ?? null
        const east = chunkChildren[row]?.[column + curLevel] ?? null
        const west = chunkChildren[row]?.[column - curLevel] ?? null

        perimeterArray[curLevel * 2 - 1] = uniq([north, south, east, west].filter((v) => v !== null))
        perimeterArray[curLevel * 2] = uniq(
          [
            chunkChildren[row - curLevel]?.[column - 1] ?? null,
            chunkChildren[row - curLevel]?.[column + 1] ?? null,
            chunkChildren[row + curLevel]?.[column - 1] ?? null,
            chunkChildren[row + curLevel]?.[column + 1] ?? null,
            chunkChildren[row + 1]?.[column + curLevel] ?? null,
            chunkChildren[row - 1]?.[column + curLevel] ?? null,
            chunkChildren[row + 1]?.[column - curLevel] ?? null,
            chunkChildren[row - 1]?.[column - curLevel] ?? null
          ].filter((v) => v !== null)
        )
      }

      return function findPerimeterLevelById(id) {
        for (let i = 1; i < perimeterArray.length; i++) {
          if (perimeterArray[i].includes(id)) {
            return i
          }
        }
      }
    }
  }

  return () => 0
}

export function getIdCoordsInChunk(id: string | number, children: Items[]): ChunkCoordinates {
  const row = children.find((row) => row.includes(id))

  return {
    row: children.indexOf(row),
    column: row.indexOf(id)
  }
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
      const { row, column } = getIdCoordsInChunk(swatchId, children)

      const btnRefs = chunk(Array.from(hostChunk.swatchesRef?.current ?? []), children[0].length)
      const coordsUp = [column, Math.max(row - 1, 0)]
      const coordsDn = [column, Math.min(row + 1, children.length - 1)]
      const coordsL = [Math.max(column - 1, 0), row]
      const coordsR = [Math.min(column + 1, children[0]?.length - 1), row]

      const currId = btnRefs[row]?.[column]?.id ?? null
      const tabbableElements = getInTabOrder(btnRefs[row]?.[column]?.swatches) ?? null

      return {
        current: {
          id: currId,
          swatches: tabbableElements
        },
        up: {
          id: btnRefs[coordsUp[1]]?.[coordsUp[0]]?.id ?? currId,
          swatches: getInTabOrder(btnRefs[coordsUp[1]]?.[coordsUp[0]]?.swatches) ?? tabbableElements
        },
        down: {
          id: btnRefs[coordsDn[1]]?.[coordsDn[0]]?.id ?? currId,
          swatches: getInTabOrder(btnRefs[coordsDn[1]]?.[coordsDn[0]]?.swatches) ?? tabbableElements
        },
        left: {
          id: btnRefs[coordsL[1]]?.[coordsL[0]]?.id ?? currId,
          swatches: getInTabOrder(btnRefs[coordsL[1]]?.[coordsL[0]]?.swatches) ?? tabbableElements
        },
        right: {
          id: btnRefs[coordsR[1]]?.[coordsR[0]]?.id ?? currId,
          swatches: getInTabOrder(btnRefs[coordsR[1]]?.[coordsR[0]]?.swatches) ?? tabbableElements
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

export function findPositionInChunks(chunkSet: Set<ChunkData>, swatchId: string | number): ChunkPositions {
  if (chunkSet?.size && isSomething(swatchId)) {
    const _chunks = Array.from(chunkSet)

    const max = _chunks
      .map(({ data }) => data)
      .map(({ children }) => children)
      .map((children) => flattenDeep(children))
      .map((children, i) => (children.includes(swatchId) ? i : -1))
      .reduce((accum, next) => Math.max(accum, next))

    return {
      current: _chunks[max] ?? null,
      next: _chunks[max + 1] ?? null,
      previous: _chunks[max - 1] ?? null
    }
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

export function getInTabOrder(list: HTMLButtonElement[]): HTMLButtonElement[] {
  return sortBy(
    uniq(list.filter(Boolean)).filter((swatch) => swatch.tabIndex !== -1),
    (swatch) => swatch.tabIndex
  )
}

export function getInitialSwatchInChunk(
  chunk: ChunkData,
  activeColorId: string | number
): { el: HTMLButtonElement; id: string | number } {
  const chunkKids = chunk.data?.children

  if (chunkKids?.length) {
    const newId = flattenDeep(chunkKids).includes(activeColorId) ? activeColorId : chunkKids[0]?.[0] ?? null
    const foundSwatches = chunk.swatchesRef.current.filter((swatch) => swatch.id === newId).at(0).swatches

    if (foundSwatches) {
      return {
        el: getInTabOrder(foundSwatches).at(0),
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

export function getAlignment(type: string): string {
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
