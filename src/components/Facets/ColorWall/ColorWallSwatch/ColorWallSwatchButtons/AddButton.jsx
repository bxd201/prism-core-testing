// @flow
import React from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

import { CLASS_NAMES } from '../shared'

const AddButton = ({ config, onAdd, onClick }: Object) => {
  if (onAdd && config.ColorWall.displayAddButton) {
    return (
      <button /* autoFocus */ onClick={onClick} className={CLASS_NAMES.CONTENT_ADD}>
        <FontAwesomeIcon icon='plus' size='1x' />
      </button>
    )
  }
  return null
}

export default AddButton
