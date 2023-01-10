import React, { MutableRefObject } from 'react'
import { Color } from '../../types'

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

export type AnyShape = WallShape | RowShape | ColumnShape | ChunkShape

export interface TitleShape {
  align: 'left' | 'center' | 'right'
  level: 1 | 2 | 3
  value: string
  hideWhenWrapped?: boolean
}

export type Items = number[] | string[]

export interface ChunkData {
  chunkRef: HTMLDivElement
  swatchesRef: MutableRefObject<
    Array<{
      elArr: HTMLButtonElement[]
      id: string | number
    }>
  >
  id: string
  data: ChunkShape
}

export interface ActiveSwatchContentRendererProps {
  color: Color
  id: string | number
}

export type ActiveSwatchContentRenderer = <T extends ActiveSwatchContentRendererProps>(internalProps: T) => JSX.Element

export interface OverlayRendererProps {
  active: boolean
  color: Color
  height: number
  id: number | string
  lifted?: boolean
  width: number
}

export interface SwatchInteractiveInternalProps extends OverlayRendererProps {
  activeSwatchContentRenderer?: ActiveSwatchContentRenderer
  activeFocus?: boolean
  children?: JSX.Element
  className?: string
  handleMakeActive: () => void
  overlayRenderer?: (props: OverlayRendererProps) => JSX.Element
  style: React.CSSProperties
}

export interface SwatchInternalProps extends OverlayRendererProps {
  activeFocus?: boolean
  className?: string
  overlayRenderer?: (props: OverlayRendererProps) => JSX.Element
  style: React.CSSProperties
}

export type SwatchRenderer = <T extends SwatchInteractiveInternalProps>(internalProps: T) => JSX.Element

export type SwatchBgRenderer = <T extends SwatchInternalProps>(internalProps: T) => JSX.Element

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
