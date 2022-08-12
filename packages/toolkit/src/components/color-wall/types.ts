import { MutableRefObject } from 'react'
import { Color } from '../../types'

// Wall Types
export interface WallShape {
  type: 'WALL'
  children?: ColumnShape[]
  props?: { wrap?: boolean }
}

export interface ColumnShape {
  type: 'COLUMN'
  children: Array<RowShape | ChunkShape>
  titles?: TitleShape[]
  props?: { spaceH?: number; spaceV?: number; align?: string }
}

export interface RowShape {
  type: 'ROW'
  children: Array<ColumnShape | ChunkShape>
  titles: TitleShape[]
  props?: { spaceH?: number; spaceV?: number; wrap?: boolean; align?: string }
}

export interface ChunkShape {
  type: 'CHUNK'
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
}

export type Items = number[]

export interface ChunkData {
  chunkRef: HTMLDivElement
  swatchesRef: MutableRefObject<Array<{ el: any; id: number }>>
  id: string
  data: ChunkShape
}

export interface SwatchInternalProps {
  active: boolean
  activeFocus: boolean
  id: number | string
  onClick: () => void
  onRefSwatch?: (_el: any) => void
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
