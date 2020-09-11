import { distance, leastDistance, bracketedDistance, ERROR_ALL_ARGS_NUMBERS } from 'src/shared/utils/colorRelationship/index'

describe('distance', () => {
  it('should throw an error when an argument is not a number', () => {
    expect(() => distance(0, false)).toThrowError(ERROR_ALL_ARGS_NUMBERS)
    expect(() => distance({}, false)).toThrowError(ERROR_ALL_ARGS_NUMBERS)
    expect(() => distance({}, 0)).toThrowError(ERROR_ALL_ARGS_NUMBERS)
    expect(() => distance('0', '0')).toThrowError(ERROR_ALL_ARGS_NUMBERS)
  })

  it('should provide the maximum distance between 2 numbers regardless of argument order', () => {
    expect(distance(0, 0)).toEqual(0)
    expect(distance(0, 90)).toEqual(90)
    expect(distance(90, 0)).toEqual(90)
    expect(distance(0, 359)).toEqual(359)
    expect(distance(359, 0)).toEqual(359)
    expect(distance(90, 270)).toEqual(180)
    expect(distance(270, 90)).toEqual(180)
    expect(distance(-1000, 1000)).toEqual(2000)
  })
})

describe('leastDistance', () => {
  it('should throw an error when an argument is not a number', () => {
    expect(() => leastDistance()).toThrowError(ERROR_ALL_ARGS_NUMBERS)
    expect(() => leastDistance('foo', 0, 0)).toThrowError(ERROR_ALL_ARGS_NUMBERS)
    expect(() => leastDistance(0, 'foo', 0)).toThrowError(ERROR_ALL_ARGS_NUMBERS)
    expect(() => leastDistance(0, 0, 'foo')).toThrowError(ERROR_ALL_ARGS_NUMBERS)
  })

  it('should return the smallest distance between two numbers on a radial scale of 360 by default', () => {
    expect(leastDistance(0, 0)).toEqual(0)
    expect(leastDistance(0, 5)).toEqual(5)
    expect(leastDistance(0, 180)).toEqual(180)
    expect(leastDistance(0, 181)).toEqual(179)
    expect(leastDistance(0, 355)).toEqual(5)
    expect(leastDistance(180, 0)).toEqual(180)
    expect(leastDistance(270, 90)).toEqual(180)
    expect(leastDistance(359, 1)).toEqual(2)
  })

  it('should return the smallest distance between two numbers on a custom radial scale', () => {
    expect(leastDistance(0, 0, 10)).toEqual(0)
    expect(leastDistance(10, 90, 100)).toEqual(20)
    expect(leastDistance(1, 999, 1000)).toEqual(2)
  })
})

describe('bracketedDistance', () => {
  it('should throw an error when an argument is not a number', () => {
    expect(() => bracketedDistance()).toThrowError(ERROR_ALL_ARGS_NUMBERS)
    expect(() => bracketedDistance('foo', 0)).toThrowError(ERROR_ALL_ARGS_NUMBERS)
    expect(() => bracketedDistance(0, 'foo')).toThrowError(ERROR_ALL_ARGS_NUMBERS)
  })

  it('should return the distance between two radial values in units of "slice" (12 slices)', () => {
    expect(bracketedDistance(0, 0)).toEqual(0)
    expect(bracketedDistance(0, 14)).toEqual(0)
    expect(bracketedDistance(0, -14)).toEqual(0)
    expect(bracketedDistance(0, 15)).toEqual(1)
    expect(bracketedDistance(0, -15)).toEqual(1)
    expect(bracketedDistance(1, 15)).toEqual(0)
    expect(bracketedDistance(-1, -15)).toEqual(0)
    expect(bracketedDistance(1, 16)).toEqual(1)
    expect(bracketedDistance(-1, -16)).toEqual(1)
    expect(bracketedDistance(0, 346)).toEqual(0)
    expect(bracketedDistance(0, 345)).toEqual(1)
    expect(bracketedDistance(5, 350)).toEqual(1)
    expect(bracketedDistance(0, 180)).toEqual(6)
    expect(bracketedDistance(0, -180)).toEqual(6)
  })
})
