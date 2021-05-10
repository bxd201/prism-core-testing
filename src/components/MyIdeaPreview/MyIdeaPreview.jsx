// @flow
import React, { useEffect, useRef, useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import MergeColors from '../MergeCanvas/MergeColors'
import PrismImage from '../PrismImage/PrismImage'
import { useIntl, FormattedMessage } from 'react-intl'
import { setLayersForPaintScene, WORKSPACE_TYPES } from '../../store/actions/paintScene'
import { Redirect, useHistory } from 'react-router-dom'
import ColorPalette from './ColorPalette'
import CardMenu from 'src/components/CardMenu/CardMenu'
import { selectSavedScene, SCENE_TYPE } from '../../store/actions/persistScene'
import { selectSavedAnonStockScene, setSelectedSceneStatus } from '../../store/actions/stockScenes'
import { StaticTintScene } from '../CompareColor/StaticTintScene'
import { SCENE_VARIANTS } from 'src/constants/globals'
import { getColorInstances, checkCanMergeColors, shouldPromptToReplacePalette } from '../LivePalette/livePaletteUtility'
import type { ColorMap } from 'src/shared/types/Colors.js.flow'
import { selectedSavedLivePalette } from 'src/store/actions/saveLivePalette'
import { mergeLpColors } from 'src/store/actions/live-palette'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { LP_MAX_COLORS_ALLOWED } from 'constants/configurations'
import { createSelectPaletteModal } from '../CVWModalManager/createModal'
import { unsetSelectedScenePaletteLoaded, showWarningModal, activateOnlyScene, unpaintSceneSurfaces } from '../../store/actions/scenes'
import ImageRotateContainer from 'src/components/MatchPhoto/ImageRotateContainer'
import SceneManager from 'src/components/SceneManager/SceneManager'
import './MyIdeaPreview.scss'
// @todo for mysherwin feature -RS
// import { CUSTOM_SCENE_IMAGE_ENDPOINT } from '../../constants/endpoints'

const wrapperClass = 'my-ideas-preview-wrapper'
const addAllBtn = `${wrapperClass}__add-all-btn`
const addAllText = `${addAllBtn}__add-all-text`
const canvasOverlayWrapper = `${wrapperClass}__overlay-canvas-wrapper`
const overlayedCanvas = `${canvasOverlayWrapper}__overlay-canvas`
const buttonClassName = `${wrapperClass}__button`
const actionButtonWrapperClassName = `${wrapperClass}__action-buttons`
const actionButtonInnerWrapperClassName = `${actionButtonWrapperClassName}__inner`
const heightCrop = 0.667

const getZoomWidthAndHeight = (dimensions, width, height) => {
  const widthAndHeight = []
  let newWidth = 0
  let newHeight = 0

  if (width > height) {
    // portrait
    newWidth = dimensions.width
    newHeight = Math.round(dimensions.width * height / width)
  } else {
    // landscape, get height based on wrapper width and then calc width based on new height
    newHeight = Math.round(dimensions.width * width / height) || 0
    newWidth = Math.round(newHeight * width / height) || 0
  }

  widthAndHeight.push(newWidth)
  widthAndHeight.push(newHeight)

  return widthAndHeight
}

export const RedirectMyIdeas = () => {
  const history = useHistory()
  history.push('/active')
}

type MyIdeaPreviewProps = { openScene: Function }
const MyIdeaPreview = ({ openScene }: MyIdeaPreviewProps) => {
  const dispatch = useDispatch()
  const { formatMessage } = useIntl()
  const intl = useIntl()
  const history = useHistory()
  const backgroundCanvasRef = useRef()
  const foregroundCanvasRef = useRef()
  const wrapperRef = useRef()
  const isActivePaintScenePolluted: boolean = useSelector(store => store.scenes.isActiveScenePolluted)

  const selectedScene = useSelector(state => {
    const { items: { colorMap } }: ColorMap = state.colors
    if (state.selectedSavedLivePaletteId) {
      const expectSavedLivePaletteData = state.sceneMetadata.find(item => item.sceneType === SCENE_TYPE.livePalette && item.id === state.selectedSavedLivePaletteId)
      const livePalette = getColorInstances(null, expectSavedLivePaletteData.livePaletteColorsIdArray, colorMap)
      return { ...expectSavedLivePaletteData, livePalette, savedSceneType: SCENE_TYPE.livePalette }
    }
    if (state.selectedStockSceneId) {
      const expectStockData = state.sceneMetadata.find(item => item.sceneType === SCENE_TYPE.anonStock && item.id === state.selectedStockSceneId)
      if (expectStockData) {
        const stockSceneData = state.scenes.sceneCollection[expectStockData.sceneFetchType].find(item => item.id === expectStockData.scene.id)
        const palette = expectStockData.scene.surfaces.map(surface => surface.color).filter(color => color !== undefined)
        const livePaletteColorsIdArray = (expectStockData.hasOwnProperty('livePaletteColorsIdArray')) ? expectStockData.livePaletteColorsIdArray : null
        const colorInstances = getColorInstances(palette, livePaletteColorsIdArray, colorMap)
        return { name: expectStockData.name, palette: colorInstances, savedSceneType: SCENE_TYPE.anonStock, stockSceneData: stockSceneData, expectStockData: expectStockData }
      }
    }
    if (state.selectedSavedSceneId) {
      const selectedScene = state.scenesAndRegions.filter(scene => scene.id === state.selectedSavedSceneId)
      if (selectedScene.length) {
        selectedScene[0].savedSceneType = SCENE_TYPE.anonCustom
        const livePaletteColorsIdArray = selectedScene[0].livePaletteColorsIdArray
        const colorInstances = getColorInstances(selectedScene[0].palette, livePaletteColorsIdArray, colorMap)
        selectedScene[0].palette = colorInstances
        return selectedScene[0]
      }
    }
    return null
  })

  const paintSceneWorkSpace = useSelector(state => state.paintSceneWorkspace)
  const lpColors = useSelector(state => state.lp.colors)

  const { renderingBaseUrl, backgroundImageUrl } = selectedScene || {}
  const initialWidth = selectedScene && selectedScene.savedSceneType === SCENE_TYPE.anonCustom ? selectedScene.surfaceMasks.width : 0
  const initialHeight = selectedScene && selectedScene.savedSceneType === SCENE_TYPE.anonCustom ? selectedScene.surfaceMasks.height : 0
  // eslint-disable-next-line no-unused-vars
  const [width, setWidth] = useState(initialWidth)
  // eslint-disable-next-line no-unused-vars
  const [height, setHeight] = useState(initialHeight)
  const [backgroundImageSrc, setBackgroundImageSrc] = useState(null)
  const backgroundImageRef = useRef()
  const [foregroundImageUrl, setForegroundImageUrl] = useState(null)
  const foregroundImageRef = useRef()
  const utilityCanvasRef = useRef()
  const layersRef = useRef([])

  const resizeHandler = (e: SyntheticEvent) => {
    const wrapperDimensions = wrapperRef.current.getBoundingClientRect()
    const [newWidth, newHeight] = getZoomWidthAndHeight(wrapperDimensions, initialWidth, initialHeight)
    setWidth(newWidth)
    setHeight(newHeight)
  }

  useEffect(() => {
    const wrapperDimensions = wrapperRef.current.getBoundingClientRect()
    const [newWidth, newHeight] = getZoomWidthAndHeight(wrapperDimensions, initialWidth, initialHeight)
    setWidth(newWidth)
    setHeight(newHeight)
  }, [])

  useEffect(() => {
    // @todo some of this code is for when mysherwin will be integrated. -RS
    // const imageEndpoint = selectedScene ? `${CUSTOM_SCENE_IMAGE_ENDPOINT}/${selectedScene.renderingBaseUrl}?w=${props.width || 120}` : null
    const backgroundImage = ((renderingBaseUrl) => {
      if (renderingBaseUrl) {
        const splitUrl = renderingBaseUrl.split('/')
        // @todo ensure the correct path is set when mysherwin is integrated -RS
        return `/public/${splitUrl[splitUrl.length - 1]}.jpg`
      }
      // assumes this is from an anonymous account if it makes it here
      return backgroundImageUrl
    })(renderingBaseUrl)

    if (backgroundImage) {
      setBackgroundImageSrc(backgroundImage)
    }
  }, [])

  useEffect(() => {
    window.addEventListener('resize', resizeHandler)

    return function cleanup () {
      window.removeEventListener('resize', resizeHandler)
      dispatch(selectSavedScene(null))
      dispatch(selectSavedAnonStockScene(null))
      dispatch(selectedSavedLivePalette(null))
    }
  }, [])

  // Merge color component callback
  const loadMergedImage = (payload: Object) => {
    setForegroundImageUrl(payload.mergedImage)
    layersRef.current = payload.layers
  }

  // Prism Image comp callback
  const handleBackgroundImageLoaded = (payload: Object) => {
    const ctx = backgroundCanvasRef.current.getContext('2d')
    ctx.putImageData(payload.data, 0, 0)
  }

  // Prism Image comp callback
  const handleForegroundImageLoaded = (payload: Object) => {
    const ctx = foregroundCanvasRef.current.getContext('2d')
    ctx.putImageData(payload.data, 0, 0)
  }

  const openProject = (e: SyntheticEvent) => {
    e.preventDefault()
    const openPaintedProject = e.currentTarget.dataset.buttonid === 'painted' && true
    const open = () => {
      dispatch(unsetSelectedScenePaletteLoaded())
      dispatch(setSelectedSceneStatus(null))
      if (selectedScene.savedSceneType === SCENE_TYPE.anonCustom) {
        dispatch(setLayersForPaintScene(backgroundCanvasRef.current.toDataURL(), openPaintedProject ? layersRef.current : null, selectedScene.palette, initialWidth, initialHeight, WORKSPACE_TYPES.savedScene))
        openScene(<ImageRotateContainer key={Date.now()} isFromMyIdeas isPaintScene checkIsPaintSceneUpdate={false} showPaintScene imgUrl='' />, 'PaintScene')
      } else if (selectedScene.savedSceneType === SCENE_TYPE.anonStock) {
        selectedScene.openUnpaintedStockScene = !openPaintedProject
        dispatch(unpaintSceneSurfaces(selectedScene.stockSceneData.id))
        dispatch(activateOnlyScene(selectedScene.stockSceneData.id))
        dispatch(setSelectedSceneStatus(selectedScene))
        openScene(<SceneManager expertColorPicks hideSceneSelector scenes={[selectedScene]} />, 'StockScene')
      }
      history.push('/active')
    }
    // @todo I think this api no longer accepts a callback -RS
    isActivePaintScenePolluted ? dispatch(showWarningModal(open)) : open()
  }

  const addAllColorsToLp = () => {
    if (selectedScene && selectedScene.livePalette) {
      if (checkCanMergeColors(lpColors, selectedScene.livePalette, LP_MAX_COLORS_ALLOWED)) {
        dispatch(mergeLpColors(selectedScene.livePalette))
      } else {
        if (shouldPromptToReplacePalette(lpColors, selectedScene.livePalette, LP_MAX_COLORS_ALLOWED)) {
          createSelectPaletteModal(intl, dispatch, 'EMPTY_SCENE')
        }
      }
    }
  }

  return (
    <>
      {/* eslint-disable-next-line no-constant-condition */}
      { selectedScene ? null : <Redirect to='/active/my-ideas' /> }
      { paintSceneWorkSpace ? <RedirectMyIdeas /> : null}
      <CardMenu menuTitle={`${(selectedScene && selectedScene.name) ? selectedScene.name : ``}`} showBackByDefault backPath='/active/my-ideas'>
        {() => (
          <div ref={wrapperRef} className={wrapperClass} style={{ minHeight: Math.round(height * heightCrop) }}>
            {selectedScene && selectedScene.savedSceneType === SCENE_TYPE.livePalette && <button className={addAllBtn} onClick={addAllColorsToLp}>
              <span className={addAllText}><FormattedMessage id='ADD_ALL' /></span>
              <FontAwesomeIcon icon={['fal', 'plus-circle']} size='1x' />
            </button>}
            {(selectedScene && selectedScene.savedSceneType === SCENE_TYPE.anonCustom) ? <MergeColors
              imageDataList={selectedScene.surfaceMasks.surfaces.map(surface => surface.surfaceMaskImageData)}
              handleImagesMerged={loadMergedImage}
              width={initialWidth}
              height={initialHeight}
              ignoreColorOffset
              colors={selectedScene.palette.map(color => {
                return { r: color.red, g: color.green, b: color.blue }
              })}
              preserveLayers /> : null}
            {(selectedScene && selectedScene.savedSceneType === SCENE_TYPE.anonCustom) ? <div className={canvasOverlayWrapper}>
              <canvas ref={foregroundCanvasRef} width={initialWidth} height={initialHeight} style={{ width, height }} className={overlayedCanvas} />
              <canvas ref={backgroundCanvasRef} width={initialWidth} height={initialHeight} style={{ width, height, opacity: 0.8 }} />
              <canvas ref={utilityCanvasRef} width={initialWidth} height={initialHeight} style={{ width, height, opacity: 0, visibility: 'hidden', display: 'none' }} />
            </div> : (selectedScene && selectedScene.savedSceneType === SCENE_TYPE.anonStock) ? <StaticTintScene
              colors={selectedScene.palette}
              scene={selectedScene.stockSceneData}
              statuses={selectedScene.expectStockData.scene.surfaces}
              config={{
                isNightScene: selectedScene.expectStockData.scene.variant === SCENE_VARIANTS.NIGHT,
                type: selectedScene.expectStockData.scene.sceneFetchType
              }} /> : null}
            {backgroundImageSrc ? <PrismImage
              ref={backgroundImageRef}
              source={backgroundImageSrc}
              loadedCallback={handleBackgroundImageLoaded}
              scalingWidth={initialWidth}
              width={initialWidth}
              height={initialHeight}
            /> : null}
            {foregroundImageUrl ? <PrismImage
              ref={foregroundImageRef}
              source={foregroundImageUrl}
              loadedCallback={handleForegroundImageLoaded}
              scalingWidth={initialWidth}
              width={initialWidth}
              height={initialHeight}
            /> : null}
            {selectedScene && selectedScene.savedSceneType !== SCENE_TYPE.livePalette && <div className={actionButtonWrapperClassName}>
              <div className={actionButtonInnerWrapperClassName}>
                <button data-buttonid='painted' className={buttonClassName} onClick={openProject}>{formatMessage({ id: 'MY_IDEAS.OPEN_PROJECT' }).toUpperCase()}</button>
                <button data-buttonid='unpainted' className={buttonClassName} onClick={openProject}>{formatMessage({ id: 'MY_IDEAS.OPEN_UNPAINTED' }).toUpperCase()}</button>
              </div>
            </div>}
            {selectedScene && selectedScene.palette && <ColorPalette palette={selectedScene.palette.slice(0, 8)} isMyIdeaPreview />}
            {selectedScene && selectedScene.livePalette && <ColorPalette palette={selectedScene.livePalette.slice(0, 8)} isMyIdeaPreview isMyIdeaPreviewLp />}
          </div>
        )}
      </CardMenu>
    </>
  )
}

export default MyIdeaPreview
