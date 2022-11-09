import { MutableRefObject } from 'react'
import { Color } from '../../types'

// This is the general shape, usually expected from the API
export interface Shape<T> {
  id: string | number
  shape: T
}

export enum Block {
  Chunk = 'CHUNK',
  Column = 'COLUMN',
  Row = 'ROW',
  Wall = 'WALL'
}

// Wall Types
export interface WallShape {
  type: Block.Wall
  children?: ColumnShape[]
  props?: { wrap?: boolean }
}

export interface ColumnShape {
  type: Block.Column
  children: Array<RowShape | ChunkShape>
  titles?: TitleShape[]
  props?: { spaceH?: number; spaceV?: number; align?: string }
}

export interface RowShape {
  type: Block.Row
  children: Array<ColumnShape | ChunkShape>
  titles?: TitleShape[]
  props?: { spaceH?: number; spaceV?: number; wrap?: boolean; align?: string }
}

export interface ChunkShape {
  type: Block.Chunk
  children: Items[]
  titles?: TitleShape[]
  props?: { spaceH?: number; spaceV?: number; align?: string }
  childProps?: {
    height?: number
    width?: number
  }
}

export interface TitleShape {
  align: 'left' | 'center' | 'right'
  level: 1 | 2 | 3
  value: string
  hideWhenWrapped?: boolean
}

export type Items = Array<number | string>

export interface SwatchRef {
  el: { current: [HTMLButtonElement] }
  id: number
}

export interface ChunkData {
  chunkRef: MutableRefObject<HTMLElement>
  swatchesRef: MutableRefObject<SwatchRef[]>
  id: string
  data: ChunkShape
}

export interface SwatchInternalProps {
  active: boolean
  activeFocus: boolean
  id: number | string
  onClick: () => void
  onRefSwatch?: (el: HTMLDivElement | HTMLButtonElement) => void
  perimeterLevel: number
  style: {
    height: number
    width: number
  }
}

export type SwatchRenderer = (internalProps: SwatchInternalProps) => JSX.Element

export interface Dimensions {
  heights: {}
  outerHeight: number
  outerWidth: number
  widths: {}
}

// Color Types
export type ColorId = string
export type BlankColor = undefined

export type ProbablyColorId = ColorId | BlankColor

export type ColorMap = Record<ColorId, Color>

export interface ColorStatus {
  message: string | typeof undefined
  status: number
}
export type ColorStatuses = Record<ColorId, ColorStatus>

export interface ColorReference {
  level: number
  compensateX?: Function
  compensateY?: Function
}

export interface Group {
  default: boolean
  id: string
  shapeId: string
  name: string
  prime: boolean
  subgroups: string[]
}

export interface SubGroup {
  id: string
  shapeId: string
  name: string
}

export interface Family {
  name: string
  default: boolean
  families: string[]
  chunkGridParams: {
    chunkWidth: number
    familiesDetermineLayout: boolean
    gridWidth: number
    wrappingEnabled: boolean
  }
  prime: boolean
}
