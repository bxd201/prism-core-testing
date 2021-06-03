// @flow
/**
 * This component renders a single variant at a time and allows a user to paint the surfaces of the image.
 * If multiple variants are specified it will display a variant selector that will allow a user to switch between them.
 * This comp preloads comps based in a given scene.
 */

import React, { useEffect, useState, ComponentType } from 'react'
import type { Color } from '../../shared/types/Colors'
import SimpleTintableScene from '../SimpleTintableScene/SimpleTintableScene'
import MultipleVariantSwitch from '../VariantSwitcher/MultipleVariantSwitch'
import CircleLoader from '../Loaders/CircleLoader/CircleLoader'
import { useSelector } from 'react-redux'
import { DndProvider } from 'react-dnd-cjs'
import HTML5Backend from 'react-dnd-html5-backend-cjs'
import { FormattedMessage } from 'react-intl'
import './SingleTinatbleSceneView.scss'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { SCENE_VARIANTS } from '../../constants/globals'
import BatchImageLoader from '../MergeCanvas/BatchImageLoader'
import type { FlatScene, FlatVariant } from '../../shared/types/Scene'
import { copySurfaceColors, createMiniColorFromColor } from './util'
export type SingleTintableSceneViewProps = {
  surfaceColorsFromParents: [],
  showClearButton?: boolean,
  customButton?: ComponentType,
  handleSurfacePaintedState?: Function,
  allowVariantSwitch?: boolean,
  interactive?: boolean,
  selectedSceneUid: string,
  scenesCollection: FlatScene,
  variantsCollection: FlatVariant,
  selectedVariantName?: string,
  showThumbnail?: boolean
}

const tintableViewBaseClassName = 'tintable-view'

const SingleTintableSceneView = (props: SingleTintableSceneViewProps) => {
  const { showClearButton, customButton, handleSurfacePaintedState, allowVariantSwitch, interactive,
    surfaceColorsFromParents, selectedSceneUid, scenesCollection, variantsCollection, selectedVariantName, showThumbnail } = props
  const [selectedScene, setSelectedScene] = useState(null)
  const [selectedVariantIndex, setSelectedVariantIndex] = useState(0)
  const [sceneVariants, setSceneVariants] = useState([])
  const [backgroundLoaded, setBackgroundLoaded] = useState(false)
  const [surfaceColors, setSurfaceColors] = useState(surfaceColorsFromParents?.map(color => {
    return color ? { ...color } : null
  }) || [])
  const [backgroundUrls, setBackgroundUrls] = useState([])
  const livePaletteColors = useSelector(state => state['lp'])
  const isScenePolluted = (paintedSurfaces) => {
    return !!paintedSurfaces.reduce((acc, curr) => (curr ? 1 : 0) + acc, 0)
  }

  useEffect(() => {
    if (surfaceColorsFromParents) {
      setSurfaceColors(copySurfaceColors(surfaceColorsFromParents) ?? [])
    }
  }, [surfaceColorsFromParents])

  useEffect(() => {
    // Inti component internal state
    if (selectedSceneUid && variantsCollection && !backgroundUrls.length) {
      setBackgroundLoaded(false)
      let variants = variantsCollection.filter(variant => variant.sceneUid === selectedSceneUid)
      if (selectedVariantName) {
        variants = variantsCollection.filter(variant => variant.sceneUid === selectedSceneUid && variant.variantName === selectedVariantName)
      }
      const { surfaces } = variants[selectedVariantIndex]
      setSelectedScene(scenesCollection.find(scene => scene.uid === selectedSceneUid))
      setSceneVariants(variants)
      if (!surfaceColors.length) {
        setSurfaceColors(surfaces.map((surface, i) => null))
      }
      const imageUrls = showThumbnail ? variants.map(variant => variant.thumb) : variants.map(variant => variant.image)
      setBackgroundUrls(imageUrls)
    }
  }, [scenesCollection, variantsCollection, selectedSceneUid])

  useEffect(() => {
    if (handleSurfacePaintedState && selectedSceneUid && variantsCollection?.length && sceneVariants.length) {
      const colors = copySurfaceColors(surfaceColors) ?? []
      handleSurfacePaintedState(selectedSceneUid, sceneVariants[selectedVariantIndex].variantName, colors)
    }
  }, [surfaceColors, sceneVariants, selectedSceneUid, selectedVariantIndex])

  const getTintableScene = (backgroundImageUrl: string, variant: FlatVariant, scene: FlatScene, colors: Color[], lpColors) => {
    const surfaceUrls = []
    const surfaceIds = []
    const highlights = []
    const shadows = []
    const surfaceHitAreas = []

    variant.surfaces.forEach(surface => {
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

    const { width, height, description } = scene
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
      />
    )
  }

  const clearSurfaces = (e: SyntheticEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setSurfaceColors(sceneVariants[selectedVariantIndex].surfaces.map(surface => null))
  }

  const changeVariant = (e: SyntheticEvent) => {
    if (sceneVariants?.length && selectedVariantIndex + 1 < sceneVariants.length) {
      return setSelectedVariantIndex(selectedVariantIndex + 1)
    }
    return setSelectedVariantIndex(0)
  }

  const getCustomButtons = (btn: Component, shouldShowVariants, variants: FlatVariant[], variantIndex: number) => {
    const variantsList = variants.map(variant => {
      return {
        icon: variant.variantName === SCENE_VARIANTS.DAY ? 'sun' : 'moon-stars'
      }
    })
    return (
      <div className={`${tintableViewBaseClassName}__custom-btn`}>
        {shouldShowVariants ? <MultipleVariantSwitch onChange={changeVariant} activeVariantIndex={variantIndex} iconType={'fa'} variantsList={variantsList} /> : null}
        {btn}
      </div>
    )
  }
  const handleImagesLoaded = imageRefs => {
    setBackgroundLoaded(true)
  }

  return (
    <DndProvider backend={HTML5Backend}>
      <div className={`${tintableViewBaseClassName}__wrapper`}>
        <BatchImageLoader key={selectedSceneUid} urls={backgroundUrls} handleImagesLoaded={handleImagesLoaded} />
        {backgroundLoaded ? getTintableScene(backgroundUrls[selectedVariantIndex], sceneVariants[selectedVariantIndex], selectedScene, surfaceColors, livePaletteColors) : <div className={`${tintableViewBaseClassName}__loader-wrapper`}><CircleLoader /></div>}
        {backgroundLoaded && showClearButton && isScenePolluted(surfaceColors) ? <button className={`${tintableViewBaseClassName}__clear-areas-btn`} onClick={clearSurfaces}>
          <div className={`${tintableViewBaseClassName}__clear-areas-btn__icon`}><FontAwesomeIcon size='lg' icon={['fa', 'eraser']} /></div>
          <div className={`${tintableViewBaseClassName}__clear-areas-btn__text`}><FormattedMessage id='CLEAR_AREAS' /></div>
        </button> : null}
        {/* The second parameter will change to allowVariantSwitch in the final version - PM */}
        {backgroundLoaded ? getCustomButtons(customButton, allowVariantSwitch && sceneVariants?.length > 1, sceneVariants, selectedVariantIndex) : null}
      </div>
    </DndProvider>
  )
}

export default SingleTintableSceneView
