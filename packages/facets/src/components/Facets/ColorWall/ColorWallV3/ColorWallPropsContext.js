// @flow
import React from 'react'
import noop from 'lodash/noop'

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
