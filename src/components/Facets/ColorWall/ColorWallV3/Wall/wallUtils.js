import flattenDeep from 'lodash/flattenDeep'
import chunk from 'lodash/chunk'
import memoizee from 'memoizee'

export const getProximalSwatchesBySwatchId = (chunks, chunkId, swatchId) => {
  if (chunks?.current && typeof chunkId !== 'undefined' && chunkId !== null && typeof swatchId !== 'undefined' && swatchId !== null) {
    const hostChunk = Array.from(chunks.current).filter(({ id }) => id === chunkId)?.[0]
    const children = hostChunk?.data?.children

    if (hostChunk && children.length && children[0]?.length) {
      const coords = children.reduce((accum, next, y) => {
        if (accum) return accum

        const x = next.indexOf(swatchId)

        if (x >= 0) {
          return [x, y]
        }
      }, undefined)

      if (coords) {
        const btnRefs = chunk(Array.from(hostChunk.swatchesRef?.current ?? []), children[0].length)
        const coordsUp = [coords[0], Math.max(coords[1] - 1, 0)]
        const coordsDn = [coords[0], Math.min(coords[1] + 1, children.length - 1)]
        const coordsL = [Math.max(coords[0] - 1, 0), coords[1]]
        const coordsR = [Math.min(coords[0] + 1, children[0]?.length - 1), coords[1]]

        return {
          up: {
            id: children[coordsUp[1]]?.[coordsUp[0]] ?? null,
            ref: btnRefs[coordsUp[1]]?.[coordsUp[0]]?.el ?? null
          },
          down: {
            id: children[coordsDn[1]]?.[coordsDn[0]] ?? null,
            ref: btnRefs[coordsDn[1]]?.[coordsDn[0]]?.el ?? null
          },
          left: {
            id: children[coordsL[1]]?.[coordsL[0]] ?? null,
            ref: btnRefs[coordsL[1]]?.[coordsL[0]]?.el ?? null
          },
          right: {
            id: children[coordsR[1]]?.[coordsR[0]] ?? null,
            ref: btnRefs[coordsR[1]]?.[coordsR[0]]?.el ?? null
          }
        }
      }
    }
  }

  return {
    up: null,
    down: null,
    left: null,
    right: null
  }
}

export const findPositionInChunks = memoizee((chunks = [], swatchId) => {
  if (chunks.length && typeof swatchId !== 'undefined' && swatchId !== null) {
    const b = chunks.map(({ data }) => data)
    const c = b.map(({ children }) => children)
    const d = c.map(children => flattenDeep(children))
    const f = d.map((children, i) => children.indexOf(swatchId) >= 0 ? i : -1)
    const g = f.reduce((accum, next) => Math.max(accum, next))

    return {
      current: chunks[g] ?? null,
      next: chunks[g + 1] ?? null,
      previous: chunks[g - 1] ?? null
    }
  }

  return {
    current: null,
    next: null,
    previous: null
  }
}, { length: 2 })

export const getProximalChunksBySwatchId = (chunks, swatchId, forceFirst = false, forceLast = false) => {
  if (chunks?.current) {
    const chunkArray = Array.from(chunks.current)
    const first = chunkArray[0]
    const last = chunkArray[chunkArray.length - 1]

    return {
      ...findPositionInChunks(chunkArray, swatchId),
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
