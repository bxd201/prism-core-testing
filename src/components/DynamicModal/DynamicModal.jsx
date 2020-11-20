// @flow
import React, { useState, useEffect } from 'react'
import { useDispatch } from 'react-redux'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { KEY_CODES } from 'src/constants/globals'
import { mouseDownPreventDefault } from 'src/shared/helpers/MiscUtils'
import { useIntl, FormattedMessage } from 'react-intl'
import './DynamicModal.scss'

export const DYNAMIC_MODAL_STYLE = {
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
const dynamicModalPreviewImageClassName = `${dynamicModalClassName}__preview-image`
const dynamicModalDescriptionClassName = `${dynamicModalClassName}__description`
const dynamicModalInputWrapperClassName = `${dynamicModalClassName}__input-wrapper`
const dynamicModalInputLabelClassName = `${dynamicModalClassName}__input-label`
const dynamicModalTextInputClassName = `${dynamicModalClassName}__text-input`
const dynamicModalButtonsClassName = `${dynamicModalClassName}__button-row`
const dynamicModalButtonBaseClassName = `${dynamicModalButtonsClassName}__button`

type DynamicModalProps = {
  // Actions are used to create buttons
  actions?: DynamicModalAction,
  title?: String,
  description: String,
  height?: number,
  allowInput?: boolean,
  inputDefault?: string,
  modalStyle?: string,
  previewData?: HTMLElement,
  showWillDestoryWarning?: boolean
}

const getDymanicModalClassName = (baseName: string, modalStyle) => modalStyle ? `${baseName} ${modalStyle}` : baseName

const DynamicModal = (props: DynamicModalProps) => {
  const defaultName = props.inputDefault ? props.inputDefault : ''
  const dispatch = useDispatch()
  const [inputValue, setInputValue] = useState(defaultName)
  const { actions, height = '100%' } = props
  const intl = useIntl()
  const btnRefs = actions && actions.reduce((acc: {}, value) => {
    acc[value.text] = React.createRef()
    return acc
  }, {})

  useEffect(() => {
    if (actions && actions.length && !props.showWillDestoryWarning) {
      btnRefs[actions[0].text].current.focus()
    }
  }, [actions])

  const blurHandler = (btnNumber) => {
    if (actions && actions.length && actions.length === btnNumber + 1) {
      btnRefs[actions[0].text].current.focus()
    }
  }

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
          onBlur={() => blurHandler(i)}
          ref={btnRefs[action.text]}
          className={getButtonClassName(action.type || props.modalStyle || DYNAMIC_MODAL_STYLE.primary)}
          // The callbacks must manually stop propagation
          onClick={callback}
          key={`${i}`}>
          {action.text}
        </button>)
    })

    return buttons
  }

  const setInputVal = (e: SyntheticEvent) => setInputValue(e.target.value)
  const clearInputVal = (e: SyntheticEvent) => {
    if (!e.keyCode || (e.keyCode && (e.keyCode === KEY_CODES.KEY_CODE_ENTER || e.keyCode === KEY_CODES.KEY_CODE_SPACE))) {
      e.preventDefault()
      setInputValue('')
    }
  }

  return (
    <div className={dynamicModalClassName} style={{ height: height }}>
      {!props.showWillDestoryWarning && <div className={getDymanicModalClassName(dynamicModalInnerClassName, props.modalStyle)}>
        {props.previewData ? <div className={dynamicModalPreviewImageClassName}>{props.previewData}</div> : null}
        <div>
          {props.title ? <div className={dynamicModalTitleClassName}>{props.title}</div> : null}
          {props.description ? <div className={dynamicModalDescriptionClassName}>{props.description}</div> : null}
          {props.allowInput ? <div className={dynamicModalInputWrapperClassName}><input className={`${dynamicModalTextInputClassName}`} onChange={setInputVal} value={inputValue} />
            <label aria-label='clear text' className={`${dynamicModalInputLabelClassName}`} tabIndex='0' role='button' htmlFor='clearModalInput' onClick={clearInputVal} onKeyDown={clearInputVal} onMouseDown={(e: SyntheticEvent) => e.preventDefault()}>
              <div>
                <input id='clearModalInput' tabIndex='-1' className='visually-hidden' />
                <FontAwesomeIcon size='xs' className={``} icon={['fa', 'times']} />
              </div>
            </label>
          </div> : null}
          <div className={dynamicModalButtonsClassName}>
            {props.actions && createButtonsFromActions(props.actions)}
          </div>
        </div>
      </div>}
      {props.showWillDestoryWarning && <div className='cvw__modal' role='presentation' onMouseDown={mouseDownPreventDefault}>
        <div className='cvw__modal__title'>{intl.messages['CVW.WARNING_REPLACEMENT']}</div>
        <div className='cvw__modal__mini-image'>
          {props.previewData ? <div className={dynamicModalPreviewImageClassName}>{props.previewData}</div> : null}
        </div>
        <div className='cvw__modal__action-wrapper'>
          <button
            className='cvw__modal__action-btn'
            onClick={() => {
              dispatch()
            }}
          >
            <FormattedMessage id='YES' />
          </button>
          <button className='cvw__modal__action-btn' onClick={() => dispatch()}>
            <FormattedMessage id='NO' />
          </button>
        </div>
      </div>}
    </div>
  )
}

export const getRefDimension = (ref, dimName, shouldRound: boolean = false) => {
  const value = ref && ref.current ? ref.current.getBoundingClientRect()[dimName] : 0

  if (shouldRound) {
    return Math.floor(value)
  }

  return value
}

export default DynamicModal
