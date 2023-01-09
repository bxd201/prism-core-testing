import { createContext } from 'react'
import noop from 'lodash/noop'
import { Color } from '../../interfaces/colors'
import { ColorWallConfig } from './color-wall'
import { ActiveSwatchContentRenderer, ChunkData, SwatchBgRenderer, SwatchRenderer } from './types'

export interface ColorWallPropsDefault {
  activeSwatchContentRenderer: ActiveSwatchContentRenderer | undefined
  activeSwatchId: string | number
  animateActivation: boolean
  addChunk: (() => void) | ((chunk: ChunkData) => Set<ChunkData>)
  colorWallConfig?: ColorWallConfig
  hostHasFocus: boolean
  isZoomed: boolean
  swatchContentRefs: {
    current: HTMLElement[]
  }
  colorResolver: (id?: number | string) => Color | null | undefined
  swatchRenderer: SwatchRenderer
  swatchBgRenderer: SwatchBgRenderer
  setActiveSwatchId?: (id: string | number) => void
  getPerimeterLevel?: (id: string | number) => number
}

export const colorWallPropsDefault: ColorWallPropsDefault = {
  activeSwatchContentRenderer: () => null,
  activeSwatchId: null,
  animateActivation: true,
  addChunk: noop,
  colorResolver: () => null,
  hostHasFocus: false,
  isZoomed: false,
  swatchContentRefs: {
    current: []
  },
  swatchBgRenderer: () => null,
  swatchRenderer: () => null
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
