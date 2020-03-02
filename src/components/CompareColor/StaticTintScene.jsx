// @flow
import React from 'react'
import ImagePreloader from '../../helpers/ImagePreloader'
import type { Color } from '../../shared/types/Colors.js.flow'
import type { Scene, Surface, Variant, SurfaceStatus } from '../../shared/types/Scene'
import memoizee from 'memoizee'
import flattenDeep from 'lodash/flattenDeep'
import { SCENE_TYPES } from 'constants/globals'
import TintableScene from '../SceneManager/TintableScene'

type PropsType = {
  color: Color,
  scene: Scene
}

export const StaticTintScene = (props: PropsType) => {
  const tintColor: Color = props.color /* the color this particular scene is being tinted to */
  const chosenScene: Scene = props.scene /* the scene you're using */
  const defaultSceneVariantName: string = chosenScene.variant_names[0]
  const defaultSceneVariant: Variant[] = chosenScene.variants.filter((variant) => {
    return variant && variant.variant_name === defaultSceneVariantName
  })
  const surfaces: Surface[] = defaultSceneVariant[0].surfaces
  const surfaceStatuses: SurfaceStatus[] = surfaces.map((surface: Surface) => {
    return {
      id: surface.id,
      color: tintColor
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
    <ImagePreloader preload={getThumbnailAssetArrayByScene(defaultSceneVariant, surfaces)}>
      {({ loading, error }) => (
        <TintableScene
          background={defaultSceneVariant[0].thumb}
          error={error}
          height={chosenScene.height}
          interactive={false} // setting to false disables interactive layer
          loading={loading}
          sceneId={sceneId}
          sceneName={defaultSceneVariant[0].name}
          surfaces={surfaces}
          surfaceStatus={surfaceStatuses}
          type={SCENE_TYPES.ROOM} // 'room', 'automotive', etc.
          width={chosenScene.width}
        />
      )}
    </ImagePreloader>
  )
}
