import React, { MutableRefObject } from 'react'
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

// Type this way to be able to create a guard
export type ShapeAlignment = 'start' | 'left' | 'center' | 'right'

export type ShapeLevel = 1 | 2 | 3

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
  props?: { spaceH?: number; spaceV?: number; align?: ShapeAlignment }
}

export interface RowShape {
  type: Block.Row
  children: Array<ColumnShape | ChunkShape>
  titles?: TitleShape[]
  props?: { spaceH?: number; spaceV?: number; wrap?: boolean; align?: ShapeAlignment }
}

export interface ChunkShape {
  type: Block.Chunk
  children: Items[]
  titles?: TitleShape[]
  props?: { spaceH?: number; spaceV?: number; align?: ShapeAlignment }
  childProps?: {
    height?: number
    width?: number
  }
}

export interface TitleShape {
  align: ShapeAlignment
  level: ShapeLevel
  value: string
  hideWhenWrapped?: boolean
}

export type Items = Array<number | string>

export interface SwatchRef {
  swatches: HTMLButtonElement[]
  id: number | string
}

export interface ChunkData {
  chunkRef: MutableRefObject<HTMLElement>
  swatchesRef: MutableRefObject<SwatchRef[]>
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
