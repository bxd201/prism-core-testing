/**
 * The scene view is tightly coupled to the scene data by design. Scenes contain variants and right now we support day and night variants.
 * Ideally, the data would provide icon and label content. For now in order to support the primary toggle use case day/night this comp
 * includes the imported icon assets.  this evolved from the SceneManager -> SingleTintableScene
 */
import React, { SyntheticEvent, useEffect, useState } from 'react'
import { faEraser,faMoonStars, faSun } from '@fortawesome/pro-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { BUTTON_POSITIONS, SCENE_VARIANTS } from '../../constants'
import { Color, CustomIcon, FlatScene, FlatVariant, MiniColor } from '../../types'
import { createMiniColorFromColor } from '../../utils/tintable-scene'
import { copySurfaceColors } from '../../utils/utils'
import BatchImageLoader, { OrderedImageItem } from '../batch-image-loader/batch-image-loader'
import CircleLoader from '../circle-loader/circle-loader'
import Propper, { ProperPosition } from '../propper/propper'
import SimpleTintableScene from '../simple-tintable-scene/simple-tintable-scene'
import Toggle from '../toggle/toggle'

export const TEST_ID = 'scene-view'
export const TEST_ID_WRAPPER = `${TEST_ID}__wrapper`
export const TEST_ID_CLEAR_BTN = `${TEST_ID}__clear-areas-btn`
export const TEST_ID_ICON = `${TEST_ID}__icon`
export const TEST_ID_BTN_TXT = `${TEST_ID}__clear-areas-btn__text`
export const TEST_ID_CUST_BTN = `${TEST_ID}_custom-btn`

export interface SceneViewContent {
  clearAreaText: string
}

export interface SceneViewProps {
  surfaceColorsFromParents: Array<MiniColor | null>
  showClearButton?: boolean
  customButton?: JSX.Element
  handleSurfacePaintedState?: Function
  allowVariantSwitch?: boolean
  interactive?: boolean
  selectedSceneUid: string
  scenesCollection: FlatScene[]
  variantsCollection: FlatVariant[]
  // This prop will only show the named variant here.
  selectedVariantName?: string
  showThumbnail?: boolean
  // this was added to address a css edge case where the svg needs to be auto height instead of 100%
  adjustSvgHeight?: boolean
  buttonPosition?: string
  customToggle?: Function
  // If a spinner is present it will not show the circle loader
  spinner?: any
  livePaletteColors?: Color[]
  activeColor?: Color
  content: SceneViewContent
}

