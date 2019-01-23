// @flow
import React from 'react'
import { Link } from 'react-router-dom'

const DetailsLink = ({ config, detailsLink, styles }: Object) => {
  if (config.ColorWall.displayViewDetails && detailsLink) {
    return (
      <Link to={detailsLink} style={styles}>View Details</Link>
    )
  }
  return null
}

export default DetailsLink
