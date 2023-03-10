// @flow
/**
 * This component renders a single variant at a time and allows a user to paint the surfaces of the image.
 * If multiple variants are specified it will display a variant selector that will allow a user to switch between them.
 * This comp preloads comps based in a given scene.
 */

import React, { ComponentType, useEffect, useState } from 'react'
import { FormattedMessage } from 'react-intl'
import { useSelector } from 'react-redux'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { BUTTON_POSITIONS, SCENE_VARIANTS } from '../../constants/globals'
import type { Color } from '../../shared/types/Colors'
import type { FlatScene, FlatVariant } from '../../shared/types/Scene'
import { removeLastS } from '../../shared/utils/tintableSceneUtils'
import BatchImageLoader from '../MergeCanvas/BatchImageLoader'
import Propper from '../Propper/Propper'
import { CircleLoader, SimpleTintableScene } from '../ToolkitComponents'
import MultipleVariantSwitch from '../VariantSwitcher/MultipleVariantSwitch'
import { copySurfaceColors, createMiniColorFromColor } from './util'
import './SingleTinatbleSceneView.scss'

export type SingleTintableSceneViewProps = {
  surfaceColorsFromParents: Array<Color | null>,
  showClearButton?: boolean,
  customButton?: ComponentType,
  handleSurfacePaintedState?: Function,
  allowVariantSwitch?: boolean,
  interactive?: boolean,
  selectedSceneUid: string,
  scenesCollection: Array<FlatScene | void>,
  variantsCollection: Array<FlatVariant | void>,
  // This prop will only show the named variant here.
  selectedVariantName?: string,
  showThumbnail?: boolean,
  // this was added to address a css edge case where the svg needs to be auto height instead of 100%
  adjustSvgHeight?: boolean,
  buttonPosition?: string,
  customToggle?: Function,
  // If a spinner is present it will not show the circle loader
  spinner?: any
}

const tintableViewBaseClassName = 'tintable-view'

