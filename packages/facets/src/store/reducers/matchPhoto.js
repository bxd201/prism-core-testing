// @flow
import type { ImageDimensions } from '../../shared/types/lib/CVWTypes'
import { SET_IMAGE_DIMS_FOR_MATCH_PHOTO, SET_IMAGE_FOR_MATCH_PHOTO } from '../actions/matchPhoto'

export const matchPhotoImage = (state = null, action: {type: string, payload: string}) => {
  if (action.type === SET_IMAGE_FOR_MATCH_PHOTO) {
    return action.payload
  }

  return state
}

export const matchPhotoImageDims = (state: ImageDimensions | null = null, action: {type: string, payload: ImageDimensions}) => {
  if (action.type === SET_IMAGE_DIMS_FOR_MATCH_PHOTO) {
    return action.payload
  }

  return state
}
