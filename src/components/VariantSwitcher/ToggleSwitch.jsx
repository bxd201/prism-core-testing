/* eslint-disable jsx-a11y/label-has-for */
// @flow
import React from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

import './ToggleSwitch.scss'

type ToggleSwitchProps = {
    isOn: Boolean,
    handleToggle: Function,
    sceneId: number,
    currentColor: string,
    variantsList: Array,
    textColor: string,
    iconType: string
}

export const NAME = 'toggle-switch'
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
  const { isOn, sceneId, handleToggle, currentColor, variantsList, textColor, iconType } = props
  const checkboxName = `${NAME}${sceneId}`

  return (
    <div className={CLASSES.MAIN} style={{ background: currentColor, color: `${textColor}` }}>
      <div className={`${CLASSES.WRAPPER} ${CLASSES.LEFT_ICON}`}>
        {variantsList?.length === 2 && variantsList[0].icon && <FontAwesomeIcon icon={[`${iconType}`, `${variantsList[0].icon}`]} size='lg' style={{ color: `${textColor}` }} />}
        {variantsList?.length === 2 && variantsList[0].label}
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
        <span className={`${CLASSES.BUTTON}`} style={{ background: isOn ? `${currentColor}` : `${textColor}` }} />
      </label>
      <div className={`${CLASSES.WRAPPER} ${CLASSES.RIGHT_ICON}`}>
        {variantsList?.length === 2 && variantsList[1].icon && <FontAwesomeIcon icon={[`${iconType}`, `${variantsList[1].icon}`]} size='lg' style={{ color: `${textColor}` }} />}
        {variantsList?.length === 2 && variantsList[1].label}
      </div>
    </div>
  )
}

export default ToggleSwitch
