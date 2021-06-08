// @flow
import {
  SET_ACTIVE_SCENE_KEY
} from '../actions/scenes'
import { SET_SELECTED_VARIANT_NAME, SCENES_DATA_FETCHED, SET_VARIANTS_COLLECTION, SET_VARIANTS_LOADING } from '../actions/loadScenes'
import { SHOW_COLOR_DETAILS_MODAL } from '../actions/loadColors'
import type { Color } from '../../shared/types/Colors'
import type { FlatScene, FlatVariant } from '../../shared/types/Scene'

export const SET_SELECTED_SCENE_UID = 'SET_SELECTED_SCENE_UID'

export const scenesCollection = (state: FlatScene[] | null = null, action: {type: string, scenesPayload: FlatScene[] | null}) => {
  if (action.type === SCENES_DATA_FETCHED) {
    return action.scenesPayload
  }

  return state
}

export const variantsCollection = (state: FlatVariant[] | null = null, action: { type: string, payload?: FlatVariant[] | null, variantsPayload?: FlatVariant[] | null }): FlatVariant[] | null => {
  if (action.type === SCENES_DATA_FETCHED) {
    return action.variantsPayload
  }

  if (action.type === SET_VARIANTS_COLLECTION) {
    return action.payload
  }

  return state
}

export const variantsLoading = (state: boolean = false, action: { type: string, payload: boolean }): boolean => {
  if (action.type === SET_VARIANTS_LOADING) {
    return action.payload
  }

  return state
}

export const selectedSceneUid = (state: string | null = null, action: {type: string, payload: string | null}) => {
  if (action.type === SET_SELECTED_SCENE_UID) {
    return action.payload
  }

  return state
}

export const selectedVariantName = (state: string = '', action: {type: string, payload: string}) => {
  if (action.type === SET_SELECTED_VARIANT_NAME) {
    return action.payload
  }
  return state
}

export const activeSceneKey = (state: string = '', action: { type: string, payload: string }) => {
  if (action.type === SET_ACTIVE_SCENE_KEY) {
    return action.payload
  }

  return state
}

export const globalColorDetailColor = (state: Color | null = null, action: { type: string, payload: Color | null }) => {
  if (action.type === SHOW_COLOR_DETAILS_MODAL) {
    return action.payload ?? null
  }

  return state
}
