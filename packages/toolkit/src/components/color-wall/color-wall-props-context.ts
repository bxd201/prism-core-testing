import React from 'react'
import noop from 'lodash/noop'
import { Color } from '../../interfaces/colors'
import { ColorWallConfig } from './color-wall'
import {ActiveSwatchContentRenderer, ChunkData, SwatchBgRenderer, SwatchRenderer} from './types'

export interface ColorWallPropsDefault {
  activeSwatchContentRenderer: ActiveSwatchContentRenderer | undefined
  activeSwatchId: string | number
  animateActivation: boolean
  addChunk: (() => void) | ((chunk: any) => Set<ChunkData>)
  chunkClickable?: (chunkId: string) => void
  colorWallConfig?: ColorWallConfig
  hostHasFocus: boolean
  isZoomed: boolean
  swatchContentRefs: {
    current: any[]
  }
  colorResolver: (id?: number | string) => (Color | null | undefined)
  swatchRenderer: (() => null) | SwatchRenderer
  swatchBgRenderer: (() => null) | SwatchBgRenderer
  setActiveSwatchId?: (id: any) => void
  getPerimeterLevel?: (any) => number
}

export const colorWallPropsDefault = {
  activeSwatchContentRenderer: () => null,
  activeSwatchId: null,
  animateActivation: true,
  addChunk: noop,
  chunkClickable: null,
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
export const ColorWallPropsContext = React.createContext<ColorWallPropsDefault>(colorWallPropsDefault)
export const ColorWallStructuralPropsContext = React.createContext<ColorWallStructuralProps>(
  colorWallStructuralPropsDefault
)