const SingleTintableSceneView = (props: SingleTintableSceneViewProps) => {
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
    spinner
  } = props
  const [selectedScene, setSelectedScene] = useState(null)
  const [sceneDims, setSceneDims] = useState({ sceneWidth: 1200, sceneHeight: 725 })
  const [selectedVariantIndex, setSelectedVariantIndex] = useState(0)
  const [sceneVariants, setSceneVariants] = useState([])
  const [backgroundLoaded, setBackgroundLoaded] = useState(false)
  const [surfaceColors, setSurfaceColors] = useState(
    surfaceColorsFromParents?.map((color) => {
      return color ? { ...color } : null
    }) || []
  )

  const [backgroundUrls, setBackgroundUrls] = useState([])
  const livePaletteColors = useSelector((state) => state.lp)
  const isScenePolluted = (paintedSurfaces) => {
    return !!paintedSurfaces.reduce((acc, curr) => (curr ? 1 : 0) + acc, 0)
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
    colors: Color[],
    lpColors,
    adjustSvg: boolean
  ) => {
    const surfaceUrls = []
    const surfaceIds = []
    const highlights = []
    const shadows = []
    const surfaceHitAreas = []

    variant.surfaces.forEach((surface) => {
      const { surfaceBlobUrl, id, highlight, hitArea, shadow } = surface
      surfaceUrls.push(surfaceBlobUrl || null)
      surfaceIds.push(id || null)
      highlights.push(highlight || null)
      surfaceHitAreas.push(hitArea || null)
      shadows.push(shadow || null)
    })

    const updateSurfaceColor = (surfaceIndex: number, selectedColor: Color) => {
      const newSurfaceColors = surfaceColors.map((color, i) => {
        if (surfaceIndex === i) {
          return selectedColor ? createMiniColorFromColor(selectedColor) : null
        }
        return color
      })

      setSurfaceColors(newSurfaceColors)
    }

    const handleSurfaceInteraction = (surfaceIndex: number) => {
      const activeColor = lpColors?.activeColor

      if (activeColor) {
        updateSurfaceColor(surfaceIndex, activeColor)
      }
    }

    const handleColorDrop = (surfaceIndex: number, color: Color) => {
      if (color) {
        updateSurfaceColor(surfaceIndex, color)
      }
    }

    const { width, height, categories } = scene
    // @todo this is technical debt, this should be localized data -RS
    const description = removeLastS(categories?.[0]) ?? ''
    const activeColorId = lpColors?.activeColor?.id

    return (
      <SimpleTintableScene
        sceneType={variant.sceneType}
        background={backgroundImageUrl}
        surfaceColors={surfaceColors}
        surfaceIds={surfaceIds}
        surfaceHitAreas={surfaceHitAreas}
        surfaceUrls={surfaceUrls}
        highlights={highlights}
        imageValueCurve={variant.normalizedImageValueCurve}
        activeColorId={activeColorId}
        shadows={shadows}
        sceneName={description}
        width={width}
        height={height}
        interactive={interactive}
        handleSurfaceInteraction={handleSurfaceInteraction}
        handleColorDrop={handleColorDrop}
        adjustSvgHeight={adjustSvg}
      />
    )
  }

  const clearSurfaces = (e: SyntheticEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setSurfaceColors(sceneVariants[selectedVariantIndex].surfaces.map((surface) => null))
  }

  const changeVariant = (e: SyntheticEvent) => {
    if (sceneVariants?.length && selectedVariantIndex + 1 < sceneVariants.length) {
      return setSelectedVariantIndex(selectedVariantIndex + 1)
    }
    return setSelectedVariantIndex(0)
  }

  type CustomButtonsProps = {
    button: Component,
    toggle: Function,
    shouldShowVariants: boolean,
    variants: FlatVariant[],
    variantIndex: number,
    position: string
  }
  const CustomButtons = ({
    button,
    toggle,
    shouldShowVariants,
    variants,
    variantIndex,
    position = BUTTON_POSITIONS.BOTTOM
  }: CustomButtonsProps) => {
    const variantsList = variants?.map((variant) => {
      return {
        icon: variant.variantName === SCENE_VARIANTS.DAY ? 'sun' : 'moon-stars'
      }
    })
    const thisVariant = variants?.length ? variants[variantIndex] : null
    const metadata = { sceneUid: thisVariant?.sceneUid, currentVariant: thisVariant?.variantName }

    const getToggle = (vIndex: number, vList: { icon: string }[], vHandler: Function, metadata: any) => {
      if (customToggle) {
        return customToggle(vIndex, vList, vHandler, metadata)
      }

      return (
        <MultipleVariantSwitch
          onChange={vHandler}
          activeVariantIndex={variantIndex}
          iconType={'fa'}
          variantsList={variantsList}
        />
      )
    }

    return (
      <div
        className={`${tintableViewBaseClassName}__buttons ${
          position === BUTTON_POSITIONS.BOTTOM ? 'bottom-0' : 'top-0'
        }`}
      >
        <div className={`${tintableViewBaseClassName}__buttons--left`}>
          {showClearButton && isScenePolluted(surfaceColors) && (
            <button className={`${tintableViewBaseClassName}__clear-areas-btn`} onClick={clearSurfaces}>
              <div className={`${tintableViewBaseClassName}__clear-areas-btn--icon`}>
                <FontAwesomeIcon icon={['fa', 'eraser']} size='lg' />
              </div>
              <FormattedMessage id='CLEAR_AREAS' />
            </button>
          )}
        </div>
        <div className={`${tintableViewBaseClassName}__buttons--right`}>
          {shouldShowVariants && getToggle(variantIndex, variantsList, changeVariant, metadata)}
          {button}
        </div>
      </div>
    )
  }
  const handleImagesLoaded = (imageRefs) => {
    setBackgroundLoaded(true)
  }

  return (
    <>
      <div className={`${tintableViewBaseClassName}__wrapper`}>
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
            vPosition={Propper.V_POSITION.CENTER}
            propSize={`${(sceneDims.sceneHeight / sceneDims.sceneWidth) * 100}%`}
          >
            {spinner || <CircleLoader />}
          </Propper>
        )}
        {backgroundLoaded && (
          <CustomButtons
            button={customButton}
            toggle={customToggle}
            shouldShowVariants={allowVariantSwitch && sceneVariants?.length > 1}
            variants={sceneVariants}
            variantIndex={selectedVariantIndex}
            position={buttonPosition}
          />
        )}
      </div>
    </>
  )
}

export default SingleTintableSceneView
