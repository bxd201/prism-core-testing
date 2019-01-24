// @flow
import React from 'react'
import { Link } from 'react-router-dom'
import { FormattedMessage } from 'react-intl'

const DetailsLink = ({ config, detailsLink, styles }: Object) => {
  if (config.ColorWall.displayViewDetails && detailsLink) {
    return (
      <Link to={detailsLink} style={styles}><FormattedMessage id='VIEW_DETAILS' /></Link>
    )
  }
  return null
}

export default DetailsLink
