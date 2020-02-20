// @flow

import React, { useState, useRef, useEffect } from 'react'
import { useIntl } from 'react-intl'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import MergeColors from '../MergeCanvas/MergeColors'
import CircleLoader from '../Loaders/CircleLoader/CircleLoader'
import PrismImage from '../PrismImage/PrismImage'
// eslint-disable-next-line no-unused-vars
import { CUSTOM_SCENE_IMAGE_ENDPOINT } from '../../constants/endpoints'

import './MyIdeas.scss'

type SavedSceneProps = {
  sceneData: Object,
  editEnabled: boolean,
  deleteScene: Function,
  selectScene: Function,
  width: number,
  height: number
}

const FIXED_WIDTH = 120
const FIXED_HEIGHT = FIXED_WIDTH / 2

const baseClassName = 'myideas-wrapper'
const sceneClassName = `${baseClassName}__scene`
const sceneFrameClassName = `${sceneClassName}__frame`
const sceneLabelClassName = `${sceneClassName}__label`
const paneClassName = `${sceneFrameClassName}__pane`
const colorsClassName = `${sceneClassName}__colors`
const colorClassName = `${colorsClassName}__color`
const thumbnailClassName = `${paneClassName}__thumb`
const editButtonClassName = `${sceneClassName}__edit`

const createColors = (colors) => {
  return colors.map((color, i) => {
    const { red, green, blue } = color
    return (
      <div
        key={i}
        className={colorClassName}
        style={{ backgroundColor: `rgb(${red},${green},${blue})` }}>
        &nbsp;
      </div>
    )
  })
}

const SavedScene = (props: SavedSceneProps) => {
  const intl = useIntl()
  const { width, height } = props.sceneData.surfaceMasks

  const [thumbnailUrl, setThumbnailUrl] = useState(null)
  const [backgroundImageData, setBackgroundImageData] = useState(null)
  const [backgroundImageSrc, setBackgroundImageSrc] = useState(null)
  const imageRef = useRef()

  useEffect(() => {
    let backgroundImageUrl = ''

    if (props.sceneData.renderingBaseUrl) {
      // @todo props approach, having CORS issues in dev... -RS
      // imageEndpoint = `${CUSTOM_SCENE_IMAGE_ENDPOINT}/${props.sceneData.renderingBaseUrl}?w=${props.width || 120}`
      // @todo - This is a dev approach to stub out the endpoints
      backgroundImageUrl = ((renderingBaseUrl) => {
        const splitUrl = renderingBaseUrl.split('/')
        return `/public/${splitUrl[splitUrl.length - 1]}.jpg`
      })(props.sceneData.renderingBaseUrl)
    } else {
      backgroundImageUrl = props.sceneData.backgroundImageUrl
    }

    setBackgroundImageSrc(backgroundImageUrl)
  }, [])

  const deleteScene = (e: SyntheticEvent) => {
    e.preventDefault()
    props.deleteScene(props.sceneData.id)
  }

  const selectScene = (e: SyntheticEvent) => {
    if (props.editEnabled) {
      return
    }

    e.preventDefault()
    props.selectScene(props.sceneData.id)
  }

  const loadThumbnail = (payload: Object) => {
    setThumbnailUrl(payload.mergedImage)
  }

  const handleBackgroundImageLoaded = (payload: Object) => {
    setBackgroundImageData(payload.data)
  }

  return (
    <div className={sceneClassName}>
      {backgroundImageSrc ? <PrismImage
        ref={imageRef}
        source={backgroundImageSrc}
        loadedCallback={handleBackgroundImageLoaded}
        shouldResample={false}
        scalingWidth={width}
        width={width}
        height={height} /> : null}
      {backgroundImageData ? <MergeColors
        shouldTint
        imageDataList={[backgroundImageData, ...props.sceneData.surfaceMasks.surfaces.map(surface => surface.surfaceMaskImageData)]}
        colors={props.sceneData.palette.map(color => {
          return { r: color.red, g: color.green, b: color.blue }
        })}
        handleImagesMerged={loadThumbnail}
        width={width}
        height={height} /> : null}
      {props.editEnabled
        ? <div className={editButtonClassName}>
          <button onClick={deleteScene}>
            <FontAwesomeIcon
              title={intl.messages.DELETE}
              icon={['fal', 'trash-alt']}
              size='sm' />
          </button>
        </div> : null}
      <div role='tab' tabIndex='0' className={sceneFrameClassName} onClick={selectScene} onKeyDown={(e) => { if (e.keyCode === 13 || e.keyCode === 32) { selectScene(e) } }}>
        <div className={paneClassName}>
          <div className={thumbnailClassName} style={{ width: `${props.width || FIXED_WIDTH}px`, height: `${props.height || FIXED_HEIGHT}px` }}>
            {thumbnailUrl ? <img style={{ width: `${props.width || FIXED_WIDTH}px` }} src={thumbnailUrl} alt={`${intl.messages['MY_IDEAS.PREVIEW']}: ${props.sceneData.name}`} /> : <CircleLoader />}
          </div>
          <div className={colorsClassName}>
            {createColors(props.sceneData.palette)}
          </div>
        </div>
      </div>
      <div className={sceneLabelClassName}>
        {props.sceneData.name}
      </div>
    </div>
  )
}

export default SavedScene
