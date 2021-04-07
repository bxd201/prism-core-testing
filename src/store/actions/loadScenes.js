// @flow
import { generateBrandedEndpoint } from '../../shared/helpers/DataUtils'
import * as axios from 'axios'
import type { ScenePayload, Surface } from '../../shared/types/Scene'
import { createUniqueSceneId } from '../../shared/utils/legacyProfileFormatUtil'
import { SCENE_TYPES } from '../../constants/globals'
import flatten from 'lodash/flatten'
import flattenDeep from 'lodash/flattenDeep'
import cloneDeep from 'lodash/cloneDeep'
import { SET_SELECTED_SCENE_UID } from '../reducers/scenes'
import ensureFullyQualifiedAssetUrl from '../../shared/utils/ensureFullyQualifiedAssetUrl.util'

export const SYSTEM_ERROR = 'SYSTEM_ERROR'
export const SCENES_DATA_FETCHED = 'SCENES_DATA_FETCHED'
export const SET_VARIANTS_COLLECTION = 'SET_VARIANTS_COLLECTION'
export const SET_VARIANTS_LOADING = 'SET_VARIANTS_LOADING'

export const fetchRemoteScenes = (sceneType: string, brandId: string, options: any, sceneEndPoint: string, handleSuccess: Function, handleFailure: Function, dispatch?: Function) => {
  const SCENES_URL = generateBrandedEndpoint(sceneEndPoint, brandId, options)

  if (dispatch) {
    axios.get(SCENES_URL).then(res => dispatch(handleSuccess(sceneType, res.data))).catch(err => dispatch(handleFailure(err)))
    return
  }

  axios.get(SCENES_URL).then(res => handleSuccess(sceneType, res.data)).catch(err => handleFailure(err))
}

// @todo may not need the scene type since i vectorize the scene maps. -RS
export const handleScenesFetchedForCVW = (sceneType: string, data: ScenePayload) => {
  const sceneTypes = Object.keys(SCENE_TYPES).map((sceneKey) => SCENE_TYPES[sceneKey])
  const vectorizedScenes = sceneTypes.reduce((acc, curr) => {
    return [...acc, data[curr].scenes.map(datum => {
      return {
        id: datum.id,
        width: datum.width,
        height: datum.height,
        variants: datum.variants,
        variantNames: datum.variant_names,
        sceneType: curr,
        uid: createUniqueSceneId(),
        categories: datum.category ? [...datum.category] : null
      }
    })]
  }, [])

  let flatScenes = flatten(vectorizedScenes)
  const flatVariants = getFlatVariants(flatScenes)
  // This removes the snake cased items
  flatScenes = flatScenes.map(datum => {
    return {
      id: datum.id,
      width: datum.width,
      height: datum.height,
      variantNames: datum.variantNames,
      sceneType: datum.sceneType,
      uid: datum.uid,
      categories: datum.categories
    }
  })

  return {
    type: SCENES_DATA_FETCHED,
    scenesPayload: flatScenes,
    variantsPayload: flatVariants
  }
}

export const handleScenesFetchErrorForCVW = (err: any) => {
  console.log(err)
  return {
    type: SYSTEM_ERROR,
    err: {
      message: `Error loading scene: ${err}`
    }
  }
}

export type FlatScene = {
  id: number,
  width: number,
  height: number,
  variantNames: string[],
  // variants prop is only used during transformation and should not be used at rest!
  variants?: any[] | null,
  sceneType: string,
  uid: string
}

export type FlatVariant = {
  surfaceMask: string,
  surfaceId: number,
  sceneId: number,
  variantName: string,
  sceneType: string,
  // blob urls are not currently set when initialized but after they have been loaded
  surfaces: Surface[],
  image: string,
  thumb: string,
  description: string,
  normalizedImageValueCurve: string,
  sceneCategories?: string[] | null
}
// This method gets a flat array of variants the are referential to the scene they belong to.
export const getFlatVariants = (scenes): FlatVariant => {
  // sort variant keys by abc  to ensure order
  // eslint-disable-next-line camelcase
  const variantsCollection = scenes.map(scene => {
    // eslint-disable-next-line no-unused-vars
    const { id: sceneId, sceneType, uid: sceneUid, categories } = scene
    return scene.variants.map(variant => {
      const surfaces = variant.surfaces.map(surface => {
        const newSurface = { ...surface }
        if (newSurface.hitArea) {
          newSurface.hitArea = ensureFullyQualifiedAssetUrl(newSurface.hitArea)
        }
        if (newSurface.highlights) {
          newSurface.highlights = ensureFullyQualifiedAssetUrl(newSurface.highlights)
        }

        return newSurface
      })
      const { variant_name: variantName, image, thumb, normalizedImageValueCurve, name: description } = variant

      return {
        description,
        image,
        thumb,
        sceneId, // scene ID are not unique, they can repeat by sceneType, sceneType + sceneId creates a compound key
        sceneType,
        sceneUid,
        variantName,
        surfaces,
        normalizedImageValueCurve,
        sceneCategories: categories ? [...categories] : null
      }
    })
  })

  // Handle any preprocessing required of all variants
  const variants = flattenDeep(variantsCollection, 2)
  const roomTypes = []
  variants.forEach((variant, i) => {
    const category = variant.sceneCategories ? variant.sceneCategories[0] : null
    if (variant.sceneType === SCENE_TYPES.ROOM && category && roomTypes.indexOf(category) === -1) {
      variant.isFirstOfKind = true
      roomTypes.push(category)
      return
    }

    variant.isFirstOfKind = false
  })

  roomTypes.length = 0
  return variants
}

export const setVariantsCollection = (variants: FlatVariant[]) => {
  return {
    type: SET_VARIANTS_COLLECTION,
    payload: variants
  }
}

export const setVariantsLoading = (isLoading: boolean) => {
  return {
    type: SET_VARIANTS_LOADING,
    payload: isLoading
  }
}

// @todo type surface data -RS
export const updateVariantsCollectionSurfaces = (variants: FlatVariant, surfaceData: any[], surfaceKey: string) => {
  let surfacePointer = 0

  const newVariants = cloneDeep(variants)

  newVariants.forEach((variant) => {
    variant.surfaces.forEach(surface => {
      surface[surfaceKey] = surfaceData[surfacePointer]
      surfacePointer++
    })
  })

  return newVariants
}

export const setSelectedSceneUid = (sceneUid: string | null = null) => {
  return {
    type: SET_SELECTED_SCENE_UID,
    payload: sceneUid
  }
}
