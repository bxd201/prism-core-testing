// @flow
import type { FastMaskWorkspace } from '../../components/FastMask/FastMaskView'
import type { ReferenceDimensions } from '../../shared/types/Scene'
import type { FastMaskOpenCache } from '../actions/fastMask'
import {
  SET_FAST_MASK_IS_POLLUTED,
  SET_FAST_MASK_OPEN_CACHE,
  SET_FAST_MASK_SAVE_CACHE,
  SET_IMAGE_FOR_FAST_MASK,
  SET_REFERENCE_DIMENSIONS_FOR_FAST_MASK
} from '../actions/fastMask'

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

export const fastMaskSaveCache = (state: FastMaskWorkspace | null = null, action: { type: string, payload: FastMaskWorkspace | null}) => {
  if (action.type === SET_FAST_MASK_SAVE_CACHE) {
    return action.payload
  }
  return state
}

export const fastMaskOpenCache = (state: FastMaskOpenCache | null = null, action: { type: string, payload: FastMaskOpenCache }) => {
  if (action.type === SET_FAST_MASK_OPEN_CACHE) {
    return action.payload
  }

  return state
}

export const fastMaskIsPolluted = (state: boolean = false, action: { type: string, payload: boolean }) => {
  if (action.type === SET_FAST_MASK_IS_POLLUTED) {
    return action.payload
  }

  return state
}
