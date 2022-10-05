// @flow
// @todo I think we can remove redux (useSelector can go bye bye) from this comp, all of what it needs looks like it could comp in as a prop passed
//  by a parent that is connected to redux or has knowledge of the data. -RS
import React, { useCallback, useMemo,useState } from 'react'
import { useSelector } from 'react-redux'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { SCENE_ROLES,SCENE_TYPES, SCENE_VARIANTS } from 'constants/globals'
import intersection from 'lodash/intersection'
import WithConfigurationContext from 'src/contexts/ConfigurationContext/WithConfigurationContext'
import type { Color } from '../../../shared/types/Colors'
import { SimpleTintableScene } from '../../ToolkitComponents'
import MultipleVariantSwitch from '../../VariantSwitcher/MultipleVariantSwitch'
import './ColorDetailsScenes.scss'
type Props = {
    config: {
      brandId: string,
      featureExclusions?: string[]
    },
    intl: {
      locale: string
    },
    color?: Color,
    isMaximized?: boolean,
}
const baseClass = 'color-details-scenes'
const ColorDetailsScene = (props: Props) => {
  const scenesCollection = useSelector((state) => state.scenesCollection)
  const variantsCollection = useSelector((state) => state.variantsCollection)
  const globalCDPColor = useSelector((state) => state.globalColorDetailColor)
  const colorDetailsPageColor = props.color || globalCDPColor
  const isMaximized = props.isMaximized
  const [selectedSceneId, setSelectedSceneSceneId] = useState(() => scenesCollection.filter(scene => scene.sceneType === SCENE_TYPES.ROOM)[0].uid)
  const livePaletteColors = useSelector(state => state.lp)
  const activatedSceneVariants = useMemo(() => variantsCollection.filter((sceneVariants) => sceneVariants.sceneUid === selectedSceneId), [selectedSceneId])
  const selectedVariantName = useSelector(store => store.selectedVariantName)
  const [selectedVariantIndex, setSelectedVariantIndex] = useState(activatedSceneVariants.findIndex(variant => variant.variantName === selectedVariantName))
  const surfacesColors = activatedSceneVariants[selectedVariantIndex].surfaces.map(surface => {
    if (surface.role === SCENE_ROLES.MAIN) {
      return {
        id: colorDetailsPageColor.id,
        hex: colorDetailsPageColor.hex,
        colorNumber: colorDetailsPageColor.colorNumber,
        name: colorDetailsPageColor.name,
        variantName: selectedVariantName
      }
    }

    return null
  })

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

  const colorDetailSceneList = useMemo(() => {
    const currVariants = activatedSceneVariants[selectedVariantIndex]
    return variantsCollection.filter((item) => item.isFirstOfKind).map((item) => {
      if (item.sceneId === currVariants.sceneId) {
        return currVariants
      }
      return item
    })
  }, [selectedVariantIndex])

  const changeVariant = () => {
    if (activatedSceneVariants?.length && selectedVariantIndex + 1 < activatedSceneVariants.length) {
      return setSelectedVariantIndex(selectedVariantIndex + 1)
    }
    return setSelectedVariantIndex(0)
  }

  const getCustomButtons = (activatedSceneVariants: any[], variantIndex: number) => {
    const availableVariants = activatedSceneVariants.map(scene => scene.variantName)
    const variantsDayNight = [SCENE_VARIANTS.DAY, SCENE_VARIANTS.NIGHT]

    if (intersection(availableVariants, variantsDayNight).length === variantsDayNight.length) {
      const variantsList = [SCENE_VARIANTS.DAY, SCENE_VARIANTS.NIGHT].map(variant => {
        return {
          icon: variant === SCENE_VARIANTS.DAY ? 'sun' : 'moon-stars'
        }
      })
      return (
        <MultipleVariantSwitch onChange={changeVariant} activeVariantIndex={variantIndex} iconType={'fa'} variantsList={variantsList} />
      )
    }

    return null
  }

  return (
    <>
      <div className={`${baseClass}__scene`}>
        {getTintableScene(activatedSceneVariants[selectedVariantIndex], selectedSceneId, surfacesColors, livePaletteColors)}
        <div className={`${baseClass}__variants-btn`}>
          {getCustomButtons(activatedSceneVariants, selectedVariantIndex)}
        </div>
      </div>
      {!isMaximized &&
        <div className={`${baseClass}__block ${baseClass}__block--tabs`} role='radiogroup' aria-label='scene selector'>
          {colorDetailSceneList.map((scene, index) => {
            const activeMarker = activatedSceneVariants[selectedVariantIndex].sceneUid === scene.sceneUid
              ? (
              <FontAwesomeIcon
                icon={['fa', 'check']}
                className={`${baseClass}__flag`}
              />
                )
              : null
            return (
              <button
                key={scene.sceneUid}
                role='radio'
                aria-checked={activatedSceneVariants[selectedVariantIndex].sceneUid === scene.sceneUid}
                className={`${baseClass}__btn ${activatedSceneVariants[selectedVariantIndex].sceneUid === scene.sceneUid ? `${baseClass}__btn--active` : ''}`}
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
