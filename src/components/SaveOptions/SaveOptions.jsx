// @flow
import React, { useCallback } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import 'src/providers/fontawesome/fontawesome'
import { useIntl } from 'react-intl'

import './SaveOptions.scss'
import { showSaveSceneModal } from '../../store/actions/persistScene'
import { replaceSceneStatus } from '../../shared/utils/sceneUtil'
import { getSceneInfoById } from '../SceneManager/SceneManager'
import SceneDownload from '../SceneDownload/SceneDownload'
import find from 'lodash/find'

type SaveOptionsProps = {
  activeComponent: string
}

const saveOptionsBaseClassName = 'save-options'
const saveOptionsItemsClassName = `${saveOptionsBaseClassName}__items`

const PAINT_SCENE_COMPONENT = 'PaintScene'

const SaveOptions = (props: SaveOptionsProps) => {
  const intl = useIntl()
  const dispatch = useDispatch()
  const scenesDownloadData = useSelector(state => {
    const scenes = state.selectedSceneStatus && !state.selectedSceneStatus.openUnpaintedStockScene ? replaceSceneStatus(state.scenes, state.selectedSceneStatus) : state.scenes
    return {
      originalScenes: state.scenes,
      originalSceneCollection: state.scenes.sceneCollection[state.scenes.type] || null,
      originalSceneStatus: state.scenes.sceneStatus[state.scenes.type],
      scenes: scenes,
      selectedSceneStatus: state.selectedSceneStatus,
      sceneStatus: scenes.sceneStatus[state.scenes.type],
      sceneCollection: scenes.sceneCollection[state.scenes.type] || null,
      selectedSceneVariantChanged: state.scenes.selectedSceneVariantChanged
    }
  })

  const firstActiveScene = scenesDownloadData.sceneCollection && scenesDownloadData.sceneCollection.filter(scene => (scene.id === scenesDownloadData.scenes.activeScenes[0]))[0]
  const firstActiveSceneInfo = firstActiveScene && firstActiveScene.id ? getSceneInfoById(firstActiveScene, scenesDownloadData.sceneStatus) : null
  const selectedScenedVariant = scenesDownloadData.selectedSceneStatus && !scenesDownloadData.selectedSceneVariantChanged ? scenesDownloadData.selectedSceneStatus.expectStockData.scene.variant : null
  if (selectedScenedVariant) {
    const sceneVariant = find(firstActiveScene.variants, { 'variant_name': selectedScenedVariant })
    firstActiveSceneInfo.variant = sceneVariant
  } else {
    const sceneVariantData = scenesDownloadData.originalSceneStatus && find(scenesDownloadData.originalSceneStatus, { 'id': scenesDownloadData.scenes.activeScenes[0] }).variant
    const sceneVariant = sceneVariantData && find(firstActiveScene.variants, { 'variant_name': sceneVariantData })
    if (sceneVariant) {
      firstActiveSceneInfo.variant = sceneVariant
    }
  }
  // @todo integrate downlaod -RS
  const handleSave = useCallback((e: SyntheticEvent) => {
    e.preventDefault()
    dispatch(showSaveSceneModal(true))
  }, [])

  // @todo [IMPLEMENT] determine if implementation should have use usecallback -RS
  const handleDownload = (e: SyntheticEvent) => {
    e.preventDefault()
    // @todo integrate download -RS
    console.log('Downloading Scene...')
  }

  return (
    <div className={saveOptionsBaseClassName}>
      {props.activeComponent === PAINT_SCENE_COMPONENT ? <button onClick={handleDownload}>
        <div className={saveOptionsItemsClassName}>
          <div>
            <FontAwesomeIcon
              title={intl.formatMessage({ id: 'DOWNLOAD_MASK' })}
              icon={['fal', 'download']}
              size='2x' />
          </div>
          <div>{intl.formatMessage({ id: 'DOWNLOAD_MASK' })}</div>
        </div>
      </button> : <div>
        <SceneDownload {...{ buttonCaption: 'DOWNLOAD_MASK', sceneInfo: firstActiveSceneInfo }} />
      </div>}
      <button onClick={handleSave}>
        <div className={saveOptionsItemsClassName}>
          <div>
            <FontAwesomeIcon
              title={intl.formatMessage({ id: 'SAVE_MASKS' })}
              icon={['fal', 'folder']}
              size='2x' />
          </div>
          <div>{intl.formatMessage({ id: 'SAVE_MASKS' })}</div>
        </div>
      </button>
    </div>
  )
}

export default SaveOptions
