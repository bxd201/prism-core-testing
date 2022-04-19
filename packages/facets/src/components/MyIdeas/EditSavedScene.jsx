// @flow
import React, { useState, useCallback, useRef, useEffect } from 'react'
import { useDispatch } from 'react-redux'
import SavedScene from './SavedScene'
import { SCENE_TYPE, updateSavedSceneName } from '../../store/actions/persistScene'
import { updateSavedStockSceneName } from '../../store/actions/stockScenes'
// import { createCustomSceneMetadata } from '../../shared/utils/legacyProfileFormatUtil'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { KEY_CODES } from 'src/constants/globals'
import { useIntl, FormattedMessage } from 'react-intl'
import './EditSavedScene.scss'

type editSavedSceneProps = {
  width: number,
  height: number,
  sceneData: Object,
  selectScene: Function,
  showMyIdeas: Function,
  editSceneType: boolean
}

const baseClass = 'edit-saved-scene'
const wrapper = `${baseClass}__wrapper`
const inputWrapper = `${baseClass}__input-wrapper`
const inputLabel = `${baseClass}__input-label`
const sceneNameError = `${baseClass}__scene-name-error`
const saveButton = `${baseClass}__save-button`
const sceneNameInput = `${baseClass}__scene-name-input`

const getSceneName = (data: any, sceneType: string) => sceneType === SCENE_TYPE.anonStock ? data.sceneMetadata.name : data.name

const EditSavedScene = ({ width, height, sceneData, selectScene, showMyIdeas, editSceneType }: editSavedSceneProps) => {
  const [savedSceneName, setSavedSceneName] = useState(getSceneName(sceneData, editSceneType))
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
      if (editSceneType === SCENE_TYPE.anonStock) {
        dispatch(updateSavedStockSceneName(sceneData.sceneMetadata.id, savedSceneName))
      } else {
        dispatch(updateSavedSceneName(sceneData.id, savedSceneName))
      }
      showMyIdeas()
    }
  }, [dispatch, sceneData, savedSceneName])

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
          sceneId={editSceneType === SCENE_TYPE.anonStock ? sceneData.sceneMetadata.id : sceneData.id}
          selectScene={selectScene}
          hideSceneName
          isImgWidthPixel
          useTintableScene={editSceneType === SCENE_TYPE.anonStock || editSceneType === SCENE_TYPE.anonFastMask}
          ref={savedSceneFrameRef}
          sceneType={editSceneType}
        />
      </div>
      <div className={`${inputWrapper}`}>
        <input className={`${sceneNameInput}`} type='text' value={savedSceneName} onChange={changeHandler} />
        <label aria-label={intl.formatMessage({ id: 'CLEAR_TEXT' })} className={`${inputLabel}`} tabIndex='0' role='button' htmlFor='clearBtn' onClick={clearSceneName} onKeyDown={clearSceneName} onMouseDown={(e: SyntheticEvent) => e.preventDefault()}>
          <div>
            <input id='clearBtn' tabIndex='-1' className='visually-hidden' />
            <FontAwesomeIcon size='xs' className={``} icon={['fa', 'times']} />
          </div>
        </label>
        {savedSceneName && <button className={`${saveButton}`} onClick={clickHandler}><FormattedMessage id='SAVE_MASKS' /></button>}
        {!savedSceneName && <div className={`${sceneNameError}`}>
          <span><FormattedMessage id='ERR_IDEA_NAME_REQUIRED' /></span>
        </div>}
      </div>
    </div>
  )
}

export default EditSavedScene
