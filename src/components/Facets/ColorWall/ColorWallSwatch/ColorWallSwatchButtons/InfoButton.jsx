// @flow
import React from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { Link } from 'react-router-dom'

const InfoButton = (props: Object) => {
  const { config, detailsLink, ...other } = props
  if (config.displayInfoButton && detailsLink) {
    return (
      <Link to={detailsLink} {...other}>
        <FontAwesomeIcon icon='info' size='1x' />
      </Link>
    )
  }
  return null
}

export default InfoButton
