// @flow
import React, { useEffect, useRef, useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import MergeColors from '../MergeCanvas/MergeColors'
import PrismImage from '../PrismImage/PrismImage'
import { useIntl } from 'react-intl'
import { setBackgroundForPaintScene } from '../../store/actions/paintScene'

import './MyIdeaPreview.scss'
import { Redirect } from 'react-router-dom'
import { MATCH_PHOTO, MY_IDEAS } from '../Facets/Prism/Prism'

type myIdeaPreviewProps = {
  // @todo implement -RS
}

const wrapperClass = 'my-ideas-preview-wrapper'
const overlayedCanvas = `${wrapperClass}__overlay-canvas`
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
    // landscape, get hieght based on wrapper width and then calc width based on new height
    newHeight = Math.round(dimensions.width * width / height) || 0
    newWidth = Math.round(newHeight * width / height) || 0
  }

  widthAndHeight.push(newWidth)
  widthAndHeight.push(newHeight)

  return widthAndHeight
}

const MyIdeaPreview = (props: myIdeaPreviewProps) => {
  const dispatch = useDispatch()
  const intl = useIntl()
  const backgroundCanvasRef = useRef()
  const foregroundCanvasRef = useRef()
  const wrapperRef = useRef()

  const selectedScene = useSelector(state => {
    const id = state.selectedSavedSceneId
    const selectedScene = state.scenesAndRegions.filter(scene => scene.id === id)
    if (selectedScene.length) {
      return selectedScene[0]
    }

    return null
  })

  const paintSceneWorkSpace = useSelector(state => state.paintScenceWorkspace)

  const { renderingBaseUrl } = selectedScene || {}
  const initialWidth = selectedScene ? selectedScene.surfaceMasks.surfaces[0].surfaceMaskImageData.width : 0
  const initialHeight = selectedScene ? selectedScene.surfaceMasks.surfaces[0].surfaceMaskImageData.height : 0
  // eslint-disable-next-line no-unused-vars
  const [width, setWidth] = useState(initialWidth)
  // eslint-disable-next-line no-unused-vars
  const [height, setHeight] = useState(initialHeight)
  const [backgroundImageSrc, setBackgroundImageSrc] = useState(null)
  const backgroundImageRef = useRef()
  const [foregroundImageUrl, setForegroundImageUrl] = useState(null)
  const foregroundImageRef = useRef()

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
    const imageEndpoint = ((renderingBaseUrl) => {
      if (renderingBaseUrl) {
        const splitUrl = renderingBaseUrl.split('/')
        return `/public/${splitUrl[splitUrl.length - 1]}.jpg`
      }

      return ''
    })(renderingBaseUrl)

    if (imageEndpoint) {
      setBackgroundImageSrc(imageEndpoint)
    }
  }, [])

  useEffect(() => {
    window.addEventListener('resize', resizeHandler)

    return function cleanup () {
      window.removeEventListener('resize', resizeHandler)
    }
  }, [])

  const loadMergedImage = (imageUrl: string) => {
    setForegroundImageUrl(imageUrl)
  }

  const handleBackgroundImageLoaded = (payload: Object) => {
    // @todo - Do not let the property name fool you, the item isn't a url but imageData, should probably refactor for clarity -RS
    const ctx = backgroundCanvasRef.current.getContext('2d')
    ctx.putImageData(payload.dataUrl, 0, 0)
  }

  const handleForegroundImageLoaded = (payload: Object) => {
    const ctx = foregroundCanvasRef.current.getContext('2d')
    ctx.putImageData(payload.dataUrl, 0, 0)
  }

  const openProject = (e: SyntheticEvent) => {
    e.preventDefault()

    dispatch(setBackgroundForPaintScene(
      backgroundCanvasRef.current.toDataURL(),
      foregroundCanvasRef.current.toDataURL(),
      selectedScene.palette,
      initialWidth,
      initialHeight))
  }

  const openUnpaintedProject = (e: SyntheticEvent) => {
    e.preventDefault()

    dispatch(setBackgroundForPaintScene(
      backgroundCanvasRef.current.toDataURL(),
      null,
      selectedScene.palette,
      initialWidth,
      initialHeight))
  }

  return (
    <>
      {/* eslint-disable-next-line no-constant-condition */}
      { selectedScene ? null : <Redirect to={MY_IDEAS} /> }
      {paintSceneWorkSpace ? <Redirect to={MATCH_PHOTO} /> : null}
      <div ref={wrapperRef} className={wrapperClass} style={{ height: Math.round(height * heightCrop) }}>
        {selectedScene ? <MergeColors
          imageDataList={selectedScene.surfaceMasks.surfaces.map(surface => surface.surfaceMaskImageData)}
          handleImagesMerged={loadMergedImage}
          width={initialWidth}
          height={initialHeight}
          ignoreColorOffset
          colors={selectedScene.palette.map(color => {
            return { r: color.red, g: color.green, b: color.blue }
          })} /> : null}
        <canvas ref={foregroundCanvasRef} width={initialWidth} height={initialHeight} style={{ width, height }} className={overlayedCanvas} />
        <canvas ref={backgroundCanvasRef} width={initialWidth} height={initialHeight} style={{ width, height, opacity: 0.8 }} />
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
        <div className={actionButtonWrapperClassName} style={{ position: 'absolute', zIndex: 10000, bottom: 20 }}>
          <div className={actionButtonInnerWrapperClassName}>
            <button className={buttonClassName} onClick={openProject}>{intl.messages['MY_IDEAS.OPEN_PROJECT'].toUpperCase()}</button>
            <button className={buttonClassName} onClick={openUnpaintedProject}>{intl.messages['MY_IDEAS.OPEN_UNPAINTED'].toUpperCase()}</button>
          </div>
        </div>
      </div>
    </>
  )
}

export default MyIdeaPreview
