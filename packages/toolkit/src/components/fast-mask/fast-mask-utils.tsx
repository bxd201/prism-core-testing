import uniqueId from 'lodash/uniqueId'
import { SCENE_TYPES, SCENE_VARIANTS } from '../../constants'
import { PreparedSurface, SceneAndVariant } from '../../types'
import { createUniqueSceneId } from '../../utils/tintable-scene'

/**
 * @param assets: string[][] - a matrix of variants where the inner vector being an order collection where
 * the first item is the variant image (background) and the following urls are surfaces.
 * @param width
 * @param height
 */
export function createScenesAndVariants(assets: string[][], width: number, height: number): SceneAndVariant {
  const sceneType = SCENE_TYPES.FAST_MASK
  const sceneUid = createUniqueSceneId()
  const sceneId = parseInt(uniqueId())
  const scene = {
    id: sceneId,
    width,
    height,
    sceneType,
    variantNames: [SCENE_VARIANTS.MAIN],
    uid: sceneUid,
    description: ''
  }

  const variants = assets.map((asset) => {
    const variant = {
      sceneType,
      sceneId,
      sceneUid,
      variantName: SCENE_VARIANTS.MAIN,
      image: asset[0],
      thumb: asset[0],
      surfaces: asset.slice(1).map((surface, i) => {
        return {
          id: i + 1,
          surfaceBlobUrl: surface
        }
      })
    }

    return variant
  })

  return {
    sceneUid,
    scenes: [scene],
    variants
  }
}

export function prepareData(
  assets: string[],
  width: number,
  height: number,
  surfaceColors,
  variantName
): PreparedSurface {
  return {
    image: assets[0],
    surfaces: assets.slice(1),
    width,
    height,
    surfaceColors: surfaceColors.map((color) => {
      return { ...color }
    }),
    variantName,
    sceneType: SCENE_TYPES.FAST_MASK
  }
}
