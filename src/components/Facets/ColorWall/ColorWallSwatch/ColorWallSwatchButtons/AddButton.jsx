// @flow
import React from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

const AddButton = (props: Object) => {
  const { config, onAdd, onClick, ...other } = props

  if (onAdd && config.ColorWall.displayAddButton) {
    return (
      <button onClick={onClick} {...other}>
        <FontAwesomeIcon icon='plus' size='1x' />
      </button>
    )
  }
  return null
}

export default AddButton
