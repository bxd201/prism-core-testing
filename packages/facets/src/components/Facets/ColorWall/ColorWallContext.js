// @flow
import React from 'react'
import noop from 'lodash/noop'
import type { Color } from 'src/shared/types/Colors.js.flow'
import { type GridBounds } from './ColorWall.flow'

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
  colorWallBgColor: string,
  colorWallPageRoot?: (string | Color) => string | string,
  displayAddButton?: boolean,
  displayAddButtonText?: boolean,
  displayDetailsLink?: boolean,
  displayInfoButton?: boolean,
  hiddenSections?: string[],
  inactiveColorRouteBuilderRef?: { current: (Color) => void },
  isChipLocator?: boolean,
  loading: boolean,
  leftHandDisplay: boolean,
  routeType: string,
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
  colorWallBgColor: '#EEEEEE',
  colorWallPageRoot: undefined,
  displayAddButton: false,
  displayAddButtonText: false,
  displayDetailsLink: true,
  displayInfoButton: false,
  hiddenSections: [],
  inactiveColorRouteBuilderRef: undefined,
  isChipLocator: false,
  loading: false,
  leftHandDisplay: false,
  routeType: 'hash',
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
