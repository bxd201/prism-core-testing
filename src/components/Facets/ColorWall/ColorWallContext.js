// @flow
import React from 'react'

const ColorWallContext = React.createContext<any>()

export default ColorWallContext
export type ColorWallContextProps = {
  displayDetailsLink: boolean | typeof undefined,
  displayInfoButton: boolean | typeof undefined,
  displayAddButton: boolean | typeof undefined,
  colorDetailPageRoot?: boolean | typeof undefined
}
