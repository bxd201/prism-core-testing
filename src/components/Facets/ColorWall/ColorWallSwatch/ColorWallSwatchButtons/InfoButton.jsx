// @flow
import React from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import 'src/providers/fontawesome/fontawesome'
import { Link } from 'react-router-dom'
import { type Color } from 'src/shared/types/Colors'
import { generateColorDetailsPageUrl } from 'src/shared/helpers/ColorUtils'
import ColorWallContext, { type ColorWallContextProps } from '../../ColorWallContext'

export default ({ color, ...other }: { color: Color }) => {
  const { displayInfoButton }: ColorWallContextProps = React.useContext(ColorWallContext)

  return displayInfoButton && (
    <Link to={generateColorDetailsPageUrl(color)} {...other}>
      <FontAwesomeIcon icon='info' size='1x' />
    </Link>
  )
}
