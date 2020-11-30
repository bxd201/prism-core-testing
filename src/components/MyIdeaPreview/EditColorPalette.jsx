// @flow
import React, { useState } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { KEY_CODES } from 'src/constants/globals'
import { FormattedMessage } from 'react-intl'
import './EditColorPalette.scss'

type editColorPaletteProps = {
  children: () => React.Node,
  defaultInput?: string,
  saveName: () => void
}

const baseClass = 'edit-color-palette'
const wrapper = `${baseClass}__wrapper`
const inputWrapper = `${baseClass}__input-wrapper`
const inputLabel = `${baseClass}__input-label`
const sceneNameError = `${baseClass}__scene-name-error`
const saveButton = `${baseClass}__save-button`
const sceneNameInput = `${baseClass}__scene-name-input`

const EditColorPalette = ({ children, defaultInput, saveName }: editColorPaletteProps) => {
  const [inputText, setInputText] = useState(defaultInput || '')
  const changeHandler = (e: SyntheticEvent) => {
    if (e.target.value.length < 26) setInputText(e.target.value)
  }

  const clearName = (e: SyntheticEvent) => {
    if (!e.keyCode || (e.keyCode && (e.keyCode === KEY_CODES.KEY_CODE_ENTER || e.keyCode === KEY_CODES.KEY_CODE_SPACE))) {
      e.preventDefault()
      setInputText('')
    }
  }

  const clickHandler = () => {
    saveName(inputText)
  }

  return (
    <div className={`${wrapper}`}>
      <div>
        {children()}
      </div>
      <div className={`${inputWrapper}`}>
        <input className={`${sceneNameInput}`} type='text' value={inputText} onChange={changeHandler} />
        <label aria-label='clear text' className={`${inputLabel}`} tabIndex='0' role='button' htmlFor='clearPaletteName' onClick={clearName} onKeyDown={clearName} onMouseDown={(e: SyntheticEvent) => e.preventDefault()}>
          <div>
            <input id='clearPaletteName' tabIndex='-1' className='visually-hidden' />
            <FontAwesomeIcon size='xs' className={``} icon={['fa', 'times']} />
          </div>
        </label>
        {inputText && <button className={`${saveButton}`} onClick={clickHandler}><FormattedMessage id='SAVE_MASKS' /></button>}
        {!inputText && <div className={`${sceneNameError}`}>
          <span><FormattedMessage id='ERR_IDEA_NAME_REQUIRED' /></span>
        </div>}
      </div>
    </div>
  )
}

export default EditColorPalette
