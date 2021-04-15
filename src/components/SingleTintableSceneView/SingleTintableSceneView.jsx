/**
 * This component renders a single variant at a time and allows a user to paint the surfaces of the image.
 * If multiple variants are specified it will display a variant selector that will allow a user to switch between them.
 */
// @flow

/**
 * @todo this component still needs app level integration so that it can retint when a user adds a new color. -RS
 */
import React, { useEffect, useState, ComponentType } from 'react'
import type { FlatScene, FlatVariant } from '../../store/actions/loadScenes'
import type { Color } from '../../shared/types/Colors'
import SimpleTintableScene from '../CustomSceneTinter/SimpleTintableScene'
import MultipleVariantSwitch from '../VariantSwitcher/MultipleVariantSwitch'
import CircleLoader from '../Loaders/CircleLoader/CircleLoader'
import { useSelector } from 'react-redux'
import useColors from '../../shared/hooks/useColors'
import { DndProvider } from 'react-dnd-cjs'
import HTML5Backend from 'react-dnd-html5-backend-cjs'

import './SingleTinatbleSceneView.scss'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { FormattedMessage, useIntl } from 'react-intl'
import { SCENE_VARIANTS } from '../../constants/globals'

export type SingleTintableSceneViewProps = {
  // sceneVariants: FlatVariant[],
  // palette: Color[]
  showClearButton?: boolean,
  customButton?: ComponentType,
  handleSurfacePaintedState?: Function,
  allowVariantSwitch?: boolean
}

const tintableViewBaseClassName = 'tintable-view'

const SingleTintableSceneView = (props: SingleTintableSceneViewProps) => {
  // By default use the first variant
  const { showClearButton, customButton, handleSurfacePaintedState, allowVariantSwitch } = props

  const [variantsCollection, scenesCollection, selectedSceneUid] = useSelector(store => [store.variantsCollection, store.scenesCollection, store.selectedSceneUid])
  const [selectedScene, setSelectedScene] = useState(null)
  const [selectedVariantIndex, setSelectedVariantIndex] = useState(0)
  const [sceneVariants, setSceneVariants] = useState([])
  const [backgroundImageUrl, setBackgroundImageUrl] = useState(null)
  const [backgroundLoaded, setBackgroundLoaded] = useState(false)
  const [surfaceColors, setSurfaceColors] = useState([])
  const colors = useColors()
  const livePaletteColors = useSelector(state => state['lp'])
  const intl = useIntl()

  const isScenePolluted = (paintedSurfaces) => {
    return !!paintedSurfaces.reduce((acc, curr) => (curr ? 1 : 0) + acc, 0)
  }

  useEffect(() => {
    // Set up defaults after we have ensured they have loaded
    if (selectedSceneUid && !sceneVariants.length) {
      const variants = variantsCollection.filter(variant => variant.sceneUid === selectedSceneUid)
      const { surfaces } = variants[selectedVariantIndex]
      setSelectedScene(scenesCollection.find(scene => scene.uid === selectedSceneUid))
      setSceneVariants(variants)
      setSurfaceColors(surfaces.map((surface, i) => null))
    }
  }, [variantsCollection, selectedSceneUid])

  useEffect(() => {
    // Handle the changing of variants
    if (sceneVariants.length) {
      const url = sceneVariants[selectedVariantIndex].image
      //  Interesting setting background loaded in hook is more consistent behavior than setting in method.
      setBackgroundLoaded(false)
      setBackgroundImageUrl(url)
    }
  }, [selectedVariantIndex, sceneVariants])

  useEffect(() => {
    // if there are any painted surfaces the scene is considered polluted
    if (handleSurfacePaintedState) {
      const isPolluted = isScenePolluted(surfaceColors)
      handleSurfacePaintedState(isPolluted)
    }
  }, [surfaceColors])

  const handleBackgroundLoaded = (e: SyntheticEvent) => {
    setBackgroundLoaded(true)
  }

  const getTintableScene = (variant: FlatVariant, scene: FlatScene, colors: Color[], lpColors) => {
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

    const updateSurfaceColor = (surfaceIndex: number, color: Color) => {
      const { brandKey, id, colorNumber, red, blue, green, hex, lab: { L, A, B } } = color
      const newSurfaceColors = surfaceColors.map((color, i) => {
        const newColor = color ? { ...color } : null
        return surfaceIndex === i ? { brandKey, id, colorNumber, red, blue, green, L, A, B, hex } : newColor
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
        interactive
        handleSurfaceInteraction={handleSurfaceInteraction}
        handleColorDrop={handleColorDrop}
      />
    )
  }

  const clearSurfaces = (e: SyntheticEvent) => {
    e.preventDefault()
    // prevent click from tinting surface
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

  return (
    <DndProvider backend={HTML5Backend}>
      <div className={`${tintableViewBaseClassName}__wrapper`}>
        {backgroundImageUrl && colors ? <img style={{ visibility: 'hidden', display: 'none' }} src={backgroundImageUrl} onLoad={handleBackgroundLoaded} alt={intl.formatMessage({ id: 'IMAGE_INVISIBLE' })} /> : null}
        {backgroundLoaded ? getTintableScene(sceneVariants[selectedVariantIndex], selectedScene, surfaceColors, livePaletteColors) : <div className={`${tintableViewBaseClassName}__loader-wrapper`}><CircleLoader /></div>}
        {backgroundLoaded && showClearButton && isScenePolluted(surfaceColors) ? <button className={`${tintableViewBaseClassName}__clear-areas-btn`} onClick={clearSurfaces}>
          <div className={`${tintableViewBaseClassName}__clear-areas-btn__icon`}><FontAwesomeIcon size='lg' icon={['fa', 'eraser']} /></div>
          <div className={`${tintableViewBaseClassName}__clear-areas-btn__text`}><FormattedMessage id='CLEAR_AREAS' /></div>
        </button> : null}
        {backgroundLoaded ? getCustomButtons(customButton, allowVariantSwitch, sceneVariants, selectedVariantIndex) : null}
      </div>
    </DndProvider>
  )
}

export default SingleTintableSceneView
