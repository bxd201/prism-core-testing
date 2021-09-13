
// @flow
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { FormattedMessage } from 'react-intl'
import React from 'react'

import './SceneSelectorNavButton.scss'

const sceneSelectorButtonClassName = 'scene-selector-nav-btn'

type SceneSelectorNavButtonProps = {
  clickHandler: Function
}
const SceneSelectorNavButton = (props: SceneSelectorNavButtonProps) => {
  return (
    <button className={sceneSelectorButtonClassName} onClick={props.clickHandler}>
      <div className={`${sceneSelectorButtonClassName}__icon`}>
        <FontAwesomeIcon className={`${sceneSelectorButtonClassName}__icon-1`} icon={['fal', 'square-full']} size='sm' />
        <FontAwesomeIcon className={`${sceneSelectorButtonClassName}__icon-2`} icon={['fal', 'square-full']} size='sm' />
        <FontAwesomeIcon className={`${sceneSelectorButtonClassName}__icon-3`} icon={['fal', 'square-full']} size='sm' />
      </div>
      <div className={`${sceneSelectorButtonClassName}__text`}><FormattedMessage id='MORE_SCENES' /></div>
    </button>
  )
}

export default SceneSelectorNavButton
