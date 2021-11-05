// @flow
import React from 'react'
import { type GridBounds } from './ColorWall.flow'
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
  addButtonText?: string,
  chunkClickable?: boolean,
  chunkMiniMap?: boolean,
  colorDetailPageRoot?: string,
  colorNumOnBottom?: boolean,
  colorWallBgColor: string,
  colorWallChunkPageRoot?: string,
  displayAddButton?: boolean,
  displayAddButtonText?: boolean,
  displayDetailsLink?: boolean,
  displayInfoButton?: boolean,
  hiddenSections?: string[],
  loading: boolean,
  swatchMaxSize: number,
  swatchSizeZoomed: number,
  swatchMinSize: number,
  swatchMinSizeZoomed: number,
  updateA11y: Function
}

export const colorWallContextDefault: ColorWallContextProps = {
  addButtonText: undefined,
  chunkClickable: false,
  chunkMiniMap: false,
  colorDetailPageRoot: undefined,
  colorNumOnBottom: false,
  colorWallChunkPageRoot: undefined,
  colorWallBgColor: '#EEEEEE',
  displayAddButton: false,
  displayAddButtonText: false,
  displayDetailsLink: true,
  viewColorText: false,
  displayInfoButton: false,
  hiddenSections: [],
  loading: false,
  swatchMaxSize: 33,
  swatchSizeZoomed: 50,
  swatchMinSize: 14,
  swatchMinSizeZoomed: 50,
  updateA11y: noop
}

const ColorWallContext = React.createContext<Object>({
  ...colorWallA11yContextDefault,
  ...colorWallContextDefault
})

export default ColorWallContext
