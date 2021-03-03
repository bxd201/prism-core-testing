// @flow
import React, { useEffect, useRef } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { GLOBAL_MODAL_STYLE, DANGER, PRIMARY } from './constants.js'
import { KEY_CODES } from 'src/constants/globals'
import './GlobalModal.scss'

export const globalModalClassName = 'global-modal'
export const globalModalInnerClassName = `${globalModalClassName}__inner-box`
export const globalModalTitleClassName = `${globalModalClassName}__title`
export const globalModalPreviewImageClassName = `${globalModalClassName}__preview-image`
export const globalModalDescriptionClassName = `${globalModalClassName}__description`
export const globalModalInputWrapperClassName = `${globalModalClassName}__input-wrapper`
export const globalModalInputLabelClassName = `${globalModalClassName}__input-label`
export const globalModalTextInputClassName = `${globalModalClassName}__text-input`
export const globalModalButtonsClassName = `${globalModalClassName}__button-row`
export const globalModalButtonBaseClassName = `${globalModalButtonsClassName}__button`

const getGlobalModalClass = (type) => {
  switch (type) {
    case DANGER:
      return GLOBAL_MODAL_STYLE.danger
    case PRIMARY:
      return GLOBAL_MODAL_STYLE.primary
    default:
      return ''
  }
}

type ModalProps = { shouldDisplayModal: boolean, previewImage: Component, styleType: String, title: String, description: String, allowInput: boolean, actions: Array, fn: Function, setInputValue: Function }
export const Modal = (props: ModalProps) => {
  const { shouldDisplayModal, previewImage, styleType, title, description, allowInput, actions, fn, setInputValue } = props
  const btnRefList = useRef([])

  useEffect(() => {
    if (btnRefList.current && btnRefList.current.length) {
      btnRefList.current[0].focus()
    }
  }, [actions])

  const blurHandler = (btnNumber) => {
    if (btnRefList.current && btnRefList.current.length && btnRefList.current.length === btnNumber + 1) {
      btnRefList.current[0].focus()
    }
  }

  const setInputVal = (e: SyntheticEvent) => setInputValue(e.target.value)

  const clearInputVal = (e: SyntheticEvent) => {
    if (!e.keyCode || (e.keyCode && (e.keyCode === KEY_CODES.KEY_CODE_ENTER || e.keyCode === KEY_CODES.KEY_CODE_SPACE))) {
      e.preventDefault()
      setInputValue('')
    }
  }

  const createButtonsFromActions = (actions, fn) => {
    const buttons = actions.map((action, i) => {
      const callback = fn(action.callback)
      return (
        <button
          onBlur={() => blurHandler(i)}
          ref={el => { if (el && !btnRefList.current.includes(el)) { btnRefList.current[i] = el } }}
          className={globalModalButtonBaseClassName}
          onClick={callback}
          key={`${i}`}>
          {action.text}
        </button>)
    })
    return buttons
  }

  return (
    <React.Fragment>
      {shouldDisplayModal &&
      <div className={globalModalClassName}>
        <div className={`${globalModalInnerClassName} ${getGlobalModalClass(styleType)}`}>
          {previewImage && <div className={`${globalModalInnerClassName}__preview-image`}>{previewImage}</div>}
          <div className={`${globalModalInnerClassName}__content`}>
            {title ? <div className={globalModalTitleClassName}>{title}</div> : null}
            {description ? <div className={globalModalDescriptionClassName}>{description}</div> : null}
            {allowInput ? <div className={globalModalInputWrapperClassName}><input className={`${globalModalTextInputClassName}`} onChange={setInputVal} />
              <label aria-label='clear text' className={`${globalModalInputLabelClassName}`} tabIndex='0' role='button' htmlFor='clearModalInput' onClick={clearInputVal} onKeyDown={clearInputVal} onMouseDown={(e: SyntheticEvent) => e.preventDefault()}>
                <div>
                  <input id='clearModalInput' tabIndex='-1' className='visually-hidden' />
                  <FontAwesomeIcon size='xs' className={``} icon={['fa', 'times']} />
                </div>
              </label>
            </div> : null}
            <div className={globalModalButtonsClassName}>
              {actions && createButtonsFromActions(actions, fn)}
            </div>
          </div>
        </div>
      </div>
      }
    </React.Fragment>
  )
}
