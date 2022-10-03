// @flow
import React, { useContext } from 'react'
import { FormattedMessage } from 'react-intl'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import ConfigurationContext, { type ConfigurationContextType } from '../../contexts/ConfigurationContext/ConfigurationContext'
import './SceneSelectorNavButton.scss'

const sceneSelectorButtonClassName = 'scene-selector-nav-btn'

type SceneSelectorNavButtonProps = {
  clickHandler: Function
}
const SceneSelectorNavButton = (props: SceneSelectorNavButtonProps) => {
  const { cvw } = useContext<ConfigurationContextType>(ConfigurationContext)

  return (
    <button className={`text-sm ${sceneSelectorButtonClassName}`} onClick={props.clickHandler}>
      {cvw.scene?.moreScenesBtn?.showIcon && <div className={`${sceneSelectorButtonClassName}__icon`}>
        <FontAwesomeIcon className={`${sceneSelectorButtonClassName}__icon-1`} icon={['fal', 'square-full']} size='sm' />
        <FontAwesomeIcon className={`${sceneSelectorButtonClassName}__icon-2`} icon={['fal', 'square-full']} size='sm' />
        <FontAwesomeIcon className={`${sceneSelectorButtonClassName}__icon-3`} icon={['fal', 'square-full']} size='sm' />
      </div>}
      <div className={`${sceneSelectorButtonClassName}__text`}><FormattedMessage id='MORE_SCENES' /></div>
    </button>
  )
}

export default SceneSelectorNavButton
