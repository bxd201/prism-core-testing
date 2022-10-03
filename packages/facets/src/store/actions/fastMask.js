// @flow

import cloneDeep from 'lodash/cloneDeep'
import type { FastMaskWorkspace } from '../../components/FastMask/FastMaskView'
import { SCENE_TYPES, SCENE_VARIANTS } from '../../constants/globals'
import type { FlatScene, FlatVariant, MiniColor, ReferenceDimensions } from '../../shared/types/Scene'
import { createUniqueSceneId } from '../../shared/utils/legacyProfileFormatUtil'

export const SET_IMAGE_FOR_FAST_MASK = 'SET_IMAGE_FOR_FAST_MASK'
export const setImageForFastMask = (imageUrl: string | null = null) => {
  return {
    type: SET_IMAGE_FOR_FAST_MASK,
    payload: imageUrl
  }
}

// ONLY CALL THIS FROM CVW FACETS, THIS IS NOT INSTANCE SAFE
export const SET_REFERENCE_DIMENSIONS_FOR_FAST_MASK = 'SET_REFERENCE_DIMENSIONS_FOR_FAST_MASK'
export const setRefsDimsForFastMask = (data: ReferenceDimensions) => {
  return {
    type: SET_REFERENCE_DIMENSIONS_FOR_FAST_MASK,
    payload: data
  }
}

export const SET_FAST_MASK_SAVE_CACHE = 'SET_FAST_MASK_SAVE_CACHE'
export const setFastMaskSaveCache = (data: FastMaskWorkspace | null = null) => {
  return {
    type: SET_FAST_MASK_SAVE_CACHE,
    payload: data
  }
}

export const imageDataToImageUrl = (imageData: ImageData) => {
  const canvas = document.createElement('canvas')
  canvas.width = imageData.width
  canvas.height = imageData.height
  const ctx = canvas.getContext('2d')
  ctx.putImageData(imageData, 0, 0)

  return canvas.toDataURL()
}

export const createScenesAndVariantsFromFastMaskWorkSpace = (fastMaskWorkspace: FastMaskWorkspace) => {
  const { surfaceMasks, backgroundImageUrl, name } = fastMaskWorkspace
  const { width, height } = surfaceMasks
  const uid = createUniqueSceneId()
  const sceneType = SCENE_TYPES.FAST_MASK

  const scene = {
    width,
    height,
    uid,
    sceneType,
    variantNames: [SCENE_VARIANTS.MAIN],
    description: name
  }

  const variant = {
    sceneUid: uid,
    sceneType,
    image: backgroundImageUrl,
    thumb: backgroundImageUrl,
    variantName: SCENE_VARIANTS.MAIN,
    surfaces: surfaceMasks.surfaces.map((surface, i) => {
      return {
        id: i + 1,
        surfaceBlobUrl: imageDataToImageUrl(surface.surfaceMaskImageData)
      }
    })
  }

  return {
    scene,
    variant,
    surfaceColors: surfaceMasks.colors.map(color => {
      return { ...color }
    }),
    palette: cloneDeep(fastMaskWorkspace.palette)
  }
}

export type FastMaskOpenCache = { scene: FlatScene, variant: FlatVariant, surfaceColors: MiniColor[] }
export const SET_FAST_MASK_OPEN_CACHE = 'SET_FAST_MASK_OPEN_CACHE'
export const setFastMaskOpenCache = (data: FastMaskOpenCache | null = null) => {
  const newData = cloneDeep(data)
  console.log('new data::', newData)
  return {
    type: SET_FAST_MASK_OPEN_CACHE,
    payload: newData
  }
}

export const SET_FAST_MASK_IS_POLLUTED = 'SET_FAST_MASK_IS_POLLUTED'
export const setFastMaskIsPolluted = (isPolluted: boolean = false) => {
  return {
    type: SET_FAST_MASK_IS_POLLUTED,
    payload: isPolluted
  }
}
