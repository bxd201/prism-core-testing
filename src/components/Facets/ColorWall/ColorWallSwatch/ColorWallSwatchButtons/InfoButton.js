// @flow
import React from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

import { CLASS_NAMES } from '../shared'

const InfoButton = ({ config, onClick }: Object) => {
  if (config.ColorWall.displayAddButton) {
    return (
      <button type='button' onClick={onClick} className={CLASS_NAMES.CONTENT_DETAILS}>
        <FontAwesomeIcon icon='info' size='1x' />
      </button>
    )
  }
  return null
}

export default InfoButton
