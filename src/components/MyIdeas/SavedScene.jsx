// @flow

import React, { useState, useRef, useEffect, forwardRef } from 'react'
import { useSelector } from 'react-redux'
import { useIntl } from 'react-intl'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import MergeColors from '../MergeCanvas/MergeColors'
import CircleLoader from '../Loaders/CircleLoader/CircleLoader'
import PrismImage from '../PrismImage/PrismImage'
// eslint-disable-next-line no-unused-vars
import { CUSTOM_SCENE_IMAGE_ENDPOINT } from '../../constants/endpoints'
import { KEY_CODES, SCENE_VARIANTS } from 'src/constants/globals'

import './MyIdeas.scss'
import { StaticTintScene } from '../CompareColor/StaticTintScene'
import { getColorInstances } from '../LivePalette/livePaletteUtility'
import type { ColorMap } from 'src/shared/types/Colors.js.flow'

type SavedSceneProps = {
  sceneData: Object,
  editEnabled: boolean,
  deleteScene?: Function,
  selectScene: Function,
  width: number,
  height: number,
  editIndividualScene: Function,
  hideSceneName?: boolean,
  useTintableScene?: boolean,
  sceneId: string,
  isImgWidthPixel?: boolean
}

const FIXED_WIDTH = 120
const FIXED_HEIGHT = FIXED_WIDTH / 2

const baseClassName = 'myideas-wrapper'
const sceneClassName = `${baseClassName}__scene`
const sceneIndividual = `${sceneClassName}--individual`
const sceneCarousel = `${sceneClassName}--carousel`
const sceneFrameWrapper = `${sceneClassName}__frame-wrapper`
const sceneFrameClassName = `${sceneClassName}__frame`
const sceneLabelClassName = `${sceneClassName}__label`
const paneClassName = `${sceneFrameClassName}__pane`
const colorsClassName = `${sceneClassName}__colors`
const colorClassName = `${colorsClassName}__color`
const thumbnailClassName = `${paneClassName}__thumb`
const editButtonClassName = `${sceneClassName}__edit`

const getColorsFromMetadata = (surfaces: Object[]) => {
  return surfaces.map(surface => surface.color).filter(color => color !== undefined)
}

