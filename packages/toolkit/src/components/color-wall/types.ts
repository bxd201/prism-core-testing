import { MutableRefObject } from 'react'

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

export interface Color {
  blue: number
  brandKey: string
  colorFamilyNames: string[]
  colorNumber: string
  coordinatingColors: {
    coord1ColorId: number
    coord2ColorId: number
    whiteColorId: number
  }
  cssrgb: string
  description: string[]
  green: number
  hex: string
  hue: number
  id: ColorId
  isDark: boolean
  isExterior: boolean
  isInterior: boolean
  lightness: number
  name: string
  red: number
  rgb: number
  saturation: number
  similarColors: string[]
  storeStripLocator?: string
}

export type ColorList = Color[]
export type ProbablyColorId = ColorId | BlankColor
export type ColorIdLine = ProbablyColorId[]
export type ColorIdGrid = ColorIdLine[]
export type ColorIdList = ColorId[]
export type CategorizedColorIdGrid = Record<string, ColorIdGrid>
export type ColorMap = Record<ColorId, Color>
export type FamilyStructure = Array<{
  name: string
  default: boolean
  families: string[]
}>

export interface ColorStatus {
  message: string | typeof undefined
  status: number
}
export type ColorStatuses = Record<ColorId, ColorStatus>

export type GridBounds =
  | {
      TL: number[]
      BR: number[]
    }
  | undefined

export interface ColorReference {
  level: number
  compensateX?: Function
  compensateY?: Function
}

export interface Section {
  name: string
  default: boolean
  families: string[]
}

export interface ColorsStateItems {
  brights?: CategorizedColorIdGrid
  colorMap?: ColorMap
  colors?: CategorizedColorIdGrid
  colorStatuses?: ColorStatuses
  unorderedColors?: ColorIdList
  chunksLayout?: any
  sectionLabels?: {
    [key in string | null | undefined]?: Array<string | null | undefined>
  }
  wall?: any
}
export interface ColorsStateStatus {
  loading: boolean
  error: boolean
  activeRequest: boolean
}
export interface ChunkGridParams {
  gridWidth: number
  chunkWidth?: number
  chunkHeight?: number
  firstRowLength?: number
  wrappingEnabled: boolean
  dynamicCellSizingEnabled: boolean
}

export interface Layout {
  name: string
  unChunkedChunks: number[][]
  chunkGridParams: ChunkGridParams
  families: Array<{
    name: string
    unChunkedChunks: number[][]
    chunkGridParams: ChunkGridParams
  }>
}
export interface Group {
  default: boolean
  id: string
  shapeId: string
  name: string
  prime: boolean
  subgroups: string[]
}
export interface Subgroup {
  id: string
  shapeId: string
  name: string
}
export interface ColorsState {
  chunkGridParams: ChunkGridParams | undefined
  cwv3: boolean
  emitColor?: {
    color: Color
    timestamp: number
  }
  families?: string[]
  family?: string
  // currently-shown family/subgroup
  group?: Group | undefined
  groups?: Group[]
  initializeWith: {
    family?: string
    section?: string
  }
  items: ColorsStateItems
  layouts?: Layout[]
  primeColorWall?: string
  search: {
    active: boolean
    count?: number
    error: boolean
    loading: boolean
    query: string
    results?: ColorList
    suggestions?: string[]
  }
  section?: string
  // currently-shown section/group
  sections?: string[]
  sectionsShortLabel?: Record<string, string | null | undefined>
  shapes?: any[]
  shape?: any
  status: ColorsStateStatus
  structure?: FamilyStructure
  subgroups?: Subgroup[]
  subgroup?: Subgroup | undefined
  unChunkedChunks: number[][]
}
