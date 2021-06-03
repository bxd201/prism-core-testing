// @flow
import { SET_IMAGE_FOR_FAST_MASK, SET_REFERENCE_DIMENSIONS_FOR_FAST_MASK } from '../actions/fastMask'
import type { ReferenceDimensions } from '../../shared/types/Scene'

export const fastMaskImageUrl = (state: string | null = null, action: {type: string, payload: string | null}) => {
  if (action.type === SET_IMAGE_FOR_FAST_MASK) {
    return action.payload
  }

  return state
}

export const fastMaskRefDims = (state: ReferenceDimensions | null = null, action: { type: string, payload: ReferenceDimensions | null }) => {
  if (action.type === SET_REFERENCE_DIMENSIONS_FOR_FAST_MASK) {
    return action.payload
  }

  return state
}
