// @ts-nocheck
import { chunk1, chunk2, chunk3, mockChunkArr } from '../../test-utils/mocked-endpoints/mock-chunk-data'
import { Block, ChunkShape, RowShape } from './types'
import {
  determineScaleForAvailableWidth,
  findPositionInChunks,
  getAlignment,
  getCumulativeTitleContainerSize,
  getIdCoordsInChunk,
  getInitialSwatchInChunk,
  getPerimeterLevelTest,
  getProximalSwatchesBySwatchId,
  getTitleContainerSize,
  getTitleFontSize,
  needsToWrap,
  parseColorId,
  sanitizeShape
} from './wall-utils'

describe('wall utilities', () => {
  const mockChunkSet = new Set(mockChunkArr)

  beforeEach(() => {
    jest.clearAllMocks()
  })

  test('getTitleFontSize', () => {
    expect(getTitleFontSize(1, 1)).toEqual(6)
    expect(getTitleFontSize(2, 1)).toEqual(6)
    expect(getTitleFontSize(3, 1)).toEqual(7.5)
    expect(getTitleFontSize(1, 2)).toEqual(12)
    expect(getTitleFontSize(2, 2)).toEqual(12)
    expect(getTitleFontSize(3, 2)).toEqual(15)
    expect(getTitleFontSize(1, 3)).toEqual(18)
    expect(getTitleFontSize(2, 3)).toEqual(18)
    expect(getTitleFontSize(3, 3)).toEqual(22.5)

    // when constrained, title font size will be limited to 12-16px
    expect(getTitleFontSize(1, 1, true)).toEqual(12)
    expect(getTitleFontSize(2, 1, true)).toEqual(12)
    expect(getTitleFontSize(3, 1, true)).toEqual(12)
    expect(getTitleFontSize(1, 2, true)).toEqual(12)
    expect(getTitleFontSize(2, 2, true)).toEqual(12)
    expect(getTitleFontSize(3, 2, true)).toEqual(15)
    expect(getTitleFontSize(1, 3, true)).toEqual(16)
    expect(getTitleFontSize(2, 3, true)).toEqual(16)
    expect(getTitleFontSize(3, 3, true)).toEqual(16)
  })

  test('getTitleContainerSize', () => {
    expect(getTitleContainerSize(1, 1)).toEqual(16.5)
    expect(getTitleContainerSize(2, 1)).toEqual(16.5)
    expect(getTitleContainerSize(3, 1)).toEqual(20.625)
    expect(getTitleContainerSize(1, 2)).toEqual(33)
    expect(getTitleContainerSize(2, 2)).toEqual(33)
    expect(getTitleContainerSize(3, 2)).toEqual(41.25)
  })

  test('getCumulativeTitleContainerSize', () => {
    expect(getCumulativeTitleContainerSize([1], 1)).toEqual(16.5)
    expect(getCumulativeTitleContainerSize([2, 1], 1)).toEqual(33)
    expect(getCumulativeTitleContainerSize([3, 2, 1], 1)).toEqual(53.625)
  })

  test('getPerimeterLevelTest', () => {
    const chunkChildren = [[2507, 2241, 2508, 1946, 1962]]
    const id = 2507
    const levels = 2
    const expected = 1
    const result = getPerimeterLevelTest(chunkChildren, id, levels)
    const resultNoLevels = getPerimeterLevelTest(chunkChildren, id, 0)

    expect(result(2241)).toEqual(expected)
    expect(resultNoLevels(2241)).toEqual(0)
  })

  test('getIdCoordsInChunk', () => {
    const chunk = [
      [11324, 1919, 1932, 1905, 1926, 1933, 1920, 1906],
      [1934, 11318, 1921, 11332, 11323, 1935, 1922, 2171],
      [1936, 11321, 1923, 1937, 2908, 11330]
    ]
    const id = 11318
    const expected = [1, 1]
    const result = getIdCoordsInChunk(id, chunk)

    expect(result).toEqual(expected)
  })

  test('getProximalSwatchesBySwatchId', () => {
    const chunkId = '0_0_0_0_0'
    const swatchId = 11346
    const expected = {
      current: null,
      up: null,
      down: null,
      left: null,
      right: null
    }
    // @ts-ignore using a mock Object that doesn't need all the properties
    const result = getProximalSwatchesBySwatchId(mockChunkSet, chunkId, swatchId)

    expect(result).toEqual(expected)
  })

  test('findPositionInChunks', () => {
    const swatchId = 11346
    const expected = {
      current: chunk1,
      next: chunk2,
      previous: null
    }
    // @ts-ignore using a mock Object that doesn't need all the properties
    const result = findPositionInChunks(mockChunkSet, swatchId)

    expect(result).toEqual(expected)
  })

  test('getInitialSwatchInChunk', () => {
    const expected = {
      el: 'mockButton',
      id: 11346
    }
    const result = getInitialSwatchInChunk(chunk3, null)
    expect(result).toEqual(expected)
  })

  test('needsToWrap', () => {
    const scale1 = 2.0545454545454547
    const scale2 = 0.7
    const scale3 = 'text'

    const result1 = needsToWrap(scale1)
    const result2 = needsToWrap(scale2)

    expect(result1).toEqual(false)
    expect(result2).toEqual(true)
    // @ts-ignore forcing a string
    expect(() => needsToWrap(scale3)).toThrow('targetScale must be numeric')
  })

  test('determineScaleForAvailableWidth', () => {
    const wallWidth = 510
    const containerWidth = 1130
    const expected = 2.0545454545454547

    const result = determineScaleForAvailableWidth(wallWidth, containerWidth)

    expect(result).toEqual(expected)
    // @ts-ignore forcing string
    expect(() => determineScaleForAvailableWidth('wallWidth', containerWidth)).toThrowError(
      'Wall width must be numeric.'
    )
  })

  describe('sanitizeShape', () => {
    test('should return chunk as-is if no duplicate colors are found', () => {
      const chunk: ChunkShape = {
        type: Block.Chunk,
        children: [
          [1, 2, 3],
          [4, 5, 6]
        ]
      }

      const { children } = sanitizeShape(chunk)
      expect(children).toEqual([
        [1, 2, 3],
        [4, 5, 6]
      ])
    })

    test('should append indexes to duplicate color ids within a chunk', () => {
      const chunk: ChunkShape = {
        type: Block.Chunk,
        children: [
          [1, 2, 1],
          [1, 2, 3]
        ]
      }

      const { children } = sanitizeShape(chunk)
      expect(children).toEqual([
        [1, 2, '1_1'],
        ['1_2', '2_1', 3]
      ])
    })

    test('should append indexes to duplicate color ids within ALL chunks', () => {
      const chunk1: ChunkShape = {
        type: Block.Chunk,
        children: [
          [1, 2, 3],
          [4, 5, 1]
        ]
      }

      const chunk2: ChunkShape = {
        type: Block.Chunk,
        children: [
          [1, 6, 7],
          [8, 2, 9]
        ]
      }

      const row: RowShape = {
        type: Block.Row,
        children: [chunk1, chunk2]
      }

      const { children } = sanitizeShape(row)
      const [newChunk1, newChunk2] = children
      const { children: ids1 } = newChunk1
      const { children: ids2 } = newChunk2

      expect(ids1).toEqual([
        [1, 2, 3],
        [4, 5, '1_1']
      ])
      expect(ids2).toEqual([
        ['1_2', 6, 7],
        [8, '2_1', 9]
      ])
    })
  })

  test.each([
    ['1_1', '1'],
    [12, 12],
    ['2', '2'],
    ['1234_100', '1234']
  ])('parseColorId for %s', (instanceId, expected) => {
    expect(parseColorId(instanceId)).toBe(expected)
  })

  test.each([
    ['start', 'justify-start'],
    ['end', 'justify-end'],
    ['center', 'justify-center'],
    ['justify', 'justify-between'],
    ['', 'justify-start']
  ])('getAlignment for %s', (a, expected) => {
    expect(getAlignment(a)).toBe(expected)
  })
})
