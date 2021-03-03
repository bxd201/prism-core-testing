// @flow
import React, { useCallback, useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import 'src/providers/fontawesome/fontawesome'
import { useIntl, FormattedMessage } from 'react-intl'
import { useHistory } from 'react-router-dom'

import './SaveOptions.scss'
import { ACTIVE_SCENE_LABELS_ENUM } from '../../store/actions/navigation'
import { replaceSceneStatus } from '../../shared/utils/sceneUtil'
import { getSceneInfoById } from '../SceneManager/SceneManager'
import SceneDownload from '../SceneDownload/SceneDownload'
import find from 'lodash/find'
import { shouldAllowFeature } from '../../shared/utils/featureSwitch.util'
import { FEATURE_EXCLUSIONS } from '../../constants/configurations'
import WithConfigurationContext from '../../contexts/ConfigurationContext/WithConfigurationContext'
import CircleLoader from '../Loaders/CircleLoader/CircleLoader'
import { createSaveSceneModal, createModalForEmptyLivePalette } from '../CVWModalManager/createModal'
import { SAVE_OPTION } from '../CVWModalManager/constants.js'
type SaveOptionsProps = {
  config: any
}

const saveOptionsBaseClassName = 'save-options'
const saveOptionsItemsClassName = `${saveOptionsBaseClassName}__items`

const SaveOptions = (props: SaveOptionsProps) => {
  const { config: { featureExclusions } } = props
  const { formatMessage } = useIntl()
  const intl = useIntl()
  const activeSceneLabel = useSelector(store => store.activeSceneLabel)
  const toggleCompareColor: boolean = useSelector(store => store.lp.toggleCompareColor)
  const dispatch = useDispatch()
  const { location: { pathname } } = useHistory()
  const { cvw } = props.config
  const [cvwFromConfig, setCvwFromConfig] = useState(null)
  const lpColors = useSelector(state => state.lp.colors)

  useEffect(() => {
    if (cvw) {
      setCvwFromConfig(cvw)
    }
  }, [cvw])

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

  const handleSave = useCallback((e: SyntheticEvent) => {
    e.preventDefault()
    if (((pathname === '/active') || (pathname === '/active/paint-scene')) && !toggleCompareColor) {
      if (lpColors.length !== 0) {
        const saveType = ACTIVE_SCENE_LABELS_ENUM.STOCK_SCENE === activeSceneLabel ? SAVE_OPTION.SAVE_STOCK_SCENE : SAVE_OPTION.SAVE_PAINT_SCENE
        createSaveSceneModal(intl, dispatch, activeSceneLabel, saveType)
      } else {
        createModalForEmptyLivePalette(intl, dispatch, SAVE_OPTION.EMPTY_SCENE, true)
      }
    } else {
      if (lpColors.length !== 0) {
        createSaveSceneModal(intl, dispatch, ACTIVE_SCENE_LABELS_ENUM.LIVE_PALETTE, SAVE_OPTION.SAVE_LIVE_PALETTE)
      } else {
        createModalForEmptyLivePalette(intl, dispatch, SAVE_OPTION.EMPTY_SCENE, false)
      }
    }
  }, [pathname, activeSceneLabel])

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
    const promise = new Promise(async (resolve) => {
      const workCanvas = document.createElement('canvas')
      workCanvas.setAttribute('width', width)
      workCanvas.setAttribute('height', height)
      const workCtx = workCanvas.getContext('2d')
      await loadAndDrawImage(bgData, workCtx, 0, 0, width, height)
      await loadAndDrawImage(paintData, workCtx, 0, 0, width, height)
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

  const getDownloadStaticResourcesPath = (data) => {
    return {
      // to do: headerImage, downloadDisclaimer1, downloadDisclaimer2 also should be configurable
      headerLogo: data.downloadSceneHeaderImage,
      bottomLogo: data.downloadSceneFooterImage,
      downloadDisclaimer1: data.downloadSceneDisclaimer1,
      downloadDisclaimer2: data.downloadSceneDisclaimer2
    }
  }

  return (
    <div className={saveOptionsBaseClassName}>
      {shouldAllowFeature(featureExclusions, FEATURE_EXCLUSIONS.download)
        ? (activeSceneLabel === ACTIVE_SCENE_LABELS_ENUM.PAINT_SCENE
          ? <div>
            {cvwFromConfig ? <SceneDownload {...{ buttonCaption: 'DOWNLOAD_MASK', getFlatImage: getFlatImage, activeComponent: activeSceneLabel, config: getDownloadStaticResourcesPath(cvwFromConfig) }} /> : <CircleLoader />}
          </div>
          : <div>
            {cvwFromConfig ? <SceneDownload {...{ buttonCaption: 'DOWNLOAD_MASK', sceneInfo: firstActiveSceneInfo, activeComponent: activeSceneLabel, config: getDownloadStaticResourcesPath(cvwFromConfig) }} /> : <CircleLoader />}
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
