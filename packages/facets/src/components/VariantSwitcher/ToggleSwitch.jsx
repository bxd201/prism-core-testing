// @flow
import React, { useState } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import uniqueId from 'lodash/uniqueId'
import './ToggleSwitch.scss'

type ToggleSwitchProps = {
    isOn: Boolean,
    handleToggle: Function,
    currentColor?: string,
    variantsList: Array,
    textColor?: string,
    iconType: string
}

export const CLASSES = {
  MAIN: 'toggle-switch',
  WRAPPER: 'toggle-switch__wrapper',
  LEFT_ICON: 'toggle-switch__left-icon',
  RIGHT_ICON: 'toggle-switch__right-icon',
  CHECKBOX: 'toggle-switch__input',
  LABEL: 'toggle-switch__label',
  BUTTON: 'toggle-switch__button'
}

const ToggleSwitch = (props: ToggleSwitchProps) => {
  const { isOn, handleToggle, currentColor, variantsList, textColor, iconType } = props
  const [checkboxName] = useState(uniqueId('toggle-switch'))

  return (
    <div className={CLASSES.MAIN} style={currentColor && textColor ? { background: currentColor, color: `${textColor}` } : null}>
      <div className={`${CLASSES.WRAPPER} ${CLASSES.LEFT_ICON}`}>
        {variantsList?.length === 2 && variantsList[0]?.icon && <FontAwesomeIcon icon={[`${iconType}`, `${variantsList[0].icon}`]} size='lg' style={textColor ? { color: `${textColor}` } : null} />}
        {variantsList?.length === 2 && variantsList[0]?.label}
      </div>
      <input
        checked={isOn}
        onChange={handleToggle}
        className={CLASSES.CHECKBOX}
        name={checkboxName}
        id={checkboxName}
        type='checkbox'
        aria-label='toggle-switch-label'
      />
      <label
        className={CLASSES.LABEL}
        title='toggle-switch-label'
        aria-label='toggle-switch-label'
        style={{ background: !isOn ? currentColor : textColor, borderColor: textColor }}
        htmlFor={checkboxName}
      >
        <span className={`${CLASSES.BUTTON}`} style={currentColor && textColor ? { background: currentColor, color: `${textColor}` } : null} />
      </label>
      <div className={`${CLASSES.WRAPPER} ${CLASSES.RIGHT_ICON}`}>
        {variantsList?.length === 2 && variantsList[1]?.icon && <FontAwesomeIcon icon={[`${iconType}`, `${variantsList[1].icon}`]} size='lg' style={textColor ? { color: `${textColor}` } : null} />}
        {variantsList?.length === 2 && variantsList[1]?.label}
      </div>
    </div>
  )
}

export default ToggleSwitch
