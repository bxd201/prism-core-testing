// @flow

import type { ReferenceDimensions } from '../../shared/types/Scene'

export const SET_IMAGE_FOR_FAST_MASK = 'SET_IMAGE_FOR_FAST_MASK'
export const setImageForFastMask = (imageUrl: string | null = null) => {
  return {
    type: SET_IMAGE_FOR_FAST_MASK,
    payload: imageUrl
  }
}

export const SET_REFERENCE_DIMENSIONS_FOR_FAST_MASK = 'SET_REFERENCE_DIMENSIONS_FOR_FAST_MASK'
export const setRefsDimsForFastMask = (data: ReferenceDimensions) => {
  return {
    type: SET_REFERENCE_DIMENSIONS_FOR_FAST_MASK,
    payload: data
  }
}
