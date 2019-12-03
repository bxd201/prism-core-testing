// @flow
import React from 'react'

export type ColorWallContextProps = {
  colorDetailPageRoot?: boolean | typeof undefined,
  colorWallBgColor: string,
  displayAddButton: boolean | typeof undefined,
  displayDetailsLink: boolean | typeof undefined,
  displayInfoButton: boolean | typeof undefined,
  swatchMaxSize: number,
  swatchMaxSizeZoomed: number,
  swatchMinSize: number,
  swatchMinSizeZoomed: number
}

export const colorWallContextDefault: ColorWallContextProps = {
  colorDetailPageRoot: false,
  colorWallBgColor: '#EEEEEE',
  displayAddButton: false,
  displayDetailsLink: false,
  displayInfoButton: false,
  swatchMaxSize: 33,
  swatchMaxSizeZoomed: 50,
  swatchMinSize: 15,
  swatchMinSizeZoomed: 50
}

const ColorWallContext = React.createContext<ColorWallContextProps>(colorWallContextDefault)

export default ColorWallContext
