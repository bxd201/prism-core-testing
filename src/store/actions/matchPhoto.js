// @flow
import type { ImageDimensions } from '../../shared/types/lib/CVWTypes'

export const SET_IMAGE_FOR_MATCH_PHOTO = 'SET_IMAGE_FOR_MATCH_PHOTO'
export const setImageForMatchPhoto = (url: string) => {
  return {
    type: SET_IMAGE_FOR_MATCH_PHOTO,
    payload: url
  }
}

export const SET_IMAGE_DIMS_FOR_MATCH_PHOTO = 'SET_IMAGE_DIMS_FOR_MATCH_PHOTO'
export const setImageDimsForMatchPhoto = (imageDims: ImageDimensions) => {
  return {
    type: SET_IMAGE_DIMS_FOR_MATCH_PHOTO,
    payload: imageDims
  }
}
