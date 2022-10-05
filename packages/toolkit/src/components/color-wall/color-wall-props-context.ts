import React from 'react'
import noop from 'lodash/noop'
import { ColorWallConfig } from './color-wall'
import { ChunkData, SwatchRenderer } from './types'

export interface ColorWallPropsDefault {
  activeSwatchId: string | number
  addChunk: (() => void) | ((chunk: any) => Set<ChunkData>)
  colorWallConfig?: ColorWallConfig
  hostHasFocus: boolean
  isZoomed: boolean
  swatchContentRefs: {
    current: any[]
  }
  swatchRenderer: (() => null) | SwatchRenderer
  setActiveSwatchId?: (id: any) => void
  getPerimeterLevel?: (any) => number
}

export const colorWallPropsDefault = {
  activeSwatchId: null,
  addChunk: noop,
  hostHasFocus: false,
  isZoomed: false,
  swatchContentRefs: {
    current: []
  },
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
