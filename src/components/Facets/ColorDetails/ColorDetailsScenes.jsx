// @flow
import React, { useEffect, useState, useCallback } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import flattenDeep from 'lodash/flattenDeep'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  fetchRemoteScenes,
  handleScenesFetchedForCVW,
  handleScenesFetchErrorForCVW
} from 'src/store/actions/loadScenes'
import { SCENES_ENDPOINT } from 'constants/endpoints'
import { SCENE_TYPES, SCENE_VARIANTS } from 'constants/globals'
import WithConfigurationContext from 'src/contexts/ConfigurationContext/WithConfigurationContext'
import SimpleTintableScene from '../../CustomSceneTinter/SimpleTintableScene'
import MultipleVariantSwitch from '../../VariantSwitcher/MultipleVariantSwitcher'
import './ColorDetailsScenes.scss'

type Props = {
    config: {
      brandId: string,
      featureExclusions?: string[]
    },
    intl: {
      locale: string
    }
}
const baseClass = 'color-details-scenes'
const ColorDetailsScene = (props: Props) => {
  const { config: { brandId, language } } = props
  const dispatch = useDispatch()
  const scenesCollection = useSelector((state) => state.scenesCollection)
  const variantsCollection = useSelector((state) => state.variantsCollection)
  const colorDetailsPageColor = useSelector((state) => state.scenes.colorDetailsPageColor)
  const [selectedSceneId, setSelectedSceneSceneId] = useState(() => scenesCollection.filter(scene => scene.sceneType === SCENE_TYPES.ROOM)[0].uid)
  const [selectedVariantIndex, setSelectedVariantIndex] = useState(0)
  const livePaletteColors = useSelector(state => state['lp'])
  useEffect(() => {
    if (!scenesCollection) {
      fetchRemoteScenes(SCENE_TYPES.ROOM, brandId, { language: language }, SCENES_ENDPOINT, handleScenesFetchedForCVW, handleScenesFetchErrorForCVW, dispatch)
    }
  })

  const activedSceneVariants = variantsCollection.filter((sceneVariants) => sceneVariants.sceneUid === selectedSceneId)
  const surfacesColors = (() => {
    const colorDetailsVariants = variantsCollection.filter(variant => variant.variantName === SCENE_VARIANTS.DAY).filter((variant) => variant.sceneId === 1)
    const surfaceColorsByVariant = flattenDeep(colorDetailsVariants?.map(variant => {
      return variant.surfaces.map(surface => {
        return {
          id: colorDetailsPageColor.id,
          hex: colorDetailsPageColor.hex,
          colorNumber: colorDetailsPageColor.colorNumber,
          name: colorDetailsPageColor.name,
          variantName: variant.variantName
        }
      })
    }))
    return surfaceColorsByVariant
  })()

  const getTintableScene = useCallback((variant: FlatVariant, selectedSceneId: FlatScene, colors: Color[], lpColors) => {
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
    const scene = scenesCollection.find(scene => scene.uid === selectedSceneId)
    const { width, height, description } = scene
    const activeColorId = lpColors?.activeColor?.id

    return (
      <SimpleTintableScene
        sceneType={variant.sceneType}
        background={variant.image}
        surfaceColors={colors}
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
        interactive={false}
      />
    )
  }, [selectedSceneId])

  const getColorDetailSceneList = () => {
    return variantsCollection.filter(variant => variant.isFirstOfKind)
  }

  const changeVariant = () => {
    if (activedSceneVariants?.length && selectedVariantIndex + 1 < activedSceneVariants.length) {
      return setSelectedVariantIndex(selectedVariantIndex + 1)
    }
    return setSelectedVariantIndex(0)
  }

  const getCustomButtons = (variantIndex: number) => {
    const variantsList = [SCENE_VARIANTS.DAY, SCENE_VARIANTS.NIGHT].map(variant => {
      return {
        icon: variant === SCENE_VARIANTS.DAY ? 'sun' : 'moon-stars'
      }
    })
    return (
      <MultipleVariantSwitch onChange={changeVariant} activeVariantIndex={variantIndex} iconType={'fa'} variantsList={variantsList} />
    )
  }

  return (
    <>
      <div className={`${baseClass}__scene`}>
        {getTintableScene(activedSceneVariants[selectedVariantIndex], selectedSceneId, surfacesColors, livePaletteColors)}
        <div className={`${baseClass}__variants-btn`}>
          {getCustomButtons(selectedVariantIndex)}
        </div>
      </div>
      {
        <div className={`${baseClass}__block ${baseClass}__block--tabs`} role='radiogroup' aria-label='scene selector'>
          {getColorDetailSceneList().map((scene, index) => {
            const activeMarker = activedSceneVariants[selectedVariantIndex].sceneUid === scene.sceneUid ? (
              <FontAwesomeIcon
                icon={['fa', 'check']}
                className={`${baseClass}__flag`}
              />
            ) : null
            return (
              <button
                key={scene.sceneUid}
                role='radio'
                aria-checked={activedSceneVariants[selectedVariantIndex].sceneUid === scene.sceneUid}
                className={`${baseClass}__btn ${activedSceneVariants[selectedVariantIndex].sceneUid === scene.sceneUid ? `${baseClass}__btn--active` : ''}`}
                onClick={() => {
                  setSelectedSceneSceneId(scene.sceneUid)
                  setSelectedVariantIndex(0)
                }
                }
                onKeyDown={e => {
                  if (e.key === 'Enter') {
                    setSelectedSceneSceneId(scene.sceneUid)
                    setSelectedVariantIndex(0)
                  }
                }}
                tabIndex={0}
              >
                <div className={`${baseClass}__thumbnails-list`}>{getTintableScene(scene, selectedSceneId, surfacesColors, livePaletteColors)}</div>
                {activeMarker}
              </button>
            )
          })}
        </div>}
    </>
  )
}

export default WithConfigurationContext(ColorDetailsScene)
