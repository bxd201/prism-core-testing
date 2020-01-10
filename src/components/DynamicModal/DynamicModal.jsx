// @flow
import React from 'react'

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
const dynamicModalButtonsClassName = `${dynamicModalClassName}__button-row`
const dynamicModalButtonBaseClassName = `${dynamicModalButtonsClassName}__button`

type DynamicModalProps = {
  // Actions are used to create buttons
  actions: DynamicModalAction,
  title: String,
  description: String,
  height: number
}

const DynamicModal = (props: DynamicModalProps) => {
  const getButtonClassName = (buttonType: string) => {
    return `${dynamicModalButtonBaseClassName} ${dynamicModalButtonBaseClassName}--${buttonType}`
  }

  const createButtonsFromActions = (actions) => {
    const buttons = actions.map((action, i) => {
      return (
        <button
          className={getButtonClassName(action.type || DynamicModalButtonType.primary)}
          // The callbacks must manually stop propogation
          onClick={action.callback}
          key={`${i}`}>
          {action.text}
        </button>)
    })

    return buttons
  }
  return (
    <div className={dynamicModalClassName} style={{ height: props.height }}>
      <div className={dynamicModalInnerClassName}>
        {props.title ? <div className={dynamicModalTitleClassName}>{props.title}</div> : null}
        {props.description ? <div className={dynamicModalDescriptionClassName}>{props.description}</div> : null}
        <div className={dynamicModalButtonsClassName}>
          {createButtonsFromActions(props.actions)}
        </div>
      </div>
    </div>
  )
}

export default DynamicModal
