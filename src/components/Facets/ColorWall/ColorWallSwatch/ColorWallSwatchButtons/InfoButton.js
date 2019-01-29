// @flow
import React from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { Link } from 'react-router-dom'

import { CLASS_NAMES } from '../shared'

const InfoButton = ({ config, detailsLink }: Object) => {
  if (config.ColorWall.displayAddButton) {
    return (
      <Link to={detailsLink} className={CLASS_NAMES.CONTENT_DETAILS}>
        <FontAwesomeIcon icon='info' size='1x' />
      </Link>
    )
  }
  return null
}

export default InfoButton
