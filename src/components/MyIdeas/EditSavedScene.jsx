// @flow
import React, { useState, useCallback, useRef, useEffect } from 'react'
import { useDispatch } from 'react-redux'
import SavedScene from './SavedScene'
import { updateSavedSceneName } from '../../store/actions/persistScene'
import { updateSavedStockSceneName } from '../../store/actions/stockScenes'
// import { createCustomSceneMetadata } from '../../shared/utils/legacyProfileFormatUtil'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { KEY_CODES } from 'src/constants/globals'
import { useIntl } from 'react-intl'
import './EditSavedScene.scss'

type editSavedSceneProps = {
  width: number,
  height: number,
  sceneData: Object,
  selectScene: Function,
  showMyIdeas: Function,
  editedTintableIndividualScene: boolean
}

const baseClass = 'edit-saved-scene'
const wrapper = `${baseClass}__wrapper`
const inputWrapper = `${baseClass}__input-wrapper`
const inputLabel = `${baseClass}__input-label`
const sceneNameError = `${baseClass}__scene-name-error`
const saveButton = `${baseClass}__save-button`
const sceneNameInput = `${baseClass}__scene-name-input`

const EditSavedScene = ({ width, height, sceneData, selectScene, showMyIdeas, editedTintableIndividualScene }: editSavedSceneProps) => {
  const [savedSceneName, setSavedSceneName] = useState((editedTintableIndividualScene) ? sceneData.sceneMetadata.name : sceneData.name)
  const dispatch = useDispatch()
  const intl = useIntl()
  const savedSceneFrameRef = useRef()

  useEffect(() => {
    if (savedSceneFrameRef.current) {
      savedSceneFrameRef.current.focus()
    }
  }, [savedSceneFrameRef])

  const clickHandler = useCallback(() => {
    if (savedSceneName) {
      if (editedTintableIndividualScene) {
        dispatch(updateSavedStockSceneName(sceneData.sceneMetadata.id, savedSceneName))
      } else {
        dispatch(updateSavedSceneName(sceneData.id, savedSceneName))
      }
      showMyIdeas()
    }
  }, [dispatch, updateSavedSceneName, sceneData, savedSceneName, showMyIdeas])

  const changeHandler = useCallback((e: SyntheticEvent) => {
    if (e.target.value.length < 26) setSavedSceneName(e.target.value)
  }, [setSavedSceneName])

  const clearSceneName = useCallback((e: SyntheticEvent) => {
    if (!e.keyCode || (e.keyCode && (e.keyCode === KEY_CODES.KEY_CODE_ENTER || e.keyCode === KEY_CODES.KEY_CODE_SPACE))) {
      e.preventDefault()
      setSavedSceneName('')
    }
  }, [setSavedSceneName])

  return (
    <div className={`${wrapper}`}>
      <div>
        <SavedScene
          width={width}
          height={height}
          sceneData={sceneData}
          sceneId={editedTintableIndividualScene ? sceneData.sceneMetadata.id : sceneData.id}
          selectScene={selectScene}
          hideSceneName
          isImgWidthPixel
          useTintableScene={editedTintableIndividualScene}
          ref={savedSceneFrameRef}
        />
      </div>
      <div className={`${inputWrapper}`}>
        <input className={`${sceneNameInput}`} type='text' value={savedSceneName} onChange={changeHandler} />
        <label aria-label='clear text' className={`${inputLabel}`} tabIndex='0' role='button' htmlFor='clearBtn' onClick={clearSceneName} onKeyDown={clearSceneName} onMouseDown={(e: SyntheticEvent) => e.preventDefault()}>
          <div>
            <input id='clearBtn' tabIndex='-1' className='visually-hidden' />
            <FontAwesomeIcon size='xs' className={``} icon={['fa', 'times']} />
          </div>
        </label>
        {savedSceneName && <button className={`${saveButton}`} onClick={clickHandler}>{intl.messages['SAVE_MASKS']}</button>}
        {!savedSceneName && <div className={`${sceneNameError}`}>
          <span>{intl.messages['ERR_IDEA_NAME_REQUIRED']}</span>
        </div>}
      </div>
    </div>
  )
}

export default EditSavedScene
