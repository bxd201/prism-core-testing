// @flow
import React, { useEffect, useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { useIntl } from 'react-intl'
import ImagePreloader from '../../helpers/ImagePreloader'
import type { Color } from '../../shared/types/Colors.js.flow'
import type { Scene, Surface, Variant, SurfaceStatus } from '../../shared/types/Scene'
import memoizee from 'memoizee'
import flattenDeep from 'lodash/flattenDeep'
import { SCENE_TYPES } from 'constants/globals'
import TintableScene from '../SceneManager/TintableScene'
import { loadColors } from '../../store/actions/loadColors'
import ConfigurationContext from '../../contexts/ConfigurationContext/ConfigurationContext'

type PropsType = {
  color: Color,
  scene: Scene,
  isCompareColor?: boolean,
  statuses?: SurfaceStatus[],
  config: Object,
  isSavedScene?: boolean
}

export const StaticTintScene = (props: PropsType) => {
  const { brandId } = React.useContext(ConfigurationContext)
  const tintColor: Color = props.color /* the color this particular scene is being tinted to */
  const chosenScene: Scene = props.scene /* the scene you're using */
  const nightSceneIndex = props.config && props.config.isNightScene ? 1 : 0
  const sceneType = props.config && props.config.type ? props.config.type : SCENE_TYPES.ROOM
  const defaultSceneVariantName: string = chosenScene.variant_names[nightSceneIndex]
  const defaultSceneVariant: Variant[] = chosenScene.variants.filter((variant) => {
    return variant && variant.variant_name === defaultSceneVariantName
  })
  const dispatch = useDispatch()
  const { locale } = useIntl()
  useEffect(() => { dispatch(loadColors(brandId, { language: locale })) }, [])
  const allColors = useSelector(state => state.colors.items.colorMap)
  const surfaces: Surface[] = defaultSceneVariant[0].surfaces
  const [surfacePromise, setSurfacePromise] = useState(props.isSavedScene ? null : surfaces)
  useEffect(() => {
    if (props.isSavedScene) {
      const sceneVariantSurfacesLoadingPromise = surfaces.map(surface => surface.mask._loadingPromise)
      Promise.all([...sceneVariantSurfacesLoadingPromise]).then(result => {
        const resultSurfaces = surfaces.map((surface, index) => {
          return {
            ...surface,
            mask: {
              ...surface.mask,
              path: result[index]
            }
          }
        })
        setSurfacePromise(resultSurfaces)
      }).catch(error => {
        console.log('Error loading promise for scene surfaces', error)
        setSurfacePromise(surfaces)
      })
    }
  }, [props.isSavedScene])
  const surfaceStatuses: SurfaceStatus[] = props.statuses ? props.statuses : surfaces.map((surface: Surface) => {
    const key = surface.colorId && ((surface.colorId).toString())
    if (allColors) {
      return {
        id: surface.id,
        color: tintColor || (tintColor === void (0) ? allColors[key] : '')
      }
    }
  })

  const getThumbnailAssetArrayByScene = memoizee((sceneVariant: Variant, surfaces: Surface[]): string[] => {
    return flattenDeep([
      sceneVariant.thumb,
      surfaces.map(surface => surface.shadows),
      surfaces.map(surface => surface.mask),
      surfaces.map(surface => surface.highlights)
    ])
  })

  const sceneId = 1/* some value that will be unique for every scene */

  return (
    surfacePromise && <ImagePreloader preload={getThumbnailAssetArrayByScene(defaultSceneVariant, surfacePromise)}>
      {({ loading, error }) => (
        <TintableScene
          background={defaultSceneVariant[0].image}
          error={error}
          height={chosenScene.height}
          imageValueCurve={defaultSceneVariant[0].normalizedImageValueCurve}
          interactive={false} // setting to false disables interactive layer
          loading={loading}
          sceneId={sceneId}
          sceneName={defaultSceneVariant[0].name}
          surfaces={surfacePromise}
          surfaceStatus={surfaceStatuses}
          type={sceneType} // 'room', 'automotive', etc.
          width={chosenScene.width}
        />
      )}
    </ImagePreloader>
  )
}
