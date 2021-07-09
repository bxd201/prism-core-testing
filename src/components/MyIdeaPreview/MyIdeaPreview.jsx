// @flow
import React, { useEffect, useRef, useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import MergeColors from '../MergeCanvas/MergeColors'
import PrismImage from '../PrismImage/PrismImage'
import { useIntl, FormattedMessage } from 'react-intl'
import { setLayersForPaintScene, WORKSPACE_TYPES } from '../../store/actions/paintScene'
import { useHistory } from 'react-router-dom'
import ColorPalette from './ColorPalette'
import CardMenu from 'src/components/CardMenu/CardMenu'
import { selectSavedScene, SCENE_TYPE } from '../../store/actions/persistScene'
import { selectSavedAnonStockScene, hydrateStockSceneFromSavedData } from '../../store/actions/stockScenes'
import { getColorInstances, checkCanMergeColors, shouldPromptToReplacePalette } from '../LivePalette/livePaletteUtility'
import type { ColorMap } from 'src/shared/types/Colors.js.flow'
import { selectedSavedLivePalette } from 'src/store/actions/saveLivePalette'
import { activate, mergeLpColors } from 'src/store/actions/live-palette'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { LP_MAX_COLORS_ALLOWED } from 'constants/configurations'
import { createSelectPaletteModal } from '../CVWModalManager/createModal'
import { unsetSelectedScenePaletteLoaded } from '../../store/actions/scenes'
import './MyIdeaPreview.scss'
import { setSelectedSceneUid } from '../../store/actions/loadScenes'
import { MODAL_TYPE_ENUM } from '../CVWModalManager/constants'
import { ROUTES_ENUM } from '../Facets/ColorVisualizerWrapper/routeValueCollections'
import SingleTintableSceneView from '../SingleTintableSceneView/SingleTintableSceneView'
import { createScenesAndVariantsFromFastMaskWorkSpace, setFastMaskOpenCache } from '../../store/actions/fastMask'
import { SCENE_TYPES } from '../../constants/globals'
import useColors from '../../shared/hooks/useColors'

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

type MyIdeaPreviewProps = {
  openScene: Function,
  maxSceneHeight: number
}
const MyIdeaPreview = ({ openScene, maxSceneHeight }: MyIdeaPreviewProps) => {
  const [colors] = useColors()
  const dispatch = useDispatch()
  const { formatMessage } = useIntl()
  const intl = useIntl()
  const backgroundCanvasRef = useRef()
  const foregroundCanvasRef = useRef()
  const wrapperRef = useRef()

  const selectedScene = useSelector(store => {
    const { items: { colorMap } }: ColorMap = store.colors
    if (store.selectedSavedLivePaletteId) {
      const expectSavedLivePaletteData = store.sceneMetadata.find(item => item.sceneType === SCENE_TYPE.livePalette && item.id === store.selectedSavedLivePaletteId)
      const livePalette = getColorInstances(null, expectSavedLivePaletteData.livePaletteColorsIdArray, colorMap)
      return { ...expectSavedLivePaletteData, livePalette, savedSceneType: SCENE_TYPE.livePalette }
    }
    if (store.selectedStockSceneId) {
      const expectedStockData = store.sceneMetadata.find(item => item.sceneType === SCENE_TYPE.anonStock && item.id === store.selectedStockSceneId)
      if (expectedStockData) {
        // const stockSceneData = store.scenes.sceneCollection[expectStockData.sceneFetchType].find(item => item.id === expectStockData.scene.id)
        const expectedStockScene = store.scenesCollection.find(scene => scene.id === expectedStockData.scene.sceneDataId && scene.sceneType === expectedStockData.scene.sceneDataType)
        const expectedVariant = store.variantsCollection.find(variant => variant.sceneUid === expectedStockScene.uid && variant.variantName === expectedStockData.scene.variantName)
        const palette = expectedStockData.scene.surfaceColors.filter(color => color)
        const livePaletteColorsIdArray = (expectedStockData.hasOwnProperty('livePaletteColorsIdArray')) ? expectedStockData.livePaletteColorsIdArray : null
        const colorInstances = getColorInstances(palette, livePaletteColorsIdArray, colorMap)
        const surfaceColors = expectedStockData.scene.surfaceColors
        return { name: expectedStockData.name,
          palette: colorInstances,
          savedSceneType: SCENE_TYPE.anonStock,
          scene: expectedStockScene,
          variant: expectedVariant,
          expectedStockData:
          expectedStockData,
          surfaceColors }
      }
    }
    if (store.selectedSavedSceneId) {
      const selectedSavedScene = store.scenesAndRegions.filter(scene => scene.id === store.selectedSavedSceneId)
      if (selectedSavedScene.length) {
        selectedSavedScene[0].savedSceneType = selectedSavedScene[0].sceneType
        const livePaletteColorsIdArray = selectedSavedScene[0].livePaletteColorsIdArray
        const colorInstances = getColorInstances(selectedSavedScene[0].palette, livePaletteColorsIdArray, colorMap)
        selectedSavedScene[0].palette = colorInstances
        return selectedSavedScene[0].sceneType === SCENE_TYPE.anonFastMask ? createScenesAndVariantsFromFastMaskWorkSpace(selectedSavedScene[0]) : selectedSavedScene[0]
      }
    }
    return null
  })

  // eslint-disable-next-line no-unused-vars
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
  const history = useHistory()

  const resizeHandler = (e: SyntheticEvent) => {
    const wrapperDimensions = wrapperRef.current.getBoundingClientRect()
    const [newWidth, newHeight] = getZoomWidthAndHeight(wrapperDimensions, initialWidth, initialHeight)
    setWidth(newWidth)
    setHeight(newHeight)
  }

  useEffect(() => {
    // Redirect if this page has be navigated to via back button.
    if (!selectedScene && !backgroundImageUrl) {
      history.push(ROUTES_ENUM.ACTIVE_MYIDEAS)
    }
  }, [selectedScene])

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
    dispatch(unsetSelectedScenePaletteLoaded())
    if (selectedScene.savedSceneType === SCENE_TYPE.anonCustom) {
      dispatch(setLayersForPaintScene(backgroundCanvasRef.current.toDataURL(), openPaintedProject
        ? layersRef.current : null, selectedScene.palette, initialWidth, initialHeight, WORKSPACE_TYPES.savedScene))
    } else if (selectedScene.savedSceneType === SCENE_TYPE.anonStock) {
      selectedScene.openUnpaintedStockScene = !openPaintedProject
      const surfaceColors = openPaintedProject ? selectedScene.surfaceColors : selectedScene.surfaceColors.map(color => null)
      dispatch(setSelectedSceneUid(selectedScene.scene.uid))
      dispatch(hydrateStockSceneFromSavedData(selectedScene.variant.variantName, surfaceColors))
    } else if (selectedScene?.scene.sceneType === SCENE_TYPES.FAST_MASK) {
      const colorId = selectedScene.surfaceColors[0].id
      const newActiveColor = colors.colorMap[colorId]
      // @todo We can do this now since there is only one fastmask surface, more surfaces will need a new design. -RS
      dispatch(activate(newActiveColor))
      dispatch(setFastMaskOpenCache(selectedScene))
      history.push(ROUTES_ENUM.ACTIVE_FAST_MASK)
      return
    }
    openScene(selectedScene.savedSceneType)
  }

  const addAllColorsToLp = () => {
    if (selectedScene && selectedScene.livePalette) {
      if (checkCanMergeColors(lpColors, selectedScene.livePalette, LP_MAX_COLORS_ALLOWED)) {
        dispatch(mergeLpColors(selectedScene.livePalette))
      } else {
        if (shouldPromptToReplacePalette(lpColors, selectedScene.livePalette, LP_MAX_COLORS_ALLOWED)) {
          dispatch(createSelectPaletteModal(intl, MODAL_TYPE_ENUM.EMPTY_SCENE))
        }
      }
    }
  }

  const getSceneName = (data: any) => {
    if (data?.name) {
      return data.name
    }

    if (data?.scene) {
      return data.scene?.description ?? ' '
    }

    return ' '
  }

  return (
    <div>
      <CardMenu menuTitle={getSceneName(selectedScene)} showBackByDefault backPath='/active/my-ideas'>
        {() => (
          <div ref={wrapperRef} className={wrapperClass} style={{ minHeight: Math.round(height * heightCrop), maxHeight: maxSceneHeight }}>
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
            </div> : (selectedScene &&
            (selectedScene.variant))
              ? <SingleTintableSceneView
                adjustSvgHeight
                scenesCollection={[selectedScene.scene]}
                selectedSceneUid={selectedScene.scene.uid}
                surfaceColorsFromParents={selectedScene.surfaceColors}
                variantsCollection={[selectedScene.variant]}
              /> : null}
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
                {selectedScene?.scene?.sceneType !== SCENE_TYPES.FAST_MASK ? <button data-buttonid='unpainted' className={buttonClassName} onClick={openProject}>{formatMessage({ id: 'MY_IDEAS.OPEN_UNPAINTED' }).toUpperCase()}</button> : null}
              </div>
            </div>}
            {selectedScene && selectedScene.palette && <ColorPalette palette={selectedScene.palette.slice(0, 8)} isMyIdeaPreview />}
            {selectedScene && selectedScene.livePalette && <ColorPalette palette={selectedScene.livePalette.slice(0, 8)} isMyIdeaPreview isMyIdeaPreviewLp />}
          </div>
        )}
      </CardMenu>
    </div>
  )
}

export default MyIdeaPreview
