// @flow
import React from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import 'src/providers/fontawesome/fontawesome'
import ColorWallContext, { type ColorWallContextProps } from '../../ColorWallContext'

export default ({ onClick, ...other }: { onClick: Function }) => {
  const { displayAddButton }: ColorWallContextProps = React.useContext(ColorWallContext)

  return displayAddButton && (
    <button onClick={onClick} {...other}>
      <FontAwesomeIcon icon={['fa', 'plus']} size='1x' />
    </button>
  )
}
