import { createContext } from 'react'
import noop from 'lodash/noop'
import { ColorWallConfig } from './color-wall'
import { ChunkData, SwatchRenderer } from './types'

export interface ColorWallPropsDefault {
  activeSwatchId: string | number | null
  addChunk: (() => void) | ((chunk: ChunkData) => Set<ChunkData>)
  colorWallConfig?: ColorWallConfig
  hostHasFocus: boolean
  isZoomed: boolean
  swatchContentRefs: {
    current: HTMLElement[]
  }
  swatchRenderer: SwatchRenderer
  setActiveSwatchId?: (id: string | number) => void
  getPerimeterLevel?: (id: string | number) => number
}

export const colorWallPropsDefault: ColorWallPropsDefault = {
  activeSwatchId: null,
  addChunk: noop,
  hostHasFocus: false,
  isZoomed: false,
  swatchContentRefs: {
    current: []
  },
  swatchRenderer: () => undefined
}
export interface ColorWallStructuralProps {
  scale: number
  isWrapped: boolean
}
export const colorWallStructuralPropsDefault = {
  scale: 1,
  isWrapped: false
}
export const ColorWallPropsContext = createContext<ColorWallPropsDefault>(colorWallPropsDefault)

export const ColorWallStructuralPropsContext = createContext<ColorWallStructuralProps>(colorWallStructuralPropsDefault)
