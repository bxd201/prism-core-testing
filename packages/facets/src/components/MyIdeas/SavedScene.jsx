// @flow

import React, { useState, useRef, useEffect, forwardRef } from 'react'
import { useSelector } from 'react-redux'
import { useIntl } from 'react-intl'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { CircleLoader } from '../ToolkitComponents'
import MergeColors from '../MergeCanvas/MergeColors'
import PrismImage from '../PrismImage/PrismImage'
import { KEY_CODES } from 'src/constants/globals'
import { getColorInstances } from '../LivePalette/livePaletteUtility'
import type { ColorMap } from 'src/shared/types/Colors.js.flow'
import SingleTintableSceneView from '../SingleTintableSceneView/SingleTintableSceneView'

import './MyIdeas.scss'
import { SCENE_TYPE } from '../../store/actions/persistScene'
import { createScenesAndVariantsFromFastMaskWorkSpace } from '../../store/actions/fastMask'

type SavedSceneProps = {
  sceneData: Object,
  editEnabled: boolean,
  deleteScene?: Function,
  selectScene: Function,
  width: number,
  height: number,
  editIndividualScene: Function,
  hideSceneName?: boolean,
  sceneId: string,
  isImgWidthPixel?: boolean,
  sceneType: string
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

const USE_TINTABLE_SCENE_TYPES = [SCENE_TYPE.anonStock, SCENE_TYPE.anonFastMask]

const createColors = (sceneData: any, sceneType: string, colorMap: ColorMap) => {
  const getColorsBySceneType = (data: any, sceneType: string) => {
    if (sceneType === SCENE_TYPE.anonStock) {
      return data.sceneMetadata.scene.surfaceColors
    }
    // anon-stock scenes and anon fast mask use same data api but fast mask uses same tinting api as anon stock...
    return data.palette
  }
  const colors = getColorsBySceneType(sceneData, sceneType)
  const livePaletteColorsIdArray = (sceneData.sceneMetadata && sceneData.sceneMetadata.hasOwnProperty('livePaletteColorsIdArray'))
    ? sceneData.sceneMetadata.livePaletteColorsIdArray
    : sceneData.hasOwnProperty('livePaletteColorsIdArray')
      ? sceneData.livePaletteColorsIdArray
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
  const useTintableScene = USE_TINTABLE_SCENE_TYPES.indexOf(props.sceneType) > -1
  const intl = useIntl()
  let width = 0
  let height = 0
  if (props.sceneType === SCENE_TYPE.anonStock) {
    width = props.sceneData.scene.width
    height = props.sceneData.scene.height
  }

  if (props.sceneType === SCENE_TYPE.anonCustom) {
    width = props.sceneData.surfaceMasks.width
    height = props.sceneData.surfaceMasks.height
  }

  if (props.sceneType === SCENE_TYPE.anonFastMask) {
    width = props.sceneData.width
    height = props.sceneData.height
  }

  const [thumbnailUrl, setThumbnailUrl] = useState(null)
  const [backgroundImageData, setBackgroundImageData] = useState(null)
  const [backgroundImageSrc, setBackgroundImageSrc] = useState(null)
  const imageRef = useRef()
  const { items: { colorMap } }: ColorMap = useSelector(state => state.colors)

  const fastMaskSceneAndVariant = props.sceneType === SCENE_TYPE.anonFastMask ? createScenesAndVariantsFromFastMaskWorkSpace(props.sceneData) : null

  useEffect(() => {
    let backgroundImageUrl = ''
    const variant = useTintableScene && props.sceneData.variant ? props.sceneData.variant : null
    const stockSceneBackgroundUrl = variant ? variant.image : null

    if (props.sceneData.renderingBaseUrl) {
      // @todo I thought I removed this self invoking function, rewrite this -RS
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
    props.deleteScene(props.sceneId, props.sceneType)
  }

  const selectScene = (e: SyntheticEvent) => {
    if (props.editEnabled) {
      props.editIndividualScene(props.sceneData)
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
        props.editIndividualScene(props.sceneData)
      } else selectScene(e)
    }
  }

  const mouseDownHandler = (e: SyntheticEvent) => {
    e.preventDefault()
  }

  const getSceneName = (data: any, sceneType: string) => {
    if (sceneType === SCENE_TYPE.anonStock) {
      return data.sceneMetadata.name
    }

    return data.name
  }

  return (
    <div className={`${sceneClassName} ${(props.isImgWidthPixel) ? sceneIndividual : sceneCarousel}`}>
      {backgroundImageSrc && !useTintableScene
        ? <PrismImage
        ref={imageRef}
        source={backgroundImageSrc}
        loadedCallback={handleBackgroundImageLoaded}
        shouldResample={false}
        scalingWidth={width}
        width={width}
        height={height} />
        : null}
      {backgroundImageData && !useTintableScene
        ? <MergeColors
        shouldTint
        colorOpacity={0.8}
        imageDataList={[backgroundImageData, ...props.sceneData.surfaceMasks.surfaces.map(surface => surface.surfaceMaskImageData)]}
        colors={props.sceneData.palette.map(color => {
          return { r: color.red, g: color.green, b: color.blue }
        })}
        handleImagesMerged={loadThumbnail}
        width={width}
        height={height} />
        : null}
      <div className={`${sceneFrameWrapper}`}>
        {props.editEnabled
          ? <div className={editButtonClassName}>
            <button onClick={deleteScene}>
              <FontAwesomeIcon
                title={`${intl.formatMessage({ id: 'DELETE' })} ${getSceneName(props.sceneData, props.sceneType)}`}
                icon={['fal', 'trash-alt']}
                size='sm' />
            </button>
          </div>
          : null}
        <div aria-label={`${props.editEnabled ? intl.formatMessage({ id: 'RENAME' }) : intl.formatMessage({ id: 'SHOW' })}${getSceneName(props.sceneData, props.sceneType)}`} ref={ref} role='button' tabIndex='0' className={sceneFrameClassName} onClick={selectScene} onKeyDown={handleKeyDown} onMouseDown={mouseDownHandler} >
          <div className={paneClassName}>
            {!useTintableScene
              ? <div className={thumbnailClassName} style={{ width: `${props.width || FIXED_WIDTH}${props.isImgWidthPixel ? 'px' : '%'}`, height: `${props.height || FIXED_HEIGHT}px` }}>
              {thumbnailUrl ? <img style={{ width: `${props.width || FIXED_WIDTH}${props.isImgWidthPixel ? 'px' : '%'}` }} src={thumbnailUrl} alt={`${intl.formatMessage({ id: 'MY_IDEAS.PREVIEW' })}: ${props.sceneData.name}`} /> : <CircleLoader />}
            </div>
              : null}
            {useTintableScene && (props.sceneData?.variant || fastMaskSceneAndVariant?.variant)
              ? <div className={thumbnailClassName} style={{ width: `${props.width || FIXED_WIDTH}${props.isImgWidthPixel ? 'px' : '%'}`, height: `${props.height || FIXED_HEIGHT}px` }}>
              <SingleTintableSceneView
                surfaceColorsFromParents={props.sceneType === SCENE_TYPE.anonStock ? props.sceneData.sceneMetadata.scene.surfaceColors : props.sceneData.palette}
                selectedSceneUid={props.sceneType === SCENE_TYPE.anonStock ? props.sceneData.variant.sceneUid : fastMaskSceneAndVariant.scene.uid}
                scenesCollection={props.sceneType === SCENE_TYPE.anonStock ? [props.sceneData.scene] : [fastMaskSceneAndVariant.scene]}
                variantsCollection={props.sceneType === SCENE_TYPE.anonStock ? [props.sceneData.variant] : [fastMaskSceneAndVariant.variant]}
                showThumbnail
              />
            </div>
              : null}
            <div className={colorsClassName}>
              {createColors(props.sceneData, props.sceneType, colorMap)}
            </div>
          </div>
        </div>
        {!props.hideSceneName
          ? <div className={sceneLabelClassName}>
          {getSceneName(props.sceneData, props.sceneType)}
        </div>
          : null}
      </div>
    </div>
  )
}

export default forwardRef(SavedScene)
