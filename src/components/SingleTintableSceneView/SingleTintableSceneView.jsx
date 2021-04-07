/* eslint-disable */
/**
 * This component renders a single variant at a time and allows a user to paint the surfaces of the image.
 * If multiple variants are specified it will display a variant selector that will allow a user to switch between them.
 */
// @flow

/**
 * @todo this component still needs app level integration so that it can retint when a user adds a new color. -RS
 */
import React, { useEffect, useState } from 'react'
import type { FlatScene, FlatVariant } from '../../store/actions/loadScenes'
import type { Color } from '../../shared/types/Colors'
import SimpleTintableScene from '../CustomSceneTinter/SimpleTintableScene'
import CircleLoader from '../Loaders/CircleLoader/CircleLoader'
import { useSelector } from 'react-redux'
import useColors from '../../shared/hooks/useColors'
import { DndProvider } from 'react-dnd-cjs'
import HTML5Backend from 'react-dnd-html5-backend-cjs'

import './SingleTinatbleSceneView.scss'

export type SingleTintableSceneViewProps = {
  // sceneVariants: FlatVariant[],
  // palette: Color[]
}

const tintableViewBaseClassName = 'tintable-view'

const getPlaceholderHeight = () => {

}

const SingleTintableSceneView = (props: SingleTintableSceneViewProps) => {
  // By default use the first variant
  // const { sceneVariants, palette } = props

  const [variantsCollection, scenesCollection, selectedSceneUid] = useSelector(store => [store.variantsCollection, store.scenesCollection, store.selectedSceneUid])
  const [selectedScene, setSelectedScene] = useState(null)
  const [selectedVariantIndex, setSelectedVariantIndex] = useState(0)
  const [sceneVariants, setSceneVariants] = useState([])
  const [backgroundImageUrl, setBackgroundImageUrl] = useState(null)
  const [backgroundLoaded, setBackgroundLoaded] = useState(false)
  const [selectedColor, setSelectedColor] = useState(null)
  const [surfaceColors, setSurfaceColors] = useState([])
  const colors = useColors()
  const livePaletteColors = useSelector(state => state['lp'])

  useEffect(() => {
    // Set up defaults after we have ensured they have loaded
    if (selectedSceneUid && !sceneVariants.length) {
      const variants = variantsCollection.filter(variant => variant.sceneUid === selectedSceneUid)
      const { image, surfaces } = variants[selectedVariantIndex]
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

  const handleBackgroundLoaded = (e: SyntheticEvent) => {
    setBackgroundLoaded(true)
  }

  const getTintableScene = (variant: FlatVariant, scene: FlatScene, colors: Color[], lpColors) => {

    const surfaceUrls = []
    const surfaceIds = []
    const highlights = []
    const shadows = []
    const surfaceHitAreas = []

    variant.surfaces.forEach((surface => {
      const { surfaceBlobUrl, id, highlight, hitArea, imageValueCurve, shadow } = surface
      surfaceUrls.push(surfaceBlobUrl || null)
      surfaceIds.push(id || null)
      highlights.push(highlight || null)
      surfaceHitAreas.push(hitArea || null)
      shadows.push(shadow || null)
    }))

    const handleSurfaceInteraction = (surfaceIndex: number) => {
      const activeColor = lpColors?.activeColor

      if(activeColor) {
        const { brandKey, id, colorNumber, red, blue, green, hex, lab: { L, A, B } } = activeColor
        const newSurfaceColors = surfaceColors.map((color, i) => {
          const newColor = color ? {...color } : null
          return surfaceIndex === i ? { brandKey, id, colorNumber, red, blue, green, L, A, B, hex } : newColor
        } )
        setSurfaceColors(newSurfaceColors)
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
      />
      )
  }

  return (
    <DndProvider backend={HTML5Backend}>
      <div className={`${tintableViewBaseClassName}-wrapper`}>
        {backgroundImageUrl && colors ? <img style={{ visibility: 'hidden', display: 'none' }} src={backgroundImageUrl} onLoad={handleBackgroundLoaded} /> : null}
        {backgroundLoaded ? getTintableScene(sceneVariants[selectedVariantIndex], selectedScene, surfaceColors, livePaletteColors) : <div className={`${tintableViewBaseClassName}-loader-wrapper`}><CircleLoader /></div>}
        {backgroundLoaded ? <button style={{ padding: '8px', border: '#000 1px solid', position: 'absolute', top: 20, left: 20, background: 'rgba(255, 255, 255, 50%)' }} onClick={(e) => {
          if (sceneVariants?.length && selectedVariantIndex + 1 < sceneVariants.length) {
            return setSelectedVariantIndex(selectedVariantIndex + 1)
          }
          return setSelectedVariantIndex(0)
        }}>test button</button> : null}
      </div>
    </DndProvider>
  )
}

export default SingleTintableSceneView