const createColors = (sceneData: any, isTintableScene: boolean, colorMap: ColorMap) => {
  const colors = isTintableScene ? getColorsFromMetadata(sceneData.sceneMetadata.scene.surfaces) : sceneData.palette
  const livePaletteColorsIdArray = (sceneData.sceneMetadata && sceneData.sceneMetadata.hasOwnProperty('livePaletteColorsIdArray'))
    ? sceneData.sceneMetadata.livePaletteColorsIdArray
    : sceneData.hasOwnProperty('livePaletteColorsIdArray') ? sceneData.livePaletteColorsIdArray
      : null

  const colorInstances = getColorInstances(colors, livePaletteColorsIdArray, colorMap)

  return colorInstances.filter(color => !!color).map((color, i) => {
    if (i > 7) return

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

const SavedScene = (props: SavedSceneProps, ref: RefObject | null) => {
  const intl = useIntl()
  const { width, height } = props.useTintableScene ? props.sceneData.scene : props.sceneData.surfaceMasks

  const [thumbnailUrl, setThumbnailUrl] = useState(null)
  const [backgroundImageData, setBackgroundImageData] = useState(null)
  const [backgroundImageSrc, setBackgroundImageSrc] = useState(null)
  const imageRef = useRef()
  const { items: { colorMap } }: ColorMap = useSelector(state => state.colors)

  const getStockSceneVariant = (useTinableScene: boolean, sceneData: Object) => {
    if (useTinableScene) {
      const variant = sceneData.sceneMetadata.scene.variant
      const sceneVariant = sceneData.scene.variants.find(item => item.variant_name === variant)

      if (sceneVariant) {
        return sceneVariant
      }
    }

    return null
  }

  useEffect(() => {
    let backgroundImageUrl = ''
    const variant = getStockSceneVariant(props.useTintableScene, props.sceneData)
    const stockSceneBackgroundUrl = variant ? variant.image : null

    if (props.sceneData.renderingBaseUrl) {
      backgroundImageUrl = ((renderingBaseUrl) => {
        const splitUrl = renderingBaseUrl.split('/')
        return `/public/${splitUrl[splitUrl.length - 1]}.jpg`
      })(props.sceneData.renderingBaseUrl)
    } else if (props.sceneData.backgroundImageUrl) {
      backgroundImageUrl = props.sceneData.backgroundImageUrl
    } else if (stockSceneBackgroundUrl) {
      backgroundImageUrl = stockSceneBackgroundUrl
    }

    setBackgroundImageSrc(backgroundImageUrl)
  }, [])

  const deleteScene = (e: SyntheticEvent) => {
    e.preventDefault()
    e.stopPropagation()
    // useTinableScene infers scene type
    props.deleteScene(props.sceneId, !!props.useTintableScene)
  }

  const selectScene = (e: SyntheticEvent) => {
    if (props.editEnabled) {
      props.editIndividualScene(props.sceneData, !!props.useTintableScene)
      return
    }

    e.preventDefault()
    e.stopPropagation()
    props.selectScene(props.sceneId)
  }

  const loadThumbnail = (payload: Object) => {
    setThumbnailUrl(payload.mergedImage)
  }

  const handleBackgroundImageLoaded = (payload: Object) => {
    setBackgroundImageData(payload.data)
  }

  const handleKeyDown = (e: SyntheticEvent) => {
    if (e.keyCode === KEY_CODES.KEY_CODE_ENTER || e.keyCode === KEY_CODES.KEY_CODE_SPACE) {
      if (props.editEnabled) {
        props.editIndividualScene(props.sceneData, !!props.useTintableScene)
      } else selectScene(e)
    }
  }

  const mouseDownHandler = (e: SyntheticEvent) => {
    e.preventDefault()
  }

  return (
    <div className={`${sceneClassName} ${(props.isImgWidthPixel) ? sceneIndividual : sceneCarousel}`}>
      {backgroundImageSrc && !props.useTintableScene ? <PrismImage
        ref={imageRef}
        source={backgroundImageSrc}
        loadedCallback={handleBackgroundImageLoaded}
        shouldResample={false}
        scalingWidth={width}
        width={width}
        height={height} /> : null}
      {backgroundImageData && !props.useTintableScene ? <MergeColors
        shouldTint
        colorOpacity={0.8}
        imageDataList={[backgroundImageData, ...props.sceneData.surfaceMasks.surfaces.map(surface => surface.surfaceMaskImageData)]}
        colors={props.sceneData.palette.map(color => {
          return { r: color.red, g: color.green, b: color.blue }
        })}
        handleImagesMerged={loadThumbnail}
        width={width}
        height={height} /> : null}
      <div className={`${sceneFrameWrapper}`}>
        {props.editEnabled
          ? <div className={editButtonClassName}>
            <button onClick={deleteScene}>
              <FontAwesomeIcon
                title={`${intl.formatMessage({ id: 'DELETE' })} ${props.useTintableScene ? props.sceneData.sceneMetadata.name : props.sceneData.name}`}
                icon={['fal', 'trash-alt']}
                size='sm' />
            </button>
          </div> : null}
        <div aria-label={props.useTintableScene ? `${props.editEnabled ? intl.formatMessage({ id: 'RENAME' }) : intl.formatMessage({ id: 'SHOW' })}${props.sceneData.sceneMetadata.name}` : `${props.editEnabled ? intl.formatMessage({ id: 'RENAME' }) : intl.formatMessage({ id: 'SHOW' })}${props.sceneData.name}`} ref={ref} role='button' tabIndex='0' className={sceneFrameClassName} onClick={selectScene} onKeyDown={handleKeyDown} onMouseDown={mouseDownHandler} >
          <div className={paneClassName}>
            {!props.useTintableScene ? <div className={thumbnailClassName} style={{ width: `${props.width || FIXED_WIDTH}${props.isImgWidthPixel ? `px` : `%`}`, height: `${props.height || FIXED_HEIGHT}px` }}>
              {thumbnailUrl ? <img style={{ width: `${props.width || FIXED_WIDTH}${props.isImgWidthPixel ? `px` : `%`}` }} src={thumbnailUrl} alt={`${intl.formatMessage({ id: 'MY_IDEAS.PREVIEW' })}: ${props.sceneData.name}`} /> : <CircleLoader />}
            </div> : null}
            {props.useTintableScene ? <div className={thumbnailClassName} style={{ width: `${props.width || FIXED_WIDTH}${props.isImgWidthPixel ? `px` : `%`}`, height: `${props.height || FIXED_HEIGHT}px` }}>
              <StaticTintScene
                colors={getColorsFromMetadata(props.sceneData.sceneMetadata.scene.surfaces)}
                scene={props.sceneData.scene}
                statuses={props.sceneData.sceneMetadata.scene.surfaces}
                config={{ isNightScene: props.sceneData.sceneMetadata.scene.variant === SCENE_VARIANTS.NIGHT, type: props.sceneData.sceneMetadata.scene.sceneFetchType }}
                isSavedScene />
            </div> : null}
            <div className={colorsClassName}>
              {createColors(props.sceneData, props.useTintableScene, colorMap)}
            </div>
          </div>
        </div>
        {!props.hideSceneName ? <div className={sceneLabelClassName}>
          {props.useTintableScene ? props.sceneData.sceneMetadata.name : props.sceneData.name}
        </div> : null}
      </div>
    </div>
  )
}

export default forwardRef(SavedScene)
