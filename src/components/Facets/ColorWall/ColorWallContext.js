// @flow
import React from 'react'
import { type GridBounds } from './ColorWall.flow'
import type { Color } from 'src/shared/types/Colors.js.flow'
import noop from 'lodash/noop'

export type ColorWallA11yContextProps = {
  a11yFocusCell: number[] | void,
  a11yFocusChunk: GridBounds,
  a11yFromKeyboard: boolean,
  a11yFocusOutline: boolean,
  a11yMaintainFocus: boolean
}

export const colorWallA11yContextDefault: ColorWallA11yContextProps = {
  a11yFocusCell: undefined,
  a11yFocusChunk: undefined,
  a11yFromKeyboard: false,
  a11yFocusOutline: false,
  a11yMaintainFocus: false
}

export type ColorWallContextProps = {
  activeColorRouteBuilderRef?: { current: (Color) => void },
  addButtonText?: string,
  autoHeight?: boolean,
  chunkClickable?: boolean,
  chunkMiniMap?: boolean,
  colorDetailPageRoot?: (Color) => string | string,
  colorNumOnBottom?: boolean,
  colorWallBgColor: string,
  colorWallPageRoot?: (string | Color) => string | string,
  displayAddButton?: boolean,
  displayAddButtonText?: boolean,
  displayDetailsLink?: boolean,
  displayInfoButton?: boolean,
  hiddenSections?: string[],
  inactiveColorRouteBuilderRef?: { current: (Color) => void },
  loading: boolean,
  leftHandDisplay: boolean,
  swatchMaxSize: number,
  swatchMinSize: number,
  swatchMinSizeZoomed: number,
  swatchSizeZoomed: number,
  updateA11y: Function
}

export const colorWallContextDefault: ColorWallContextProps = {
  activeColorRouteBuilderRef: undefined,
  addButtonText: undefined,
  autoHeight: false,
  chunkClickable: false,
  chunkMiniMap: false,
  colorDetailPageRoot: undefined,
  colorNumOnBottom: false,
  colorWallBgColor: '#EEEEEE',
  colorWallPageRoot: undefined,
  displayAddButton: false,
  displayAddButtonText: false,
  displayDetailsLink: true,
  displayInfoButton: false,
  hiddenSections: [],
  inactiveColorRouteBuilderRef: undefined,
  loading: false,
  leftHandDisplay: false,
  swatchMaxSize: 33,
  swatchMinSize: 14,
  swatchMinSizeZoomed: 50,
  swatchSizeZoomed: 50,
  updateA11y: noop,
  viewColorText: false
}

const ColorWallContext = React.createContext<Object>({
  ...colorWallA11yContextDefault,
  ...colorWallContextDefault
})

export default ColorWallContext