export default function SceneView(props: SceneViewProps): JSX.Element {
  const {
    showClearButton,
    customButton,
    handleSurfacePaintedState,
    allowVariantSwitch,
    interactive,
    surfaceColorsFromParents,
    selectedSceneUid,
    scenesCollection,
    variantsCollection,
    selectedVariantName,
    showThumbnail,
    adjustSvgHeight,
    buttonPosition,
    customToggle,
    spinner,
    livePaletteColors,
    content
  } = props
  const [selectedScene, setSelectedScene] = useState(null)
  const [sceneDims, setSceneDims] = useState({ sceneWidth: 1200, sceneHeight: 725 })
  const [selectedVariantIndex, setSelectedVariantIndex] = useState(0)
  const [sceneVariants, setSceneVariants] = useState([])
  const [backgroundLoaded, setBackgroundLoaded] = useState(false)
  const [surfaceColors, setSurfaceColors] = useState<Array<MiniColor | null>>(
    surfaceColorsFromParents?.map((color: MiniColor | null) => {
      return color ? { ...color } : null
    }) || []
  )

  const [backgroundUrls, setBackgroundUrls] = useState([])
  const isScenePolluted = (paintedSurfaces): boolean => {
    return !!paintedSurfaces.reduce((acc: number, curr: number) => (curr ? 1 : 0) + acc, 0)
  }

  useEffect(() => {
    if (selectedScene) {
      setSceneDims({
        sceneWidth: selectedScene.width,
        sceneHeight: selectedScene.height
      })
    }
  }, [selectedScene])

  useEffect(() => {
    // Init component internal state
    if (selectedSceneUid && variantsCollection && !backgroundUrls.length) {
      setBackgroundLoaded(false)
      let variants = variantsCollection.filter((variant) => variant.sceneUid === selectedSceneUid)
      if (selectedVariantName) {
        variants = variantsCollection.filter(
          (variant) => variant.sceneUid === selectedSceneUid && variant.variantName === selectedVariantName
        )
      }
      const { surfaces } = variants[selectedVariantIndex]
      setSelectedScene(scenesCollection.find((scene) => scene.uid === selectedSceneUid))
      setSceneVariants(variants)
      if (surfaceColors.length) {
        setSurfaceColors(surfaceColorsFromParents)
      } else {
        setSurfaceColors(surfaces.map((surface, i) => null))
      }
      const imageUrls = showThumbnail
        ? variants.map((variant) => variant.thumb)
        : variants.map((variant) => variant.image)
      setBackgroundUrls(imageUrls)
    }
  }, [scenesCollection, variantsCollection, selectedSceneUid])

  useEffect(() => {
    if (surfaceColorsFromParents) {
      setSurfaceColors(copySurfaceColors(surfaceColorsFromParents) ?? [])
    }
  }, [surfaceColorsFromParents])

  useEffect(() => {
    if (handleSurfacePaintedState && selectedSceneUid && variantsCollection?.length && sceneVariants.length) {
      const colors = copySurfaceColors(surfaceColors) ?? []
      handleSurfacePaintedState(selectedSceneUid, sceneVariants[selectedVariantIndex].variantName, colors)
    }
  }, [surfaceColors, sceneVariants, selectedSceneUid, selectedVariantIndex])

  const getTintableScene = (
    backgroundImageUrl: string,
    variant: FlatVariant,
    scene: FlatScene,
    colors: Array<Color | MiniColor | null>,
    lpColors,
    adjustSvg: boolean
  ): JSX.Element => {
    const surfaceUrls = []
    const surfaceIds = []
    const highlightUrls = []
    const shadowUrls = []
    const surfaceHitAreas = []

    variant.surfaces.forEach((surface) => {
      const { surfaceBlobUrl, id, highlights, hitArea, shadows } = surface
      surfaceUrls.push(surfaceBlobUrl || null)
      surfaceIds.push(id || null)
      highlightUrls.push(highlights || null)
      surfaceHitAreas.push(hitArea || null)
      shadowUrls.push(shadows || null)
    })

    const updateSurfaceColor = (surfaceIndex: number, selectedColor: Color): void => {
      const newSurfaceColors = surfaceColors.map((color, i) => {
        if (surfaceIndex === i) {
          return selectedColor ? createMiniColorFromColor(selectedColor) : null
        }
        return color
      })

      setSurfaceColors(newSurfaceColors)
    }

    const handleSurfaceInteraction = (surfaceIndex: number): void => {
      const activeColor = lpColors?.activeColor

      if (activeColor) {
        updateSurfaceColor(surfaceIndex, activeColor)
      }
    }

    const { width, height, description } = scene

    return (
      <SimpleTintableScene
        sceneType={variant.sceneType}
        background={backgroundImageUrl}
        surfaceColors={surfaceColors}
        surfaceIds={surfaceIds}
        surfaceHitAreas={surfaceHitAreas}
        surfaceUrls={surfaceUrls}
        highlights={highlightUrls}
        imageValueCurve={variant.normalizedImageValueCurve}
        shadows={shadowUrls}
        sceneName={description}
        width={width}
        height={height}
        interactive={interactive}
        handleSurfaceInteraction={handleSurfaceInteraction}
        adjustSvgHeight={adjustSvg}
      />
    )
  }

  const clearSurfaces = (e: SyntheticEvent): void => {
    e.preventDefault()
    e.stopPropagation()
    setSurfaceColors(sceneVariants[selectedVariantIndex].surfaces.map((surface) => null))
  }

  const changeVariant = (isOn: number): void => {
    if (sceneVariants?.length && selectedVariantIndex + 1 < sceneVariants.length) {
      return setSelectedVariantIndex(selectedVariantIndex + 1)
    }
    return setSelectedVariantIndex(0)
  }

  const getCustomButtons = (
    btn: JSX.Element | null,
    toggle: Function,
    shouldShowVariants,
    variants: FlatVariant[],
    variantIndex: number,
    position: string = BUTTON_POSITIONS.BOTTOM
  ): JSX.Element => {
    const variantsList = variants.map((variant) => {
      return {
        icon: variant.variantName === SCENE_VARIANTS.DAY ? faSun : faMoonStars
      }
    }) as [CustomIcon, CustomIcon]

    const thisVariant = variants?.length ? variants[variantIndex] : null
    const metadata = { sceneUid: thisVariant?.sceneUid, currentVariant: thisVariant?.variantName }

    const getToggle = (
      vIndex: number,
      vList: [CustomIcon, CustomIcon],
      vHandler: (isOn: number) => void
    ): JSX.Element => {
      if (customToggle) {
        return customToggle(vIndex, vList, vHandler, metadata)
      }

      return variantsList.length > 1 ? <Toggle handleToggle={vHandler} itemList={variantsList} /> : null
    }
    return (
      <div
        data-testid={TEST_ID_CUST_BTN}
        className={`flex content-center justify-center absolute right-[20px] ${
          position === BUTTON_POSITIONS.BOTTOM ? 'bottom-[20px]' : 'top-[20px]'
        }`}
      >
        <>
          {shouldShowVariants ? getToggle(variantIndex, variantsList, changeVariant) : null}
          {btn}
        </>
      </div>
    )
  }
  const handleImagesLoaded = (images: OrderedImageItem[]): void => {
    setBackgroundLoaded(true)
  }

  return (
    <>
      <div data-testid={TEST_ID_WRAPPER} className='w-100 h-auto relative'>
        <BatchImageLoader key={selectedSceneUid} urls={backgroundUrls} handleImagesLoaded={handleImagesLoaded} />
        {backgroundLoaded ? (
          getTintableScene(
            backgroundUrls[selectedVariantIndex],
            sceneVariants[selectedVariantIndex],
            selectedScene,
            surfaceColors,
            livePaletteColors,
            adjustSvgHeight
          )
        ) : (
          <Propper
            vPosition={ProperPosition.CENTER}
            propSize={`${(sceneDims.sceneHeight / sceneDims.sceneWidth) * 100}%`}
          >
            {spinner || <CircleLoader />}
          </Propper>
        )}
        {backgroundLoaded && showClearButton && isScenePolluted(surfaceColors) ? (
          <button
            data-testid={TEST_ID_CLEAR_BTN}
            className='flex content-center justify-center flex-row absolute bottom-[20px] left-[20px] bg-white text-black font-title p-2'
            onClick={clearSurfaces}
          >
            <div data-testid={TEST_ID_ICON} className='p-0.5 text-base'>
              <FontAwesomeIcon size='lg' icon={faEraser} />
            </div>
            <div data-testid={TEST_ID_BTN_TXT} className='pt-2 pb-2 pl-0.5 pr-0.5'>
              {content.clearAreaText || null}
            </div>
          </button>
        ) : null}
        {backgroundLoaded
          ? getCustomButtons(
              customButton,
              customToggle,
              allowVariantSwitch && sceneVariants?.length > 1,
              sceneVariants,
              selectedVariantIndex,
              buttonPosition
            )
          : null}
      </div>
    </>
  )
}
