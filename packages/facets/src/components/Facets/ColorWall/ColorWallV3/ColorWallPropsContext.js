// @flow
import React from 'react'
import noop from 'lodash/noop'

export const MIN_SWATCH_SIZE = 14
export const MAX_SWATCH_SIZE = 50
export const BASE_SWATCH_SIZE = 15
export const OUTER_SPACING = 27
export const MIN_SCROLLER_HEIGHT = 200
export const MAX_SCROLLER_HEIGHT = MIN_SCROLLER_HEIGHT * 3

export const colorWallPropsDefault = {
  activeSwatchId: null,
  addChunk: noop,
  display: true,
  hostHasFocus: false,
  isZoomed: false,
  scale: 1,
  setActiveSwatchId: noop,
  swatchRenderer: noop
}

const ColorWallPropsContext = React.createContext<Object>(colorWallPropsDefault)

export default ColorWallPropsContext
