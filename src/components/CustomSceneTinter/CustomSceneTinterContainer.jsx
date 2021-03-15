// @flow
// eslint-disable-next-line no-unused-vars
import React, { useEffect, useRef, useState } from 'react'
import type { PaintSceneWorkspace } from '../../store/actions/paintScene'
import type { Color } from '../../shared/types/Colors'
import { FormattedMessage, useIntl } from 'react-intl'
import SimpleTintableScene from './SimpleTintableScene'
import { SCENE_TYPES, SCENE_VARIANTS } from '../../constants/globals'
import useColors from '../../shared/hooks/useColors'
import { useDispatch, useSelector } from 'react-redux'
import ImageQueue from '../MergeCanvas/ImageQueue'
import CircleLoader from '../Loaders/CircleLoader/CircleLoader'
import uniqueId from 'lodash/uniqueId'
import { setShowEditCustomScene } from '../../store/actions/scenes'
import { useHistory } from 'react-router-dom'
import DynamicModal from '../DynamicModal/DynamicModal'
import {
  saveMasks,
  showSavedCustomSceneSuccessModal,
  showSaveSceneModal,
  startSavingMasks
} from '../../store/actions/persistScene'
import { StaticTintScene } from '../CompareColor/StaticTintScene'
import { getLABFromColor } from '../PaintScene/PaintSceneUtils'
import { createCustomSceneMetadata } from '../../shared/utils/legacyProfileFormatUtil'
import { SurfaceSelector } from '../SurfaceSelector/SurfaceSelector'

import './CustomSceneTinter.scss'

type CustomSceneTinterContainerProps = {
  workspace: PaintSceneWorkspace,
  allowEdit: boolean,
  // A change in wrapper width indicates a resize
  wrapperWidth: number,
  angle: number,
  originalIsPortrait: boolean
}

const customSceneTinterClass = 'custom-scene-tinter'
const customSceneTinterSpinnerClass = `${customSceneTinterClass}__spinner`
const customSceneTinterModalClass = `${customSceneTinterClass}__modal`
const customSceneTinterModalButtonClass = `${customSceneTinterModalClass}__btn`
const customSceneTinterModalTextClass = `${customSceneTinterModalClass}__text`
const customSceneTinterSurfaceSelectorWrapper = `${customSceneTinterClass}__surface-selector`

export const createPseudoScene = (bgImage: string, maskRef: any[], colorMap: any, width: number, height: number) => {
  let surfacePaths = maskRef && maskRef.current ? maskRef.current.map(item => item.src) : []
  const surfaces = surfacePaths.map((sp: string, i: number) => {
    const surface = {
      id: i,
      mask: {
        path: sp
      },
      colorId: colorMap[`${i}`]
    }

    return surface
  })
  const scene = {
    // Default to day
    variant_names: [SCENE_VARIANTS.DAY],
    variants: [{
      surfaces,
      variant_name: SCENE_VARIANTS.DAY,
      // @todo make this a const maybe? -RS
      name: '',
      normalizedImageValueCurve: '',
      image: bgImage,
      // @todo may not need thumb -RS
      thumb: bgImage
    }],
    id: uniqueId('cs_'),
    width,
    height
  }

  return scene
}

export const createPseudoSceneMetaData = (scene, lpColors: Color[], variant: string, singleSurfaceIndex?: number) => {
  const variantId = scene.variant_names.findIndex(item => item === variant)
  const sceneMetaData = {
    variant,
    id: scene.id,
    surfaces: scene.variants[variantId].surfaces.map((surface, i) => {
      return {
        id: surface.id,
        color: lpColors.find((color) => color.id === surface.colorId)
      }
    }).filter((item, i) => {
      // This basically splits a multi surface scene into multiple single surface scenes
      if (singleSurfaceIndex !== void (0)) {
        return i === singleSurfaceIndex
      }

      return true
    })
  }

  return sceneMetaData
}

