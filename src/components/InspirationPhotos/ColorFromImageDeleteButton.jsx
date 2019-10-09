// @flow

import React from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

type ColorFromImageDeleteButtonProps = {
  isVisible: boolean,
  clickHandler: Function
}

const ColorFromImageDeleteButton = (props: ColorFromImageDeleteButtonProps) => {
  return (
    props.isVisible ? <button className='scene__image__wrapper__delete-pin' onClick={props.clickHandler}><FontAwesomeIcon icon='trash' size='1x' /></button> : null
  )
}

export default ColorFromImageDeleteButton
