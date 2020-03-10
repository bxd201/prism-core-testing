// @flow
import React, { useEffect, useRef, useState, useContext } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import MergeColors from '../MergeCanvas/MergeColors'
import PrismImage from '../PrismImage/PrismImage'
import { useIntl } from 'react-intl'
import { setLayersForPaintScene } from '../../store/actions/paintScene'

import './MyIdeaPreview.scss'
import { Redirect } from 'react-router-dom'
import { MY_IDEAS } from '../Facets/ColorVisualizerWrapper/ColorVisualizerWrapper'
import { RouteContext } from '../../contexts/RouteContext/RouteContext'
import ColorPalette from './ColorPalette'
import CardMenu from 'src/components/CardMenu/CardMenu'
import { selectSavedScene, SCENE_TYPE } from '../../store/actions/persistScene'
import { selectSavedAnonStockScene, setSelectedSceneStatus } from '../../store/actions/stockScenes'
import { StaticTintScene } from '../CompareColor/StaticTintScene'

type myIdeaPreviewProps = {
  // @todo implement -RS
}

const wrapperClass = 'my-ideas-preview-wrapper'
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
  const routeContext = useContext(RouteContext)
  routeContext.redirectMyIdeas(false, null)
  return null
}

const MyIdeaPreview = (props: myIdeaPreviewProps) => {
  const dispatch = useDispatch()
  const intl = useIntl()
  const backgroundCanvasRef = useRef()
  const foregroundCanvasRef = useRef()
  const wrapperRef = useRef()

  const selectedScene = useSelector(state => {
    if (state.selectedStockSceneId) {
      const expectStockData = state.sceneMetadata.find(item => item.sceneType === SCENE_TYPE.anonStock && item.id === state.selectedStockSceneId)
      if (expectStockData) {
        const stockSceneData = state.scenes.sceneCollection[expectStockData.sceneFetchType].find(item => item.id === expectStockData.scene.id)
        const palette = expectStockData.scene.surfaces.map(surface => surface.color).filter(color => color !== undefined)
        return { name: expectStockData.name, palette: palette, savedSceneType: SCENE_TYPE.anonStock, stockSceneData: stockSceneData, expectStockData: expectStockData }
      }
    }
    if (state.selectedSavedSceneId) {
      const selectedScene = state.scenesAndRegions.filter(scene => scene.id === state.selectedSavedSceneId)
      if (selectedScene.length) {
        selectedScene[0].savedSceneType = SCENE_TYPE.anonCustom
        return selectedScene[0]
      }
    }
    return null
  })

  const paintSceneWorkSpace = useSelector(state => state.paintSceneWorkspace)

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
  const routeContext = useContext(RouteContext)

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
    // @todo props approach, having CORS issues in dev... -RS
    // const imageEndpoint = `${CUSTOM_SCENE_IMAGE_ENDPOINT}/${props.sceneData.renderingBaseUrl}?w=${props.width || 120}`
    // @todo - This is a dev approach to stub out the endpoints
    const backgroundImage = ((renderingBaseUrl) => {
      if (renderingBaseUrl) {
        const splitUrl = renderingBaseUrl.split('/')
        return `/public/${splitUrl[splitUrl.length - 1]}.jpg`
      }
      // assumes this is from non-mysherwin account
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
    }
  }, [])

  // Merge color component callback
  const loadMergedImage = (payload: Object) => {
    setForegroundImageUrl(payload.mergedImage)
    // Save image urls
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
    if (routeContext.checkIsPaintScenePolluted()) {
      if (selectedScene.savedSceneType === SCENE_TYPE.anonCustom) {
        routeContext.showWarningModalMyIdeas(
          {
            backgroundCanvasRef: backgroundCanvasRef.current.toDataURL(),
            layersRef: openPaintedProject ? layersRef.current : null,
            selectedScenePalette: selectedScene.palette,
            initialWidth: initialWidth,
            initialHeight: initialHeight,
            isPaintSceneProject: true
          }
        )
      } else if (selectedScene.savedSceneType === SCENE_TYPE.anonStock) {
        routeContext.showWarningModalMyIdeas({ isPaintSceneProject: false, tmpActiveId: selectedScene.expectStockData.scene.id })
      }
    } else if (routeContext.checkIsStockScenePolluted()) {
      if (selectedScene.savedSceneType === SCENE_TYPE.anonCustom) {
        routeContext.showWarningModalMyIdeas(
          {
            backgroundCanvasRef: backgroundCanvasRef.current.toDataURL(),
            layersRef: openPaintedProject ? layersRef.current : null,
            selectedScenePalette: selectedScene.palette,
            initialWidth: initialWidth,
            initialHeight: initialHeight,
            isPaintSceneProject: true,
            isStockScenePolluted: true
          }
        )
      } else if (selectedScene.savedSceneType === SCENE_TYPE.anonStock) {
        routeContext.showWarningModalMyIdeas({
          isPaintSceneProject: false, isStockScenePolluted: true, tmpActiveId: selectedScene.expectStockData.scene.id
        })
      }
    } else {
      if (selectedScene.savedSceneType === SCENE_TYPE.anonCustom) {
        dispatch(setLayersForPaintScene(
          backgroundCanvasRef.current.toDataURL(),
          openPaintedProject ? layersRef.current : null,
          selectedScene.palette,
          initialWidth,
          initialHeight))
      } else if (selectedScene.savedSceneType === SCENE_TYPE.anonStock) {
        dispatch(setSelectedSceneStatus(selectedScene))
        return routeContext.redirectMyIdeas(true, selectedScene.expectStockData.scene.id)
      }
    }
  }

  // const openUnpaintedProject = (e: SyntheticEvent) => {
  //   e.preventDefault()
  //   if (routeContext.checkIsPaintScenePolluted()) {
  //     if (selectedScene.savedSceneType === SCENE_TYPE.anonCustom) {
  //       routeContext.showWarningModalMyIdeas(
  //         {
  //           backgroundCanvasRef: backgroundCanvasRef.current.toDataURL(),
  //           layersRef: null,
  //           selectedScenePalette: selectedScene.palette,
  //           initialWidth: initialWidth,
  //           initialHeight: initialHeight
  //         }
  //       )
  //     } else if (selectedScene.savedSceneType === SCENE_TYPE.anonStock) {
  //       routeContext.showWarningModalMyIdeas({})
  //     }
  //   } else {
  //     if (selectedScene.savedSceneType === SCENE_TYPE.anonCustom) {
  //       dispatch(setLayersForPaintScene(
  //         backgroundCanvasRef.current.toDataURL(),
  //         null,
  //         selectedScene.palette,
  //         initialWidth,
  //         initialHeight))
  //     } else if (selectedScene.savedSceneType === SCENE_TYPE.anonStock) {
  //       // routeContext.showWarningModalMyIdeas({})
  //     }
  //   }
  // }

  return (
    <>
      {/* eslint-disable-next-line no-constant-condition */}
      { selectedScene ? null : <Redirect to={MY_IDEAS} /> }
      { paintSceneWorkSpace ? <RedirectMyIdeas /> : null}
      <CardMenu menuTitle={`${(selectedScene && selectedScene.name) ? selectedScene.name : ``}`} showBackByDefault backPath={MY_IDEAS}>
        {() => (
          <div ref={wrapperRef} className={wrapperClass} style={{ minHeight: Math.round(height * heightCrop) }}>
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
              statuses={selectedScene.expectStockData.scene.surfaces} /> : null}
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
            <div className={actionButtonWrapperClassName}>
              <div className={actionButtonInnerWrapperClassName}>
                <button data-buttonid='painted' className={buttonClassName} onClick={openProject}>{intl.messages['MY_IDEAS.OPEN_PROJECT'].toUpperCase()}</button>
                <button data-buttonid='unpainted' className={buttonClassName} onClick={openProject}>{intl.messages['MY_IDEAS.OPEN_UNPAINTED'].toUpperCase()}</button>
              </div>
            </div>
            {selectedScene && selectedScene.palette && <ColorPalette palette={selectedScene.palette.slice(0, 8)} />}
          </div>
        )}
      </CardMenu>
    </>
  )
}

export default MyIdeaPreview
