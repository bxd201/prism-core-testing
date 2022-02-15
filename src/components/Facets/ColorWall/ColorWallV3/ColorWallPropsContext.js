// @flow
import React from 'react'
import noop from 'lodash/noop'

export const BASE_SWATCH_SIZE = 20
export const SCALE_ZOOM_OUT = 1
export const SCALE_ZOOM_IN = 4

export const colorWallPropsDefault = {
  activeSwatchRenderer: noop,
  activeSwatchId: null,
  addChunk: noop,
  baseSwatchSize: BASE_SWATCH_SIZE,
  display: true,
  hostHasFocus: false,
  inactiveSwatchRenderer: noop,
  isZoomed: false,
  scale: 1
}

const ColorWallPropsContext = React.createContext<Object>(colorWallPropsDefault)

export default ColorWallPropsContext
