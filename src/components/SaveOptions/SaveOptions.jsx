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
import { shouldAllowFeature } from '../../shared/utils/featureSwitch.util'
import { FEATURE_EXCLUSIONS } from '../../constants/configurations'
import WithConfigurationContext from '../../contexts/ConfigurationContext/WithConfigurationContext'

type SaveOptionsProps = {
  activeComponent: string,
  config: any
}

const saveOptionsBaseClassName = 'save-options'
const saveOptionsItemsClassName = `${saveOptionsBaseClassName}__items`

const PAINT_SCENE_COMPONENT = 'PaintScene'

const SaveOptions = (props: SaveOptionsProps) => {
  const { activeComponent, config: { featureExclusions } } = props
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

  const loadAndDrawImage = (url, ctx, w = 0, h = 0, x = 0, y = 0) => {
    var image = new Image()
    const promise = new Promise((resolve) => {
      image.onload = () => {
        ctx.drawImage(image, w, h, x, y)
        resolve(ctx)
      }
    })
    image.src = url
    return promise
  }

  const getFlatImage = (ctx1, ctx2) => {
    const { width, height } = ctx1.canvas
    const bgData = ctx1.canvas.toDataURL(0, 0, width, height)
    const paintData = ctx2.canvas.toDataURL(0, 0, width, height)
    const promise = new Promise((resolve) => {
      const workCanvas = document.createElement('canvas')
      workCanvas.setAttribute('width', width)
      workCanvas.setAttribute('height', height)
      const workCtx = workCanvas.getContext('2d')
      loadAndDrawImage(bgData, workCtx, 0, 0, width, height)
      loadAndDrawImage(paintData, workCtx, 0, 0, width, height)
      const miniImgWidth = Math.floor(width / 3)
      const miniImgHeight = Math.floor(height / 3)
      loadAndDrawImage(bgData, workCtx, width - miniImgWidth, height - miniImgHeight, miniImgWidth, miniImgHeight).then((ctx) => {
        const promise = new Promise((resolve) => {
          ctx.canvas.toBlob((blob) => {
            const url = URL.createObjectURL(blob)
            resolve(url)
          }, 'image/png')
        })
        resolve(promise)
      })
    })
    return promise
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
      {shouldAllowFeature(featureExclusions, FEATURE_EXCLUSIONS.download)
        ? (activeComponent === PAINT_SCENE_COMPONENT
          ? <div>
            <SceneDownload {...{ buttonCaption: 'DOWNLOAD_MASK', getFlatImage: getFlatImage, activeComponent: props.activeComponent }} />
          </div>
          : <div>
            <SceneDownload {...{ buttonCaption: 'DOWNLOAD_MASK', sceneInfo: firstActiveSceneInfo, activeComponent: props.activeComponent }} />
          </div>) : null}
      { shouldAllowFeature(featureExclusions, FEATURE_EXCLUSIONS.documentSaving)
        ? <button onClick={handleSave}>
          <div className={saveOptionsItemsClassName}>
            <div>
              <FontAwesomeIcon
                title={formatMessage({ id: 'SAVE_MASKS' })}
                icon={['fal', 'folder']}
                size='2x' />
            </div>
            <div><FormattedMessage id='SAVE_MASKS' /></div>
          </div>
        </button> : null}
    </div>
  )
}

export default WithConfigurationContext(SaveOptions)
