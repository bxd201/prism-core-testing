// @flow
import React from 'react'
import { Link } from 'react-router-dom'
import { FormattedMessage } from 'react-intl'
import kebabCase from 'lodash/kebabCase'
import { type Color } from 'src/shared/types/Colors'
import { generateColorDetailsPageUrl } from 'src/shared/helpers/ColorUtils'
import ColorWallContext, { type ColorWallContextProps } from '../../ColorWallContext'

type Props = { config: Object, color: Color }

export default ({ color, ...other }: Props) => {
  const { displayDetailsLink, colorDetailPageRoot }: ColorWallContextProps = React.useContext(ColorWallContext)

  return displayDetailsLink && (colorDetailPageRoot
    ? <a href={`${colorDetailPageRoot}/${color.brandKey}${color.colorNumber}-${kebabCase(color.name)}`} {...other}>
      <FormattedMessage id='VIEW_DETAILS' />
    </a>
    : <Link to={generateColorDetailsPageUrl(color)} {...other}>
      <FormattedMessage id='VIEW_DETAILS' />
    </Link>
  )
}
