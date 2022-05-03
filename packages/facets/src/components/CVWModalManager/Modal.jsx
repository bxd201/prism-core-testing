// @flow
import React, { useEffect, useRef, ComponentType } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { GLOBAL_MODAL_STYLE, DANGER, PRIMARY, SAVED, ACTION_SAVE } from './constants.js'
import { KEY_CODES } from 'src/constants/globals'
import './GlobalModal.scss'
import { CircleLoader } from '@prism/toolkit'

export const globalModalClassName = 'global-modal'
export const globalModalInnerClassName = `${globalModalClassName}__inner-box`
export const globalModalInnerClearClassName = `${globalModalInnerClassName}--clear`
export const globalModalTitleClassName = `${globalModalClassName}__title`
export const globalModalPreviewImageClassName = `${globalModalClassName}__preview-image`
export const globalModalDescriptionClassName = `${globalModalClassName}__description`
export const globalModalInputWrapperClassName = `${globalModalClassName}__input-wrapper`
export const globalModalInputLabelClassName = `${globalModalClassName}__input-label`
export const globalModalTextInputClassName = `${globalModalClassName}__text-input`
export const globalModalButtonsClassName = `${globalModalClassName}__button-row`
export const globalModalButtonBaseClassName = `${globalModalButtonsClassName}__button`
export const globalModalEmptyInputClassName = `${globalModalClassName}__empty-input`
export const globalModalSavedClassName = `${globalModalInnerClassName}__saved`

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

type ModalProps = {
  shouldDisplayModal: boolean,
  previewImage: ComponentType,
  intl: Object,
  styleType: String,
  title: String,
  description: String,
  allowInput: boolean,
  actions: Array,
  fn: Function,
  setInputValue: Function,
  inputValue: string,
  resetInputValue: Function,
  loadingMode?: boolean
}

export const Modal = (props: ModalProps) => {
  const {
    shouldDisplayModal,
    previewImage,
    styleType,
    title,
    description,
    allowInput,
    actions,
    fn,
    setInputValue,
    inputValue,
    resetInputValue,
    intl,
    loadingMode
  } = props

  const btnRefList = useRef([])

  useEffect(() => resetInputValue(), [shouldDisplayModal])

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

  const hidePreviewImage = !!(description && description === SAVED)

  const disabledSave = allowInput && !inputValue

  const setInputVal = (e: SyntheticEvent) => setInputValue(e.target.value)

  const clearInputVal = (e: SyntheticEvent) => {
    if (!e.keyCode || (e.keyCode && (e.keyCode === KEY_CODES.KEY_CODE_ENTER || e.keyCode === KEY_CODES.KEY_CODE_SPACE))) {
      e.preventDefault()
      setInputValue('')
    }
  }

  const createButtonsFromActions = (actions, fn, disabledSave) => {
    const buttons = actions.map((action, i) => {
      const callback = fn(action.callback)
      return (
        <button
          onBlur={() => blurHandler(i)}
          ref={el => { if (el && !btnRefList.current.includes(el)) { btnRefList.current[i] = el } }}
          className={globalModalButtonBaseClassName}
          onClick={callback}
          disabled={action.text === ACTION_SAVE && disabledSave}
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
        <div className={`${loadingMode ? globalModalInnerClearClassName : globalModalInnerClassName} ${getGlobalModalClass(styleType)} ${hidePreviewImage && globalModalSavedClassName}`}>
          {!hidePreviewImage && previewImage && <div className={`${globalModalInnerClassName}__preview-image`}>{previewImage}</div>}
          <div className={`${globalModalInnerClassName}__content`}>
            {title ? <div className={globalModalTitleClassName}>{title}</div> : null}
            {description ? <div className={globalModalDescriptionClassName}>{description}</div> : null}
            {allowInput ? <div className={globalModalInputWrapperClassName}><input className={`${globalModalTextInputClassName}`} onChange={setInputVal} value={inputValue} />
              <label aria-label='clear text' className={`${globalModalInputLabelClassName}`} tabIndex='0' role='button' htmlFor='clearModalInput' onClick={clearInputVal} onKeyDown={clearInputVal} onMouseDown={(e: SyntheticEvent) => e.preventDefault()}>
                <div>
                  <input id='clearModalInput' tabIndex='-1' className='visually-hidden' />
                  <FontAwesomeIcon size='xs' className={``} icon={['fa', 'times']} />
                </div>
              </label>
            </div> : null}
            {loadingMode ? <CircleLoader /> : null}
            {disabledSave && <div className={globalModalEmptyInputClassName}>{intl.formatMessage({ id: 'SAVE_SCENE_MODAL.EMPTY_INPUT' })}</div>}
            <div className={globalModalButtonsClassName}>
              {actions && createButtonsFromActions(actions, fn, disabledSave)}
            </div>
          </div>
        </div>
      </div>
      }
    </React.Fragment>
  )
}
