// @flow

import React from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { injectIntl } from 'react-intl'
import 'src/providers/fontawesome/fontawesome'

type ColorFromImageDeleteButtonProps = {
  isVisible: boolean,
  clickHandler: Function,
  intl: any
}

const ColorFromImageDeleteButton = (props: ColorFromImageDeleteButtonProps) => {
  return (
    props.isVisible ? <button
      className='scene__image__wrapper__delete-pin'
      onClick={props.clickHandler}>
      <FontAwesomeIcon
        title={props.intl.formatMessage({ id: 'DELETE.PIN' })}
        icon='trash' size='1x' />
    </button> : null
  )
}

export default injectIntl(ColorFromImageDeleteButton)