const CustomSceneTinterContainer = (props: CustomSceneTinterContainerProps) => {
  const intl = useIntl()
  const dispatch = useDispatch()
  const history = useHistory()
  const [imagesLoaded, setImagesLoaded] = useState(0)
  const showEditModal = useSelector(state => state['showEditCustomScene'])
  const [colors] = useColors()
  const livePaletteColors = useSelector(state => state['lp'])
  const maskImageRef = useRef([])
  const showSaveSceneModalFlag = useSelector(state => state['showSaveSceneModal'])
  const [livePaletteColorCount, setLivePaletteColorCount] = useState(0)
  const isSavingMask = useSelector(state => state['savingMasks'])
  // @todo get actual value -RS
  const sceneCount = useSelector(state => state['sceneMetadata'].length + 1)
  // @todo - needed for surface selector comp -RS
  // eslint-disable-next-line no-unused-vars
  const previewRef = useRef()
  const [colorSurfaceMap, setColorSurfaceMap] = useState({})
  // @todo - needed for surface selector comp -RS
  // eslint-disable-next-line no-unused-vars
  const [currentSurfaceIndex, setCurrentSurfaceIndex] = useState(0)
  const showSavedConfirmModalFlag = useSelector(state => state['showSavedCustomSceneSuccess'])
  const { workspace, allowEdit, wrapperWidth, angle, originalIsPortrait } = props

  const [wrapperWidthVal, setWrapperWidthVal] = useState(wrapperWidth)

  // eslint-disable-next-line no-unused-vars
  const { height, width, sceneName, bgImageUrl: background, surfaces } = workspace

  const [imageHeight, setImageHeight] = useState(height)
  const [imageWidth, setImageWidth] = useState(width)

  useEffect(() => {
    dispatch(setShowEditCustomScene(true))
  }, [])

  useEffect(() => {
    console.log(`Width param: ${wrapperWidth} :: Width state: ${wrapperWidthVal}`)
    // calc diff in width change
    const widthDiffPct = wrapperWidth / wrapperWidthVal
    // separate cases for portrait vs vertical images
    let newImageWidth = 0
    let newImageHeight = 0

    if ((originalIsPortrait && (Math.abs(angle) / 90 % 2)) || (!originalIsPortrait && !(Math.abs(angle) / 90 % 2))) {
      // handle og portrait turned on its side
      newImageWidth = wrapperWidth
      newImageHeight = Math.floor(newImageWidth * (height / width))
    } else {
      newImageWidth = Math.floor(imageWidth * widthDiffPct)
      newImageHeight = Math.floor(newImageWidth * (height / width))
    }

    setImageWidth(newImageWidth)
    setImageHeight(newImageHeight)
    setWrapperWidthVal(wrapperWidth)
  }, [wrapperWidth, wrapperWidthVal, imageWidth, angle])

  useEffect(() => {
    if (livePaletteColors) {
      setLivePaletteColorCount(livePaletteColors.length)
      const colorMap = {}
      for (let i = 0; i < props.workspace.layers.length; i++) {
        // This absolutely needs to be rethought after the color selector flow is designed. -RS
        const layerColor = i === 0 ? livePaletteColors.activeColor.id : livePaletteColors.colors[i].id
        colorMap[`${i}`] = layerColor
      }
      setColorSurfaceMap(colorMap)
      console.log('color map', colorMap)
    }
  }, [livePaletteColors])

  useEffect(() => {
    return function () {
      maskImageRef.current.length = 0
    }
  }, [maskImageRef, surfaces])

  const surfaceIds = surfaces.map((surface: string, i: number) => i)
  const handleSurfaceLoaded = (e, i) => {
    maskImageRef.current.push(e.target)
    setImagesLoaded(maskImageRef.current.length)
  }

  const getActiveColorId = (lpColor) => {
    if (lpColor && lpColor.activeColor) {
      return lpColor.activeColor.id
    }

    return null
  }

  const isReadyToTint = (imagesLoaded: number, livePaletteColors?: Color[], surfaces: string[]) => {
    return imagesLoaded && colors && livePaletteColors && livePaletteColors.colors.length && imagesLoaded === surfaces.length
  }

  const hideEditModal = (e: SyntheticEvent) => {
    e.preventDefault()
    dispatch(setShowEditCustomScene(false))
  }

  const editMask = (e: SyntheticEvent) => {
    e.preventDefault()
    dispatch(setShowEditCustomScene(false))
    history.push('/active/masking')
  }

  const hideSaveSceneModal = () => {
    dispatch(showSaveSceneModal(false))
  }

  const saveSceneFromModal = (e: SyntheticEvent, sceneName: string) => {
    const { bgImageUrl, width, height, layers, uid } = workspace
    console.log('event', e)
    if (sceneName.trim() === '') {
      return false
    }

    hideSaveSceneModal(sceneName)
    dispatch(startSavingMasks(sceneName))
    const colorList = Object.keys(colorSurfaceMap).sort().map(colorKey => livePaletteColors.colors.find(color => color.id === colorSurfaceMap[colorKey]))
    const labColorList = colorList.map(color => getLABFromColor(color))
    const lpColorIds = livePaletteColors.colors.map(color => color.id)
    const metaData = createCustomSceneMetadata('TEMP_NAME', sceneName, uid, colorList, width, height, lpColorIds)
    dispatch(saveMasks(labColorList, layers, bgImageUrl, metaData))
  }

  const hideSavedConfirmModal = (e: SyntheticEvent) => {
    e.preventDefault()
    dispatch(showSavedCustomSceneSuccessModal(false))
  }

  const getPreviewData = (workspace: PaintSceneWorkspace, maskRef: any[], lpColors: Color[]) => {
    const { bgImageUrl, width, height } = workspace
    const scene = createPseudoScene(bgImageUrl, maskRef, colorSurfaceMap, width, height)
    const { surfaces: sceneStatus } = createPseudoSceneMetaData(scene, lpColors, SCENE_VARIANTS.DAY)
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
      <StaticTintScene scene={scene} statuses={sceneStatus} config={{ isNightScene: false }} />
      <div style={{ display: 'flex', marginTop: '1px' }}>{livePaletteColorsDiv}</div>
    </>
  }

  return (
    <div>
      <ImageQueue dataUrls={surfaces} addToQueue={handleSurfaceLoaded} />
      <div className={customSceneTinterClass}>
        {isSavingMask ? <div className={customSceneTinterSpinnerClass}><CircleLoader /></div> : null}
        {/* this is the loader that appears when saving a mask */}
        {/* Save scene confirm modal */}
        {showSaveSceneModalFlag && livePaletteColorCount !== 0 ? <DynamicModal
          actions={[
            { text: intl.formatMessage({ id: 'SAVE_SCENE_MODAL.SAVE' }), callback: saveSceneFromModal },
            { text: intl.formatMessage({ id: 'SAVE_SCENE_MODAL.CANCEL' }), callback: hideSaveSceneModal }
          ]}
          previewData={getPreviewData(workspace, maskImageRef, livePaletteColors.colors)}
          height={imageHeight}
          allowInput
          inputDefault={`${intl.formatMessage({ id: 'SAVE_SCENE_MODAL.DEFAULT_DESCRIPTION' })} ${sceneCount}`} /> : null}
        {showSaveSceneModalFlag && livePaletteColorCount === 0 ? <DynamicModal
          actions={[
            { text: intl.formatMessage({ id: 'SAVE_SCENE_MODAL.CANCEL' }), callback: hideSaveSceneModal }
          ]}
          description={intl.formatMessage({ id: 'SAVE_SCENE_MODAL.UNABLE_TO_SAVE_WARNING' })}
          height={imageHeight} /> : null}
        { /* ---------- Saved notification modal ---------- */ }
        { showSavedConfirmModalFlag ? <DynamicModal
          actions={[
            { text: intl.formatMessage({ id: 'PAINT_SCENE.OK_DISMISS' }), callback: hideSavedConfirmModal }
          ]}
          description={intl.formatMessage({ id: 'PAINT_SCENE.SCENE_SAVED' })}
          height={imageHeight} /> : null}
        { isReadyToTint(imagesLoaded, livePaletteColors, surfaces)
          ? <SimpleTintableScene
            colors={livePaletteColors.colors}
            activeColorId={getActiveColorId(livePaletteColors)}
            surfaceUrls={surfaces}
            surfaceIds={surfaceIds}
            width={imageWidth}
            allowEdit={allowEdit}
            height={imageHeight}
            sceneName={sceneName}
            sceneType={SCENE_TYPES.ROOM}
            background={background}
            isUsingWorkspace />
          : <CircleLoader />}
        { isReadyToTint(imagesLoaded, livePaletteColors, surfaces) && allowEdit && showEditModal ? <div className={`${customSceneTinterModalClass}`}>
          <div className={customSceneTinterModalTextClass}>
            <FormattedMessage id={'SCENE_TINTER.FEEDBACK_MESSAGE'} />
            <button className={customSceneTinterModalButtonClass} onClick={editMask}>
              <FormattedMessage id={'SCENE_TINTER.FEEDBACK_CONFIRM'} />
            </button>
            <button className={customSceneTinterModalButtonClass} onClick={hideEditModal}>
              <FormattedMessage id={'SCENE_TINTER.FEEDBACK_CANCEL'} />
            </button>
          </div>
        </div> : null }
      </div>
      <div className={customSceneTinterSurfaceSelectorWrapper}>
        { isReadyToTint(imagesLoaded, livePaletteColors, surfaces)
          ? <SurfaceSelector
            workspace={workspace}
            maskRef={maskImageRef}
            lpColors={livePaletteColors.colors}
            colorSurfaceMap={colorSurfaceMap} />
          : null }
      </div>
    </div>
  )
}

export default CustomSceneTinterContainer
