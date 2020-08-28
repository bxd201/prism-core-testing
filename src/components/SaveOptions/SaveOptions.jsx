// @flow
import React, { useCallback, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import 'src/providers/fontawesome/fontawesome'
import { useIntl, FormattedMessage } from 'react-intl'
import { useHistory } from 'react-router-dom'

import './SaveOptions.scss'
import { showSaveSceneModal } from '../../store/actions/persistScene'
import { saveLivePalette } from '../../store/actions/saveLivePalette'
import { replaceSceneStatus } from '../../shared/utils/sceneUtil'
import { fullColorNumber } from '../../shared/helpers/ColorUtils'
import { getSceneInfoById } from '../SceneManager/SceneManager'
import DynamicModal from '../DynamicModal/DynamicModal'
import SceneDownload from '../SceneDownload/SceneDownload'
import { createUniqueSceneId } from '../../shared/utils/legacyProfileFormatUtil'
import find from 'lodash/find'

type SaveOptionsProps = {
  activeComponent: string
}

const saveOptionsBaseClassName = 'save-options'
const saveOptionsItemsClassName = `${saveOptionsBaseClassName}__items`

const PAINT_SCENE_COMPONENT = 'PaintScene'

const SaveOptions = (props: SaveOptionsProps) => {
  const { formatMessage } = useIntl()
  const [showLivePaletteSaveModal, setShowLivePaletteSaveModal] = useState(false)
  const [showSavedConfirmModalFlag, setShowSavedConfirmModalFlag] = useState(false)
  const dispatch = useDispatch()
  const { location: { pathname } } = useHistory()

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

  const lpColors = useSelector(state => state.lp.colors)

  const sceneCount = useSelector(state => state.sceneMetadata.length + 1)

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

  const handleSave = useCallback((e: SyntheticEvent) => {
    e.preventDefault()
    if ((pathname === '/active') || (pathname === '/active/paint-scene')) {
      dispatch(showSaveSceneModal(true))
    } else {
      setShowLivePaletteSaveModal(true)
    }
  }, [pathname])

  // @todo [IMPLEMENT] determine if implementation should have use usecallback -RS
  const handleDownload = (e: SyntheticEvent) => {
    e.preventDefault()
    // @todo integrate download -RS
    console.log('Downloading Scene...')
  }

  const saveLivePaletteColorsFromModal = (e: SyntheticEvent, inputValue: string) => {
    let livePaletteColorsIdArray = []
    lpColors && lpColors.map(color => {
      livePaletteColorsIdArray.push(color.id)
    })
    dispatch(saveLivePalette(createUniqueSceneId(), inputValue, livePaletteColorsIdArray))
    setShowLivePaletteSaveModal(false)
    setShowSavedConfirmModalFlag(true)
  }

  const hideSaveLivePaletteColorsModal = () => {
    setShowLivePaletteSaveModal(false)
  }

  const hideSavedConfirmModal = () => {
    setShowSavedConfirmModalFlag(false)
  }

  const getPreviewData = () => {
    const livePaletteColorsDiv = lpColors.filter(color => !!color).map((color, i) => {
      const { red, green, blue } = color
      return (
        <div
          key={i}
          style={{ backgroundColor: `rgb(${red},${green},${blue})`, flexGrow: '1', borderLeft: (i > 0) ? '1px solid #ffffff' : 'none' }}>
          &nbsp;
        </div>
      )
    })

    return <>
      <div style={{ display: 'flex', marginTop: '1px', height: '84px' }}>{livePaletteColorsDiv}</div>
    </>
  }

  return (
    <div className={saveOptionsBaseClassName}>
      {showLivePaletteSaveModal && lpColors.length > 0 ? <DynamicModal
        actions={[
          { text: formatMessage({ id: 'SAVE_LIVE_PALETTE_MODAL.SAVE' }), callback: saveLivePaletteColorsFromModal },
          { text: formatMessage({ id: 'SAVE_LIVE_PALETTE_MODAL.CANCEL' }), callback: hideSaveLivePaletteColorsModal }
        ]}
        previewData={getPreviewData()}
        height={document.documentElement.clientHeight + window.pageYOffset}
        allowInput
        inputDefault={`${(lpColors.length === 1) ? `${fullColorNumber(lpColors[0].brandKey, lpColors[0].colorNumber).trim()} ${lpColors[0].name}` : `${formatMessage({ id: 'SAVE_LIVE_PALETTE_MODAL.DEFAULT_DESCRIPTION' })} ${sceneCount}`}`} /> : null}
      {showLivePaletteSaveModal && lpColors.length === 0 ? <DynamicModal
        actions={[
          { text: formatMessage({ id: 'SAVE_LIVE_PALETTE_MODAL.CANCEL' }), callback: hideSaveLivePaletteColorsModal }
        ]}
        description={formatMessage({ id: 'SAVE_LIVE_PALETTE_MODAL.UNABLE_TO_SAVE_WARNING' })}
        height={document.documentElement.clientHeight + window.pageYOffset} /> : null}
      {showSavedConfirmModalFlag ? <DynamicModal
        actions={[
          { text: formatMessage({ id: 'SAVE_LIVE_PALETTE_MODAL.OK' }), callback: hideSavedConfirmModal }
        ]}
        description={formatMessage({ id: 'SAVE_LIVE_PALETTE_MODAL.LP_SAVED' })}
        height={document.documentElement.clientHeight + window.pageYOffset} /> : null}
      {props.activeComponent === PAINT_SCENE_COMPONENT ? <button onClick={handleDownload}>
        <div className={saveOptionsItemsClassName}>
          <div>
            <FontAwesomeIcon
              title={formatMessage({ id: 'DOWNLOAD_MASK' })}
              icon={['fal', 'download']}
              size='2x' />
          </div>
          <div><FormattedMessage id='DOWNLOAD_MASK' /></div>
        </div>
      </button> : <div>
        <SceneDownload {...{ buttonCaption: 'DOWNLOAD_MASK', sceneInfo: firstActiveSceneInfo }} />
      </div>}
      <button onClick={handleSave}>
        <div className={saveOptionsItemsClassName}>
          <div>
            <FontAwesomeIcon
              title={formatMessage({ id: 'SAVE_MASKS' })}
              icon={['fal', 'folder']}
              size='2x' />
          </div>
          <div><FormattedMessage id='SAVE_MASKS' /></div>
        </div>
      </button>
    </div>
  )
}

export default SaveOptions
