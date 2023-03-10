// @flow

type Point = {
  x: number,
  y: number
}

export function euclideanDistance (point1: Point, point2: Point): number {
  return Math.sqrt(
    Math.abs(Math.pow(point1.x - point2.x, 2)) +
    Math.abs(Math.pow(point1.y - point2.y, 2))
  )
}
