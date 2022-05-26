// @flow
import React from 'react'
import noop from 'lodash/noop'

export const MIN_SWATCH_SIZE = 14
export const MAX_SWATCH_SIZE = 50
export const BASE_SWATCH_SIZE = 15
export const OUTER_SPACING = 27
export const MIN_SCROLLER_HEIGHT = 200
export const MAX_SCROLLER_HEIGHT = MIN_SCROLLER_HEIGHT * 3

export const MIN_BASE_SIZE = 14
export const MAX_BASE_SIZE = 33
export const ZOOMED_BASE_SIZE = 50

export const SWATCH_WIDTH_WRAP_THRESHOLD = 20 // will prefer wrapped view if unwrapped view target swatch size falls below threshold value

export const colorWallPropsDefault = {
  activeSwatchId: null,
  addChunk: noop,
  display: true,
  hostHasFocus: false,
  isZoomed: false,
  swatchContentRefs: { current: [] },
  swatchRenderer: noop
}

export const colorWallStructuralPropsDefault = {
  scale: 1,
  isWrapped: false
}

export const ColorWallPropsContext = React.createContext<Object>(colorWallPropsDefault)
export const ColorWallStructuralPropsContext = React.createContext<Object>(colorWallStructuralPropsDefault)
