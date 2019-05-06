// @flow

export type GridBounds = {
  TL: number[],
  BR: number[]
} | void

export type ColorReference = {
  level: number,
  compensateX?: Function,
  compensateY?: Function
}
