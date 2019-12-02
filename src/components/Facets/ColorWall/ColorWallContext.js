// @flow
import React from 'react'

const ColorWallContext = React.createContext<any>({
  displayDetailsLink: false,
  displayInfoButton: false,
  displayAddButton: false,
  colorDetailPageRoot: false
})

export default ColorWallContext
export type ColorWallContextProps = {
  displayDetailsLink: boolean | typeof undefined,
  displayInfoButton: boolean | typeof undefined,
  displayAddButton: boolean | typeof undefined,
  colorDetailPageRoot?: boolean | typeof undefined
}
