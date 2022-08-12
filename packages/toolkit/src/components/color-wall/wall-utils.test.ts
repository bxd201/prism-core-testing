import {
  determineScaleForAvailableWidth,
  findPositionInChunks,
  getAlignment,
  getHeight,
  getIdCoordsInChunk,
  getInitialSwatchInChunk,
  getOuterHeightAll,
  getPerimeterLevelTest,
  getProximalSwatchesBySwatchId,
  needsToWrap
} from './wall-utils'
import { chunk1, chunk2, chunk3, mockChunkArr } from '../../test-utils/mocked-endpoints/mock-chunk-data'

describe('wall utilities', () => {
  const mockChunkSet = new Set(mockChunkArr)

  beforeEach(() => {
    jest.clearAllMocks()
  })
  test('getOuterHeight', () => {
    const expected = 10
    const result = getHeight(1, 1)
    expect(result).toEqual(expected)
  })

  test('getOuterHeightAll', () => {
    const expected = 28.5
    const result = getOuterHeightAll([1], 1.9)
    expect(result).toEqual(expected)
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
