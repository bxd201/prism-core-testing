// @flow
import React, { useState } from 'react'

import './DynamicModal.scss'

export const DynamicModalButtonType = {
  success: 'success',
  danger: 'danger',
  warning: 'warning',
  primary: 'primary',
  secondary: 'secondary'
}

type DynamicModalAction = {
  callback: Function,
  text: string,
  type: string
}

const dynamicModalClassName = 'dynamic-modal'
const dynamicModalInnerClassName = `${dynamicModalClassName}__inner-box`
const dynamicModalTitleClassName = `${dynamicModalClassName}__title`
const dynamicModalDescriptionClassName = `${dynamicModalClassName}__description`
const dynamicModalInputWrapperClassName = `${dynamicModalClassName}__input-wrapper`
const dynamicModalButtonsClassName = `${dynamicModalClassName}__button-row`
const dynamicModalButtonBaseClassName = `${dynamicModalButtonsClassName}__button`

type DynamicModalProps = {
  // Actions are used to create buttons
  actions: DynamicModalAction,
  title: String,
  description: String,
  height: number,
  allowInput: boolean,
  inputDefault?: string
}

const DynamicModal = (props: DynamicModalProps) => {
  const defaultName = props.inputDefault ? props.inputDefault : ''
  const [inputValue, setInputValue] = useState(defaultName)
  const getButtonClassName = (buttonType: string) => {
    return `${dynamicModalButtonBaseClassName} ${dynamicModalButtonBaseClassName}--${buttonType}`
  }

  const createButtonsFromActions = (actions) => {
    const buttons = actions.map((action, i) => {
      const callback = props.allowInput ? (e: SyntheticEvent) => {
        action.callback(e, inputValue)
      } : action.callback
      return (
        <button
          className={getButtonClassName(action.type || DynamicModalButtonType.primary)}
          // The callbacks must manually stop propogation
          onClick={callback}
          key={`${i}`}>
          {action.text}
        </button>)
    })

    return buttons
  }

  const setInputVal = (e: SyntheticEvent) => setInputValue(e.target.value)
  return (
    <div className={dynamicModalClassName} style={{ height: props.height }}>
      <div className={dynamicModalInnerClassName}>
        {props.title ? <div className={dynamicModalTitleClassName}>{props.title}</div> : null}
        {props.description ? <div className={dynamicModalDescriptionClassName}>{props.description}</div> : null}
        {props.allowInput ? <div className={dynamicModalInputWrapperClassName}><input onChange={setInputVal} value={inputValue} /></div> : null}
        <div className={dynamicModalButtonsClassName}>
          {createButtonsFromActions(props.actions)}
        </div>
      </div>
    </div>
  )
}

export default DynamicModal
