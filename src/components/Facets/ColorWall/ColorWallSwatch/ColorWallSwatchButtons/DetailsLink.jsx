// @flow
import React from 'react'
import { Link } from 'react-router-dom'
import { FormattedMessage } from 'react-intl'

const DetailsLink = (props: Object) => {
  const { config, detailsLink, ...other } = props
  if (config.ColorWall.displayViewDetails && detailsLink) {
    return (
      <Link to={detailsLink} {...other}>
        <FormattedMessage id='VIEW_DETAILS' />
      </Link>
    )
  }
  return null
}

export default DetailsLink
